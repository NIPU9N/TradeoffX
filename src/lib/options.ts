export type OptionType = "CE" | "PE";
export type PositionType = "BUY" | "SELL";

export interface OptionLeg {
  id: string;
  type: OptionType;
  position: PositionType;
  strike: number;
  premium: number;
  quantity: number;
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
  strikes: OptionStrikeData[];
}

export function calculatePayoff(legs: OptionLeg[], underlyingPrice: number): number {
  return legs.reduce((totalPnl, leg) => {
    let intrinsicValue = 0;
    if (leg.type === "CE") {
      intrinsicValue = Math.max(0, underlyingPrice - leg.strike);
    } else if (leg.type === "PE") {
      intrinsicValue = Math.max(0, leg.strike - underlyingPrice);
    }

    let legPnl = 0;
    if (leg.position === "BUY") {
      // PnL = Intrinsic Value - Premium Paid
      legPnl = (intrinsicValue - leg.premium) * leg.quantity;
    } else {
      // PnL = Premium Received - Intrinsic Value
      legPnl = (leg.premium - intrinsicValue) * leg.quantity;
    }

    return totalPnl + legPnl;
  }, 0);
}

export function generatePayoffCurve(legs: OptionLeg[], currentPrice: number, rangePercent = 0.1): { price: number; pnl: number }[] {
  if (legs.length === 0) return [];

  const strikes = legs.map((l) => l.strike);
  const minStrike = Math.min(...strikes, currentPrice);
  const maxStrike = Math.max(...strikes, currentPrice);

  const lowerBound = minStrike * (1 - rangePercent);
  const upperBound = maxStrike * (1 + rangePercent);

  const step = (upperBound - lowerBound) / 100;
  
  const curve = [];
  for (let price = lowerBound; price <= upperBound; price += step) {
    curve.push({
      price: Math.round(price * 100) / 100,
      pnl: Math.round(calculatePayoff(legs, price) * 100) / 100,
    });
  }

  // Also ensure we calculate exact points at each strike and current price for sharp angles
  const keyPoints = [...strikes, currentPrice].filter(p => p >= lowerBound && p <= upperBound);
  for (const kp of keyPoints) {
    const existing = curve.find((c) => Math.abs(c.price - kp) < step / 2);
    if (!existing) {
      curve.push({
        price: Math.round(kp * 100) / 100,
        pnl: Math.round(calculatePayoff(legs, kp) * 100) / 100,
      });
    }
  }

  return curve.sort((a, b) => a.price - b.price);
}

export function calculateStrategyMetrics(legs: OptionLeg[], currentPrice: number): StrategyMetrics {
  if (legs.length === 0) {
    return {
      maxProfit: 0,
      maxLoss: 0,
      netPremium: 0,
      breakevens: [],
      riskReward: "N/A"
    };
  }

  const curve = generatePayoffCurve(legs, currentPrice, 0.5); // Wide range for finding max/min
  
  // Calculate Net Premium
  let netPremium = 0;
  for (const leg of legs) {
    if (leg.position === "BUY") netPremium -= leg.premium * leg.quantity;
    if (leg.position === "SELL") netPremium += leg.premium * leg.quantity;
  }

  // Determine Max Profit and Max Loss
  let maxP = -Infinity;
  let maxL = Infinity;

  curve.forEach((point) => {
    if (point.pnl > maxP) maxP = point.pnl;
    if (point.pnl < maxL) maxL = point.pnl;
  });

  // Check if unbounded (if lowest or highest point is at the edges and slope is non-zero)
  const firstPoint = curve[0];
  const secondPoint = curve[1];
  const lastPoint = curve[curve.length - 1];
  const secondLastPoint = curve[curve.length - 2];

  const leftSlope = firstPoint.pnl - secondPoint.pnl;
  const rightSlope = lastPoint.pnl - secondLastPoint.pnl;

  let maxProfit: number | "Unlimited" = maxP;
  let maxLoss: number | "Unlimited" = maxL;

  if (leftSlope > 1 || rightSlope > 1) maxProfit = "Unlimited";
  if (leftSlope < -1 || rightSlope < -1) maxLoss = "Unlimited";

  // Calculate Breakevens (where PnL crosses 0)
  const breakevens: number[] = [];
  for (let i = 0; i < curve.length - 1; i++) {
    const p1 = curve[i];
    const p2 = curve[i + 1];
    if ((p1.pnl <= 0 && p2.pnl >= 0) || (p1.pnl >= 0 && p2.pnl <= 0)) {
      // Linear interpolation to find precise 0 crossing
      const ratio = Math.abs(p1.pnl) / (Math.abs(p1.pnl) + Math.abs(p2.pnl));
      const be = p1.price + ratio * (p2.price - p1.price);
      // Avoid duplicates
      if (!breakevens.some(b => Math.abs(b - be) < 0.1)) {
        breakevens.push(Math.round(be * 100) / 100);
      }
    }
  }

  // Risk Reward Ratio
  let riskReward = "N/A";
  if (maxProfit !== "Unlimited" && maxLoss !== "Unlimited" && maxLoss < 0 && maxProfit > 0) {
    riskReward = `1 : ${(Math.abs(maxProfit) / Math.abs(maxLoss)).toFixed(2)}`;
  } else if (maxProfit === "Unlimited" && typeof maxLoss === "number" && maxLoss < 0) {
    riskReward = "1 : Unlimited";
  } else if (maxLoss === "Unlimited") {
    riskReward = "Unlimited Risk";
  }

  return {
    maxProfit: maxProfit !== "Unlimited" ? Math.round(maxProfit * 100) / 100 : "Unlimited",
    maxLoss: maxLoss !== "Unlimited" ? Math.round(maxLoss * 100) / 100 : "Unlimited",
    netPremium: Math.round(netPremium * 100) / 100,
    breakevens: breakevens.sort((a, b) => a - b),
    riskReward
  };
}
