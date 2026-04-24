export type KnownAsset = {
  name: string;
  symbol: string;
  type: "stock" | "mutual_fund" | "crypto" | "gold" | "other";
};

// Client-safe list of supported symbols for autocomplete and mapping.
export const KNOWN_ASSETS: KnownAsset[] = [
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
  { name: "Nifty BeES", symbol: "NIFTYBEES.NS", type: "mutual_fund" },
  { name: "Junior BeES", symbol: "JUNIORBEES.NS", type: "mutual_fund" },
  { name: "Gold BeES", symbol: "GOLDBEES.NS", type: "mutual_fund" },
  { name: "Bank BeES", symbol: "BANKBEES.NS", type: "mutual_fund" },
  { name: "IT BeES", symbol: "ITBEES.NS", type: "mutual_fund" },
  { name: "Bitcoin", symbol: "BTC-USD", type: "crypto" },
  { name: "Ethereum", symbol: "ETH-USD", type: "crypto" },
  { name: "BNB", symbol: "BNB-USD", type: "crypto" },
  { name: "Solana", symbol: "SOL-USD", type: "crypto" },
  { name: "XRP", symbol: "XRP-USD", type: "crypto" },
  { name: "Gold", symbol: "GC=F", type: "gold" },
  { name: "Nifty 50", symbol: "^NSEI", type: "other" },
  { name: "Sensex", symbol: "^BSESN", type: "other" },
];
