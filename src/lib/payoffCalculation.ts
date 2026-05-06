import { OptionPosition } from "@/app/(app)/options/page";
import { calculateBS } from "./blackScholes";

const RISK_FREE_RATE = 0.06; // 6% annual
const DAYS_IN_YEAR = 365;

export interface PayoffData {
  spotPrice: number;
  payoff: number;
  breakeven?: boolean;
}

export interface StrategyMetrics {
  maxProfit: number;
  maxLoss: number;
  breakevens: number[];
  profitRange: { min: number; max: number };
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
}

export function calculatePayoff(
  positions: OptionPosition[],
  spotPrice: number,
  spotAtEntry: number,
  daysToExpiry: number
): number {
  let totalPayoff = 0;

  for (const position of positions) {
    const strikeDistance = spotPrice - position.strike;
    let optionPayoff = 0;

    if (position.type === "buy_call") {
      optionPayoff = Math.max(strikeDistance, 0) - position.premium;
    } else if (position.type === "sell_call") {
      optionPayoff = position.premium - Math.max(strikeDistance, 0);
    } else if (position.type === "buy_put") {
      optionPayoff = Math.max(-strikeDistance, 0) - position.premium;
    } else if (position.type === "sell_put") {
      optionPayoff = position.premium - Math.max(-strikeDistance, 0);
    }

    totalPayoff += optionPayoff * position.quantity * position.lotSize;
  }

  return totalPayoff;
}

export function generatePayoffChartData(
  positions: OptionPosition[],
  spotAtEntry: number,
  daysToExpiry: number,
  range: number = 0.15 // ±15% from spot
): PayoffData[] {
  const data: PayoffData[] = [];
  const minSpot = spotAtEntry * (1 - range);
  const maxSpot = spotAtEntry * (1 + range);
  const step = (maxSpot - minSpot) / 50; // 50 points for smooth curve

  for (let spot = minSpot; spot <= maxSpot; spot += step) {
    const payoff = calculatePayoff(positions, spot, spotAtEntry, daysToExpiry);
    data.push({
      spotPrice: spot,
      payoff,
    });
  }

  return data;
}

export function calculateStrategyMetrics(
  positions: OptionPosition[],
  spotAtEntry: number,
  daysToExpiry: number
): StrategyMetrics {
  const range = 0.2; // ±20% for analysis
  const minSpot = spotAtEntry * (1 - range);
  const maxSpot = spotAtEntry * (1 + range);

  let maxProfit = -Infinity;
  let maxLoss = Infinity;
  const breakevens: number[] = [];

  const step = (maxSpot - minSpot) / 200;
  let lastPayoff = calculatePayoff(positions, minSpot, spotAtEntry, daysToExpiry);

  for (let spot = minSpot; spot <= maxSpot; spot += step) {
    const payoff = calculatePayoff(positions, spot, spotAtEntry, daysToExpiry);

    maxProfit = Math.max(maxProfit, payoff);
    maxLoss = Math.min(maxLoss, payoff);

    // Find breakeven points (payoff crosses zero)
    if ((lastPayoff < 0 && payoff >= 0) || (lastPayoff >= 0 && payoff < 0)) {
      breakevens.push(spot);
    }

    lastPayoff = payoff;
  }

  // Calculate Greeks at current spot
  const greeks = calculatePositionGreeks(positions, spotAtEntry, daysToExpiry);

  return {
    maxProfit: Math.max(maxProfit, 0),
    maxLoss: Math.min(maxLoss, 0),
    breakevens: Array.from(new Set(breakevens.map((x) => Math.round(x * 100) / 100))),
    profitRange: { min: minSpot, max: maxSpot },
    greeks,
  };
}

export function calculatePositionGreeks(
  positions: OptionPosition[],
  spotPrice: number,
  daysToExpiry: number
): { delta: number; gamma: number; theta: number; vega: number } {
  let totalDelta = 0;
  let totalGamma = 0;
  let totalTheta = 0;
  let totalVega = 0;

  for (const position of positions) {
    const timeToExpiry = daysToExpiry / DAYS_IN_YEAR;
    const isCall = position.type.includes("call");
    const multiplier = position.type.startsWith("buy") ? 1 : -1;

    const bs = calculateBS(
      isCall ? 'call' : 'put',
      spotPrice,
      position.strike,
      timeToExpiry,
      RISK_FREE_RATE,
      position.iv
    );

    totalDelta += bs.delta * multiplier * position.quantity * position.lotSize;
    totalGamma += bs.gamma * multiplier * position.quantity * position.lotSize;
    totalTheta += bs.theta * multiplier * position.quantity * position.lotSize;
    totalVega += bs.vega * multiplier * position.quantity * position.lotSize;
  }

  return { delta: totalDelta, gamma: totalGamma, theta: totalTheta, vega: totalVega };
}
