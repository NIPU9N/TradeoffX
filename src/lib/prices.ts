import { createClient } from "@/lib/supabase/server";

// ═══════════════════════════════════════════
// Indian Market Symbol Constants
// ═══════════════════════════════════════════
export const KNOWN_ASSETS = [
  // NSE Blue Chips
  { name: "Reliance Industries", symbol: "RELIANCE.NS", type: "stock" },
  { name: "Infosys", symbol: "INFY.NS", type: "stock" },
  { name: "TCS", symbol: "TCS.NS", type: "stock" },
  { name: "HDFC Bank", symbol: "HDFCBANK.NS", type: "stock" },
  { name: "ICICI Bank", symbol: "ICICIBANK.NS", type: "stock" },
  { name: "SBI", symbol: "SBIN.NS", type: "stock" },
  { name: "Bajaj Finance", symbol: "BAJFINANCE.NS", type: "stock" },
  { name: "HUL", symbol: "HINDUNILVR.NS", type: "stock" },
  { name: "Axis Bank", symbol: "AXISBANK.NS", type: "stock" },
  { name: "Kotak Mahindra Bank", symbol: "KOTAKBANK.NS", type: "stock" },
  { name: "Wipro", symbol: "WIPRO.NS", type: "stock" },
  { name: "Tata Motors", symbol: "TATAMOTORS.NS", type: "stock" },
  { name: "Zomato", symbol: "ZOMATO.NS", type: "stock" },
  { name: "Paytm", symbol: "PAYTM.NS", type: "stock" },
  { name: "Nykaa", symbol: "NYKAA.NS", type: "stock" },
  { name: "Delhivery", symbol: "DELHIVERY.NS", type: "stock" },
  { name: "Adani Enterprises", symbol: "ADANIENT.NS", type: "stock" },
  { name: "Adani Ports", symbol: "ADANIPORTS.NS", type: "stock" },
  { name: "Maruti Suzuki", symbol: "MARUTI.NS", type: "stock" },
  { name: "Titan Company", symbol: "TITAN.NS", type: "stock" },
  // Mutual Funds / ETFs
  { name: "Nifty BeES", symbol: "NIFTYBEES.NS", type: "mutual_fund" },
  { name: "Junior BeES", symbol: "JUNIORBEES.NS", type: "mutual_fund" },
  { name: "Gold BeES", symbol: "GOLDBEES.NS", type: "mutual_fund" },
  { name: "Bank BeES", symbol: "BANKBEES.NS", type: "mutual_fund" },
  { name: "IT BeES", symbol: "ITBEES.NS", type: "mutual_fund" },
  // Crypto
  { name: "Bitcoin", symbol: "BTC-USD", type: "crypto" },
  { name: "Ethereum", symbol: "ETH-USD", type: "crypto" },
  { name: "BNB", symbol: "BNB-USD", type: "crypto" },
  { name: "Solana", symbol: "SOL-USD", type: "crypto" },
  { name: "XRP", symbol: "XRP-USD", type: "crypto" },
  // Gold & Indices
  { name: "Gold", symbol: "GC=F", type: "gold" },
  { name: "Nifty 50", symbol: "^NSEI", type: "other" },
  { name: "Sensex", symbol: "^BSESN", type: "other" },
];

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
    const yahooFinance = (await import("yahoo-finance2")).default;
    const quote = await yahooFinance.quote(symbol);

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
