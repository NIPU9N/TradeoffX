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

  let activePortfolio = portfolio;
  if (!activePortfolio) {
    if (portfolioError && !portfolioError.message?.includes("Result contains 0 rows")) {
      return NextResponse.json({ error: portfolioError.message }, { status: 500 });
    }

    const { data: createdPortfolio, error: createError } = await supabase
      .from("practice_portfolio")
      .insert({
        user_id: user.id,
        virtual_capital: 1000000,
        current_value: 1000000,
        total_return_percent: 0,
        total_return_amount: 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    activePortfolio = createdPortfolio;
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
  const freeCapital = Number(activePortfolio.virtual_capital) - deployedCapital;

  return NextResponse.json({
    portfolio: activePortfolio,
    metrics: {
      deployed_capital: deployedCapital,
      free_capital: Math.max(0, freeCapital),
      unrealized_pnl: unrealizedPnL,
      open_positions: (openPositions || []).length,
    },
  });
}
