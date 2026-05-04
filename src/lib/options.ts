import { calculateBS } from "./blackScholes";

export type OptionType = "CE" | "PE";
export type PositionType = "BUY" | "SELL";

export interface OptionLeg {
  id: string;
  type: OptionType;
  position: PositionType;
  strike: number;
  premium: number;
  quantity: number;
  expiry: string; // e.g., "08-May-2025" — NSE format
  iv: number; // implied volatility as percent, e.g. 18.5
  lotSize: number;
}

export interface StrategyMetrics {
  maxProfit: number | "Unlimited";
  maxLoss: number | "Unlimited";
  netPremium: number;
  breakevens: number[];
  riskReward: string;
}

export interface OptionStrikeData {
  strikePrice: number;
  ce: {
    lastPrice: number;
    openInterest: number;
    impliedVolatility: number;
  };
  pe: {
    lastPrice: number;
    openInterest: number;
    impliedVolatility: number;
  };
}

export interface OptionChainData {
  symbol: string;
  underlyingValue: number;
  timestamp: string;
  isMocked: boolean;
  expiryDates: string[];  // All available expiry dates from NSE
  strikes: OptionStrikeData[];
}

export interface StrategyGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

const DEFAULT_LOT_SIZE = 1;

export function parseExpiryDate(expiry: string): Date | null {
  const [day, mon, year] = expiry.split("-");
  if (!day || !mon || !year) return null;
  const monthNames: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const month = monthNames[mon];
  if (month === undefined) return null;
  return new Date(Number(year), month, Number(day));
}

export function getTimeToExpiryInYears(expiry: string, asOf = new Date()): number {
  const expiryDate = parseExpiryDate(expiry);
  if (!expiryDate) return 0;
  const start = new Date(asOf);
  start.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);
  const ms = expiryDate.getTime() - start.getTime();
  return Math.max(0, ms / 1000 / 60 / 60 / 24 / 365);
}

export function getLotSizeForSymbol(symbol: string): number {
  const normalized = symbol.toUpperCase();
  switch (normalized) {
    case "NIFTY": return 50;
    case "BANKNIFTY": return 25;
    case "FINNIFTY": return 40;
    case "MIDCPNIFTY": return 25;
    case "SENSEX": return 1;
    default: return DEFAULT_LOT_SIZE;
  }
}

export function calculateLegPayoffAtExpiry(leg: OptionLeg, underlyingPrice: number): number {
  const intrinsic = leg.type === "CE"
    ? Math.max(0, underlyingPrice - leg.strike)
    : Math.max(0, leg.strike - underlyingPrice);

  const multiplier = leg.quantity * leg.lotSize;
  if (leg.position === "BUY") {
    return (intrinsic - leg.premium) * multiplier;
  }

  return (leg.premium - intrinsic) * multiplier;
}

export function calculateLegBreakevens(leg: OptionLeg): number[] {
  const premium = leg.premium;
  const strike = leg.strike;

  if (leg.type === "CE") {
    if (leg.position === "BUY") {
      return [strike + premium];
    }
    return [strike + premium];
  }

  if (leg.type === "PE") {
    if (leg.position === "BUY") {
      return [strike - premium];
    }
    return [strike - premium];
  }

  return [];
}

export function calculateLegGreeks(leg: OptionLeg, underlyingPrice: number, r = 0.065): StrategyGreeks {
  const t = getTimeToExpiryInYears(leg.expiry);
  const sigma = Math.max(leg.iv, 0) / 100;
  const bs = calculateBS(leg.type === "CE" ? "call" : "put", underlyingPrice, leg.strike, t, r, sigma);
  const multiplier = leg.quantity * leg.lotSize * (leg.position === "BUY" ? 1 : -1);

  return {
    delta: bs.delta * multiplier,
    gamma: bs.gamma * multiplier,
    theta: bs.theta * multiplier,
    vega: bs.vega * multiplier,
  };
}

export function calculateStrategyGreeks(legs: OptionLeg[], underlyingPrice: number, r = 0.065): StrategyGreeks {
  return legs.reduce((acc, leg) => {
    const greek = calculateLegGreeks(leg, underlyingPrice, r);
    return {
      delta: acc.delta + greek.delta,
      gamma: acc.gamma + greek.gamma,
      theta: acc.theta + greek.theta,
      vega: acc.vega + greek.vega,
    };
  }, { delta: 0, gamma: 0, theta: 0, vega: 0 });
}

