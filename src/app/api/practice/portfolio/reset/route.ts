import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/practice/portfolio/reset — reset portfolio and clear positions
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error: deleteError } = await supabase
    .from("practice_positions")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  const { data: portfolio, error: updateError } = await supabase
    .from("practice_portfolio")
    .update({
      virtual_capital: 1000000,
      current_value: 1000000,
      total_return_percent: 0,
      total_return_amount: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ portfolio, message: "Practice portfolio reset" });
}
