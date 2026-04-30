import { NextRequest, NextResponse } from "next/server";
import { OptionChainData, OptionStrikeData } from "@/lib/options";

// Helper to generate a realistic mock option chain if NSE blocks us
function generateMockChain(symbol: string): OptionChainData {
  // Approximate base values
  const underlyingValue = symbol === "BANKNIFTY" ? 48000 : symbol === "NIFTY" ? 22000 : 1000;
  const strikeStep = symbol === "BANKNIFTY" ? 100 : symbol === "NIFTY" ? 50 : 10;
  
  const strikes: OptionStrikeData[] = [];
  
  // Generate 20 strikes around the ATM (At The Money) strike
  const atmStrike = Math.round(underlyingValue / strikeStep) * strikeStep;
  const startStrike = atmStrike - (strikeStep * 10);
  
  for (let i = 0; i <= 20; i++) {
    const currentStrike = startStrike + (i * strikeStep);
    
    // Simple option pricing approximation based on distance from ATM
    const distanceFromAtm = currentStrike - underlyingValue;
    
    // Intrinsic value
    const callIntrinsic = Math.max(0, underlyingValue - currentStrike);
    const putIntrinsic = Math.max(0, currentStrike - underlyingValue);
    
    // Time value (bell curve centered at ATM)
    const timeValue = Math.exp(-Math.pow(distanceFromAtm / (strikeStep * 5), 2)) * (underlyingValue * 0.01);
    
    // Add some random noise
    const noise = () => 1 + (Math.random() * 0.1 - 0.05);
    
    strikes.push({
      strikePrice: currentStrike,
      ce: {
        lastPrice: Number(((callIntrinsic + timeValue) * noise()).toFixed(2)),
        openInterest: Math.floor(Math.random() * 50000),
        impliedVolatility: Number((12 + Math.random() * 5).toFixed(2))
      },
      pe: {
        lastPrice: Number(((putIntrinsic + timeValue) * noise()).toFixed(2)),
        openInterest: Math.floor(Math.random() * 50000),
        impliedVolatility: Number((12 + Math.random() * 5).toFixed(2))
      }
    });
  }

  return {
    symbol,
    underlyingValue,
    timestamp: new Date().toISOString(),
    isMocked: true,
    strikes
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  // Remove .NS suffix if present (e.g. RELIANCE.NS -> RELIANCE)
  symbol = symbol.replace('.NS', '');

  try {
    // Step 1: Get cookies
    const cookieResponse = await fetch('https://www.nseindia.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      next: { revalidate: 0 }
    });
    
    const setCookieHeaders = cookieResponse.headers.get('set-cookie');
    const cookies = setCookieHeaders ? setCookieHeaders.split(',').map(c => c.split(';')[0]).join('; ') : '';
    
    // Step 2: Fetch option chain
    const isIndex = symbol === "NIFTY" || symbol === "BANKNIFTY" || symbol === "FINNIFTY" || symbol === "MIDCPNIFTY";
    const url = isIndex 
      ? `https://www.nseindia.com/api/option-chain-indices?symbol=${encodeURIComponent(symbol)}`
      : `https://www.nseindia.com/api/option-chain-equities?symbol=${encodeURIComponent(symbol)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': '*/*',
        'Cookie': cookies,
      },
      next: { revalidate: 0 } // Don't cache the live prices heavily
    });

    // Check if the response is valid JSON and actually contains data
    // NSE sometimes returns a 200 OK with just "{}" or HTML if blocked
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn("NSE India returned non-JSON response (likely blocked). Using mock fallback.");
      return NextResponse.json(generateMockChain(symbol));
    }

    if (!data.records || !data.records.data || data.records.data.length === 0) {
      console.warn("NSE India returned empty records. Using mock fallback.");
      return NextResponse.json(generateMockChain(symbol));
    }

    // Process valid NSE data
    const strikes: OptionStrikeData[] = [];
    const underlyingValue = data.records.underlyingValue;
    
    // Filter to only current expiry strikes to avoid massive payload
    const currentExpiry = data.records.expiryDates[0];
    const filteredData = data.records.data.filter((d: any) => d.expiryDate === currentExpiry);

    for (const item of filteredData) {
      // Only add strikes that have both CE and PE data for simpler UI
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
      underlyingValue: underlyingValue || 0,
      timestamp: data.records.timestamp || new Date().toISOString(),
      isMocked: false,
      strikes: strikes.sort((a, b) => a.strikePrice - b.strikePrice)
    };

    return NextResponse.json(chainData);

  } catch (error) {
    console.error("Error fetching NSE option chain:", error);
    // If anything fails (network error, etc), return realistic mock data
    // so the app remains usable for demonstration/practice
    return NextResponse.json(generateMockChain(symbol));
  }
}
