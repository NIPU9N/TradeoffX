import { NextResponse } from "next/server";
import { fetchStockPrice } from "@/lib/prices";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "symbol param is required" }, { status: 400 });
  }

  try {
    const price = await fetchStockPrice(symbol);
    if (!price) {
      return NextResponse.json({ error: "Price not available" }, { status: 404 });
    }
    return NextResponse.json(price);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to fetch price" }, { status: 500 });
  }
}
