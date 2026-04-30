import { Plus, Trash2 } from "lucide-react";
import { OptionLeg, OptionType, PositionType } from "@/lib/options";
import { cn } from "@/lib/utils";

interface StrategyLegManagerProps {
  legs: OptionLeg[];
  onChange: (legs: OptionLeg[]) => void;
  currentPrice: number;
}

export function StrategyLegManager({ legs, onChange, currentPrice }: StrategyLegManagerProps) {
  const addLeg = () => {
    const newLeg: OptionLeg = {
      id: Math.random().toString(36).substring(7),
      type: "CE",
      position: "BUY",
      strike: Math.round(currentPrice || 10000), // Default to current price rounded
      premium: 100,
      quantity: 1,
    };
    onChange([...legs, newLeg]);
  };

  const updateLeg = (id: string, updates: Partial<OptionLeg>) => {
    onChange(legs.map((leg) => (leg.id === id ? { ...leg, ...updates } : leg)));
  };

  const removeLeg = (id: string) => {
    onChange(legs.filter((leg) => leg.id !== id));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-syne text-lg font-bold">Strategy Legs</h3>
        <button
          onClick={addLeg}
          className="flex items-center gap-2 px-4 py-2 bg-tx-primary/10 text-tx-primary hover:bg-tx-primary/20 border border-tx-primary/30 rounded-xl transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Leg
        </button>
      </div>

      {legs.length === 0 ? (
        <div className="text-center py-8 bg-tx-bg/50 border border-tx-border/50 rounded-xl text-tx-text-secondary text-sm">
          No legs added. Add a call or put to start building your strategy.
        </div>
      ) : (
        <div className="space-y-3">
          {legs.map((leg) => (
            <div key={leg.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 bg-tx-card border border-tx-border rounded-xl">
              <select
                value={leg.position}
                onChange={(e) => updateLeg(leg.id, { position: e.target.value as PositionType })}
                className={cn(
                  "bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tx-primary font-semibold",
                  leg.position === "BUY" ? "text-emerald-500" : "text-red-500"
                )}
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>

              <select
                value={leg.type}
                onChange={(e) => updateLeg(leg.id, { type: e.target.value as OptionType })}
                className="bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tx-primary"
              >
                <option value="CE">CE (Call)</option>
                <option value="PE">PE (Put)</option>
              </select>

              <div className="flex-1 min-w-[100px]">
                <label className="block text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Strike</label>
                <input
                  type="number"
                  value={leg.strike}
                  onChange={(e) => updateLeg(leg.id, { strike: Number(e.target.value) })}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                />
              </div>

              <div className="flex-1 min-w-[80px]">
                <label className="block text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Premium</label>
                <input
                  type="number"
                  value={leg.premium}
                  onChange={(e) => updateLeg(leg.id, { premium: Number(e.target.value) })}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                />
              </div>

              <div className="flex-1 min-w-[80px]">
                <label className="block text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Qty</label>
                <input
                  type="number"
                  value={leg.quantity}
                  onChange={(e) => updateLeg(leg.id, { quantity: Number(e.target.value) })}
                  min="1"
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                />
              </div>

              <button
                onClick={() => removeLeg(leg.id)}
                className="mt-4 sm:mt-0 p-2 text-tx-text-secondary hover:text-tx-danger hover:bg-tx-danger/10 rounded-lg transition-colors"
                title="Remove Leg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
