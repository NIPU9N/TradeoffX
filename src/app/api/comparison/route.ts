import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type DecisionWithOutcome = {
  mode: "real" | "practice";
  status: string;
  decision_type: string;
  confidence_level: number;
  emotion: string;
  stop_loss: number | null;
  outcome:
    | { outcome_type?: string; actual_return_percent?: number | null; exit_price?: number | null }[]
    | { outcome_type?: string; actual_return_percent?: number | null; exit_price?: number | null }
    | null;
};

function getOutcome(decision: DecisionWithOutcome) {
  return Array.isArray(decision.outcome) ? decision.outcome[0] : decision.outcome;
}

function average(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  if (profile?.plan !== "pro") {
    return NextResponse.json({ error: "Requires TradeoffX Pro" }, { status: 403 });
  }

  const { data: decisions, error } = await supabase
    .from("decisions")
    .select("*, outcome:outcomes(*)")
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const all = decisions || [];
  const typed = all as DecisionWithOutcome[];
  const practice = typed.filter((d) => d.mode === "practice");
  const real = typed.filter((d) => d.mode === "real");

  const calcWinRate = (items: DecisionWithOutcome[]) => {
    const reviewed = items.filter((d) => d.status === "reviewed" && getOutcome(d));
    if (!reviewed.length) return 0;
    const wins = reviewed.filter((d) => getOutcome(d)?.outcome_type === "profit").length;
    return Math.round((wins / reviewed.length) * 100);
  };

  const calcLogicDriven = (items: DecisionWithOutcome[]) => {
    if (!items.length) return 0;
    const logic = items.filter((d) => d.decision_type === "logic").length;
    return Math.round((logic / items.length) * 100);
  };

  const calcAvgReturn = (items: DecisionWithOutcome[]) => {
    const returns = items
      .map((d) => getOutcome(d)?.actual_return_percent)
      .filter((v): v is number => typeof v === "number");
    return Number(average(returns).toFixed(2));
  };

  const calcAvgConfidence = (items: DecisionWithOutcome[]) => {
    const conf = items.map((d) => d.confidence_level).filter((v): v is number => typeof v === "number");
    return Number(average(conf).toFixed(1));
  };

  const calcFomoTrades = (items: DecisionWithOutcome[]) => items.filter((d) => d.emotion === "fomo").length;

  const calcStopLossHonor = (items: DecisionWithOutcome[]) => {
    const withStop = items.filter((d) => d.stop_loss && getOutcome(d)?.exit_price);
    if (!withStop.length) return 0;
    const honored = withStop.filter((d) => {
      const o = getOutcome(d);
      return Number(o.exit_price) <= Number(d.stop_loss);
    }).length;
    return Math.round((honored / withStop.length) * 100);
  };

  return NextResponse.json({
    practice_win_rate: calcWinRate(practice),
    real_win_rate: calcWinRate(real),
    practice_logic_driven: calcLogicDriven(practice),
    real_logic_driven: calcLogicDriven(real),
    practice_avg_return: calcAvgReturn(practice),
    real_avg_return: calcAvgReturn(real),
    practice_avg_confidence: calcAvgConfidence(practice),
    real_avg_confidence: calcAvgConfidence(real),
    practice_fomo_trades: calcFomoTrades(practice),
    real_fomo_trades: calcFomoTrades(real),
    practice_stop_loss_honor: calcStopLossHonor(practice),
    real_stop_loss_honor: calcStopLossHonor(real),
  });
}
