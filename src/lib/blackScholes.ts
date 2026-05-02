/**
 * Options Pricing Math Engine (Black-Scholes-Merton)
 */

// Normal Cumulative Distribution Function
export function CND(x: number): number {
  const a1 = 0.31938153;
  const a2 = -0.356563782;
  const a3 = 1.781477937;
  const a4 = -1.821255978;
  const a5 = 1.330274429;
  const l = Math.abs(x);
  const k = 1.0 / (1.0 + 0.2316419 * l);
  let w = 1.0 - 1.0 / Math.sqrt(2 * Math.PI) * Math.exp(-l * l / 2) * (a1 * k + a2 * k * k + a3 * Math.pow(k, 3) + a4 * Math.pow(k, 4) + a5 * Math.pow(k, 5));
  if (x < 0) {
    w = 1.0 - w;
  }
  return w;
}

// Normal Probability Density Function
export function ND(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export interface BSMetrics {
  price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

/**
 * Calculate Options Price and Greeks
 * @param type 'call' or 'put'
 * @param S Underlying Spot Price
 * @param K Strike Price
 * @param t Time to Expiration (in years) e.g., days/365
 * @param r Risk-Free Interest Rate (e.g., 0.10 for 10% in India)
 * @param v Volatility (IV) (e.g., 0.20 for 20%)
 */
export function calculateBS(
  type: 'call' | 'put',
  S: number,
  K: number,
  t: number,
  r: number,
  v: number
): BSMetrics {
  // Edge case: Expiry is now
  if (t <= 0) {
    const price = type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S);
    return { price, delta: type === 'call' ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0 };
  }

  // Edge case: Volatility is zero
  if (v <= 0) {
     const price = type === 'call' ? Math.max(0, S - K * Math.exp(-r * t)) : Math.max(0, K * Math.exp(-r * t) - S);
     return { price, delta: 0, gamma: 0, theta: 0, vega: 0 };
  }

  const d1 = (Math.log(S / K) + (r + v * v / 2) * t) / (v * Math.sqrt(t));
  const d2 = d1 - v * Math.sqrt(t);

  let price = 0;
  let delta = 0;
  let theta = 0;

  const gamma = ND(d1) / (S * v * Math.sqrt(t));
  const vega = S * ND(d1) * Math.sqrt(t) / 100; // Divide by 100 for 1% change

  if (type === 'call') {
    price = S * CND(d1) - K * Math.exp(-r * t) * CND(d2);
    delta = CND(d1);
    theta = (- (S * v * ND(d1)) / (2 * Math.sqrt(t)) - r * K * Math.exp(-r * t) * CND(d2)) / 365; // Per day
  } else {
    price = K * Math.exp(-r * t) * CND(-d2) - S * CND(-d1);
    delta = CND(d1) - 1;
    theta = (- (S * v * ND(d1)) / (2 * Math.sqrt(t)) + r * K * Math.exp(-r * t) * CND(-d2)) / 365; // Per day
  }

  return { price, delta, gamma, theta, vega };
}
