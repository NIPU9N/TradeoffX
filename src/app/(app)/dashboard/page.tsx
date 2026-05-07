"use client";

import { useMode } from "@/context/ModeContext";
import { 
  Apple, 
  Car, 
  LayoutGrid, 
  Search, 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  MoreHorizontal,
  Music,
  ShoppingCart,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchDashboard, getDecisions, getWatchlist, getPracticePortfolio, getPracticePositions } from "@/lib/api";
import type { DashboardStats, WatchlistItem, Decision, PracticePosition, PracticePortfolio } from "@/types";

export default function Dashboard() {
  const { mode } = useMode();
  const isPractice = mode === "practice";

  // Accent colors based on mode (Green for Practice, Blue for Real)
  const primaryBg = isPractice ? "bg-[#10B981]" : "bg-[#0066FF]";
  const primaryText = isPractice ? "text-[#10B981]" : "text-[#0066FF]";
  const primaryStroke = isPractice ? "#10B981" : "#0066FF";

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [practicePortfolio, setPracticePortfolio] = useState<PracticePortfolio | null>(null);
  const [practicePositions, setPracticePositions] = useState<PracticePosition[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, watchData] = await Promise.all([
        fetchDashboard(mode),
        getWatchlist({ mode })
      ]);
      setStats(statsData);
      setWatchlist(watchData.items);

      if (isPractice) {
        try {
          const [portData, posData] = await Promise.all([
            getPracticePortfolio(),
            getPracticePositions()
          ]);
          setPracticePortfolio(portData.portfolio);
          setPracticePositions(posData.positions);
        } catch (e) {
          console.error("Failed to load practice portfolio", e);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [mode, isPractice]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalValue = useMemo(() => {
    if (isPractice) return practicePortfolio?.current_value || 0;
    if (!stats) return 0;
    return stats.recent_decisions.reduce((sum, d) => sum + d.investment_amount, 0);
  }, [isPractice, practicePortfolio, stats]);

  const totalReturn = useMemo(() => {
    if (isPractice) return { pct: practicePortfolio?.total_return_percent || 0, amt: practicePortfolio?.total_return_amount || 0 };
    if (!stats) return { pct: 0, amt: 0 };
    const closed = stats.recent_decisions.filter(d => {
      const oc = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
      return oc && (oc.outcome_type === "profit" || oc.outcome_type === "loss");
    });
    if (closed.length === 0) return { pct: 0, amt: 0 };
    const pct = closed.reduce((sum, d) => {
      const oc = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
      return sum + (oc?.actual_return_percent || 0);
    }, 0) / closed.length;
    return { pct, amt: 0 };
  }, [isPractice, practicePortfolio, stats]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 text-[#0066FF] animate-spin" />
        <p className="text-gray-400 text-sm tracking-widest uppercase">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] p-4 sm:p-6 lg:p-8 font-sans text-white pb-24">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* TOP ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Holding */}
          <div className="lg:col-span-1 bg-[#11131A] rounded-[24px] p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* Subtle background wave/gradient */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 flex items-start justify-between">
              <h3 className="text-gray-400 font-medium">Total Holding</h3>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-full border border-white/20 text-xs font-medium hover:bg-white/5 transition">6M</button>
                <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="relative z-10 mt-12">
              <h1 className="text-4xl font-bold mb-3 tracking-tight">₹ {totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Return</span>
                <span className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                  totalReturn.pct >= 0 ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
                )}>
                  {totalReturn.pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {totalReturn.pct >= 0 ? "+" : ""}{totalReturn.pct.toFixed(2)}% {totalReturn.amt !== 0 ? `(₹ ${Math.abs(totalReturn.amt).toLocaleString()})` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* My Portfolio */}
          <div className="lg:col-span-2 bg-[#11131A] rounded-[24px] p-6 border border-white/5 flex flex-col justify-between min-h-[220px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-400 font-medium">My Portfolio</h3>
              <div className="flex gap-2">
                <button className="px-5 py-1.5 rounded-full border border-white/20 text-xs font-medium hover:bg-white/5 transition">See all</button>
                <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal scrollable cards */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {(isPractice ? practicePositions : stats?.recent_decisions.map(d => ({
                asset_name: d.asset_name,
                current_value: d.investment_amount,
                return_percent: (Array.isArray(d.outcome) ? d.outcome[0] : d.outcome)?.actual_return_percent || 0,
                quantity: 1,
              })) || []).map((item: any, i: number) => {
                const isUp = item.return_percent >= 0;
                return (
                  <div key={i} className="bg-[#1A1C23] rounded-[16px] p-4 min-w-[140px] flex-shrink-0 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-1">₹ {item.current_value?.toLocaleString("en-IN") || item.investment_amount?.toLocaleString("en-IN") || 0}</p>
                      <p className={cn("text-[10px] font-medium", isUp ? "text-emerald-500" : "text-red-500")}>
                        {isUp ? "+" : ""}{item.return_percent?.toFixed(2) || "0.00"}%
                      </p>
                    </div>
                    <div className="flex items-end justify-between mt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-300">{item.asset_name.charAt(0)}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-300 truncate max-w-[60px]">{item.asset_name}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">Qty {item.quantity || 1}</span>
                    </div>
                  </div>
                );
              })}
              {(!isPractice && !stats?.recent_decisions.length) || (isPractice && !practicePositions.length) ? (
                <p className="text-gray-500 text-sm">No positions to show.</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Portfolio Performance */}
        <div className="bg-[#11131A] rounded-[24px] p-6 border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-gray-400 font-medium">Portfolio Performance</h3>
            <div className="flex gap-2">
              {["1D", "1W", "1M", "6M", "1Y"].map((btn) => (
                <button 
                  key={btn}
                  className={cn(
                    "w-10 h-10 rounded-full text-xs font-medium flex items-center justify-center transition-colors",
                    btn === "6M" 
                      ? `${primaryBg} text-white border-transparent` 
                      : "border border-white/20 text-gray-300 hover:bg-white/5"
                  )}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[280px] w-full flex">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between text-[10px] text-gray-500 pr-4 h-[240px] pt-2">
              <span>200k</span>
              <span>150k</span>
              <span>100k</span>
              <span>50k</span>
              <span>10k</span>
            </div>

            {/* Chart Area */}
            <div className="relative flex-1 h-[240px]">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full h-px bg-white/5" />
                ))}
              </div>

              {/* Tooltip & Line */}
              <div className="absolute left-[35%] top-[50%] -translate-y-[100%] -translate-x-[50%] z-20 pointer-events-none mb-2">
                <div className="bg-[#1A1C23] border border-white/10 rounded-xl p-3 shadow-xl min-w-[140px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-400">1st Mar 2024</span>
                    <MoreHorizontal className="w-3 h-3 text-gray-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">$ 16.500</span>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <TrendingUp className="w-2.5 h-2.5" />
                      +35%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Vertical Dashed line for tooltip */}
              <div className="absolute left-[35%] top-[50%] bottom-0 w-px border-l border-dashed border-gray-600 z-10" />
              {/* Tooltip dot */}
              <div className={cn("absolute left-[35%] top-[50%] w-4 h-4 rounded-full -translate-x-[50%] -translate-y-[50%] z-20 border-4 border-[#11131A]", primaryBg)} />

              {/* The SVG Line */}
              <svg viewBox="0 0 1000 240" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primaryStroke} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={primaryStroke} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* A squiggly line resembling the image */}
                <path 
                  d="M0,20 C50,20 80,60 120,60 C160,60 180,40 220,50 C260,60 300,50 350,120 C400,190 420,70 450,110 C480,150 500,60 550,50 C600,40 650,70 700,50 C750,30 800,100 850,90 C900,80 950,140 1000,150" 
                  fill="none" 
                  stroke={primaryStroke} 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M0,20 C50,20 80,60 120,60 C160,60 180,40 220,50 C260,60 300,50 350,120 C400,190 420,70 450,110 C480,150 500,60 550,50 C600,40 650,70 700,50 C750,30 800,100 850,90 C900,80 950,140 1000,150 L1000,240 L0,240 Z" 
                  fill="url(#chartFill)" 
                />
              </svg>
            </div>
            
            {/* X-Axis */}
            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] text-gray-500 pt-4 translate-y-full">
              <span>1st Jan</span>
              <span>15th Jan</span>
              <span>1st Feb</span>
              <span>15th Feb</span>
              <span>1st Mar</span>
              <span>15th Mar</span>
              <span>1st Apr</span>
              <span>15th Apr</span>
              <span>1st May</span>
              <span>15th May</span>
              <span>1st Jun</span>
              <span>15th Jun</span>
              <span>1st Jul</span>
              <span>15th Jul</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Overview */}
          <div className="lg:col-span-2 bg-[#11131A] rounded-[24px] p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-400 font-medium">Portfolio Overview</h3>
              <div className="flex bg-[#1A1C23] rounded-full p-1 border border-white/5">
                {["All", "Gainers", "Losers"].map((btn) => (
                  <button 
                    key={btn}
                    className={cn(
                      "px-6 py-1.5 rounded-full text-xs font-medium transition-colors",
                      btn === "All" ? `${primaryBg} text-white` : "text-gray-400 hover:text-white"
                    )}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-gray-500 text-xs font-medium border-b border-white/5">
                    <th className="pb-4 font-normal pl-2">Stock</th>
                    <th className="pb-4 font-normal">Last Price ↑↓</th>
                    <th className="pb-4 font-normal">Change ↑↓</th>
                    <th className="pb-4 font-normal">Market Cap ↑↓</th>
                    <th className="pb-4 font-normal">Volume ↑↓</th>
                    <th className="pb-4 font-normal text-right pr-4">Last 7 days ↑↓</th>
                  </tr>
                </thead>
                <tbody>
                  {(isPractice ? practicePositions : stats?.recent_decisions || []).slice(0, 5).map((item: any, i: number) => {
                    const isUp = isPractice ? item.return_percent >= 0 : ((Array.isArray(item.outcome) ? item.outcome[0] : item.outcome)?.actual_return_percent || 0) >= 0;
                    const change = isPractice ? item.return_percent : ((Array.isArray(item.outcome) ? item.outcome[0] : item.outcome)?.actual_return_percent || 0);
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-400">{item.asset_name.charAt(0)}</span>
                            </div>
                            <span className="font-bold">{item.asset_name}</span>
                          </div>
                        </td>
                        <td className="py-4 font-semibold">₹ {item.current_price?.toLocaleString("en-IN") || item.investment_amount?.toLocaleString("en-IN") || 0}</td>
                        <td className={cn("py-4 text-xs font-medium", isUp ? "text-emerald-500" : "text-red-500")}>
                          {isUp ? "+" : ""}{change?.toFixed(2) || "0.00"}%
                        </td>
                        <td className="py-4 text-gray-300 text-xs">-</td>
                        <td className="py-4 text-gray-300 text-xs">Qty {item.quantity || 1}</td>
                        <td className="py-4 pr-4">
                          <div className="w-16 h-6 ml-auto">
                            {isUp ? (
                              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                                <path d="M0,20 Q10,25 20,15 T40,20 T60,10 T80,15 T100,5" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="100" cy="5" r="3" fill="#10B981" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                                <path d="M0,5 Q10,10 20,5 T40,15 T60,10 T80,20 T100,25" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="100" cy="25" r="3" fill="#EF4444" />
                              </svg>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {((isPractice && practicePositions.length === 0) || (!isPractice && !stats?.recent_decisions.length)) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Watchlist */}
          <div className="lg:col-span-1 bg-[#11131A] rounded-[24px] p-6 border border-white/5">
            <h3 className="text-gray-400 font-medium mb-6">Watchlist</h3>
            <div className="flex bg-[#1A1C23] rounded-full p-1 border border-white/5 mb-6">
              {["Most Viewed", "Gainers", "Losers"].map((btn) => (
                <button 
                  key={btn}
                  className={cn(
                    "flex-1 py-1.5 rounded-full text-[11px] font-medium transition-colors",
                    btn === "Most Viewed" ? `${primaryBg} text-white` : "text-gray-400 hover:text-white"
                  )}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {watchlist.slice(0, 5).map((item) => {
                const diff = (item.current_price || 0) - (item.price_when_added || 0);
                const pct = item.price_when_added ? (diff / item.price_when_added) * 100 : 0;
                const isUp = pct >= 0;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A1C23] flex items-center justify-center font-bold text-gray-400">
                        {item.asset_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[100px]">{item.asset_name}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{item.asset_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹ {item.current_price?.toLocaleString("en-IN") || "--"}</p>
                      <p className={cn("text-[10px] font-medium", isUp ? "text-emerald-500" : "text-red-500")}>
                        {isUp ? "+" : ""}{pct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
              {watchlist.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">Watchlist is empty</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
