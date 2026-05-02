"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { OptionLeg, calculateStrategyMetrics, generatePayoffCurve, OptionChainData } from "@/lib/options";
import { calculateBS } from "@/lib/blackScholes";
import { StrategyLegManager } from "@/components/StrategyLegManager";
import { StrategyPayoffChart } from "@/components/StrategyPayoffChart";
import { KNOWN_ASSETS } from "@/lib/assets";
import { cn, DEVELOPER_EMAILS } from "@/lib/utils";
import { getProfile } from "@/lib/api";
import Link from "next/link";

function formatMinutesAgo(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} mins ago`;
}

export default function BuilderPage() {
  const [isDeveloper, setIsDeveloper] = useState<boolean | null>(null);
  const [legs, setLegs] = useState<OptionLeg[]>([]);
  const [underlyingPrice, setUnderlyingPrice] = useState(10000);
  const [assetSearch, setAssetSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [optionChain, setOptionChain] = useState<OptionChainData | null>(null);
  const [isFetchingChain, setIsFetchingChain] = useState(false);
  const [lastFetchAt, setLastFetchAt] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ticker, setTicker] = useState(0); // triggers re-render to update "X mins ago"

  useEffect(() => {
    const interval = setInterval(() => setTicker(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const stockSuggestions = useMemo(() => {
    const query = assetSearch.trim().toLowerCase();
    if (!query) return [];
    return KNOWN_ASSETS.filter((asset) =>
      asset.name.toLowerCase().includes(query) || asset.symbol.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [assetSearch]);

  useEffect(() => {
    async function checkAccess() {
      try {
        const { profile } = await getProfile();
        setIsDeveloper(profile?.email ? DEVELOPER_EMAILS.includes(profile.email) : false);
      } catch {
        setIsDeveloper(false);
      }
    }
    checkAccess();
  }, []);

  const fetchChain = useCallback(async (symbol: string) => {
    setIsFetchingChain(true);
    setFetchError(null);
    try {
      const response = await fetch(`/api/options/chain?symbol=${symbol}`);
      const data: OptionChainData & { error?: string } = await response.json();

      if (data.error || data.strikes.length === 0) {
        setFetchError(data.error || "No data in cache yet. The GitHub Actions worker may not have run yet during market hours.");
        if (!optionChain) setOptionChain(data);
      } else {
        setOptionChain(data);
        setLastFetchAt(new Date().toISOString());
        if (data.underlyingValue > 0) setUnderlyingPrice(data.underlyingValue);
        setFetchError(null);
      }
    } catch {
      setFetchError("Network error. Using last available snapshot.");
    } finally {
      setIsFetchingChain(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedAsset) return;
    fetchChain(selectedAsset);
  }, [selectedAsset, fetchChain]);

  const selectAsset = (asset: { symbol: string; name: string }) => {
    setSelectedAsset(asset.symbol);
    setAssetSearch(asset.name);
    setLegs([]);
    setOptionChain(null);
    setLastFetchAt(null);
    setFetchError(null);
  };

  const payoffData = useMemo(() => generatePayoffCurve(legs, underlyingPrice, 0.15), [legs, underlyingPrice]);
  const metrics = useMemo(() => calculateStrategyMetrics(legs, underlyingPrice), [legs, underlyingPrice]);

  const greeks = useMemo(() => {
    if (legs.length === 0) return null;
    let delta = 0, gamma = 0, theta = 0, vega = 0;
    const r = 0.065;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const leg of legs) {
      const strike = optionChain?.strikes.find(s => s.strikePrice === leg.strike);
      const iv = leg.type === "CE"
        ? (strike?.ce.impliedVolatility ?? 15) / 100
        : (strike?.pe.impliedVolatility ?? 15) / 100;

      // Compute actual DTE from the leg's expiry string (e.g., "08-May-2025")
      let dte = 7;
      if (leg.expiry) {
        const expiryDate = new Date(leg.expiry);
        if (!isNaN(expiryDate.getTime())) {
          dte = Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / 86400000));
        }
      }
      const t = Math.max(dte, 0.5) / 365; // min 0.5 days to avoid divide by zero

      const bs = calculateBS(
        leg.type === "CE" ? "call" : "put",
        underlyingPrice,
        leg.strike,
        t,
        r,
        iv
      );
      const mult = leg.position === "BUY" ? 1 : -1;
      delta += bs.delta * mult * leg.quantity;
      gamma += bs.gamma * mult * leg.quantity;
      theta += bs.theta * mult * leg.quantity;
      vega += bs.vega * mult * leg.quantity;
    }
    return { delta, gamma, theta, vega };
  }, [legs, underlyingPrice, optionChain]);


  if (isDeveloper === null) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-tx-primary animate-spin" />
      </div>
    );
  }

  if (isDeveloper === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="w-16 h-16 bg-tx-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-tx-primary/20">
          <span className="text-3xl">🏗️</span>
        </div>
        <h1 className="font-syne text-3xl font-bold mb-3">Developer Preview</h1>
        <p className="text-tx-text-secondary max-w-md mb-8">
          The Options Strategy Builder is currently in closed testing. It will be available to all users in an upcoming release.
        </p>
        <Link href="/dashboard" className="bg-tx-primary text-tx-bg font-bold px-6 py-3 rounded-xl transition-all hover:opacity-90">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const dataAgeWarning = lastFetchAt && (() => {
    const mins = Math.floor((Date.now() - new Date(lastFetchAt).getTime()) / 60000);
    return mins > 6;
  })();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-syne text-4xl font-bold">Options Strategy Builder</h1>
          <p className="text-tx-text-secondary mt-2 max-w-2xl">
            Design, analyze, and visualize complex option strategies before putting your capital at risk.
          </p>
        </div>
        {lastFetchAt && (
          <div className={cn(
            "flex items-center gap-2 text-xs px-3 py-2 rounded-xl border",
            dataAgeWarning
              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          )}>
            {dataAgeWarning ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            <span>Data from {formatMinutesAgo(lastFetchAt)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          {/* Asset Selection */}
          <div className="glass-card p-6 border border-tx-border relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne text-lg font-bold">Underlying Asset</h3>
              {selectedAsset && (
                <button
                  onClick={() => fetchChain(selectedAsset)}
                  disabled={isFetchingChain}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-tx-primary/10 text-tx-primary border border-tx-primary/20 hover:bg-tx-primary/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-3 h-3", isFetchingChain && "animate-spin")} />
                  {isFetchingChain ? "Fetching..." : "Refresh Data"}
                </button>
              )}
            </div>

            {fetchError && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Could not fetch fresh data</p>
                  <p className="mt-0.5 text-yellow-400/70">{fetchError}</p>
                  {lastFetchAt && <p className="mt-1 text-yellow-400/50">Showing snapshot from {formatMinutesAgo(lastFetchAt)}.</p>}
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-tx-text-secondary" />
              </div>
              <input
                type="text"
                value={assetSearch}
                onChange={(e) => {
                  setAssetSearch(e.target.value);
                  if (selectedAsset) setSelectedAsset(null);
                }}
                placeholder="Search NIFTY, BANKNIFTY, or equity symbol…"
                className="w-full bg-tx-bg border border-tx-border rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-tx-primary transition-colors"
              />
            </div>

            {!selectedAsset && stockSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-tx-card border border-tx-border rounded-xl shadow-xl p-2 left-0">
                {stockSuggestions.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => selectAsset(asset)}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm text-white transition hover:bg-tx-primary/10 flex justify-between items-center"
                  >
                    <span className="font-semibold">{asset.name}</span>
                    <span className="text-[11px] text-tx-text-secondary uppercase tracking-[0.2em]">{asset.symbol}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Current Underlying Price (Editable)</label>
                <input
                  type="number"
                  value={underlyingPrice}
                  onChange={(e) => setUnderlyingPrice(Number(e.target.value))}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                />
              </div>
            </div>
          </div>

          {/* Payoff Chart */}
          <div className="glass-card p-6 border border-tx-border">
            <h3 className="font-syne text-lg font-bold mb-4">Payoff Chart at Expiration</h3>
            <StrategyPayoffChart data={payoffData} currentPrice={underlyingPrice} />
          </div>

          {/* Legs Manager */}
          <div className="glass-card p-6 border border-tx-border relative overflow-hidden">
            {isFetchingChain && (
              <div className="absolute inset-0 z-20 bg-tx-bg/80 backdrop-blur-sm flex flex-col items-center justify-center border border-tx-primary/30 rounded-xl">
                <Loader2 className="w-8 h-8 text-tx-primary animate-spin mb-3" />
                <p className="text-sm font-semibold text-white">Loading from Supabase Cache…</p>
                <p className="text-xs text-tx-text-secondary mt-1 max-w-xs text-center">Reading latest snapshot from our NSE data cache</p>
              </div>
            )}
            <StrategyLegManager
              legs={legs}
              onChange={setLegs}
              currentPrice={underlyingPrice}
              optionChain={optionChain}
            />
          </div>
        </div>

        {/* Strategy Summary Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-tx-border sticky top-6 space-y-6">
            <h3 className="font-syne text-lg font-bold">Strategy Summary</h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-tx-text-secondary mb-1">Max Profit</div>
                  <div className={cn("font-mono text-lg font-bold", metrics.maxProfit === "Unlimited" || (typeof metrics.maxProfit === "number" && metrics.maxProfit > 0) ? "text-emerald-500" : "")}>
                    {metrics.maxProfit === "Unlimited" ? "Unlimited" : `₹${metrics.maxProfit}`}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-tx-text-secondary mb-1">Max Loss</div>
                  <div className={cn("font-mono text-lg font-bold", metrics.maxLoss === "Unlimited" || (typeof metrics.maxLoss === "number" && metrics.maxLoss < 0) ? "text-red-500" : "")}>
                    {metrics.maxLoss === "Unlimited" ? "Unlimited" : `₹${Math.abs(metrics.maxLoss as number)}`}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50 flex justify-between items-center">
                <div className="text-sm text-tx-text-secondary">Net Premium</div>
                <div className={cn("font-mono font-bold", metrics.netPremium >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {metrics.netPremium >= 0 ? "Credit " : "Debit "}
                  ₹{Math.abs(metrics.netPremium).toFixed(2)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                <div className="text-[10px] uppercase tracking-[0.2em] text-tx-text-secondary mb-2">Breakeven Points</div>
                <div className="flex flex-wrap gap-2">
                  {metrics.breakevens.length > 0 ? (
                    metrics.breakevens.map((be, idx) => (
                      <span key={idx} className="px-3 py-1 bg-tx-primary/10 text-tx-primary border border-tx-primary/20 rounded-lg font-mono text-sm">
                        ₹{be.toFixed(2)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-tx-text-secondary">None</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50 flex justify-between items-center">
                <div className="text-sm text-tx-text-secondary">Risk : Reward</div>
                <div className="font-mono font-bold text-white">{metrics.riskReward}</div>
              </div>
            </div>

            {/* Greeks Panel */}
            {greeks && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-tx-text-secondary mb-3 flex items-center gap-2">
                  <span>Greeks</span>
                  <span className="text-tx-primary text-[9px] bg-tx-primary/10 border border-tx-primary/20 px-1.5 py-0.5 rounded">B-S Model</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Delta", value: greeks.delta.toFixed(3), color: greeks.delta >= 0 ? "text-emerald-400" : "text-red-400" },
                    { label: "Gamma", value: greeks.gamma.toFixed(4), color: "text-blue-400" },
                    { label: "Theta / day", value: `₹${greeks.theta.toFixed(2)}`, color: greeks.theta >= 0 ? "text-emerald-400" : "text-red-400" },
                    { label: "Vega / 1%", value: `₹${greeks.vega.toFixed(2)}`, color: "text-purple-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                      <div className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">{label}</div>
                      <div className={cn("font-mono text-sm font-bold", color)}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="w-full py-3 px-4 bg-tx-primary text-tx-bg font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
              disabled={legs.length === 0}
            >
              Execute Practice Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
