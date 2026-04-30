import { createClient } from "@/lib/supabase/server";

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION_MS = 15 * 60 * 1000;

export interface PriceData {
  symbol: string;
  current_price: number;
  previous_close: number | null;
  change_percent: number | null;
  last_updated: string;
}

/**
 * Fetch stock/crypto price from Yahoo Finance.
 * Falls back to cached Supabase value if API fails.
 */
export async function fetchStockPrice(symbol: string): Promise<PriceData | null> {
  const supabase = await createClient();

  // 1. Check cache first
  const { data: cached } = await supabase
    .from("market_prices")
    .select("*")
    .eq("asset_symbol", symbol)
    .single();

  if (cached) {
    const cacheAge = Date.now() - new Date(cached.last_updated).getTime();
    if (cacheAge < CACHE_DURATION_MS) {
      return {
        symbol: cached.asset_symbol,
        current_price: cached.current_price,
        previous_close: cached.previous_close,
        change_percent: cached.change_percent,
        last_updated: cached.last_updated,
      };
    }
  }

  // 2. Fetch from Yahoo Finance
  try {
    // Dynamic import to avoid issues with edge runtime
    const YahooFinance = (await import("yahoo-finance2")).default;
    const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
    const quote = (await yahooFinance.quote(symbol)) as {
      regularMarketPrice?: number;
      regularMarketPreviousClose?: number;
      regularMarketChangePercent?: number;
      longName?: string;
      shortName?: string;
    } | null;

    if (!quote || !quote.regularMarketPrice) {
      // Return stale cache if available
      if (cached) {
        return {
          symbol: cached.asset_symbol,
          current_price: cached.current_price,
          previous_close: cached.previous_close,
          change_percent: cached.change_percent,
          last_updated: cached.last_updated,
        };
      }
      return null;
    }

    const priceData: PriceData = {
      symbol,
      current_price: quote.regularMarketPrice,
      previous_close: quote.regularMarketPreviousClose ?? null,
      change_percent: quote.regularMarketChangePercent ?? null,
      last_updated: new Date().toISOString(),
    };

    // 3. Upsert cache
    await supabase.from("market_prices").upsert({
      asset_symbol: symbol,
      asset_name: quote.longName ?? quote.shortName ?? symbol,
      current_price: priceData.current_price,
      previous_close: priceData.previous_close,
      change_percent: priceData.change_percent,
      last_updated: priceData.last_updated,
    }, { onConflict: "asset_symbol" });

    return priceData;
  } catch (err) {
    console.error(`Failed to fetch price for ${symbol}:`, err);
    // Return stale cache if available
    if (cached) {
      return {
        symbol: cached.asset_symbol,
        current_price: cached.current_price,
        previous_close: cached.previous_close,
        change_percent: cached.change_percent,
        last_updated: cached.last_updated,
      };
    }
    return null;
  }
}

/**
 * Fetch prices for multiple symbols at once (batch).
 */
export async function fetchBatchPrices(symbols: string[]): Promise<Record<string, PriceData>> {
  const results: Record<string, PriceData> = {};
  await Promise.allSettled(
    symbols.map(async (symbol) => {
      const price = await fetchStockPrice(symbol);
      if (price) results[symbol] = price;
    })
  );
  return results;
}
