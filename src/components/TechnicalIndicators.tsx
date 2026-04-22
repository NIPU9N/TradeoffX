"use client";

import { BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateDecisionInput } from "@/types";

type Signal = "Bullish" | "Bearish" | "Neutral" | "";

interface TechnicalIndicatorsProps {
  data: CreateDecisionInput;
  update: (updates: Partial<CreateDecisionInput>) => void;
}

export function TechnicalIndicators({ data, update }: TechnicalIndicatorsProps) {

  // Auto Calculations
  const rsiAutoMsg = data.rsi_value 
    ? (data.rsi_value < 30 ? { text: "Oversold — potential buy signal", color: "text-tx-primary" } 
       : data.rsi_value > 70 ? { text: "Overbought — proceed carefully", color: "text-orange-400" } 
       : { text: "Neutral zone", color: "text-tx-text-muted" })
    : null;

  const dmaAutoMsg = (data.ma_50_position && data.ma_200_position) 
    ? (data.ma_50_position === "above" && data.ma_200_position === "above" ? { text: "Bullish structure. Price respecting trend.", color: "text-tx-primary" }
       : data.ma_50_position === "below" && data.ma_200_position === "below" ? { text: "Bearish structure. Going against the trend.", color: "text-tx-danger" }
       : { text: "Mixed signals. Proceed carefully.", color: "text-orange-400" })
    : null;

  const patternMsg = data.candlestick_pattern === "Hammer" ? "potential reversal signal at support levels"
    : data.candlestick_pattern === "Shooting Star" ? "potential reversal signal at resistance"
    : data.candlestick_pattern === "Engulfing (Bullish)" ? "strong bullish momentum shift"
    : data.candlestick_pattern === "Engulfing (Bearish)" ? "strong bearish momentum shift"
    : data.candlestick_pattern === "Doji" ? "indecision in the market"
    : null;

  // Verdict Calculation
  let bullishCount = 0;
  let bearishCount = 0;
  
  [data.rsi_signal, data.macd_signal, data.volume_signal, data.custom_indicator_signal].forEach(s => {
    if (s === "bullish" || s === "Bullish") bullishCount++;
    if (s === "bearish" || s === "Bearish") bearishCount++;
  });
  if (data.ma_50_position === "above") bullishCount++;
  if (data.ma_50_position === "below") bearishCount++;
  if (data.trend === "uptrend") bullishCount++;
  if (data.trend === "downtrend") bearishCount++;

  let verdict = { state: "Mixed", title: "⚖️ Mixed Signals", desc: "Technicals unclear, thesis must be fundamentally strong", color: "bg-orange-500/10 border-orange-500/30 text-orange-400" };
  if (bullishCount > bearishCount && bullishCount >= 2) {
    verdict = { state: "Bullish", title: "📈 Technically Strong", desc: "Majority of indicators are bullish", color: "bg-tx-primary/10 border-tx-primary/30 text-tx-primary" };
  } else if (bearishCount > bullishCount && bearishCount >= 2) {
    verdict = { state: "Bearish", title: "📉 Technically Weak", desc: "Majority of indicators are bearish", color: "bg-tx-danger/10 border-tx-danger/30 text-tx-danger" };
  }

  const SignalSelect = ({ value, onChange }: { value: string | null | undefined, onChange: (val: any) => void }) => (
    <select 
      value={value || ""} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary appearance-none cursor-pointer"
    >
      <option value="">Select Signal...</option>
      <option value="bullish">📈 Bullish</option>
      <option value="bearish">📉 Bearish</option>
      <option value="neutral">➡️ Neutral</option>
    </select>
  );

  return (
    <div className="mt-8 border-t border-tx-border/50 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-tx-primary/20 flex items-center justify-center border border-tx-primary/50 shadow-[0_0_15px_rgba(0,255,148,0.3)]">
          <BarChart2 className="w-4 h-4 text-tx-primary" />
        </div>
        <h2 className="font-syne text-xl font-bold text-tx-primary drop-shadow-[0_0_8px_rgba(0,255,148,0.5)]">
          Technical Indicators
        </h2>
      </div>

      <div className="pt-6 pb-2">
              <p className="text-sm text-tx-text-secondary mb-8 bg-tx-primary/5 border border-tx-primary/20 p-4 rounded-xl">
                <strong className="text-tx-primary block mb-1">PRO TIP: Let the charts confirm your thesis.</strong>
                Logging your technical indicators forces you to prove your entry point is mathematically sound, not just emotionally driven. Highlighting multiple confluences dramatically increases your win rate.
              </p>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                
                {/* Card 1: RSI */}
                <div className="bg-tx-card border border-tx-border rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-syne font-bold text-white text-sm">RSI (Relative Strength Index)</h4>
                  <input type="number" placeholder="Value (0-100)" value={data.rsi_value || ""} onChange={(e) => update({ rsi_value: parseInt(e.target.value) || null })} className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary" />
                  <SignalSelect value={data.rsi_signal} onChange={(val) => update({ rsi_signal: val })} />
                  {rsiAutoMsg && <div className={cn("text-xs font-medium mt-1", rsiAutoMsg.color)}>{rsiAutoMsg.text}</div>}
                </div>

                {/* Card 2: MACD */}
                <div className="bg-tx-card border border-tx-border rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-syne font-bold text-white text-sm">MACD</h4>
                  <p className="text-[10px] text-tx-text-muted -mt-2">Crossover or divergence?</p>
                  <SignalSelect value={data.macd_signal} onChange={(val) => update({ macd_signal: val })} />
                </div>

                {/* Card 3: Volume */}
                <div className="bg-tx-card border border-tx-border rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-syne font-bold text-white text-sm">Volume</h4>
                  <p className="text-[10px] text-tx-text-muted -mt-2">High volume confirms the move</p>
                  <SignalSelect value={data.volume_signal} onChange={(val) => update({ volume_signal: val })} />
                </div>

                {/* Card 4: Moving Averages */}
                <div className="bg-tx-card border border-tx-border rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-syne font-bold text-white text-sm">Moving Averages</h4>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-tx-text-secondary">50 DMA</span>
                    <div className="flex gap-1 bg-tx-bg rounded-lg p-1 border border-tx-border">
                      <button onClick={() => update({ ma_50_position: "above" })} className={cn("px-2 py-1 text-xs rounded transition-colors", data.ma_50_position === "above" ? "bg-tx-primary/20 text-tx-primary" : "text-tx-text-muted hover:text-white")}>Above</button>
                      <button onClick={() => update({ ma_50_position: "below" })} className={cn("px-2 py-1 text-xs rounded transition-colors", data.ma_50_position === "below" ? "bg-tx-danger/20 text-tx-danger" : "text-tx-text-muted hover:text-white")}>Below</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-tx-text-secondary">200 DMA</span>
                    <div className="flex gap-1 bg-tx-bg rounded-lg p-1 border border-tx-border">
                      <button onClick={() => update({ ma_200_position: "above" })} className={cn("px-2 py-1 text-xs rounded transition-colors", data.ma_200_position === "above" ? "bg-tx-primary/20 text-tx-primary" : "text-tx-text-muted hover:text-white")}>Above</button>
                      <button onClick={() => update({ ma_200_position: "below" })} className={cn("px-2 py-1 text-xs rounded transition-colors", data.ma_200_position === "below" ? "bg-tx-danger/20 text-tx-danger" : "text-tx-text-muted hover:text-white")}>Below</button>
                    </div>
                  </div>

                  {dmaAutoMsg && <div className={cn("text-xs font-medium mt-1", dmaAutoMsg.color)}>{dmaAutoMsg.text}</div>}
                </div>

                {/* Card 5: Fibonacci */}
                <div className="bg-tx-card border border-tx-border rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-syne font-bold text-white text-sm">Fibonacci Levels</h4>
                  <select value={data.fibonacci_level || ""} onChange={(e) => update({ fibonacci_level: e.target.value })} className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary appearance-none cursor-pointer">
                    <option value="">Which level is price near?</option>
                    <option value="23.6">23.6%</option>
                    <option value="38.2">38.2%</option>
                    <option value="50.0">50.0%</option>
                    <option value="61.8">61.8% (Golden Ratio)</option>
                    <option value="78.6">78.6%</option>
                  </select>
                  {data.fibonacci_level === "61.8" && <div className="text-xs font-medium mt-1 text-[#FFB800]">Golden Ratio — strongest support/resistance</div>}
                </div>

                {/* Card 6: Support & Resistance */}
                <div className="bg-tx-card border border-tx-border rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-syne font-bold text-white text-sm">Support & Resistance</h4>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-text-muted text-sm">₹</span>
                    <input type="number" placeholder="Nearest Support" value={data.support_level || ""} onChange={(e) => update({ support_level: parseFloat(e.target.value) || null })} className="w-full bg-tx-bg border border-tx-border rounded-lg pl-7 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-tx-primary" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-text-muted text-sm">₹</span>
                    <input type="number" placeholder="Nearest Resistance" value={data.resistance_level || ""} onChange={(e) => update({ resistance_level: parseFloat(e.target.value) || null })} className="w-full bg-tx-bg border border-tx-border rounded-lg pl-7 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-tx-primary" />
                  </div>
                </div>

                {/* Card 7: Trend */}
                <div className="bg-tx-card border border-tx-border rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-syne font-bold text-white text-sm">Overall Trend</h4>
                  <div className="flex flex-col gap-2 mt-1">
                    {[
                      { val: "uptrend", label: "Uptrend", icon: "📈", color: "bg-tx-primary/20 text-tx-primary border-tx-primary" },
                      { val: "sideways", label: "Sideways", icon: "➡️", color: "bg-tx-text-secondary/20 text-white border-tx-text-secondary" },
                      { val: "downtrend", label: "Downtrend", icon: "📉", color: "bg-tx-danger/20 text-tx-danger border-tx-danger" }
                    ].map(t => (
                      <button 
                        key={t.val} 
                        onClick={() => update({ trend: t.val as any })}
                        className={cn(
                          "w-full py-2 px-3 rounded-lg border text-sm font-medium transition-all text-left",
                          data.trend === t.val ? t.color : "border-tx-bg bg-tx-bg text-tx-text-secondary hover:border-tx-border"
                        )}
                      >
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card 8: Candlestick Pattern */}
                <div className="bg-tx-card border border-tx-border rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-syne font-bold text-white text-sm">Any notable pattern?</h4>
                  <select value={data.candlestick_pattern || ""} onChange={(e) => update({ candlestick_pattern: e.target.value })} className="w-full bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary appearance-none cursor-pointer">
                    <option value="">None</option>
                    <option value="Doji">Doji</option>
                    <option value="Hammer">Hammer</option>
                    <option value="Shooting Star">Shooting Star</option>
                    <option value="Engulfing (Bullish)">Engulfing (Bullish)</option>
                    <option value="Engulfing (Bearish)">Engulfing (Bearish)</option>
                    <option value="Morning Star">Morning Star</option>
                    <option value="Double Top">Double Top / Bottom</option>
                    <option value="Head & Shoulders">Head & Shoulders</option>
                    <option value="Other">Other</option>
                  </select>
                  {patternMsg && <div className="text-xs text-tx-text-secondary italic mt-1 border-l-2 border-tx-primary pl-2">{data.candlestick_pattern} — {patternMsg}</div>}
                </div>

                {/* Card 9: Custom Indicator */}
                <div className="bg-tx-card border border-tx-border rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-syne font-bold text-white text-sm">Custom Indicator</h4>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Name" value={data.custom_indicator_name || ""} onChange={(e) => update({ custom_indicator_name: e.target.value })} className="w-1/2 bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary" />
                    <input type="text" placeholder="Value" value={data.custom_indicator_value || ""} onChange={(e) => update({ custom_indicator_value: e.target.value })} className="w-1/2 bg-tx-bg border border-tx-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tx-primary" />
                  </div>
                  <SignalSelect value={data.custom_indicator_signal} onChange={(val) => update({ custom_indicator_signal: val })} />
                </div>

              </div>

              {/* Overall Technical Verdict */}
              <div className={cn("rounded-xl p-6 border mb-6 flex items-start gap-4 transition-colors duration-500", verdict.color)}>
                <div className="flex-1">
                  <h3 className="font-syne font-bold text-xl mb-1">Overall Technical Verdict</h3>
                  <div className="font-bold text-lg mb-1">{verdict.title}</div>
                  <p className="text-sm opacity-80">{verdict.desc}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-70 mb-1">Based on inputs</div>
                  <div className="flex gap-2 text-sm font-medium">
                    <span className="text-tx-primary">{bullishCount} Bullish</span>
                    <span className="text-tx-text-muted">•</span>
                    <span className="text-tx-danger">{bearishCount} Bearish</span>
                  </div>
                </div>
              </div>

            </div>
    </div>
  );
}