export function generatePayoffCurve(legs: OptionLeg[], currentPrice: number, rangePercent = 0.1): { price: number; pnl: number }[] {
  if (legs.length === 0) return [];

  const strikes = legs.map((leg) => leg.strike);
  const minStrike = Math.min(...strikes, currentPrice);
  const maxStrike = Math.max(...strikes, currentPrice);

  const lowerBound = Math.min(minStrike - 1000, currentPrice * (1 - rangePercent));
  const upperBound = Math.max(maxStrike + 1000, currentPrice * (1 + rangePercent));
  const step = Math.max(1, Math.round((upperBound - lowerBound) / 120));

  const curve: { price: number; pnl: number }[] = [];
  for (let price = lowerBound; price <= upperBound; price += step) {
    curve.push({
      price: Math.round(price * 100) / 100,
      pnl: Math.round(calculateLegPayoffAtExpiry(legs[0], price) * 100) / 100,
    });
  }

  // use a proper aggregate function rather than only first leg
  const fullCurve = [];
  for (let price = lowerBound; price <= upperBound; price += step) {
    fullCurve.push({
      price: Math.round(price * 100) / 100,
      pnl: Math.round(legs.reduce((sum, leg) => sum + calculateLegPayoffAtExpiry(leg, price), 0) * 100) / 100,
    });
  }

  const keyPoints = [...strikes, currentPrice].filter((p) => p >= lowerBound && p <= upperBound);
  for (const kp of keyPoints) {
    if (!fullCurve.some((c) => Math.abs(c.price - kp) < step / 2)) {
      fullCurve.push({
        price: Math.round(kp * 100) / 100,
        pnl: Math.round(legs.reduce((sum, leg) => sum + calculateLegPayoffAtExpiry(leg, kp), 0) * 100) / 100,
      });
    }
  }

  return fullCurve.sort((a, b) => a.price - b.price);
}

function interpolateZeroCrossing(p1: { price: number; pnl: number }, p2: { price: number; pnl: number }): number {
  const difference = p2.pnl - p1.pnl;
  if (difference === 0) return p1.price;
  const ratio = Math.abs(p1.pnl) / Math.abs(difference);
  return p1.price + ratio * (p2.price - p1.price);
}

export function calculateBreakevens(curve: { price: number; pnl: number }[]): number[] {
  const breakevens: number[] = [];
  for (let i = 0; i < curve.length - 1; i++) {
    const p1 = curve[i];
    const p2 = curve[i + 1];
    if ((p1.pnl <= 0 && p2.pnl >= 0) || (p1.pnl >= 0 && p2.pnl <= 0)) {
      const be = interpolateZeroCrossing(p1, p2);
      if (!breakevens.some((existing) => Math.abs(existing - be) < 0.5)) {
        breakevens.push(Math.round(be * 100) / 100);
      }
    }
  }
  return breakevens.sort((a, b) => a - b);
}

export function calculateStrategyMetrics(legs: OptionLeg[], currentPrice: number): StrategyMetrics {
  if (legs.length === 0) {
    return {
      maxProfit: 0,
      maxLoss: 0,
      netPremium: 0,
      breakevens: [],
      riskReward: "N/A",
    };
  }

  const curve = generatePayoffCurve(legs, currentPrice, 0.2);

  const netPremium = legs.reduce((sum, leg) => {
    const premiumFlow = leg.premium * leg.quantity * leg.lotSize;
    return sum + (leg.position === "BUY" ? -premiumFlow : premiumFlow);
  }, 0);

  const maxProfitValue = Math.max(...curve.map((point) => point.pnl));
  const maxLossValue = Math.min(...curve.map((point) => point.pnl));

  const leftSlope = curve.length > 1 ? curve[1].pnl - curve[0].pnl : 0;
  const rightSlope = curve.length > 1 ? curve[curve.length - 1].pnl - curve[curve.length - 2].pnl : 0;

  const maxProfit: number | "Unlimited" = rightSlope > 0.5 || leftSlope > 0.5 ? "Unlimited" : Math.round(maxProfitValue * 100) / 100;
  const maxLoss: number | "Unlimited" = rightSlope < -0.5 || leftSlope < -0.5 ? "Unlimited" : Math.round(maxLossValue * 100) / 100;

  const breakevens = calculateBreakevens(curve);

  let riskReward = "N/A";
  if (maxProfit !== "Unlimited" && maxLoss !== "Unlimited" && maxLoss < 0 && maxProfit > 0) {
    riskReward = `1 : ${(Math.abs(maxProfit) / Math.abs(maxLoss)).toFixed(2)}`;
  } else if (maxProfit === "Unlimited" && typeof maxLoss === "number" && maxLoss < 0) {
    riskReward = "1 : Unlimited";
  } else if (maxLoss === "Unlimited") {
    riskReward = "Unlimited Risk";
  }

  return {
    maxProfit,
    maxLoss,
    netPremium: Math.round(netPremium * 100) / 100,
    breakevens,
    riskReward,
  };
}
