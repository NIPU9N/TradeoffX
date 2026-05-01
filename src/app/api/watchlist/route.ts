import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { fetchStockPrice } from "@/lib/prices";

export const runtime = "nodejs";

// GET /api/watchlist
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const status = searchParams.get("status");

  let query = supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", user.id)
    .order("watched_since", { ascending: false });

  if (mode) query = query.eq("mode", mode);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data });
}

// POST /api/watchlist
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();

  if (!body.asset_name || !body.watching_thesis) {
    return NextResponse.json({ error: "asset_name and watching_thesis are required" }, { status: 400 });
  }

  // Auto-fetch current price if symbol is provided
  let priceWhenAdded: number | null = null;
  if (body.asset_symbol) {
    try {
      const priceData = await fetchStockPrice(body.asset_symbol);
      priceWhenAdded = priceData?.current_price ?? null;
    } catch (_) { /* silent — price is optional */ }
  }

  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: user.id,
      mode: body.mode ?? "real",
      asset_name: body.asset_name,
      asset_symbol: body.asset_symbol ?? null,
      asset_type: body.asset_type ?? "stock",
      price_when_added: priceWhenAdded,
      current_price: priceWhenAdded,
      watching_thesis: body.watching_thesis,
      what_would_make_me_buy: body.what_would_make_me_buy ?? null,
      what_would_make_me_skip: body.what_would_make_me_skip ?? null,
      target_entry_price: body.target_entry_price ?? null,
      max_entry_price: body.max_entry_price ?? null,
      review_date: body.review_date ?? null,
      status: "watching",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ item: data }, { status: 201 });
}
