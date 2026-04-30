"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { OptionLeg, calculateStrategyMetrics, generatePayoffCurve } from "@/lib/options";
import { StrategyLegManager } from "@/components/StrategyLegManager";
import { StrategyPayoffChart } from "@/components/StrategyPayoffChart";
import { KNOWN_ASSETS } from "@/lib/assets";
import { cn } from "@/lib/utils";

export default function BuilderPage() {
  const [legs, setLegs] = useState<OptionLeg[]>([]);
  const [underlyingPrice, setUnderlyingPrice] = useState(10000); // Default placeholder
  const [assetSearch, setAssetSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const stockSuggestions = useMemo(() => {
    const query = assetSearch.trim().toLowerCase();
    if (!query) return [];
    return KNOWN_ASSETS.filter((asset) =>
      asset.name.toLowerCase().includes(query) || asset.symbol.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [assetSearch]);

  const selectAsset = (asset: { symbol: string, name: string }) => {
    setSelectedAsset(asset.symbol);
    setAssetSearch(asset.name);
    // Optionally fetch live price here later
    setUnderlyingPrice(10000); // Reset or keep a default for now until real fetch
  };

  const payoffData = useMemo(() => generatePayoffCurve(legs, underlyingPrice, 0.15), [legs, underlyingPrice]);
  const metrics = useMemo(() => calculateStrategyMetrics(legs, underlyingPrice), [legs, underlyingPrice]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-syne text-4xl font-bold">Options Strategy Builder</h1>
          <p className="text-tx-text-secondary mt-2 max-w-2xl">
            Design, analyze, and visualize complex option strategies before putting your capital at risk.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          {/* Asset Selection */}
          <div className="glass-card p-6 border border-tx-border relative">
            <h3 className="font-syne text-lg font-bold mb-4">Underlying Asset</h3>
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
                placeholder="Search by symbol or company name"
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
          <div className="glass-card p-6 border border-tx-border">
            <StrategyLegManager legs={legs} onChange={setLegs} currentPrice={underlyingPrice} />
          </div>
        </div>

        {/* Strategy Summary Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-tx-border sticky top-6">
            <h3 className="font-syne text-lg font-bold mb-6">Strategy Summary</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-tx-text-secondary mb-1">Max Profit</div>
                  <div className={cn("font-mono text-lg font-bold", metrics.maxProfit > 0 || metrics.maxProfit === "Unlimited" ? "text-emerald-500" : "")}>
                    {metrics.maxProfit === "Unlimited" ? "Unlimited" : `₹${metrics.maxProfit}`}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-tx-bg/50 border border-tx-border/50">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-tx-text-secondary mb-1">Max Loss</div>
                  <div className={cn("font-mono text-lg font-bold", metrics.maxLoss < 0 || metrics.maxLoss === "Unlimited" ? "text-red-500" : "")}>
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
                <div className="font-mono font-bold text-white">
                  {metrics.riskReward}
                </div>
              </div>
              
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
    </div>
  );
}
