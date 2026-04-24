import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/practice/positions/[id]/close — close a practice position
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { exit_price } = body;

  if (!exit_price || exit_price <= 0) {
    return NextResponse.json({ error: "Valid exit_price is required" }, { status: 400 });
  }

  // 1. Get the position
  const { data: position, error: posError } = await supabase
    .from("practice_positions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "open")
    .single();

  if (posError || !position) {
    return NextResponse.json({ error: "Open position not found" }, { status: 404 });
  }

  // 2. Calculate returns
  const current_value = position.quantity * exit_price;
  const return_amount = current_value - position.investment_amount;
  const return_percent = (return_amount / position.investment_amount) * 100;

  // 3. Close the position
  const { error: updateError } = await supabase
    .from("practice_positions")
    .update({
      status: "closed",
      exit_price,
      current_price: exit_price,
      current_value,
      return_amount,
      return_percent,
      closed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 4. Recalculate portfolio totals
  const { data: allClosed, error: allClosedError } = await supabase
    .from("practice_positions")
    .select("return_amount")
    .eq("user_id", user.id)
    .eq("status", "closed");

  if (allClosedError) {
    return NextResponse.json({ error: allClosedError.message }, { status: 500 });
  }

  const { data: allOpen, error: allOpenError } = await supabase
    .from("practice_positions")
    .select("current_value, investment_amount")
    .eq("user_id", user.id)
    .eq("status", "open");

  if (allOpenError) {
    return NextResponse.json({ error: allOpenError.message }, { status: 500 });
  }

  const { data: portfolio, error: portfolioError } = await supabase
    .from("practice_portfolio")
    .select("virtual_capital")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (portfolioError || !portfolio) {
    return NextResponse.json({ error: portfolioError?.message ?? "Practice portfolio not found" }, { status: 500 });
  }

  const virtualCapital = portfolio?.virtual_capital ?? 1000000;
  const closedPnl = (allClosed ?? []).reduce((sum, p) => sum + (p.return_amount ?? 0), 0);
  const openValue = (allOpen ?? []).reduce((sum, p) => sum + (p.current_value ?? 0), 0);
  const openInvested = (allOpen ?? []).reduce((sum, p) => sum + (p.investment_amount ?? 0), 0);
  const unrealizedPnl = openValue - openInvested;
  const totalReturn = closedPnl + unrealizedPnl;
  const currentPortfolioValue = virtualCapital + totalReturn;

  await supabase.from("practice_portfolio").update({
    current_value: currentPortfolioValue,
    total_return_amount: totalReturn,
    total_return_percent: (totalReturn / virtualCapital) * 100,
    updated_at: new Date().toISOString(),
  }).eq("user_id", user.id);

  // 5. Mark the associated decision as pending_review
  await supabase.from("decisions").update({
    status: "pending_review",
    updated_at: new Date().toISOString(),
  }).eq("id", position.decision_id).eq("user_id", user.id);

  return NextResponse.json({
    position: {
      ...position,
      status: "closed",
      exit_price,
      current_value,
      return_amount,
      return_percent,
    },
    portfolio: {
      current_value: currentPortfolioValue,
      total_return_amount: totalReturn,
      total_return_percent: (totalReturn / virtualCapital) * 100,
    },
  });
}
