const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nseindia.com/option-chain'
};

async function fetchWithCookie(url, cookie) {
  // Add a slight delay to avoid rate limits even with valid cookies
  await new Promise(resolve => setTimeout(resolve, 1000));
  const res = await fetch(url, { headers: { ...headers, 'Cookie': cookie } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function run() {
  try {
    console.log("Fetching session cookie from NSE...");
    const baseRes = await fetch("https://www.nseindia.com", { headers });
    
    // Parse cookies correctly. Node fetch headers.get('set-cookie') might return a single string or array depending on Node version
    const setCookieHeader = baseRes.headers.get('set-cookie');
    if (!setCookieHeader) {
        console.warn("No cookies returned from NSE main page. Proceeding anyway, but might fail.");
    }
    
    // Extract nseappid or valid session cookies if available
    const cookieStr = setCookieHeader ? setCookieHeader.split(';')[0] : '';
    
    console.log("Fetching NIFTY Option Chain...");
    const niftyData = await fetchWithCookie("https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY", cookieStr);
    
    console.log("Fetching BANKNIFTY Option Chain...");
    const bankNiftyData = await fetchWithCookie("https://www.nseindia.com/api/option-chain-indices?symbol=BANKNIFTY", cookieStr);

    console.log("Upserting to Supabase...");
    
    const timestamp = new Date().toISOString();
    
    const { error: err1 } = await supabase.from('option_chains').upsert({
      symbol: 'NIFTY',
      data: niftyData,
      underlying_value: niftyData.records?.underlyingValue,
      timestamp: niftyData.records?.timestamp || timestamp,
      updated_at: timestamp
    }, { onConflict: 'symbol' });
    
    if (err1) throw err1;

    const { error: err2 } = await supabase.from('option_chains').upsert({
      symbol: 'BANKNIFTY',
      data: bankNiftyData,
      underlying_value: bankNiftyData.records?.underlyingValue,
      timestamp: bankNiftyData.records?.timestamp || timestamp,
      updated_at: timestamp
    }, { onConflict: 'symbol' });

    if (err2) throw err2;

    console.log("Successfully updated option chains in Supabase.");
    
  } catch (err) {
    console.error("Error fetching options:", err.message);
    process.exit(1);
  }
}

run();
