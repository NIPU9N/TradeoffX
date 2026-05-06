"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMockOptionChain } from "@/lib/mockOptionChain";
import { calculateStrategyMetrics } from "@/lib/payoffCalculation";
import { OptionsTopBar } from "@/components/options/OptionsTopBar";
import { StrategyTemplatesPanel } from "@/components/options/StrategyTemplatesPanel";
import { PositionBuilder } from "@/components/options/PositionBuilder";
import { StrategyPositionsList } from "@/components/options/StrategyPositionsList";
import { PayoffChartPanel } from "@/components/options/PayoffChartPanel";
import { SaveStrategyModal } from "@/components/options/SaveStrategyModal";
import { SavedStrategiesPanel } from "@/components/options/SavedStrategiesPanel";

export interface OptionPosition {
  id: string;
  type: "buy_call" | "sell_call" | "buy_put" | "sell_put";
  strike: number;
  expiry: string;
  premium: number;
  iv: number;
  quantity: number;
  lotSize: number;
}

export default function OptionsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase]);

  const [selectedUnderlying, setSelectedUnderlying] = useState("NIFTY");
  const [positions, setPositions] = useState<OptionPosition[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSavedStrategies, setShowSavedStrategies] = useState(false);
  const [savedStrategies, setSavedStrategies] = useState<any[]>([]);

  const optionChain = useMemo(() => getMockOptionChain(selectedUnderlying), [selectedUnderlying]);

  const handleResetPositions = () => {
    setPositions([]);
  };

  const handleAddPosition = (position: Omit<OptionPosition, "id">) => {
    setPositions((current) => [
      ...current,
      { ...position, id: Math.random().toString(36).slice(2) },
    ]);
  };

  const handleRemovePosition = (id: string) => {
    setPositions((current) => current.filter((p) => p.id !== id));
  };

  const handleApplyTemplate = (positionConfigs: any[]) => {
    // Clear current positions and apply template
    setPositions([]);
    
    positionConfigs.forEach((config) => {
      const atm = optionChain.strikes[Math.floor(optionChain.strikes.length / 2)];
      const targetStrike = atm.strike + config.strikeOffset;
      
      // Find closest strike
      const closestStrike = optionChain.strikes.reduce((prev, curr) => 
        Math.abs(curr.strike - targetStrike) < Math.abs(prev.strike - targetStrike) ? curr : prev
      );

      const isPutType = config.type.includes("put");
      const isShort = config.type.includes("sell");
      
      const strikeData = isPutType ? closestStrike.pe : closestStrike.ce;
      
      handleAddPosition({
        type: config.type,
        strike: closestStrike.strike,
        expiry: optionChain.expiries[0],
        premium: strikeData.premium,
        iv: strikeData.iv,
        quantity: 1,
        lotSize: optionChain.lotSize,
      });
    });
  };

  const handleSaveStrategy = async (strategyData: any) => {
    if (!user?.id) {
      alert("Please sign in to save strategies");
      return;
    }

    const metrics = calculateStrategyMetrics(positions, optionChain.spot, optionChain.dte);

    try {
      const response = await fetch("/api/strategies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          name: strategyData.name,
          description: strategyData.description,
          underlying_symbol: selectedUnderlying,
          strategy_type: strategyData.strategy_type || "CUSTOM",
          entry_spot: optionChain.spot,
          max_profit: metrics.maxProfit,
          max_loss: metrics.maxLoss,
          breakevens: metrics.breakevens,
          greeks: metrics.greeks,
          positions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save strategy");
      }

      const data = await response.json();
      setShowSaveModal(false);
      alert("Strategy saved successfully!");
      
      // Reload saved strategies
      await handleLoadSavedStrategies();
    } catch (error) {
      alert("Error saving strategy: " + String(error));
    }
  };

  const handleLoadSavedStrategies = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/strategies", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch strategies");
      }

      const data = await response.json();
      setSavedStrategies(data.strategies || []);
    } catch (error) {
      console.error("Error loading strategies:", error);
    }
  }, [user?.id]);

  const handleLoadStrategy = (strategy: any) => {
    // Load positions from saved strategy
    setSelectedUnderlying(strategy.underlying_symbol);
    setPositions(strategy.positions);
    setShowSavedStrategies(false);
  };

  return (
    <div className="min-h-screen bg-tx-bg">
      {/* Save Strategy Modal */}
      {showSaveModal && (
        <SaveStrategyModal
          onSave={handleSaveStrategy}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {/* Saved Strategies Panel */}
      {showSavedStrategies && (
        <SavedStrategiesPanel
          strategies={savedStrategies}
          onLoadStrategy={handleLoadStrategy}
          onClose={() => setShowSavedStrategies(false)}
        />
      )}
      {/* Top Bar */}
      <OptionsTopBar
        selectedUnderlying={selectedUnderlying}
        onSelectUnderlying={setSelectedUnderlying}
        optionChain={optionChain}
      />

      {/* Main Content - 3 Column Layout */}
      <div className="flex h-[calc(100vh-180px)] gap-6 p-6">
        {/* LEFT: Strategy Templates */}
        <div className="w-64 overflow-y-auto">
          <StrategyTemplatesPanel onApplyTemplate={handleApplyTemplate} />
        </div>

        {/* MIDDLE: Position Builder + Positions List */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
          <PositionBuilder
            optionChain={optionChain}
            onAddPosition={handleAddPosition}
          />

          <StrategyPositionsList
            positions={positions}
            onRemove={handleRemovePosition}
            onReset={handleResetPositions}
            optionChain={optionChain}
            onSaveStrategy={() => {
              if (positions.length === 0) {
                alert("Add positions to save a strategy");
                return;
              }
              setShowSaveModal(true);
            }}
            onViewSaved={() => {
              handleLoadSavedStrategies();
              setShowSavedStrategies(true);
            }}
          />
        </div>

        {/* RIGHT: Payoff Chart & Greeks */}
        <div className="w-[450px] overflow-y-auto">
          <PayoffChartPanel
            positions={positions}
            optionChain={optionChain}
          />
        </div>
      </div>
    </div>
  );
}
