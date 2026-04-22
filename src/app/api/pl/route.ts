import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch all decisions with their outcomes
  const { data: decisions, error } = await supabase
    .from("decisions")
    .select("*, outcome:outcomes(*)")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const all = (decisions || []).filter(d => {
      const oc = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
      return oc && oc.outcome_type !== 'still_open';
  });

  let totalPnLAmount = 0;
  let totalInvestment = 0;
  let winCount = 0;
  let lossCount = 0;
  let breakEvenCount = 0;

  const monthlyPnL: Record<string, number> = {};
  const assetPnL: Record<string, number> = {};
  
  let biggestWin = 0;
  let biggestLoss = 0;

  all.forEach(d => {
    const oc = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
    const amount = d.investment_amount;
    let returnPct = oc.actual_return_percent || 0;
    
    // Force negative if it's a loss but user entered positive number
    if (oc.outcome_type === 'loss' && returnPct > 0) {
      returnPct = -returnPct;
    }
    
    const pnlAmount = (amount * returnPct) / 100;

    totalPnLAmount += pnlAmount;
    totalInvestment += amount;

    if (oc.outcome_type === 'profit') winCount++;
    else if (oc.outcome_type === 'loss') lossCount++;
    else breakEvenCount++;

    if (pnlAmount > biggestWin) biggestWin = pnlAmount;
    if (pnlAmount < biggestLoss) biggestLoss = pnlAmount;

    // Monthly aggregation
    const date = new Date(d.decision_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyPnL[monthKey] = (monthlyPnL[monthKey] || 0) + pnlAmount;

    // Asset aggregation
    assetPnL[d.asset_type] = (assetPnL[d.asset_type] || 0) + pnlAmount;
  });

  // Convert monthlyPnL to sorted array for chart
  const monthlyChartData = Object.entries(monthlyPnL)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month: new Date(month + "-01").toLocaleString('default', { month: 'short', year: '2-digit' }),
      amount
    }));

  // Behavioral leak calculation
  const biasLosses: Record<string, number> = {};
  all.forEach(d => {
    const oc = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
    const amount = d.investment_amount;
    const returnPct = oc.actual_return_percent || 0;
    const pnlAmount = (amount * returnPct) / 100;
    
    if (pnlAmount < 0 && d.emotion !== 'calm') {
      biasLosses[d.emotion] = (biasLosses[d.emotion] || 0) + Math.abs(pnlAmount);
    }
  });

  const topBiasEntry = Object.entries(biasLosses).sort(([, a], [, b]) => b - a)[0];
  const topBiasForLoss = topBiasEntry?.[0] || null;
  const topBiasLeakAmount = topBiasEntry?.[1] || 0;
  const potentialRecoveryPct = totalPnLAmount !== 0 
    ? Math.round((topBiasLeakAmount / Math.abs(totalPnLAmount)) * 100) 
    : 0;

  const winRate = all.length > 0 ? Math.round((winCount / all.length) * 100) : 0;

  return NextResponse.json({
    summary: {
      total_pnl: totalPnLAmount,
      total_investment: totalInvestment,
      overall_return_pct: totalInvestment > 0 ? (totalPnLAmount / totalInvestment) * 100 : 0,
      win_rate: winRate,
      win_count: winCount,
      loss_count: lossCount,
      breakeven_count: breakEvenCount,
      biggest_win: biggestWin,
      biggest_loss: biggestLoss,
      trade_count: all.length,
      top_bias_for_loss: topBiasForLoss,
      top_bias_leak_amount: topBiasLeakAmount,
      potential_recovery_pct: potentialRecoveryPct
    },
    monthly_data: monthlyChartData,
    asset_data: Object.entries(assetPnL).map(([asset, amount]) => ({ asset, amount })),
    trades: all.map(d => {
      const oc = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
      let returnPct = oc.actual_return_percent || 0;
      if (oc.outcome_type === 'loss' && returnPct > 0) {
        returnPct = -returnPct;
      }
      return {
        id: d.id,
        asset_name: d.asset_name,
        pnl_amount: (d.investment_amount * returnPct) / 100,
        return_pct: returnPct,
        date: d.decision_date,
        type: d.asset_type,
        emotion: d.emotion
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  });
}
