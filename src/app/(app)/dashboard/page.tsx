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
  AlertCircle,
  Brain,
  Target,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchDashboard, getDecisions, getWatchlist, getPracticePortfolio, getPracticePositions } from "@/lib/api";
import type { DashboardStats, WatchlistItem, Decision, PracticePosition, PracticePortfolio } from "@/types";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const } }),
};

// Win rate ring SVG component
function WinRing({ rate, color }: { rate: number, color: string }) {
  const r = 36, circ = 2 * Math.PI * r;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - rate / 100)}
        strokeLinecap="round" className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

export default function Dashboard() {
  const { mode } = useMode();
  const isPractice = mode === "practice";

  const primaryBg = isPractice ? "bg-[#10B981]" : "bg-[#0066FF]";
  const primaryText = isPractice ? "text-[#10B981]" : "text-[#0066FF]";
  const primaryStroke = isPractice ? "#10B981" : "#0066FF";
  const hexColor = isPractice ? "#10B981" : "#0066FF";

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [practicePortfolio, setPracticePortfolio] = useState<PracticePortfolio | null>(null);
  const [practicePositions, setPracticePositions] = useState<PracticePosition[]>([]);
  
  const [watchlistFilter, setWatchlistFilter] = useState<"All" | "Watching" | "Bought">("All");
  const [portfolioFilter, setPortfolioFilter] = useState<"All" | "Gainers" | "Losers">("All");

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
    
    const amt = closed.reduce((sum, d) => {
      const oc = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
      return sum + (oc?.actual_return_amount || 0);
    }, 0);
    return { pct, amt };
  }, [isPractice, practicePortfolio, stats]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className={cn("w-10 h-10 animate-spin", primaryText)} />
        <p className="text-gray-400 text-sm tracking-widest uppercase">Loading Dashboard...</p>
      </div>
    );
  }

  const filteredWatchlist = watchlist.filter(item => {
    if (watchlistFilter === "All") return true;
    if (watchlistFilter === "Watching") return item.status !== "bought";
    if (watchlistFilter === "Bought") return item.status === "bought";
    return true;
  });

  const portfolioItems = (isPractice ? practicePositions : stats?.recent_decisions || []).map((item: any) => {
    const isUp = isPractice ? item.return_percent >= 0 : ((Array.isArray(item.outcome) ? item.outcome[0] : item.outcome)?.actual_return_percent || 0) >= 0;
    const changePct = isPractice ? item.return_percent : ((Array.isArray(item.outcome) ? item.outcome[0] : item.outcome)?.actual_return_percent || 0);
    const changeAmt = isPractice ? item.return_amount : ((Array.isArray(item.outcome) ? item.outcome[0] : item.outcome)?.actual_return_amount || 0);
    const entryPrice = isPractice ? item.entry_price : (Array.isArray(item.outcome) ? item.outcome[0] : item.outcome)?.entry_price || 0;
    const currentPrice = isPractice ? item.current_price : (Array.isArray(item.outcome) ? item.outcome[0] : item.outcome)?.exit_price || 0;
    const qty = isPractice ? item.quantity : 1;
    const invAmt = isPractice ? (entryPrice * qty) : item.investment_amount;
    
    return { ...item, isUp, changePct, changeAmt, entryPrice, currentPrice, qty, invAmt };
  }).filter((item: any) => {
    if (portfolioFilter === "All") return true;
    if (portfolioFilter === "Gainers") return item.isUp;
    if (portfolioFilter === "Losers") return !item.isUp;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07090E] p-4 sm:p-6 lg:p-8 font-sans text-white pb-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* TOP ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Holding */}
          <motion.div custom={1} variants={fade} initial="hidden" animate="visible" className="lg:col-span-1 bg-[#11131A] rounded-[24px] p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 flex items-start justify-between">
              <h3 className="text-gray-400 font-medium">{isPractice ? "Total Deployed Capital" : "Total Tracked Capital"}</h3>
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
          </motion.div>

          {/* Behavior Intelligence Grid */}
          <motion.div custom={2} variants={fade} initial="hidden" animate="visible" className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Biggest Bias */}
            <div className="bg-[#11131A] rounded-[24px] p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-orange-400" /> Biggest Bias
                </h3>
              </div>
              <div>
                <p className="text-2xl font-bold text-white uppercase tracking-tight leading-none mb-2">
                  {stats?.top_bias === "none" ? "CLEAN" : stats?.top_bias?.split("_").join(" ") || "N/A"}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {stats?.top_bias === "none"
                    ? "No behavioral leaks detected."
                    : `Detected in ${stats?.bias_breakdown[stats?.top_bias] || 0} recent trades.`}
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500 opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full blur-2xl" />
            </div>

            {/* Win Rate */}
            <div className="bg-[#11131A] rounded-[24px] p-6 border border-white/5 flex items-center justify-between">
               <div className="flex flex-col justify-between h-full">
                  <h3 className="text-gray-400 font-medium text-sm flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-blue-400" /> Win Rate
                  </h3>
                  <div>
                    <p className="text-3xl font-bold text-white">{stats?.win_rate || 0}%</p>
                    <p className="text-xs text-gray-500 mt-1">{stats?.total_decisions || 0} Trades Total</p>
                  </div>
               </div>
               <div className="relative">
                 <WinRing rate={stats?.win_rate || 0} color={hexColor} />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{stats?.win_rate || 0}%</span>
                 </div>
               </div>
            </div>

            {/* Day Streak */}
            <div className="bg-[#11131A] rounded-[24px] p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" /> Day Streak
                </h3>
              </div>
              <div>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold text-white leading-none">{stats?.current_streak || 0}</p>
                  <p className="text-sm text-gray-500 mb-1">Days</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mt-2">
                  {stats?.current_streak ? "Consistent logging builds edge." : "Start logging to build streak."}
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-500 opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full blur-2xl" />
            </div>

          </motion.div>
        </div>

        {/* MIDDLE ROW: Portfolio Performance */}
        <motion.div custom={3} variants={fade} initial="hidden" animate="visible" className="bg-[#11131A] rounded-[24px] p-6 border border-white/5">
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
                    <stop offset="0%" stopColor={hexColor} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={hexColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,20 C50,20 80,60 120,60 C160,60 180,40 220,50 C260,60 300,50 350,120 C400,190 420,70 450,110 C480,150 500,60 550,50 C600,40 650,70 700,50 C750,30 800,100 850,90 C900,80 950,140 1000,150" 
                  fill="none" 
                  stroke={hexColor} 
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
        </motion.div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Overview */}
          <motion.div custom={4} variants={fade} initial="hidden" animate="visible" className="lg:col-span-2 bg-[#11131A] rounded-[24px] p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-400 font-medium">Portfolio Overview</h3>
              <div className="flex bg-[#1A1C23] rounded-full p-1 border border-white/5">
                {["All", "Gainers", "Losers"].map((btn: any) => (
                  <button 
                    key={btn}
                    onClick={() => setPortfolioFilter(btn)}
                    className={cn(
                      "px-6 py-1.5 rounded-full text-xs font-medium transition-colors",
                      portfolioFilter === btn ? `${primaryBg} text-white` : "text-gray-400 hover:text-white"
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
                    <th className="pb-4 font-normal">Entry Price</th>
                    <th className="pb-4 font-normal">CMP/Exit</th>
                    <th className="pb-4 font-normal">Qty</th>
                    <th className="pb-4 font-normal">Inv. Amount</th>
                    <th className="pb-4 font-normal text-right pr-4">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioItems.slice(0, 5).map((item: any, i: number) => {
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1A1C23] flex items-center justify-center border border-white/5">
                              <span className="text-xs font-bold text-gray-400 uppercase">{item.asset_name.charAt(0)}</span>
                            </div>
                            <span className="font-bold text-gray-200">{item.asset_name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-300">₹ {item.entryPrice?.toLocaleString("en-IN") || "--"}</td>
                        <td className="py-4 text-gray-300">₹ {item.currentPrice?.toLocaleString("en-IN") || "--"}</td>
                        <td className="py-4 text-gray-400 text-xs">Qty {item.qty}</td>
                        <td className="py-4 font-semibold text-gray-200">₹ {item.invAmt?.toLocaleString("en-IN") || "0"}</td>
                        <td className="py-4 pr-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={cn("text-sm font-semibold", item.isUp ? "text-emerald-500" : "text-red-500")}>
                              {item.isUp ? "+" : ""}₹ {item.changeAmt?.toLocaleString("en-IN") || "0"}
                            </span>
                            <span className={cn("text-[10px] font-medium", item.isUp ? "text-emerald-500" : "text-red-500")}>
                              {item.isUp ? "+" : ""}{item.changePct?.toFixed(2) || "0.00"}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {portfolioItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 text-sm italic">No investments logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Watchlist */}
          <motion.div custom={5} variants={fade} initial="hidden" animate="visible" className="lg:col-span-1 bg-[#11131A] rounded-[24px] p-6 border border-white/5">
            <h3 className="text-gray-400 font-medium mb-6">Watchlist</h3>
            <div className="flex bg-[#1A1C23] rounded-full p-1 border border-white/5 mb-6">
              {["All", "Watching", "Bought"].map((btn: any) => (
                <button 
                  key={btn}
                  onClick={() => setWatchlistFilter(btn)}
                  className={cn(
                    "flex-1 py-1.5 rounded-full text-[11px] font-medium transition-colors",
                    watchlistFilter === btn ? `${primaryBg} text-white` : "text-gray-400 hover:text-white"
                  )}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredWatchlist.slice(0, 5).map((item) => {
                const diff = (item.current_price || 0) - (item.price_when_added || 0);
                const pct = item.price_when_added ? (diff / item.price_when_added) * 100 : 0;
                const isUp = pct >= 0;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#1A1C23] transition-colors cursor-pointer border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A1C23] flex items-center justify-center font-bold text-gray-400 border border-white/5">
                        {item.asset_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[120px] text-gray-200">{item.asset_name}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{item.asset_type || "EQUITY"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-200">₹ {item.current_price?.toLocaleString("en-IN") || "--"}</p>
                      <p className={cn("text-[10px] font-medium", isUp ? "text-emerald-500" : "text-red-500")}>
                        {isUp ? "+" : ""}{pct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
              {filteredWatchlist.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center opacity-50">
                  <Search className="w-8 h-8 text-gray-500 mb-2" />
                  <p className="text-gray-500 text-sm text-center">Watchlist is empty</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
