"use client";

import { useState, useMemo } from "react";
import { OptionPosition } from "@/app/(app)/options/page";
import { MockOptionChain } from "@/lib/mockOptionChain";
import { cn } from "@/lib/utils";
import {
  generatePayoffChartData,
  calculateStrategyMetrics,
  calculatePayoff,
} from "@/lib/payoffCalculation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Legend,
} from "recharts";

interface PayoffChartPanelProps {
  positions: OptionPosition[];
  optionChain: MockOptionChain;
}

type TabType = "payoff" | "futures" | "greeks" | "pnl";

export function PayoffChartPanel({ positions, optionChain }: PayoffChartPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("payoff");

  const payoffData = useMemo(() => {
    if (positions.length === 0) return [];
    return generatePayoffChartData(positions, optionChain.spot, optionChain.dte);
  }, [positions, optionChain]);

  const metrics = useMemo(() => {
    if (positions.length === 0) {
      return {
        maxProfit: 0,
        maxLoss: 0,
        breakevens: [],
        profitRange: { min: 0, max: 0 },
        greeks: { delta: 0, gamma: 0, theta: 0, vega: 0 },
      };
    }
    return calculateStrategyMetrics(positions, optionChain.spot, optionChain.dte);
  }, [positions, optionChain]);

  const tabs: { id: TabType; label: string }[] = [
    { id: "payoff", label: "Payoff Chart" },
    { id: "greeks", label: "Greeks" },
    { id: "pnl", label: "P&L" },
  ];

  return (
    <div className="glass-card p-6 border border-tx-border rounded-xl h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-tx-border mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-2 text-xs font-semibold border-b-2 transition-all",
              activeTab === tab.id
                ? "border-tx-primary text-tx-primary"
                : "border-transparent text-tx-text-secondary hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {activeTab === "payoff" && (
          <div className="flex-1 flex flex-col">
            {positions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-tx-text-secondary">
                <div className="text-center">
                  <p className="text-sm">Payoff chart will appear here</p>
                  <p className="text-xs mt-1">Add positions to see the payoff diagram</p>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={payoffData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="spotPrice"
                      stroke="rgba(255,255,255,0.4)"
                      tickFormatter={(v) => `₹${Math.round(v)}`}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.4)"
                      tickFormatter={(v) => `₹${Math.round(v)}`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(74, 222, 128, 0.3)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => [`₹${value.toFixed(2)}`, "Payoff"]}
                      labelFormatter={(label) => `Spot: ₹${label.toFixed(2)}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="payoff"
                      stroke="#4ade80"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Metrics Below Chart */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-tx-border/50">
                  <div className="bg-tx-bg/50 rounded p-2">
                    <p className="text-[10px] uppercase tracking-wide text-tx-text-secondary">Max Profit</p>
                    <p className="text-lg font-bold text-emerald-500">₹{metrics.maxProfit.toFixed(0)}</p>
                  </div>
                  <div className="bg-tx-bg/50 rounded p-2">
                    <p className="text-[10px] uppercase tracking-wide text-tx-text-secondary">Max Loss</p>
                    <p className="text-lg font-bold text-red-500">₹{metrics.maxLoss.toFixed(0)}</p>
                  </div>
                  {metrics.breakevens.length > 0 && (
                    <div className="bg-tx-bg/50 rounded p-2 col-span-2">
                      <p className="text-[10px] uppercase tracking-wide text-tx-text-secondary">Breakevens</p>
                      <p className="text-sm font-bold text-white">
                        {metrics.breakevens.map((be) => `₹${be.toFixed(0)}`).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "greeks" && (
          <div className="space-y-3">
            <div className="bg-tx-bg/50 border border-tx-border/50 rounded-lg p-3">
              <p className="text-xs uppercase tracking-wider text-tx-text-secondary mb-1">Delta</p>
              <p className="text-2xl font-bold text-white">{metrics.greeks.delta.toFixed(2)}</p>
              <p className="text-xs text-tx-text-secondary mt-1">
                Directional exposure to spot moves
              </p>
            </div>

            <div className="bg-tx-bg/50 border border-tx-border/50 rounded-lg p-3">
              <p className="text-xs uppercase tracking-wider text-tx-text-secondary mb-1">Gamma</p>
              <p className="text-2xl font-bold text-white">{metrics.greeks.gamma.toFixed(4)}</p>
              <p className="text-xs text-tx-text-secondary mt-1">
                Rate of delta change
              </p>
            </div>

            <div className="bg-tx-bg/50 border border-tx-border/50 rounded-lg p-3">
              <p className="text-xs uppercase tracking-wider text-tx-text-secondary mb-1">Theta (per day)</p>
              <p className={cn("text-2xl font-bold", metrics.greeks.theta > 0 ? "text-emerald-500" : "text-red-500")}>
                ₹{metrics.greeks.theta.toFixed(2)}
              </p>
              <p className="text-xs text-tx-text-secondary mt-1">
                Time decay P&L
              </p>
            </div>

            <div className="bg-tx-bg/50 border border-tx-border/50 rounded-lg p-3">
              <p className="text-xs uppercase tracking-wider text-tx-text-secondary mb-1">Vega (per 1% IV)</p>
              <p className={cn("text-2xl font-bold", metrics.greeks.vega > 0 ? "text-emerald-500" : "text-red-500")}>
                ₹{metrics.greeks.vega.toFixed(2)}
              </p>
              <p className="text-xs text-tx-text-secondary mt-1">
                IV change sensitivity
              </p>
            </div>
          </div>
        )}

        {activeTab === "pnl" && (
          <div className="space-y-3">
            <div className="bg-tx-bg/50 border border-tx-border/50 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wider text-tx-text-secondary mb-2">Current P&L</p>
              <p className="text-3xl font-bold text-white">
                ₹{calculatePayoff(positions, optionChain.spot, optionChain.spot, optionChain.dte).toFixed(0)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-tx-bg/50 border border-tx-border/50 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wide text-tx-text-secondary mb-1">Best Case</p>
                <p className="text-xl font-bold text-emerald-500">₹{metrics.maxProfit.toFixed(0)}</p>
              </div>
              <div className="bg-tx-bg/50 border border-tx-border/50 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wide text-tx-text-secondary mb-1">Worst Case</p>
                <p className="text-xl font-bold text-red-500">₹{metrics.maxLoss.toFixed(0)}</p>
              </div>
            </div>

            <div className="bg-tx-bg/50 border border-tx-border/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-tx-text-secondary mb-2">Risk/Reward Ratio</p>
              <p className="text-xl font-bold text-white">
                {metrics.maxLoss === 0 ? "∞" : (Math.abs(metrics.maxProfit / metrics.maxLoss)).toFixed(2)}
              </p>
              <p className="text-xs text-tx-text-secondary mt-1">
                {metrics.maxLoss === 0 ? "Unlimited profit" : "Profit to Loss ratio"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="mt-6 pt-4 border-t border-tx-border">
        <button className="w-full bg-tx-primary text-tx-bg font-bold py-3 rounded-lg hover:opacity-90 transition-all">
          Execute Practice Trade
        </button>
      </div>
    </div>
  );
}
