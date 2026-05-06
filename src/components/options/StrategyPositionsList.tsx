"use client";

import { OptionPosition } from "@/app/(app)/options/page";
import { MockOptionChain } from "@/lib/mockOptionChain";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrategyPositionsListProps {
  positions: OptionPosition[];
  onRemove: (id: string) => void;
  onReset: () => void;
  optionChain: MockOptionChain;
  onSaveStrategy?: () => void;
  onViewSaved?: () => void;
}

export function StrategyPositionsList({
  positions,
  onRemove,
  onReset,
  optionChain,
  onSaveStrategy,
  onViewSaved,
}: StrategyPositionsListProps) {
  const getPositionLabel = (type: string) => {
    const labels: Record<string, string> = {
      buy_call: "Buy Call",
      sell_call: "Sell Call",
      buy_put: "Buy Put",
      sell_put: "Sell Put",
    };
    return labels[type] || type;
  };

  const getPositionColor = (type: string) => {
    return type.startsWith("buy") ? "text-emerald-500" : "text-red-500";
  };

  if (positions.length === 0) {
    return (
      <div className="glass-card p-6 border border-tx-border rounded-xl text-center">
        <p className="text-tx-text-secondary">No positions added yet</p>
        <p className="text-xs text-tx-text-secondary mt-1">
          Select a template or add a position manually
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border border-tx-border rounded-xl space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-syne text-lg font-bold">Strategy Positions</h3>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-tx-text-secondary hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-tx-bg"
        >
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {positions.map((position, idx) => (
          <div key={position.id} className="p-4 bg-tx-bg border border-tx-border/50 rounded-lg">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-semibold text-tx-text-secondary bg-tx-bg/50 px-2 py-1 rounded">
                  {idx + 1}
                </span>
                <div>
                  <p className={cn("font-bold", getPositionColor(position.type))}>
                    {getPositionLabel(position.type)}
                  </p>
                  <p className="text-xs text-tx-text-secondary">
                    {position.expiry} • {position.strike} {position.type.includes("call") ? "CE" : "PE"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemove(position.id)}
                className="p-2 text-tx-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-tx-bg/50 rounded p-2">
                <p className="text-[10px] text-tx-text-secondary uppercase tracking-wide">Premium</p>
                <p className="font-semibold text-white">₹{position.premium.toFixed(2)}</p>
              </div>
              <div className="bg-tx-bg/50 rounded p-2">
                <p className="text-[10px] text-tx-text-secondary uppercase tracking-wide">Qty</p>
                <p className="font-semibold text-white">{position.quantity}</p>
              </div>
              <div className="bg-tx-bg/50 rounded p-2">
                <p className="text-[10px] text-tx-text-secondary uppercase tracking-wide">IV</p>
                <p className="font-semibold text-white">{position.iv.toFixed(2)}</p>
              </div>
              <div className="bg-tx-bg/50 rounded p-2">
                <p className="text-[10px] text-tx-text-secondary uppercase tracking-wide">Lot Size</p>
                <p className="font-semibold text-white">{position.lotSize}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-tx-border">
        <button className="flex-1 bg-tx-primary text-tx-bg font-bold py-3 rounded-lg hover:opacity-90 transition-all">
          Save Strategy
        </button>
        <button className="flex-1 bg-tx-primary/10 border border-tx-primary/20 text-tx-primary font-bold py-3 rounded-lg hover:bg-tx-primary/20 transition-all">
          Execute Trade
        </button>
      </div>
    </div>
  );
}
