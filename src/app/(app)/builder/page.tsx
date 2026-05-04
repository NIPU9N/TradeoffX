"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { OptionLeg, calculateStrategyMetrics, calculateStrategyGreeks, generatePayoffCurve, getLotSizeForSymbol, OptionChainData, StrategyGreeks } from "@/lib/options";
import { StrategyLegManager } from "@/components/StrategyLegManager";
import { StrategyPayoffChart } from "@/components/StrategyPayoffChart";
import { KNOWN_ASSETS } from "@/lib/assets";
import { cn } from "@/lib/utils";

function formatMinutesAgo(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} mins ago`;
}

export default function BuilderPage() {
  const [legs, setLegs] = useState<OptionLeg[]>([]);
  const [underlyingPrice, setUnderlyingPrice] = useState(10000);
  const [assetSearch, setAssetSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string>("NIFTY");
  const [optionChain, setOptionChain] = useState<OptionChainData | null>(null);
  const [isFetchingChain, setIsFetchingChain] = useState(false);
  const [lastFetchAt, setLastFetchAt] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [ticker, setTicker] = useState(0);

  const [selectedExpiry, setSelectedExpiry] = useState<string>("");
  const [selectedStrike, setSelectedStrike] = useState<number>(0);
  const [selectedOptionType, setSelectedOptionType] = useState<"CE" | "PE">("CE");
  const [selectedPosition, setSelectedPosition] = useState<"BUY" | "SELL">("BUY");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedPremium, setSelectedPremium] = useState<number>(0);
  const [selectedIv, setSelectedIv] = useState<number>(15);

  useEffect(() => {
    const interval = setInterval(() => setTicker((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const stockSuggestions = useMemo(() => {
    const query = assetSearch.trim().toLowerCase();
    if (!query) return [];
    return KNOWN_ASSETS.filter((asset) =>
      asset.name.toLowerCase().includes(query) || asset.symbol.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [assetSearch]);

  const fetchChain = useCallback(async (symbol: string) => {
    setIsFetchingChain(true);
    setFetchError(null);
    try {
      const response = await fetch(`/api/options/chain?symbol=${encodeURIComponent(symbol)}`);
      const data: OptionChainData & { error?: string } = await response.json();

      if (data.error || data.strikes.length === 0) {
        setFetchError(data.error || "No option chain data available.");
        if (!optionChain) setOptionChain(data);
      } else {
        setOptionChain(data);
        setLastFetchAt(new Date().toISOString());
        if (data.underlyingValue > 0) setUnderlyingPrice(data.underlyingValue);
      }
    } catch {
      setFetchError("Network error while fetching option chain.");
    } finally {
      setIsFetchingChain(false);
    }
  }, [optionChain]);

  useEffect(() => {
    if (!selectedAsset) return;
    fetchChain(selectedAsset);
  }, [selectedAsset, fetchChain]);

  useEffect(() => {
    if (!optionChain) return;
    setSelectedExpiry(optionChain.expiryDates[0] ?? "");
    const atmStrike = optionChain.strikes.reduce((prev, curr) =>
      Math.abs(curr.strikePrice - optionChain.underlyingValue) < Math.abs(prev.strikePrice - optionChain.underlyingValue) ? curr : prev
    ).strikePrice;
    setSelectedStrike(atmStrike);
    setSelectedOptionType("CE");
  }, [optionChain]);

  useEffect(() => {
    if (!optionChain) return;
    const strikeData = optionChain.strikes.find((s) => s.strikePrice === selectedStrike);
    if (strikeData) {
      const option = selectedOptionType === "CE" ? strikeData.ce : strikeData.pe;
      setSelectedPremium(option.lastPrice ?? 0);
      setSelectedIv(option.impliedVolatility ?? 15);
    }
  }, [selectedStrike, selectedOptionType, optionChain]);

  const selectAsset = (asset: { symbol: string; name: string }) => {
    setSelectedAsset(asset.symbol);
    setAssetSearch(asset.name);
    setLegs([]);
    setOptionChain(null);
    setLastFetchAt(null);
    setFetchError(null);
  };

  const addLeg = () => {
    if (!selectedExpiry || !selectedStrike) return;
    const lotSize = getLotSizeForSymbol(selectedAsset);

    const nextLeg: OptionLeg = {
      id: Math.random().toString(36).slice(2),
      type: selectedOptionType,
      position: selectedPosition,
      strike: selectedStrike,
      premium: selectedPremium,
      quantity: selectedQuantity,
      expiry: selectedExpiry,
      iv: selectedIv,
      lotSize,
    };

    setLegs((current) => [...current, nextLeg]);
  };

  const resetStrategy = () => {
    setLegs([]);
  };

  const payoffData = useMemo(() => generatePayoffCurve(legs, underlyingPrice, 0.15), [legs, underlyingPrice]);
  const metrics = useMemo(() => calculateStrategyMetrics(legs, underlyingPrice), [legs, underlyingPrice]);
  const greeks: StrategyGreeks | null = useMemo(() => {
    if (legs.length === 0) return null;
    return calculateStrategyGreeks(legs, underlyingPrice);
  }, [legs, underlyingPrice]);

  const strikeOptions = useMemo(() => {
    if (!optionChain) return [];
    return [...optionChain.strikes].sort((a, b) => a.strikePrice - b.strikePrice);
  }, [optionChain]);

  const currentStrikeData = useMemo(() => {
    return optionChain?.strikes.find((s) => s.strikePrice === selectedStrike) ?? null;
  }, [optionChain, selectedStrike]);

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
            Design, analyze, and visualize option strategies with accurate payoff math, Greeks, and breakeven analysis.
          </p>
        </div>
        {lastFetchAt && (
          <div className={cn(
            "flex items-center gap-2 text-xs px-3 py-2 rounded-xl border",
            fetchError ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          )}>
            {fetchError ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            <span>{fetchError ? "Data may be stale" : `Data from ${formatMinutesAgo(lastFetchAt)}`}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
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
                  {isFetchingChain ? "Refreshing" : "Refresh"}
                </button>
              )}
            </div>

            {fetchError && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Unable to refresh data</p>
                  <p className="mt-0.5 text-yellow-400/70">{fetchError}</p>
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
                  if (selectedAsset) setSelectedAsset("");
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

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Spot Price</div>
                <input
                  type="number"
                  value={underlyingPrice}
                  onChange={(e) => setUnderlyingPrice(Number(e.target.value))}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Expiry</div>
                <select
                  value={selectedExpiry}
                  onChange={(e) => setSelectedExpiry(e.target.value)}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                >
                  {optionChain?.expiryDates.map((expiry) => (
                    <option key={expiry} value={expiry}>{expiry}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                <div className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-2">Spot</div>
                <div className="font-sans text-2xl font-bold">{underlyingPrice.toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                <div className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-2">IV</div>
                <div className="font-sans text-2xl font-bold">{currentStrikeData ? currentStrikeData[selectedOptionType === "CE" ? "ce" : "pe"].impliedVolatility.toFixed(2) : selectedIv}%</div>
              </div>
              <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                <div className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-2">Lot Size</div>
                <div className="font-sans text-2xl font-bold">{getLotSizeForSymbol(selectedAsset)}</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-tx-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-syne text-lg font-bold">Add Leg</h3>
                <p className="text-sm text-tx-text-secondary">Use the selected strike, expiry and premium to add a new leg to your strategy.</p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-tx-text-secondary">
                {optionChain ? "Live option chain" : "Manual entry"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-2 block">Position</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value as "BUY" | "SELL")}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-2 block">Option Type</label>
                <select
                  value={selectedOptionType}
                  onChange={(e) => setSelectedOptionType(e.target.value as "CE" | "PE")}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                >
                  <option value="CE">Call (CE)</option>
                  <option value="PE">Put (PE)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-2 block">Expiry</label>
                <select
                  value={selectedExpiry}
                  onChange={(e) => setSelectedExpiry(e.target.value)}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                >
                  {optionChain?.expiryDates.map((expiry) => (
                    <option key={expiry} value={expiry}>{expiry}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-2 block">Strike</label>
                {strikeOptions.length > 0 ? (
                  <select
                    value={selectedStrike}
                    onChange={(e) => setSelectedStrike(Number(e.target.value))}
                    className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                  >
                    {strikeOptions.map((option) => (
                      <option key={option.strikePrice} value={option.strikePrice}>{option.strikePrice}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={selectedStrike}
                    onChange={(e) => setSelectedStrike(Number(e.target.value))}
                    className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                  />
                )}
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-2 block">Premium</label>
                <input
                  type="number"
                  value={selectedPremium}
                  onChange={(e) => setSelectedPremium(Number(e.target.value))}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                  readOnly={!!optionChain}
                  title={optionChain ? "Auto-filled from the option chain" : "Enter premium manually"}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-2 block">IV (%)</label>
                <input
                  type="number"
                  value={selectedIv}
                  onChange={(e) => setSelectedIv(Number(e.target.value))}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 items-end">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-2 block">Quantity</label>
                <input
                  type="number"
                  value={selectedQuantity}
                  min={1}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                />
              </div>
              <button
                onClick={addLeg}
                disabled={!selectedExpiry || selectedStrike === 0 || selectedQuantity < 1}
                className="w-full py-3 px-4 bg-tx-primary text-tx-bg font-bold rounded-xl transition hover:opacity-90 disabled:opacity-50"
              >
                Add Leg to Strategy
              </button>
            </div>
          </div>

          <div className="glass-card p-6 border border-tx-border">
            <h3 className="font-syne text-lg font-bold mb-4">Payoff Chart at Expiration</h3>
            <StrategyPayoffChart data={payoffData} currentPrice={underlyingPrice} />
          </div>

          <div className="glass-card p-6 border border-tx-border relative overflow-hidden">
            {isFetchingChain && (
              <div className="absolute inset-0 z-20 bg-tx-bg/80 backdrop-blur-sm flex flex-col items-center justify-center border border-tx-primary/30 rounded-xl">
                <Loader2 className="w-8 h-8 text-tx-primary animate-spin mb-3" />
                <p className="text-sm font-semibold text-white">Loading option chain…</p>
                <p className="text-xs text-tx-text-secondary mt-1 max-w-xs text-center">Fetching expiries, strikes, and implied vol from NSE.</p>
              </div>
            )}
            <StrategyLegManager
              legs={legs}
              onChange={setLegs}
              currentPrice={underlyingPrice}
              optionChain={optionChain}
            />
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={resetStrategy}
                className="w-full py-3 px-4 bg-tx-bg border border-tx-border text-tx-text-secondary rounded-xl transition hover:bg-tx-bg/80"
              >
                Reset Strategy
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border border-tx-border sticky top-6 space-y-6">
            <h3 className="font-syne text-lg font-bold">Strategy Summary</h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-tx-text-secondary mb-1">Max Profit</div>
                  <div className={cn("font-mono text-lg font-bold", metrics.maxProfit === "Unlimited" ? "text-emerald-500" : "text-white")}>
                    {metrics.maxProfit === "Unlimited" ? "Unlimited" : `${metrics.maxProfit}`}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-tx-text-secondary mb-1">Max Loss</div>
                  <div className={cn("font-mono text-lg font-bold", metrics.maxLoss === "Unlimited" ? "text-red-500" : "text-white")}>
                    {metrics.maxLoss === "Unlimited" ? "Unlimited" : `${Math.abs(metrics.maxLoss as number)}`}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50 flex justify-between items-center">
                <span className="text-sm text-tx-text-secondary">Net Premium</span>
                <span className={cn("font-mono font-bold", metrics.netPremium >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {metrics.netPremium >= 0 ? "Credit" : "Debit"} {Math.abs(metrics.netPremium).toFixed(2)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                <div className="text-[10px] uppercase tracking-[0.2em] text-tx-text-secondary mb-2">Breakeven Points</div>
                <div className="flex flex-wrap gap-2">
                  {metrics.breakevens.length > 0 ? (
                    metrics.breakevens.map((be, idx) => (
                      <span key={idx} className="px-3 py-1 bg-tx-primary/10 text-tx-primary border border-tx-primary/20 rounded-lg font-mono text-sm">
                        {be.toFixed(2)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-tx-text-secondary">None</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50 flex justify-between items-center">
                <span className="text-sm text-tx-text-secondary">Risk : Reward</span>
                <span className="font-mono font-bold text-white">{metrics.riskReward}</span>
              </div>
            </div>

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
                    { label: "Theta / day", value: `${greeks.theta.toFixed(2)}`, color: greeks.theta >= 0 ? "text-emerald-400" : "text-red-400" },
                    { label: "Vega / 1%", value: `${greeks.vega.toFixed(2)}`, color: "text-purple-400" },
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
