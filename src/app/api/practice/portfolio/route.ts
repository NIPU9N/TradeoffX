import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/practice/portfolio — returns portfolio + derived capital stats
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: portfolio, error: portfolioError } = await supabase
    .from("practice_portfolio")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (portfolioError || !portfolio) {
    return NextResponse.json({ error: "Practice portfolio not found" }, { status: 404 });
  }

  const { data: openPositions, error: positionsError } = await supabase
    .from("practice_positions")
    .select("investment_amount, current_value")
    .eq("user_id", user.id)
    .eq("status", "open");

  if (positionsError) {
    return NextResponse.json({ error: positionsError.message }, { status: 500 });
  }

  const deployedCapital = (openPositions || []).reduce((sum, p) => sum + Number(p.investment_amount || 0), 0);
  const openCurrentValue = (openPositions || []).reduce((sum, p) => sum + Number(p.current_value || 0), 0);
  const unrealizedPnL = openCurrentValue - deployedCapital;
  const freeCapital = Number(portfolio.virtual_capital) - deployedCapital;

  return NextResponse.json({
    portfolio,
    metrics: {
      deployed_capital: deployedCapital,
      free_capital: Math.max(0, freeCapital),
      unrealized_pnl: unrealizedPnL,
      open_positions: (openPositions || []).length,
    },
  });
}
