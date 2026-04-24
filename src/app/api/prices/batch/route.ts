import { NextResponse } from "next/server";
import { fetchBatchPrices } from "@/lib/prices";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const symbols: string[] = body?.symbols;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ error: "symbols array is required" }, { status: 400 });
    }

    if (symbols.length > 20) {
      return NextResponse.json({ error: "Max 20 symbols per batch request" }, { status: 400 });
    }

    const prices = await fetchBatchPrices(symbols);
    return NextResponse.json(prices);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to fetch batch prices" }, { status: 500 });
  }
}
