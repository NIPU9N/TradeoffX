import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/practice/positions — list all open positions for the user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: positions, error } = await supabase
    .from("practice_positions")
    .select("*, decisions(thesis, stop_loss, target_price, emotion, decision_date, what_would_make_me_wrong)")
    .eq("user_id", user.id)
    .order("opened_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ positions });
}

// POST /api/practice/positions — open a new practice position
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { decision_id, asset_name, asset_type, quantity, entry_price } = body;

  if (!decision_id || !asset_name || !asset_type || !quantity || !entry_price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const investment_amount = quantity * entry_price;

  // 1. Get current portfolio
  const { data: portfolio, error: portfolioError } = await supabase
    .from("practice_portfolio")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (portfolioError || !portfolio) {
    return NextResponse.json({ error: "Practice portfolio not found" }, { status: 404 });
  }

  const available_capital = portfolio.virtual_capital - (portfolio.current_value - portfolio.virtual_capital <= 0
    ? portfolio.current_value - (portfolio.total_return_amount)
    : portfolio.virtual_capital - portfolio.total_return_amount);

  // 2. Check available capital
  const deployed = portfolio.virtual_capital - (portfolio.current_value - portfolio.total_return_amount);
  const free_capital = portfolio.virtual_capital - deployed;

  // Simpler: track available as virtual_capital - sum of all open positions' investment_amount
  const { data: openPositions } = await supabase
    .from("practice_positions")
    .select("investment_amount")
    .eq("user_id", user.id)
    .eq("status", "open");

  const totalDeployed = (openPositions ?? []).reduce((sum, p) => sum + p.investment_amount, 0);
  const freeCapital = portfolio.virtual_capital - totalDeployed;

  if (investment_amount > freeCapital) {
    return NextResponse.json({
      error: "Insufficient virtual capital",
      available: freeCapital,
      required: investment_amount,
    }, { status: 400 });
  }

  // 3. Create the position
  const { data: position, error: positionError } = await supabase
    .from("practice_positions")
    .insert({
      user_id: user.id,
      decision_id,
      asset_name,
      asset_type,
      quantity,
      entry_price,
      current_price: entry_price,
      investment_amount,
      current_value: investment_amount,
      return_amount: 0,
      return_percent: 0,
      status: "open",
    })
    .select()
    .single();

  if (positionError) return NextResponse.json({ error: positionError.message }, { status: 500 });

  // 4. Update portfolio totals
  const newDeployed = totalDeployed + investment_amount;
  await supabase.from("practice_portfolio").update({
    current_value: portfolio.virtual_capital, // will be recalculated when prices refresh
    updated_at: new Date().toISOString(),
  }).eq("user_id", user.id);

  return NextResponse.json({ position }, { status: 201 });
}
