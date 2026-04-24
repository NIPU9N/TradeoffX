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

  const { data: portfolio } = await supabase
    .from("practice_portfolio")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .maybeSingle();

  let activePortfolio = portfolio;
  if (!activePortfolio) {

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

  // 2. Check available capital
  const { data: openPositions, error: openPositionsError } = await supabase
    .from("practice_positions")
    .select("investment_amount")
    .eq("user_id", user.id)
    .eq("status", "open");

  if (openPositionsError) {
    return NextResponse.json({ error: openPositionsError.message }, { status: 500 });
  }

  const totalDeployed = (openPositions ?? []).reduce((sum, p) => sum + p.investment_amount, 0);
  const freeCapital = activePortfolio.virtual_capital - totalDeployed;

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
  await supabase.from("practice_portfolio").update({
    current_value: activePortfolio.virtual_capital,
    updated_at: new Date().toISOString(),
  }).eq("user_id", user.id);

  return NextResponse.json({ position }, { status: 201 });
}
