// Mock option chain data for NIFTY, BANKNIFTY, FINNIFTY
// This will be replaced with real NSE API data later

export interface OptionStrike {
  strike: number;
  ce: {
    premium: number;
    iv: number;
    openInterest: number;
    volume: number;
  };
  pe: {
    premium: number;
    iv: number;
    openInterest: number;
    volume: number;
  };
}

export interface MockOptionChain {
  symbol: string;
  spot: number;
  futures: number;
  lotSize: number;
  iv: number;
  ivPercentile: number;
  dte: number;
  expiries: string[];
  strikes: OptionStrike[];
}

// Realistic Black-Scholes based pricing
const NIFTY_STRIKES: OptionStrike[] = [
  { strike: 24000, ce: { premium: 556.95, iv: 16.2, openInterest: 45200, volume: 8900 }, pe: { premium: 92.45, iv: 15.8, openInterest: 32100, volume: 5600 } },
  { strike: 24100, ce: { premium: 496.40, iv: 16.5, openInterest: 52100, volume: 9200 }, pe: { premium: 108.30, iv: 16.1, openInterest: 38900, volume: 6100 } },
  { strike: 24200, ce: { premium: 438.65, iv: 16.8, openInterest: 61200, volume: 10100 }, pe: { premium: 125.90, iv: 16.4, openInterest: 45600, volume: 6800 } },
  { strike: 24300, ce: { premium: 383.50, iv: 17.1, openInterest: 68900, volume: 11200 }, pe: { premium: 145.20, iv: 16.7, openInterest: 51200, volume: 7200 } },
  { strike: 24400, ce: { premium: 331.20, iv: 17.3, openInterest: 75600, volume: 12100 }, pe: { premium: 166.80, iv: 17.0, openInterest: 58900, volume: 8100 } },
  { strike: 24450, ce: { premium: 362.95, iv: 15.34, openInterest: 89200, volume: 13500 }, pe: { premium: 178.45, iv: 16.8, openInterest: 62100, volume: 8900 } },
  { strike: 24500, ce: { premium: 282.40, iv: 17.5, openInterest: 85100, volume: 13200 }, pe: { premium: 190.60, iv: 17.2, openInterest: 64800, volume: 9200 } },
  { strike: 24600, ce: { premium: 236.75, iv: 17.8, openInterest: 78200, volume: 12100 }, pe: { premium: 216.30, iv: 17.5, openInterest: 71200, volume: 9800 } },
  { strike: 24700, ce: { premium: 194.20, iv: 18.0, openInterest: 69100, volume: 10800 }, pe: { premium: 243.80, iv: 17.8, openInterest: 76900, volume: 10200 } },
  { strike: 24800, ce: { premium: 155.90, iv: 18.2, openInterest: 58200, volume: 9100 }, pe: { premium: 273.10, iv: 18.0, openInterest: 81200, volume: 10800 } },
  { strike: 24900, ce: { premium: 121.45, iv: 18.4, openInterest: 45100, volume: 7200 }, pe: { premium: 304.20, iv: 18.3, openInterest: 84100, volume: 11200 } },
];

const BANKNIFTY_STRIKES: OptionStrike[] = [
  { strike: 47500, ce: { premium: 892.30, iv: 16.8, openInterest: 32100, volume: 5200 }, pe: { premium: 156.70, iv: 16.2, openInterest: 28900, volume: 4100 } },
  { strike: 47750, ce: { premium: 745.60, iv: 17.1, openInterest: 38900, volume: 5800 }, pe: { premium: 189.20, iv: 16.5, openInterest: 33200, volume: 4600 } },
  { strike: 48000, ce: { premium: 612.40, iv: 17.4, openInterest: 45200, volume: 6400 }, pe: { premium: 228.50, iv: 16.8, openInterest: 38100, volume: 5.2 } },
  { strike: 48250, ce: { premium: 491.80, iv: 17.6, openInterest: 52100, volume: 7.1 }, pe: { premium: 275.30, iv: 17.1, openInterest: 42800, volume: 5.8 } },
  { strike: 48500, ce: { premium: 383.60, iv: 17.9, openInterest: 58900, volume: 7.9 }, pe: { premium: 329.10, iv: 17.4, openInterest: 47900, volume: 6.4 } },
  { strike: 48750, ce: { premium: 287.90, iv: 18.1, openInterest: 64200, volume: 8.5 }, pe: { premium: 390.20, iv: 17.7, openInterest: 52100, volume: 6.9 } },
  { strike: 49000, ce: { premium: 204.50, iv: 18.3, openInterest: 68100, volume: 9.0 }, pe: { premium: 457.60, iv: 18.0, openInterest: 56200, volume: 7.4 } },
];

const FINNIFTY_STRIKES: OptionStrike[] = [
  { strike: 23500, ce: { premium: 445.20, iv: 17.2, openInterest: 28900, volume: 4200 }, pe: { premium: 78.30, iv: 16.8, openInterest: 22100, volume: 3.1 } },
  { strike: 23750, ce: { premium: 374.60, iv: 17.5, openInterest: 34200, volume: 4.8 }, pe: { premium: 98.70, iv: 17.1, openInterest: 27800, volume: 3.8 } },
  { strike: 24000, ce: { premium: 309.40, iv: 17.8, openInterest: 40100, volume: 5.6 }, pe: { premium: 123.40, iv: 17.4, openInterest: 33200, volume: 4.5 } },
  { strike: 24250, ce: { premium: 249.80, iv: 18.0, openInterest: 45600, volume: 6.3 }, pe: { premium: 152.90, iv: 17.7, openInterest: 38900, volume: 5.2 } },
  { strike: 24500, ce: { premium: 195.50, iv: 18.2, openInterest: 50200, volume: 6.9 }, pe: { premium: 187.60, iv: 18.0, openInterest: 43100, volume: 5.8 } },
];

export const MOCK_OPTION_CHAINS: Record<string, MockOptionChain> = {
  NIFTY: {
    symbol: "NIFTY",
    spot: 24339.30,
    futures: 24466.30,
    lotSize: 65,
    iv: 16.91,
    ivPercentile: 77.42,
    dte: 20,
    expiries: ["26-MAY-2026", "30-JUN-2026", "25-JUL-2026", "29-AUG-2026"],
    strikes: NIFTY_STRIKES,
  },
  BANKNIFTY: {
    symbol: "BANKNIFTY",
    spot: 48462.50,
    futures: 48601.20,
    lotSize: 25,
    iv: 17.34,
    ivPercentile: 72.15,
    dte: 20,
    expiries: ["26-MAY-2026", "30-JUN-2026", "25-JUL-2026"],
    strikes: BANKNIFTY_STRIKES,
  },
  FINNIFTY: {
    symbol: "FINNIFTY",
    spot: 24156.80,
    futures: 24298.90,
    lotSize: 40,
    iv: 16.45,
    ivPercentile: 68.92,
    dte: 20,
    expiries: ["26-MAY-2026", "30-JUN-2026", "25-JUL-2026"],
    strikes: FINNIFTY_STRIKES,
  },
};

export function getMockOptionChain(symbol: string): MockOptionChain {
  return MOCK_OPTION_CHAINS[symbol] || MOCK_OPTION_CHAINS.NIFTY;
}
