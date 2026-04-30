"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

export type PayoffPoint = {
  price: number;
  pnl: number;
};

interface StrategyPayoffChartProps {
  data: PayoffPoint[];
  className?: string;
  currentPrice?: number;
}

export function StrategyPayoffChart({ data, className, currentPrice }: StrategyPayoffChartProps) {
  // Calculate gradient offset so green is above 0, red is below 0
  const gradientOffset = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const dataMax = Math.max(...data.map((i) => i.pnl));
    const dataMin = Math.min(...data.map((i) => i.pnl));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  }, [data]);

  const minPrice = data.length > 0 ? data[0].price : 0;
  const maxPrice = data.length > 0 ? data[data.length - 1].price : 0;

  if (!data || data.length === 0) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center text-tx-text-secondary bg-tx-bg/50 border border-tx-border/50 rounded-xl", className)}>
        Add option legs to see the payoff chart
      </div>
    );
  }

  return (
    <div className={cn("w-full h-[400px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.4} />
              <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis 
            dataKey="price" 
            stroke="#888888" 
            tickFormatter={(val) => `₹${val}`}
            type="number"
            domain={[minPrice, maxPrice]}
          />
          <YAxis 
            stroke="#888888" 
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#121212", borderColor: "#2a2a2a", borderRadius: "12px", color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: any) => {
              const numVal = Number(value) || 0;
              return [
                <span key="1" className={numVal >= 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>
                  {numVal >= 0 ? "+" : ""}₹{numVal.toFixed(2)}
                </span>,
                "P&L",
              ];
            }}
            labelFormatter={(label) => `Underlying Price: ₹${label}`}
          />
          <ReferenceLine y={0} stroke="#444" strokeWidth={2} />
          {currentPrice && (
            <ReferenceLine x={currentPrice} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'top', value: 'Current', fill: '#3b82f6', fontSize: 12 }} />
          )}
          <Area 
            type="linear" 
            dataKey="pnl" 
            stroke="#ffffff" 
            strokeWidth={2}
            fill="url(#splitColor)" 
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
