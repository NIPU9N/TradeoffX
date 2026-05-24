"use client";

import { useState, useMemo } from "react";
import { MockOptionChain } from "@/lib/mockOptionChain";
import { OptionPosition } from "@/app/(app)/options/page";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface PositionBuilderProps {
  optionChain: MockOptionChain;
  onAddPosition: (position: Omit<OptionPosition, "id">) => void;
}

export function PositionBuilder({ optionChain, onAddPosition }: PositionBuilderProps) {
  const [selectedExpiry, setSelectedExpiry] = useState(optionChain.expiries[0]);
  const [selectedStrike, setSelectedStrike] = useState(optionChain.strikes[Math.floor(optionChain.strikes.length / 2)].strike);
  const [selectedType, setSelectedType] = useState<"CE" | "PE">("CE");
  const [isBuy, setIsBuy] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const strikeData = useMemo(() => {
    return optionChain.strikes.find((s) => s.strike === selectedStrike);
  }, [selectedStrike, optionChain]);

  const premium = useMemo(() => {
    if (!strikeData) return 0;
    return selectedType === "CE" ? strikeData.ce.premium : strikeData.pe.premium;
  }, [strikeData, selectedType]);

  const iv = useMemo(() => {
    if (!strikeData) return 0;
    return selectedType === "CE" ? strikeData.ce.iv : strikeData.pe.iv;
  }, [strikeData, selectedType]);

  const handleAddPosition = () => {
    const positionType: OptionPosition["type"] = isBuy
      ? selectedType === "CE"
        ? "buy_call"
        : "buy_put"
      : selectedType === "CE"
      ? "sell_call"
      : "sell_put";

    onAddPosition({
      type: positionType,
      strike: selectedStrike,
      expiry: selectedExpiry,
      premium,
      iv,
      quantity,
      lotSize: optionChain.lotSize,
    });
  };

  return (
    <div className="glass-card p-6 border border-tx-border rounded-xl space-y-4">
      <h3 className="font-syne text-lg font-bold">Add Position</h3>

      {/* First Row: Expiry, Strike, Type */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-tx-text-secondary mb-2 block">
            Expiry
          </label>
          <select
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
            className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-tx-primary"
          >
            {optionChain.expiries.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-tx-text-secondary mb-2 block">
            Strike
          </label>
          <select
            value={selectedStrike}
            onChange={(e) => setSelectedStrike(Number(e.target.value))}
            className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-tx-primary"
          >
            {optionChain.strikes.map((s) => (
              <option key={s.strike} value={s.strike}>
                {s.strike}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-tx-text-secondary mb-2 block">
            Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as "CE" | "PE")}
            className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-tx-primary"
          >
            <option value="CE">Call (CE)</option>
            <option value="PE">Put (PE)</option>
          </select>
        </div>
      </div>

      {/* Buy/Sell Selection */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={isBuy}
            onChange={() => setIsBuy(true)}
            className="w-4 h-4 accent-tx-primary"
          />
          <span className="text-sm font-semibold text-emerald-500">Buy</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!isBuy}
            onChange={() => setIsBuy(false)}
            className="w-4 h-4 accent-tx-primary"
          />
          <span className="text-sm font-semibold text-red-500">Sell</span>
        </label>
      </div>

      {/* Quantity & Premium Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-tx-text-secondary mb-2 block">
            Quantity
          </label>
          <div className="flex items-center justify-between gap-2 bg-tx-bg border border-tx-border rounded-lg p-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 text-tx-text-secondary hover:text-white transition-colors bg-tx-card rounded-md border border-tx-border/50"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="flex-1 min-w-0 w-full bg-transparent text-white text-center font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1 text-tx-text-secondary hover:text-white transition-colors bg-tx-card rounded-md border border-tx-border/50"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-2">
          <div className="flex justify-between items-center text-sm bg-tx-bg/80 border border-tx-border/50 px-3 py-2 rounded-lg">
            <span className="text-tx-text-secondary">Option Price:</span>
            <span className="font-bold text-white">₹{premium.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm bg-tx-bg/80 border border-tx-border/50 px-3 py-2 rounded-lg">
            <span className="text-tx-text-secondary">IV:</span>
            <span className="font-bold text-white">{iv.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Add Position Button */}
      <button
        onClick={handleAddPosition}
        className="w-full bg-tx-primary text-tx-bg font-bold py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Position
      </button>
    </div>
  );
}
