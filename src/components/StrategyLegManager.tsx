import { Plus, Trash2, Calendar } from "lucide-react";
import { OptionLeg, OptionType, PositionType, OptionChainData, getLotSizeForSymbol } from "@/lib/options";
import { cn } from "@/lib/utils";

interface StrategyLegManagerProps {
  legs: OptionLeg[];
  onChange: (legs: OptionLeg[]) => void;
  currentPrice: number;
  optionChain: OptionChainData | null;
}

export function StrategyLegManager({ legs, onChange, currentPrice, optionChain }: StrategyLegManagerProps) {
  const availableStrikes = optionChain?.strikes || [];
  const availableExpiries = optionChain?.expiryDates || [];

  const getPremiumForStrike = (strike: number, type: OptionType): number => {
    if (!optionChain) return 100;
    const strikeData = optionChain.strikes.find(s => s.strikePrice === strike);
    if (!strikeData) return 100;
    return type === "CE" ? strikeData.ce.lastPrice : strikeData.pe.lastPrice;
  };

  const addLeg = () => {
    let defaultStrike = Math.round(currentPrice || 10000);
    if (availableStrikes.length > 0) {
      const closest = availableStrikes.reduce((prev, curr) =>
        Math.abs(curr.strikePrice - currentPrice) < Math.abs(prev.strikePrice - currentPrice) ? curr : prev
      );
      defaultStrike = closest.strikePrice;
    }

    const defaultType: OptionType = "CE";
    const defaultPremium = getPremiumForStrike(defaultStrike, defaultType);
    const defaultExpiry = availableExpiries[0] || "";
    const lotSize = optionChain ? getLotSizeForSymbol(optionChain.symbol) : 1;
    const defaultIv = optionChain
      ? optionChain.strikes.find(s => s.strikePrice === defaultStrike)?.[defaultType.toLowerCase() as "ce" | "pe"].impliedVolatility ?? 15
      : 15;

    const newLeg: OptionLeg = {
      id: Math.random().toString(36).substring(7),
      type: defaultType,
      position: "BUY",
      strike: defaultStrike,
      premium: defaultPremium,
      quantity: 1,
      expiry: defaultExpiry,
      iv: defaultIv,
      lotSize,
    };
    onChange([...legs, newLeg]);
  };

  const updateLeg = (id: string, updates: Partial<OptionLeg>) => {
    onChange(legs.map((leg) => {
      if (leg.id === id) {
        const updatedLeg = { ...leg, ...updates };
        if ((updates.strike !== undefined || updates.type !== undefined) && optionChain) {
          updatedLeg.premium = getPremiumForStrike(updatedLeg.strike, updatedLeg.type);
        }
        return updatedLeg;
      }
      return leg;
    }));
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
              {/* BUY / SELL */}
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

              {/* CE / PE */}
              <select
                value={leg.type}
                onChange={(e) => updateLeg(leg.id, { type: e.target.value as OptionType })}
                className="bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tx-primary"
              >
                <option value="CE">CE (Call)</option>
                <option value="PE">PE (Put)</option>
              </select>

              {/* Expiry */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Expiry
                </label>
                {availableExpiries.length > 0 ? (
                  <select
                    value={leg.expiry}
                    onChange={(e) => updateLeg(leg.id, { expiry: e.target.value })}
                    className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                  >
                    {availableExpiries.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={leg.expiry}
                    onChange={(e) => updateLeg(leg.id, { expiry: e.target.value })}
                    placeholder="DD-Mon-YYYY"
                    className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                  />
                )}
              </div>

              {/* Strike */}
              <div className="flex-1 min-w-[100px]">
                <label className="block text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Strike</label>
                {availableStrikes.length > 0 ? (
                  <select
                    value={leg.strike}
                    onChange={(e) => updateLeg(leg.id, { strike: Number(e.target.value) })}
                    className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                  >
                    {availableStrikes.map(s => (
                      <option key={s.strikePrice} value={s.strikePrice}>{s.strikePrice}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={leg.strike}
                    onChange={(e) => updateLeg(leg.id, { strike: Number(e.target.value) })}
                    className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                  />
                )}
              </div>

              {/* Premium */}
              <div className="flex-1 min-w-[80px]">
                <label className="block text-[10px] uppercase tracking-wider text-tx-text-secondary mb-1">Premium</label>
                <input
                  type="number"
                  value={leg.premium}
                  onChange={(e) => updateLeg(leg.id, { premium: Number(e.target.value) })}
                  className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary"
                  readOnly={!!optionChain}
                  title={optionChain ? "Premium is auto-fetched from live market data" : "Enter premium manually"}
                />
              </div>

              {/* Qty */}
              <div className="flex-1 min-w-[60px]">
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
