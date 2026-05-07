"use client";

import { useMode } from "@/context/ModeContext";
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  Loader2,
  Brain,
  Target,
  Flame,
  Search,
  Activity,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchDashboard, getWatchlist, getPracticePortfolio, getPracticePositions } from "@/lib/api";
import type { DashboardStats, WatchlistItem, PracticePosition, PracticePortfolio } from "@/types";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

// Win rate ring SVG component
function WinRing({ rate, color }: { rate: number, color: string }) {
  const r = 36, circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90 filter drop-shadow-lg">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - rate / 100)}
          strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-widest">Win</span>
        <span className="text-sm font-bold text-white leading-none">{rate}%</span>
      </div>
    </div>
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
        fetchDashboard(mode).catch(() => null),
        getWatchlist({ mode }).catch(() => ({ items: [] }))
      ]);
      setStats(statsData);
      setWatchlist(watchData.items || []);

      if (isPractice) {
        try {
          const [portData, posData] = await Promise.all([
            getPracticePortfolio().catch(() => ({ portfolio: null })),
            getPracticePositions().catch(() => ({ positions: [] }))
          ]);
          setPracticePortfolio(portData.portfolio);
          setPracticePositions(posData.positions || []);
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
    if (!stats || !stats.recent_decisions) return 0;
    return stats.recent_decisions.reduce((sum, d) => sum + (d.investment_amount || 0), 0);
  }, [isPractice, practicePortfolio, stats]);

  const totalReturn = useMemo(() => {
    if (isPractice) return { pct: practicePortfolio?.total_return_percent || 0, amt: practicePortfolio?.total_return_amount || 0 };
    if (!stats || !stats.recent_decisions) return { pct: 0, amt: 0 };
    
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
      // Approximate amount if it's not explicitly in the outcome
      const pnlAmt = oc?.actual_return_percent ? (d.investment_amount * (oc.actual_return_percent / 100)) : 0;
      return sum + pnlAmt;
    }, 0);
    
    return { pct, amt };
  }, [isPractice, practicePortfolio, stats]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className={cn("w-10 h-10 animate-spin", primaryText)} />
        <p className="text-gray-400 text-sm tracking-widest uppercase font-medium">Initializing Terminal...</p>
      </div>
    );
  }

  const filteredWatchlist = watchlist.filter(item => {
    if (watchlistFilter === "All") return true;
    if (watchlistFilter === "Watching") return item.status !== "bought";
    if (watchlistFilter === "Bought") return item.status === "bought";
    return true;
  });

  const portfolioItems = (isPractice ? practicePositions : (stats?.recent_decisions || [])).map((item: any) => {
    const isPracticeItem = isPractice;
    const oc = !isPracticeItem && item.outcome ? (Array.isArray(item.outcome) ? item.outcome[0] : item.outcome) : null;
    
    const changePct = isPracticeItem ? (item.return_percent || 0) : (oc?.actual_return_percent || 0);
    const isUp = changePct >= 0;
    
    const entryPrice = isPracticeItem ? item.entry_price : (oc?.entry_price || 0);
    const currentPrice = isPracticeItem ? item.current_price : (oc?.exit_price || 0);
    const qty = isPracticeItem ? item.quantity : 1;
    const invAmt = isPracticeItem ? (entryPrice * qty) : item.investment_amount;
    
    // Approximate PNL amount for real mode if not provided explicitly
    const changeAmt = isPracticeItem ? (item.return_amount || 0) : (invAmt * (changePct / 100));
    
    return { 
      id: item.id,
      asset_name: item.asset_name || "Unknown",
      isUp, 
      changePct, 
      changeAmt, 
      entryPrice, 
      currentPrice, 
      qty, 
      invAmt 
    };
  }).filter((item: any) => {
    if (portfolioFilter === "All") return true;
    if (portfolioFilter === "Gainers") return item.isUp && item.changePct > 0;
    if (portfolioFilter === "Losers") return !item.isUp || item.changePct < 0;
    return true;
  });

  const biasString = stats?.top_bias === "none" ? "CLEAN" : stats?.top_bias?.split("_").join(" ") || "N/A";
  const biasCount = stats?.top_bias && stats?.bias_breakdown ? (stats.bias_breakdown[stats.top_bias] || 0) : 0;

  return (
    <div className="min-h-screen bg-[#07090E] p-4 sm:p-6 lg:p-8 font-sans text-white pb-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* TOP ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Holding */}
          <motion.div custom={1} variants={fade} initial="hidden" animate="visible" 
            className="lg:col-span-1 bg-[#11131A]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-2xl">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 flex items-start justify-between">
              <h3 className="text-gray-400 font-medium text-sm flex items-center gap-2">
                <Activity className={cn("w-4 h-4", primaryText)} />
                {isPractice ? "Total Deployed Capital" : "Total Tracked Capital"}
              </h3>
              <div className="flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                <button className="px-4 py-1.5 rounded-full border border-white/20 text-xs font-medium hover:bg-white/10 transition">6M</button>
                <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition">
                  <MoreHorizontal className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            
            <div className="relative z-10 mt-12">
              <h1 className="text-4xl font-bold mb-3 tracking-tight drop-shadow-sm">₹ {totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 font-medium">Return</span>
                <span className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold shadow-inner",
                  totalReturn.pct >= 0 ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-red-400 bg-red-500/10 border border-red-500/20"
                )}>
                  {totalReturn.pct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {totalReturn.pct >= 0 ? "+" : ""}{totalReturn.pct.toFixed(2)}% {totalReturn.amt !== 0 ? `(₹ ${Math.abs(totalReturn.amt).toLocaleString("en-IN", {maximumFractionDigits: 0})})` : ""}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Behavior Intelligence Grid */}
          <motion.div custom={2} variants={fade} initial="hidden" animate="visible" className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Biggest Bias */}
            <div className="bg-[#11131A]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group shadow-lg hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-orange-400" /> Biggest Bias
                </h3>
              </div>
              <div className="relative z-10 flex flex-col justify-end h-full">
                <p className="text-2xl font-bold text-white uppercase tracking-tight leading-none mb-2 drop-shadow-sm truncate">
                  {biasString}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  {stats?.top_bias === "none" || !stats?.top_bias
                    ? "No leaks detected."
                    : `Detected in ${biasCount} recent trades.`}
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500 opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full blur-2xl" />
            </div>

            {/* Win Rate */}
            <div className="bg-[#11131A]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/5 flex items-center justify-between shadow-lg hover:border-white/10 transition-colors">
               <div className="flex flex-col justify-between h-full">
                  <h3 className="text-gray-400 font-medium text-sm flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-blue-400" /> Win Rate
                  </h3>
                  <div className="flex flex-col justify-end h-full">
                    <p className="text-3xl font-bold text-white drop-shadow-sm leading-none mb-1">{stats?.win_rate || 0}%</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{stats?.total_decisions || 0} Trades Total</p>
                  </div>
               </div>
               <div className="flex items-end h-full pb-1">
                 <WinRing rate={stats?.win_rate || 0} color={hexColor} />
               </div>
            </div>

            {/* Day Streak */}
            <div className="bg-[#11131A]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group shadow-lg hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" /> Day Streak
                </h3>
              </div>
              <div className="relative z-10 flex flex-col justify-end h-full">
                <div className="flex items-baseline gap-1.5 mb-2">
                  <p className="text-4xl font-bold text-white leading-none drop-shadow-sm">{stats?.current_streak || 0}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Days</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  {stats?.current_streak && stats.current_streak > 0 ? "Consistent logging builds edge." : "Start logging to build streak."}
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-500 opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full blur-2xl" />
            </div>

          </motion.div>
        </div>

        {/* MIDDLE ROW: Portfolio Performance */}
        <motion.div custom={3} variants={fade} initial="hidden" animate="visible" className="bg-[#11131A]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-gray-400 font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" /> Portfolio Performance
            </h3>
            <div className="flex bg-[#1A1C23] rounded-full p-1 border border-white/5">
              {["1D", "1W", "1M", "6M", "1Y"].map((btn) => (
                <button 
                  key={btn}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300",
                    btn === "6M" 
                      ? `${primaryBg} text-white shadow-md` 
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[280px] w-full flex">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between text-[10px] font-medium text-gray-600 pr-6 h-[240px] pt-2 text-right w-[60px]">
              <span>+20%</span>
              <span>+15%</span>
              <span>+10%</span>
              <span>+5%</span>
              <span>0%</span>
            </div>

            {/* Chart Area */}
            <div className="relative flex-1 h-[240px]">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full h-px bg-white/[0.03]" />
                ))}
              </div>

              {/* The SVG Line (Decorative) */}
              <svg viewBox="0 0 1000 240" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={hexColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={hexColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,180 C50,180 80,140 120,150 C160,160 180,120 220,130 C260,140 300,100 350,120 C400,140 420,70 450,90 C480,110 500,60 550,50 C600,40 650,70 700,50 C750,30 800,100 850,90 C900,80 950,140 1000,80" 
                  fill="none" 
                  stroke={hexColor} 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="filter drop-shadow-md"
                />
                <path 
                  d="M0,180 C50,180 80,140 120,150 C160,160 180,120 220,130 C260,140 300,100 350,120 C400,140 420,70 450,90 C480,110 500,60 550,50 C600,40 650,70 700,50 C750,30 800,100 850,90 C900,80 950,140 1000,80 L1000,240 L0,240 Z" 
                  fill="url(#chartFill)" 
                />
              </svg>
            </div>
            
            {/* X-Axis */}
            <div className="absolute bottom-0 left-[60px] right-0 flex justify-between text-[10px] font-medium text-gray-600 pt-4 translate-y-full px-2">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </motion.div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Overview */}
          <motion.div custom={4} variants={fade} initial="hidden" animate="visible" className="lg:col-span-2 bg-[#11131A]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-400 font-medium">Portfolio Overview</h3>
              <div className="flex bg-[#1A1C23] rounded-full p-1 border border-white/5">
                {["All", "Gainers", "Losers"].map((btn: any) => (
                  <button 
                    key={btn}
                    onClick={() => setPortfolioFilter(btn)}
                    className={cn(
                      "px-5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300",
                      portfolioFilter === btn ? `${primaryBg} text-white shadow-md` : "text-gray-500 hover:text-white"
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
                  <tr className="text-gray-500 text-[11px] font-semibold tracking-wider uppercase border-b border-white/5">
                    <th className="pb-4 pl-2 text-left">Asset</th>
                    <th className="pb-4 text-center">Entry</th>
                    <th className="pb-4 text-center">CMP / Exit</th>
                    <th className="pb-4 text-center">Qty</th>
                    <th className="pb-4 text-center">Invested</th>
                    <th className="pb-4 text-right pr-4">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {portfolioItems.slice(0, 5).map((item: any) => {
                    return (
                      <tr key={item.id || item.asset_name} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 pl-2 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#1A1C23] flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                              <span className="text-xs font-bold text-gray-400 uppercase">{item.asset_name.charAt(0)}</span>
                            </div>
                            <span className="font-bold text-gray-200">{item.asset_name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-400 font-medium text-center align-middle">₹{item.entryPrice?.toLocaleString("en-IN") || "--"}</td>
                        <td className="py-4 text-gray-400 font-medium text-center align-middle">₹{item.currentPrice?.toLocaleString("en-IN") || "--"}</td>
                        <td className="py-4 align-middle">
                          <div className="flex justify-center items-center">
                            <span className="text-gray-500 text-xs font-bold text-center bg-white/[0.02] rounded-lg px-3 py-1.5">{item.qty}</span>
                          </div>
                        </td>
                        <td className="py-4 font-semibold text-gray-300 text-center align-middle">₹{item.invAmt?.toLocaleString("en-IN") || "0"}</td>
                        <td className="py-4 pr-4 align-middle">
                          <div className="flex flex-col items-end justify-center">
                            <span className={cn("text-sm font-bold leading-none mb-1", item.isUp ? "text-emerald-400" : "text-red-400")}>
                              {item.changeAmt > 0 ? "+" : ""}₹{Math.abs(item.changeAmt).toLocaleString("en-IN", {maximumFractionDigits:0})}
                            </span>
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded leading-none", item.isUp ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10")}>
                              {item.changePct > 0 ? "+" : ""}{item.changePct?.toFixed(2) || "0.00"}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {portfolioItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                          <Search className="w-8 h-8 mb-1" />
                          <p className="text-sm font-medium">No investments logged yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Watchlist */}
          <motion.div custom={5} variants={fade} initial="hidden" animate="visible" className="lg:col-span-1 bg-[#11131A]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/5 shadow-xl">
            <h3 className="text-gray-400 font-medium mb-6">Watchlist</h3>
            <div className="flex bg-[#1A1C23] rounded-full p-1 border border-white/5 mb-6">
              {["All", "Watching", "Bought"].map((btn: any) => (
                <button 
                  key={btn}
                  onClick={() => setWatchlistFilter(btn)}
                  className={cn(
                    "flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300",
                    watchlistFilter === btn ? `${primaryBg} text-white shadow-md` : "text-gray-500 hover:text-white"
                  )}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredWatchlist.slice(0, 6).map((item) => {
                const diff = (item.current_price || 0) - (item.price_when_added || 0);
                const pct = item.price_when_added ? (diff / item.price_when_added) * 100 : 0;
                const isUp = pct >= 0;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] transition-all cursor-pointer border border-transparent hover:border-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A1C23] flex items-center justify-center font-bold text-gray-400 border border-white/5 group-hover:border-white/10 transition-colors">
                        {item.asset_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[120px] text-gray-200 group-hover:text-white transition-colors">{item.asset_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{item.asset_type || "EQUITY"}</span>
                          <span className={cn("w-1.5 h-1.5 rounded-full", item.status === "bought" ? "bg-blue-500" : "bg-gray-500")}></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">₹{item.current_price?.toLocaleString("en-IN") || "--"}</p>
                      <p className={cn("text-[11px] font-bold mt-0.5", isUp ? "text-emerald-500" : "text-red-500")}>
                        {isUp ? "+" : ""}{pct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
              {filteredWatchlist.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center opacity-40">
                  <Search className="w-10 h-10 text-gray-500 mb-3" />
                  <p className="text-gray-400 text-sm font-medium">No assets tracked yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
