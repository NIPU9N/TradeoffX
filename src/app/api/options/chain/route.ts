import { NextRequest, NextResponse } from "next/server";
import { OptionChainData, OptionStrikeData } from "@/lib/options";
import { createClient } from "@/lib/supabase/server";

// Known index configurations: [underlyingValue, strikeStep]
const INDEX_CONFIG: Record<string, [number, number]> = {
  NIFTY:      [24500, 50],
  BANKNIFTY:  [52000, 100],
  FINNIFTY:   [23000, 50],
  MIDCPNIFTY: [12000, 25],
  SENSEX:     [80000, 100],
};

const NSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nseindia.com/option-chain',
};

// Generate realistic mock data as a last resort
function generateMockChain(symbol: string): OptionChainData {
  const config = INDEX_CONFIG[symbol];
  const underlyingValue = config ? config[0] : 1000;
  const strikeStep = config ? config[1] : Math.round(underlyingValue * 0.005);

  const strikes: OptionStrikeData[] = [];
  const atmStrike = Math.round(underlyingValue / strikeStep) * strikeStep;
  const startStrike = atmStrike - strikeStep * 10;

  for (let i = 0; i <= 20; i++) {
    const currentStrike = startStrike + i * strikeStep;
    const distanceFromAtm = currentStrike - underlyingValue;
    const callIntrinsic = Math.max(0, underlyingValue - currentStrike);
    const putIntrinsic = Math.max(0, currentStrike - underlyingValue);
    const timeValue = Math.exp(-Math.pow(distanceFromAtm / (strikeStep * 5), 2)) * (underlyingValue * 0.01);
    const noise = () => 1 + (Math.random() * 0.1 - 0.05);

    strikes.push({
      strikePrice: currentStrike,
      ce: {
        lastPrice: Number(((callIntrinsic + timeValue) * noise()).toFixed(2)),
        openInterest: Math.floor(Math.random() * 50000),
        impliedVolatility: Number((12 + Math.random() * 5).toFixed(2)),
      },
      pe: {
        lastPrice: Number(((putIntrinsic + timeValue) * noise()).toFixed(2)),
        openInterest: Math.floor(Math.random() * 50000),
        impliedVolatility: Number((12 + Math.random() * 5).toFixed(2)),
      },
    });
  }

  return {
    symbol,
    underlyingValue,
    timestamp: new Date().toISOString(),
    isMocked: true,
    strikes,
  };
}

// Parse NSE JSON payload into our OptionChainData shape
function parseNseData(symbol: string, nseData: any, timestamp?: string): OptionChainData | null {
  if (!nseData?.records?.data?.length) return null;

  const underlyingValue = nseData.records.underlyingValue || 0;
  const currentExpiry = nseData.records.expiryDates?.[0];
  const filteredData = nseData.records.data.filter((d: any) => d.expiryDate === currentExpiry);

  const strikes: OptionStrikeData[] = [];
  for (const item of filteredData) {
    if (item.CE && item.PE) {
      strikes.push({
        strikePrice: item.strikePrice,
        ce: {
          lastPrice: item.CE.lastPrice || 0,
          openInterest: item.CE.openInterest || 0,
          impliedVolatility: item.CE.impliedVolatility || 0,
        },
        pe: {
          lastPrice: item.PE.lastPrice || 0,
          openInterest: item.PE.openInterest || 0,
          impliedVolatility: item.PE.impliedVolatility || 0,
        },
      });
    }
  }

  if (strikes.length === 0) return null;

  return {
    symbol,
    underlyingValue,
    timestamp: timestamp || nseData.records.timestamp || new Date().toISOString(),
    isMocked: false,
    strikes: strikes.sort((a, b) => a.strikePrice - b.strikePrice),
  };
}

// Direct NSE scrape (fallback when Supabase cache is cold)
async function fetchFromNse(symbol: string): Promise<OptionChainData | null> {
  try {
    // Step 1: Get session cookie
    const cookieRes = await fetch('https://www.nseindia.com', {
      headers: { ...NSE_HEADERS, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      next: { revalidate: 0 },
    });
    const setCookie = cookieRes.headers.get('set-cookie');
    const cookie = setCookie ? setCookie.split(',').map(c => c.split(';')[0]).join('; ') : '';

    // Step 2: Fetch option chain
    const isIndex = symbol in INDEX_CONFIG;
    const url = isIndex
      ? `https://www.nseindia.com/api/option-chain-indices?symbol=${encodeURIComponent(symbol)}`
      : `https://www.nseindia.com/api/option-chain-equities?symbol=${encodeURIComponent(symbol)}`;

    const res = await fetch(url, {
      headers: { ...NSE_HEADERS, 'Cookie': cookie },
      next: { revalidate: 0 },
    });

    const text = await res.text();
    const json = JSON.parse(text);
    return parseNseData(symbol, json);
  } catch (err) {
    console.warn('NSE direct fetch failed:', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  symbol = symbol.replace('.NS', '').toUpperCase();

  try {
    const supabase = await createClient();

    // ── Layer 1: Try Supabase cache (populated by GitHub Actions) ──
    const { data: cached } = await supabase
      .from('option_chains')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (cached?.data) {
      const parsed = parseNseData(symbol, cached.data, cached.timestamp);
      if (parsed) {
        return NextResponse.json(parsed);
      }
    }

    console.log(`Cache miss for ${symbol}, falling back to direct NSE fetch…`);

    // ── Layer 2: Direct NSE scrape (cache is cold) ──
    const live = await fetchFromNse(symbol);
    if (live) {
      return NextResponse.json(live);
    }

    console.warn(`NSE blocked for ${symbol}, serving mock data…`);

    // ── Layer 3: Mock data (NSE also blocked, market hours, or unknown symbol) ──
    return NextResponse.json(generateMockChain(symbol));

  } catch (error) {
    console.error("Option chain route error:", error);
    return NextResponse.json(generateMockChain(symbol));
  }
}
