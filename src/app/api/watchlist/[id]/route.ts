import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { fetchStockPrice } from "@/lib/prices";

export const runtime = "nodejs";

// PATCH /api/watchlist/[id]
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  // If refreshing price, fetch live price first
  if (body.refresh_price && body.asset_symbol) {
    try {
      const priceData = await fetchStockPrice(body.asset_symbol);
      if (priceData?.current_price) body.current_price = priceData.current_price;
    } catch (_) { /* silent */ }
    delete body.refresh_price;
    delete body.asset_symbol;
  }

  // If marking as bought/skipped, stamp the time
  if (body.status === "bought" || body.status === "skipped") {
    body.action_taken_date = new Date().toISOString();
  }

  body.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("watchlist")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

// DELETE /api/watchlist/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Deleted" });
}
