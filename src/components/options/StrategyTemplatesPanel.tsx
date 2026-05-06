"use client";

import { useState } from "react";
import { getTemplatesByCategory, STRATEGY_TEMPLATES, type StrategyCategory } from "@/lib/strategyTemplates";
import { cn } from "@/lib/utils";

interface StrategyTemplatesPanelProps {
  onApplyTemplate: (positions: any[]) => void;
}

export function StrategyTemplatesPanel({ onApplyTemplate }: StrategyTemplatesPanelProps) {
  const [activeCategory, setActiveCategory] = useState<StrategyCategory>("BULLISH");

  const categories: { label: string; value: StrategyCategory }[] = [
    { label: "BULLISH", value: "BULLISH" },
    { label: "BEARISH", value: "BEARISH" },
    { label: "NON-DIRECTIONAL", value: "NON_DIRECTIONAL" },
  ];

  const templates = getTemplatesByCategory(activeCategory);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-tx-border">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              "px-4 py-2 text-sm font-semibold border-b-2 transition-all",
              activeCategory === cat.value
                ? "border-tx-primary text-tx-primary"
                : "border-transparent text-tx-text-secondary hover:text-white"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template List */}
      <div className="space-y-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onApplyTemplate(template.positions)}
            className="w-full text-left p-3 rounded-lg bg-tx-card border border-tx-border hover:border-tx-primary hover:bg-tx-primary/5 transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-semibold text-white group-hover:text-tx-primary transition-colors">
                  {template.name}
                </p>
                <p className="text-xs text-tx-text-secondary mt-1">{template.description}</p>
                <p className="text-[10px] text-tx-text-secondary mt-2 uppercase tracking-wide">
                  {template.riskProfile === "limited" ? "LIMITED RISK" : "UNLIMITED RISK"}
                </p>
              </div>
              <div
                className="w-6 h-6 rounded-lg bg-tx-primary/10 border border-tx-primary/20 group-hover:bg-tx-primary/20 transition-colors flex-shrink-0 flex items-center justify-center text-[10px] text-tx-primary font-bold"
              >
                {template.positions.length}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="text-xs text-tx-text-secondary space-y-1 pt-4 border-t border-tx-border">
        <p className="font-semibold">How to use:</p>
        <p>1. Click a template to auto-fill positions</p>
        <p>2. Adjust strikes & premiums as needed</p>
        <p>3. Watch payoff update in real-time</p>
      </div>
    </div>
  );
}
