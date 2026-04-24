import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/mirror — rich stats for the Pattern Mirror page
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "real";

  // Fetch all decisions with outcomes
  const { data: decisions } = await supabase
    .from("decisions")
    .select("*, outcome:outcomes(*)")
    .eq("user_id", user.id)
    .eq("mode", mode)
    .order("created_at", { ascending: false });

  const all = decisions || [];
  const total = all.length;

  // ── Logic vs Emotion ────────────────────────────────────────────────────────
  const logicCount = all.filter((d) => d.decision_type === "logic").length;
  const emotionCount = all.filter((d) => d.decision_type === "emotion").length;
  const logicPct = total > 0 ? Math.round((logicCount / total) * 100) : 0;
  const emotionPct = total > 0 ? Math.round((emotionCount / total) * 100) : 0;

  // ── Reviewed decisions with outcomes ────────────────────────────────────────
  const withOutcome = all.filter((d) => {
    const outcome = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
    return outcome && d.status === "reviewed";
  });

  // ── Emotion-driven exit stats ────────────────────────────────────────────────
  const emotionDecisions = withOutcome.filter((d) => d.decision_type === "emotion");
  const emotionLosses = emotionDecisions.filter((d) => {
    const outcome = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
    return outcome?.outcome_type === "loss";
  });
  const emotionLossRate = emotionDecisions.length > 0
    ? Math.round((emotionLosses.length / emotionDecisions.length) * 100)
    : 0;

  // ── Logic-driven avg return ──────────────────────────────────────────────────
  const logicDecisions = withOutcome.filter((d) => d.decision_type === "logic");
  const logicReturns = logicDecisions
    .map((d) => {
      const o = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
      return o?.actual_return_percent ?? null;
    })
    .filter((r): r is number => r !== null);
  const avgLogicReturn = logicReturns.length > 0
    ? (logicReturns.reduce((a, b) => a + b, 0) / logicReturns.length).toFixed(1)
    : null;

  // ── Calm emotion stats ───────────────────────────────────────────────────────
  const calmDecisions = withOutcome.filter((d) => d.emotion === "calm");
  const calmReturns = calmDecisions
    .map((d) => {
      const o = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
      return o?.actual_return_percent ?? null;
    })
    .filter((r): r is number => r !== null);
  const avgCalmReturn = calmReturns.length > 0
    ? (calmReturns.reduce((a, b) => a + b, 0) / calmReturns.length).toFixed(1)
    : null;

  // ── High conviction (confidence >= 8) win rate ───────────────────────────────
  const highConviction = withOutcome.filter((d) => d.confidence_level >= 8);
  const highConvictionWins = highConviction.filter((d) => {
    const o = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
    return o?.outcome_type === "profit";
  });
  const highConvictionWinRate = highConviction.length > 0
    ? Math.round((highConvictionWins.length / highConviction.length) * 100)
    : null;

  // ── FOMO decision stats ──────────────────────────────────────────────────────
  const fomoDecisions = withOutcome.filter((d) => d.emotion === "fomo");
  const fomoLosses = fomoDecisions.filter((d) => {
    const o = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
    return o?.outcome_type === "loss";
  });
  const fomoLossRate = fomoDecisions.length > 0
    ? Math.round((fomoLosses.length / fomoDecisions.length) * 100)
    : null;

  // ── Bias breakdown from bias_tags ────────────────────────────────────────────
  const { data: biasTags } = await supabase
    .from("bias_tags")
    .select("bias_type, decision:decisions(mode)")
    .eq("user_id", user.id);

  const biasRaw: Record<string, number> = {};
  (biasTags || [])
    .filter((tag) => (tag.decision as { mode?: string } | null)?.mode === mode)
    .forEach((tag) => {
    biasRaw[tag.bias_type] = (biasRaw[tag.bias_type] || 0) + 1;
  });

  // If no bias tags, derive from emotions on decisions
  const biasFromEmotions: Record<string, number> = {};
  if (Object.keys(biasRaw).length === 0) {
    all.forEach((d) => {
      const emotionMap: Record<string, string> = {
        fomo: "fomo",
        greedy: "greed",
        anxious: "panic_sell",
        excited: "overconfidence",
        uncertain: "loss_aversion",
      };
      const mapped = emotionMap[d.emotion];
      if (mapped) biasFromEmotions[mapped] = (biasFromEmotions[mapped] || 0) + 1;
    });
  }

  const biasSource = Object.keys(biasRaw).length > 0 ? biasRaw : biasFromEmotions;

  // Convert to sorted array with percentages (cap at 100)
  const totalBiasTags = Object.values(biasSource).reduce((a, b) => a + b, 0) || 1;
  const biasBreakdown = Object.entries(biasSource)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      val: Math.min(Math.round((count / totalBiasTags) * 100), 100),
    }));

  // ── Biggest leak (top bias) ──────────────────────────────────────────────────
  const topBias = biasBreakdown[0]?.name || null;

  // ── Decisions this month vs last ─────────────────────────────────────────────
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthCount = all.filter((d) => new Date(d.created_at) >= thisMonthStart).length;
  const lastMonthCount = all.filter(
    (d) => new Date(d.created_at) >= lastMonthStart && new Date(d.created_at) < thisMonthStart
  ).length;
  const decisionsChangeVsLastMonth = lastMonthCount > 0
    ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    : null;

  return NextResponse.json({
    mode,
    total_decisions: total,
    this_month_decisions: thisMonthCount,
    decisions_change_pct: decisionsChangeVsLastMonth,
    logic_pct: logicPct,
    emotion_pct: emotionPct,
    emotion_loss_rate: emotionLossRate,
    avg_logic_return: avgLogicReturn,
    avg_calm_return: avgCalmReturn,
    high_conviction_win_rate: highConvictionWinRate,
    fomo_loss_rate: fomoLossRate,
    bias_breakdown: biasBreakdown,
    top_bias: topBias,
  });
}
