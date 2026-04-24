import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/dashboard — aggregated stats for the logged-in user
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "real";

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch all decisions for this mode
  const { data: decisions } = await supabase
    .from("decisions")
    .select("*, outcome:outcomes(*)")
    .eq("user_id", user.id)
    .eq("mode", mode)
    .order("created_at", { ascending: false });

  const allDecisions = decisions || [];

  // Recent 5
  const recentDecisions = allDecisions.slice(0, 5);

  // Pending reviews (open or pending)
  const pendingReviews = allDecisions.filter(
    (d) => d.status === "open" || d.status === "pending_review"
  );

  // Win rate — from reviewed decisions with outcomes
  const reviewedWithOutcome = allDecisions.filter(
    (d) => {
      if (d.status !== "reviewed" || !d.outcome) return false;
      return Array.isArray(d.outcome) ? d.outcome.length > 0 : true;
    }
  );
  const wins = reviewedWithOutcome.filter(
    (d) => {
      const outcomeType = Array.isArray(d.outcome) ? d.outcome[0]?.outcome_type : d.outcome?.outcome_type;
      return outcomeType === "profit";
    }
  ).length;
  const winRate = reviewedWithOutcome.length > 0
    ? Math.round((wins / reviewedWithOutcome.length) * 100)
    : 0;

  // Logic vs emotion score
  const logicCount = allDecisions.filter((d) => d.decision_type === "logic").length;
  const mixedCount = allDecisions.filter((d) => d.decision_type === "mixed").length;
  const emotionCount = allDecisions.filter((d) => d.decision_type === "emotion").length;

  // Logic score: Logic (100%) + Mixed (50%)
  const logicScore = allDecisions.length > 0
    ? Math.round(((logicCount + (mixedCount * 0.5)) / allDecisions.length) * 100)
    : 0;
  
  // Emotion score: Emotion (100%) + Mixed (50%)
  const emotionScore = allDecisions.length > 0
    ? Math.round(((emotionCount + (mixedCount * 0.5)) / allDecisions.length) * 100)
    : 0;

  // Bias breakdown
  // Note: bias_tags doesn't have a mode field directly yet, but we can link it through decisions
  const { data: biasTags } = await supabase
    .from("bias_tags")
    .select("bias_type, decision:decisions(mode)")
    .eq("user_id", user.id);

  const filteredBiasTags = (biasTags || []).filter(bt => (bt.decision as any)?.mode === mode);

  const biasBreakdown: Record<string, number> = {};
  
  // 1. Add from explicit tags
  filteredBiasTags.forEach((tag) => {
    biasBreakdown[tag.bias_type] = (biasBreakdown[tag.bias_type] || 0) + 1;
  });

  // 2. Add from decision emotions (fallback/enrichment)
  const emotionToBias: Record<string, string> = {
    fomo: "fomo",
    greedy: "greed",
    anxious: "panic_sell",
    excited: "overconfidence",
    uncertain: "loss_aversion",
  };

  allDecisions.forEach((d) => {
    const derivedBias = emotionToBias[d.emotion];
    if (derivedBias) {
      biasBreakdown[derivedBias] = (biasBreakdown[derivedBias] || 0) + 1;
    }
  });

  // Top bias
  const topBias = Object.entries(biasBreakdown).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] || "none";

  // Asset type performance
  const assetPerformance: Record<string, { total: number; wins: number }> = {};
  reviewedWithOutcome.forEach((d) => {
    if (!assetPerformance[d.asset_type]) {
      assetPerformance[d.asset_type] = { total: 0, wins: 0 };
    }
    assetPerformance[d.asset_type].total++;
    const outcomeType = Array.isArray(d.outcome) ? d.outcome[0]?.outcome_type : d.outcome?.outcome_type;
    if (outcomeType === "profit") {
      assetPerformance[d.asset_type].wins++;
    }
  });

  const sorted = Object.entries(assetPerformance).sort(
    ([, a], [, b]) => (b.wins / b.total) - (a.wins / a.total)
  );

  return NextResponse.json({
    total_decisions: allDecisions.length,
    win_rate: winRate,
    current_streak: profile?.current_streak || 0,
    longest_streak: profile?.longest_streak || 0,
    logic_score: logicScore,
    emotion_score: emotionScore,
    recent_decisions: recentDecisions,
    pending_reviews: pendingReviews,
    top_bias: topBias,
    bias_breakdown: biasBreakdown,
    best_performing_asset_type: sorted[0]?.[0] || "N/A",
    worst_performing_asset_type: sorted[sorted.length - 1]?.[0] || "N/A",
    mode: mode as "real" | "practice"
  });
}
