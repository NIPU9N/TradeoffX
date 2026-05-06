"use client";

import { useMemo } from "react";
import { MockOptionChain } from "@/lib/mockOptionChain";
import { cn } from "@/lib/utils";

interface OptionsTopBarProps {
  selectedUnderlying: string;
  onSelectUnderlying: (symbol: string) => void;
  optionChain: MockOptionChain;
}

export function OptionsTopBar({
  selectedUnderlying,
  onSelectUnderlying,
  optionChain,
}: OptionsTopBarProps) {
  const underlyingOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY"];

  return (
    <div className="border-b border-tx-border bg-tx-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Underlying Selector */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-semibold text-tx-text-secondary">Underlying:</label>
          <select
            value={selectedUnderlying}
            onChange={(e) => onSelectUnderlying(e.target.value)}
            className="bg-tx-bg border border-tx-border rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-tx-primary transition-colors"
          >
            {underlyingOptions.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-6 gap-3">
          {/* Spot Price */}
          <div className="bg-tx-bg border border-tx-border/50 rounded-lg p-3 flex flex-col">
            <p className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Spot</p>
            <p className="text-lg font-bold text-white">₹{optionChain.spot.toFixed(2)}</p>
          </div>

          {/* Futures Price */}
          <div className="bg-tx-bg border border-tx-border/50 rounded-lg p-3 flex flex-col">
            <p className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Futures</p>
            <p className="text-lg font-bold text-white">₹{optionChain.futures.toFixed(2)}</p>
          </div>

          {/* Lot Size */}
          <div className="bg-tx-bg border border-tx-border/50 rounded-lg p-3 flex flex-col">
            <p className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Lot Size</p>
            <p className="text-lg font-bold text-white">{optionChain.lotSize}</p>
          </div>

          {/* IV */}
          <div className="bg-tx-bg border border-tx-border/50 rounded-lg p-3 flex flex-col">
            <p className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">IV</p>
            <p className="text-lg font-bold text-white">{optionChain.iv.toFixed(2)}</p>
          </div>

          {/* IV Percentile */}
          <div className="bg-tx-bg border border-tx-border/50 rounded-lg p-3 flex flex-col">
            <p className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">IV%ile</p>
            <p className="text-lg font-bold text-white">{optionChain.ivPercentile.toFixed(2)}</p>
          </div>

          {/* DTE */}
          <div className="bg-tx-bg border border-tx-border/50 rounded-lg p-3 flex flex-col">
            <p className="text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">DTE</p>
            <p className="text-lg font-bold text-white">{optionChain.dte}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
