async function fetchNSEOptionChain(symbol: string) {
  try {
    // Step 1: Get cookies
    const cookieResponse = await fetch('https://www.nseindia.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      }
    });
    
    // Extract cookies properly
    const setCookieHeaders = cookieResponse.headers.get('set-cookie');
    const cookies = setCookieHeaders ? setCookieHeaders.split(',').map(c => c.split(';')[0]).join('; ') : '';
    console.log("Cookies:", cookies);
    
    // Step 2: Fetch option chain
    const url = symbol === "NIFTY" || symbol === "BANKNIFTY" 
      ? `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}`
      : `https://www.nseindia.com/api/option-chain-equities?symbol=${symbol}`;

    const response = await fetch(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': '*/*',
          'Cookie': cookies,
        }
      }
    );
    
    console.log("Status:", response.status);
    if (!response.ok) {
      console.log(await response.text());
      return;
    }
    const text = await response.text();
    console.log(`Raw length:`, text.length);
    console.log(`Preview:`, text.substring(0, 200));
  } catch (e) {
    console.error(e);
  }
}

fetchNSEOptionChain("NIFTY");
