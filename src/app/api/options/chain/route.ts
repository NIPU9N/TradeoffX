import { NextRequest, NextResponse } from "next/server";
import { OptionChainData, OptionStrikeData } from "@/lib/options";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  // Normalize: remove .NS suffix and uppercase (e.g. 'RELIANCE.NS' -> 'RELIANCE', 'nifty' -> 'NIFTY')
  symbol = symbol.replace('.NS', '').toUpperCase();

  try {
    const supabase = await createClient();
    
    // Fetch the latest cached option chain from Supabase
    const { data, error } = await supabase
      .from('option_chains')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (error || !data || !data.data) {
      console.warn(`No cached data found for ${symbol}`);
      return NextResponse.json({ 
        symbol,
        error: "Data not available. The background worker may not have fetched it yet.", 
        isMocked: true, 
        timestamp: new Date().toISOString(),
        underlyingValue: 0,
        strikes: []
      });
    }

    const nseData = data.data;
    const strikes: OptionStrikeData[] = [];
    const underlyingValue = data.underlying_value || nseData.records?.underlyingValue || 0;
    
    // Filter to only current expiry to avoid massive payload
    const currentExpiry = nseData.records?.expiryDates?.[0];
    const filteredData = nseData.records?.data?.filter((d: any) => d.expiryDate === currentExpiry) || [];

    for (const item of filteredData) {
      if (item.CE && item.PE) {
        strikes.push({
          strikePrice: item.strikePrice,
          ce: {
            lastPrice: item.CE.lastPrice || 0,
            openInterest: item.CE.openInterest || 0,
            impliedVolatility: item.CE.impliedVolatility || 0
          },
          pe: {
            lastPrice: item.PE.lastPrice || 0,
            openInterest: item.PE.openInterest || 0,
            impliedVolatility: item.PE.impliedVolatility || 0
          }
        });
      }
    }

    const chainData: OptionChainData = {
      symbol,
      underlyingValue: underlyingValue,
      timestamp: data.timestamp || new Date().toISOString(),
      isMocked: false,
      strikes: strikes.sort((a, b) => a.strikePrice - b.strikePrice)
    };

    return NextResponse.json(chainData);

  } catch (error) {
    console.error("Error reading from Supabase cache:", error);
    return NextResponse.json({ 
      symbol: symbol || "UNKNOWN",
      error: "Internal server error reading from cache",
      isMocked: true,
      timestamp: new Date().toISOString(),
      underlyingValue: 0,
      strikes: []
    }, { status: 500 });
  }
}

