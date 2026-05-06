// Strategy template configurations
// Each template auto-fills positions when selected

export type StrategyCategory = "BULLISH" | "BEARISH" | "NON_DIRECTIONAL";

export interface PositionTemplate {
  type: "buy_call" | "sell_call" | "buy_put" | "sell_put";
  strikeOffset: number; // offset from ATM (0 = ATM, 500 = ATM+500, -500 = ATM-500)
  description?: string;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  category: StrategyCategory;
  description: string;
  positions: PositionTemplate[];
  riskProfile: "limited" | "unlimited";
  bestFor: string;
}

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  // BULLISH STRATEGIES
  {
    id: "long_call",
    name: "Long Call",
    category: "BULLISH",
    description: "Buy a call option",
    positions: [{ type: "buy_call", strikeOffset: 0 }],
    riskProfile: "limited",
    bestFor: "Moderate bullish, unlimited upside, limited risk",
  },
  {
    id: "short_put",
    name: "Short Put",
    category: "BULLISH",
    description: "Sell a put option",
    positions: [{ type: "sell_put", strikeOffset: 0 }],
    riskProfile: "unlimited",
    bestFor: "Mildly bullish, earn premium, willing to own stock",
  },
  {
    id: "bull_call_spread",
    name: "Bull Call Spread",
    category: "BULLISH",
    description: "Buy call + Sell higher call",
    positions: [
      { type: "buy_call", strikeOffset: 0 },
      { type: "sell_call", strikeOffset: 500 },
    ],
    riskProfile: "limited",
    bestFor: "Moderately bullish, limited risk & reward, lower cost",
  },
  {
    id: "bull_put_spread",
    name: "Bull Put Spread",
    category: "BULLISH",
    description: "Sell put + Buy lower put",
    positions: [
      { type: "sell_put", strikeOffset: 0 },
      { type: "buy_put", strikeOffset: -500 },
    ],
    riskProfile: "limited",
    bestFor: "Mildly bullish, credit spread, limited risk",
  },
  {
    id: "call_ratio_spread",
    name: "Call Ratio Spread",
    category: "BULLISH",
    description: "Buy call + Sell 2 higher calls",
    positions: [
      { type: "buy_call", strikeOffset: 0 },
      { type: "sell_call", strikeOffset: 500 },
      { type: "sell_call", strikeOffset: 500 },
    ],
    riskProfile: "unlimited",
    bestFor: "Moderately bullish, reduce cost, careful at higher strikes",
  },
  {
    id: "long_synthetic",
    name: "Long Synthetic",
    category: "BULLISH",
    description: "Buy call + Sell put at same strike",
    positions: [
      { type: "buy_call", strikeOffset: 0 },
      { type: "sell_put", strikeOffset: 0 },
    ],
    riskProfile: "unlimited",
    bestFor: "Very bullish, unlimited upside, willing to own stock",
  },
  {
    id: "range_forward",
    name: "Range Forward",
    category: "BULLISH",
    description: "Buy call + Sell put at lower strike",
    positions: [
      { type: "buy_call", strikeOffset: 0 },
      { type: "sell_put", strikeOffset: -500 },
    ],
    riskProfile: "unlimited",
    bestFor: "Bullish with downside protection range",
  },
  {
    id: "bullish_butterfly",
    name: "Bullish Butterfly",
    category: "BULLISH",
    description: "Buy 1 call ATM, Sell 2 calls above, Buy 1 call higher",
    positions: [
      { type: "buy_call", strikeOffset: 0 },
      { type: "sell_call", strikeOffset: 500 },
      { type: "sell_call", strikeOffset: 500 },
      { type: "buy_call", strikeOffset: 1000 },
    ],
    riskProfile: "limited",
    bestFor: "Moderately bullish, low cost, max profit at upper middle strike",
  },
  {
    id: "bullish_condor",
    name: "Bullish Condor",
    category: "BULLISH",
    description: "Buy lower call, Sell middle calls, Buy higher call",
    positions: [
      { type: "buy_call", strikeOffset: 0 },
      { type: "sell_call", strikeOffset: 250 },
      { type: "sell_call", strikeOffset: 750 },
      { type: "buy_call", strikeOffset: 1000 },
    ],
    riskProfile: "limited",
    bestFor: "Mildly bullish, high probability, wider profit range",
  },

  // BEARISH STRATEGIES
  {
    id: "long_put",
    name: "Long Put",
    category: "BEARISH",
    description: "Buy a put option",
    positions: [{ type: "buy_put", strikeOffset: 0 }],
    riskProfile: "limited",
    bestFor: "Moderate bearish, unlimited downside profit, limited risk",
  },
  {
    id: "short_call",
    name: "Short Call",
    category: "BEARISH",
    description: "Sell a call option",
    positions: [{ type: "sell_call", strikeOffset: 0 }],
    riskProfile: "unlimited",
    bestFor: "Mildly bearish, earn premium, limit upside exposure",
  },
  {
    id: "bear_call_spread",
    name: "Bear Call Spread",
    category: "BEARISH",
    description: "Sell call + Buy higher call",
    positions: [
      { type: "sell_call", strikeOffset: 0 },
      { type: "buy_call", strikeOffset: 500 },
    ],
    riskProfile: "limited",
    bestFor: "Moderately bearish, limited risk & reward, credit spread",
  },
  {
    id: "bear_put_spread",
    name: "Bear Put Spread",
    category: "BEARISH",
    description: "Buy put + Sell lower put",
    positions: [
      { type: "buy_put", strikeOffset: 0 },
      { type: "sell_put", strikeOffset: -500 },
    ],
    riskProfile: "limited",
    bestFor: "Mildly bearish, debit spread, limited risk",
  },
  {
    id: "put_ratio_spread",
    name: "Put Ratio Spread",
    category: "BEARISH",
    description: "Buy put + Sell 2 lower puts",
    positions: [
      { type: "buy_put", strikeOffset: 0 },
      { type: "sell_put", strikeOffset: -500 },
      { type: "sell_put", strikeOffset: -500 },
    ],
    riskProfile: "unlimited",
    bestFor: "Moderately bearish, reduce cost, careful below lower puts",
  },
  {
    id: "short_synthetic",
    name: "Short Synthetic",
    category: "BEARISH",
    description: "Buy put + Sell call at same strike",
    positions: [
      { type: "buy_put", strikeOffset: 0 },
      { type: "sell_call", strikeOffset: 0 },
    ],
    riskProfile: "unlimited",
    bestFor: "Very bearish, unlimited downside profit, willing to short",
  },
  {
    id: "reverse_range_forward",
    name: "Reverse Range Forward",
    category: "BEARISH",
    description: "Buy put + Sell call at higher strike",
    positions: [
      { type: "buy_put", strikeOffset: 0 },
      { type: "sell_call", strikeOffset: 500 },
    ],
    riskProfile: "unlimited",
    bestFor: "Bearish with upside protection range",
  },
  {
    id: "bearish_butterfly",
    name: "Bearish Butterfly",
    category: "BEARISH",
    description: "Buy 1 put ATM, Sell 2 puts below, Buy 1 put lower",
    positions: [
      { type: "buy_put", strikeOffset: 0 },
      { type: "sell_put", strikeOffset: -500 },
      { type: "sell_put", strikeOffset: -500 },
      { type: "buy_put", strikeOffset: -1000 },
    ],
    riskProfile: "limited",
    bestFor: "Moderately bearish, low cost, max profit at lower middle strike",
  },
  {
    id: "bearish_condor",
    name: "Bearish Condor",
    category: "BEARISH",
    description: "Buy higher put, Sell middle puts, Buy lower put",
    positions: [
      { type: "buy_put", strikeOffset: 0 },
      { type: "sell_put", strikeOffset: -250 },
      { type: "sell_put", strikeOffset: -750 },
      { type: "buy_put", strikeOffset: -1000 },
    ],
    riskProfile: "limited",
    bestFor: "Mildly bearish, high probability, wider profit range",
  },

  // NON-DIRECTIONAL STRATEGIES
  {
    id: "long_straddle",
    name: "Long Straddle",
    category: "NON_DIRECTIONAL",
    description: "Buy call + Buy put at same strike",
    positions: [
      { type: "buy_call", strikeOffset: 0 },
      { type: "buy_put", strikeOffset: 0 },
    ],
    riskProfile: "limited",
    bestFor: "Expect big move, direction unclear, unlimited profit potential",
  },
  {
    id: "short_straddle",
    name: "Short Straddle",
    category: "NON_DIRECTIONAL",
    description: "Sell call + Sell put at same strike",
    positions: [
      { type: "sell_call", strikeOffset: 0 },
      { type: "sell_put", strikeOffset: 0 },
    ],
    riskProfile: "unlimited",
    bestFor: "Expect low volatility, earn premium, stay near strike",
  },
  {
    id: "long_strangle",
    name: "Long Strangle",
    category: "NON_DIRECTIONAL",
    description: "Buy out-of-money call + Buy out-of-money put",
    positions: [
      { type: "buy_call", strikeOffset: 500 },
      { type: "buy_put", strikeOffset: -500 },
    ],
    riskProfile: "limited",
    bestFor: "Expect big move, want to reduce cost vs straddle",
  },
  {
    id: "short_strangle",
    name: "Short Strangle",
    category: "NON_DIRECTIONAL",
    description: "Sell out-of-money call + Sell out-of-money put",
    positions: [
      { type: "sell_call", strikeOffset: 500 },
      { type: "sell_put", strikeOffset: -500 },
    ],
    riskProfile: "unlimited",
    bestFor: "Expect low volatility, earn premium, wider range than straddle",
  },
  {
    id: "iron_butterfly",
    name: "Iron Butterfly",
    category: "NON_DIRECTIONAL",
    description: "Sell call + Buy higher call + Sell put + Buy lower put",
    positions: [
      { type: "sell_call", strikeOffset: 0 },
      { type: "buy_call", strikeOffset: 500 },
      { type: "sell_put", strikeOffset: 0 },
      { type: "buy_put", strikeOffset: -500 },
    ],
    riskProfile: "limited",
    bestFor: "Expect price to stay near ATM, high probability, limited risk",
  },
  {
    id: "iron_condor",
    name: "Iron Condor",
    category: "NON_DIRECTIONAL",
    description: "Bear call spread + Bull put spread",
    positions: [
      { type: "sell_call", strikeOffset: 500 },
      { type: "buy_call", strikeOffset: 1000 },
      { type: "sell_put", strikeOffset: -500 },
      { type: "buy_put", strikeOffset: -1000 },
    ],
    riskProfile: "limited",
    bestFor: "Expect low volatility, high probability, wider profit range",
  },
  {
    id: "calendar_spread_call",
    name: "Calendar Spread (Call)",
    category: "NON_DIRECTIONAL",
    description: "Sell near-term call + Buy far-term call at same strike",
    positions: [
      { type: "sell_call", strikeOffset: 0 },
      { type: "buy_call", strikeOffset: 0 },
    ],
    riskProfile: "limited",
    bestFor: "Neutral view, profit from theta decay, earn over time",
  },
  {
    id: "diagonal_spread_call",
    name: "Diagonal Spread (Call)",
    category: "NON_DIRECTIONAL",
    description: "Sell near-term call + Buy far-term call at higher strike",
    positions: [
      { type: "sell_call", strikeOffset: 0 },
      { type: "buy_call", strikeOffset: 500 },
    ],
    riskProfile: "limited",
    bestFor: "Slightly bullish, earn theta, benefit from vega",
  },
  {
    id: "ratio_spread",
    name: "Ratio Spread",
    category: "NON_DIRECTIONAL",
    description: "Buy 1 option + Sell 2 options at higher strike",
    positions: [
      { type: "buy_call", strikeOffset: 0 },
      { type: "sell_call", strikeOffset: 500 },
      { type: "sell_call", strikeOffset: 500 },
    ],
    riskProfile: "unlimited",
    bestFor: "Neutral with slight bullish edge, reduce cost, careful upside",
  },
];

export function getTemplatesByCategory(category: StrategyCategory): StrategyTemplate[] {
  return STRATEGY_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplate(id: string): StrategyTemplate | undefined {
  return STRATEGY_TEMPLATES.find((t) => t.id === id);
}
