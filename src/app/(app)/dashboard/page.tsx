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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchDashboard, getWatchlist, getPracticePortfolio, getPracticePositions } from "@/lib/api";
import type { DashboardStats, WatchlistItem, PracticePosition, PracticePortfolio } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

// Enhanced Win Ring with tooltip
function WinRing({ rate, color, totalTrades }: { rate: number, color: string, totalTrades: number }) {
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center group">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90 filter drop-shadow-lg">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - rate / 100)}
          strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-widest">Win Rate</span>
        <span className="text-lg font-bold text-white leading-none">{rate}%</span>
        <span className="text-[9px] text-gray-400 mt-0.5">{totalTrades} trades</span>
      </div>
      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {rate}% win rate from {totalTrades} completed trades
      </div>
    </div>
  );
}

// Performance Chart Component
function PerformanceChart({ data, timeframe, color }: { data: Array<{ date: string, value: number }>, timeframe: string, color: string }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 80; // 80% height for padding
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = points + ` 100,100 0,100`;

  return (
    <div className="relative h-full w-full">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between opacity-20">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full h-px bg-white/10" />
        ))}
      </div>

      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`chartFill-${timeframe}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="filter drop-shadow-sm"
        />
        <polygon
          fill={`url(#chartFill-${timeframe})`}
          points={areaPoints}
        />
      </svg>
    </div>
  );
}

// Enhanced Metric Card
function MetricCard({ title, value, subtitle, icon: Icon, color, trend }: {
  title: string,
  value: string | number,
  subtitle?: string,
  icon: any,
  color: string,
  trend?: { direction: 'up' | 'down' | 'neutral', value: string }
}) {
  return (
    <motion.div
      className="bg-[#11131A]/90 backdrop-blur-xl rounded-[20px] p-5 border border-white/5 relative overflow-hidden group shadow-lg hover:border-white/10 transition-all duration-300 hover:shadow-xl"
      whileHover={{ scale: 1.02 }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className={`absolute -top-16 -right-16 w-32 h-32 ${color} opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full blur-2xl`} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-400 font-medium text-sm flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {title}
          </h3>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
              trend.direction === 'up' ? "text-emerald-400 bg-emerald-500/10" :
              trend.direction === 'down' ? "text-red-400 bg-red-500/10" :
              "text-gray-400 bg-gray-500/10"
            )}>
              {trend.direction === 'up' && <ArrowUpRight className="w-3 h-3" />}
              {trend.direction === 'down' && <ArrowDownRight className="w-3 h-3" />}
              {trend.value}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 font-medium">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
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
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [practicePortfolio, setPracticePortfolio] = useState<PracticePortfolio | null>(null);
  const [practicePositions, setPracticePositions] = useState<PracticePosition[]>([]);

  const [watchlistFilter, setWatchlistFilter] = useState<"All" | "Watching" | "Bought">("All");
  const [portfolioFilter, setPortfolioFilter] = useState<"All" | "Gainers" | "Losers">("All");
  const [chartTimeframe, setChartTimeframe] = useState<"1D" | "1W" | "1M" | "6M" | "1Y">("6M");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [watchlistPage, setWatchlistPage] = useState(1);
  const itemsPerPage = 8;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, watchData] = await Promise.all([
        fetchDashboard(mode).catch((err) => {
          console.error("Failed to fetch dashboard stats:", err);
          return null;
        }),
        getWatchlist({ mode }).catch((err) => {
          console.error("Failed to fetch watchlist:", err);
          return { items: [] };
        })
      ]);

      setStats(statsData);
      setWatchlist(watchData.items || []);

      if (isPractice) {
        try {
          const [portData, posData] = await Promise.all([
            getPracticePortfolio().catch((err) => {
              console.error("Failed to fetch practice portfolio:", err);
              return { portfolio: null };
            }),
            getPracticePositions().catch((err) => {
              console.error("Failed to fetch practice positions:", err);
              return { positions: [] };
            })
          ]);
          setPracticePortfolio(portData.portfolio);
          setPracticePositions(posData.positions || []);
        } catch (e) {
          console.error("Failed to load practice data:", e);
          setError("Failed to load practice portfolio data");
        }
      }
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [mode, isPractice]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate mock chart data based on timeframe (in a real app, this would come from API)
  const chartData = useMemo(() => {
    const now = new Date();
    const periods = {
      "1D": 24, // hours
      "1W": 7,  // days
      "1M": 30, // days
      "6M": 26, // weeks
      "1Y": 52  // weeks
    };

    const count = periods[chartTimeframe];
    const data = [];
    let baseValue = isPractice ? (practicePortfolio?.current_value || 100000) : 100000;

    for (let i = count; i >= 0; i--) {
      const date = new Date(now);
      if (chartTimeframe === "1D") {
        date.setHours(now.getHours() - i);
      } else if (chartTimeframe === "1W" || chartTimeframe === "1M") {
        date.setDate(now.getDate() - i);
      } else {
        date.setDate(now.getDate() - (i * 7));
      }

      // Simulate some volatility
      const change = (Math.random() - 0.5) * 0.02; // ±1% change
      baseValue *= (1 + change);

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, baseValue)
      });
    }

    return data;
  }, [chartTimeframe, isPractice, practicePortfolio]);

  const totalValue = useMemo(() => {
    if (isPractice) return practicePortfolio?.current_value || 0;
    if (!stats || !stats.recent_decisions) return 0;
    return stats.recent_decisions.reduce((sum, d) => sum + (d.investment_amount || 0), 0);
  }, [isPractice, practicePortfolio, stats]);

  const totalReturn = useMemo(() => {
    if (isPractice && practicePortfolio) {
      return {
        pct: practicePortfolio.total_return_percent || 0,
        amt: practicePortfolio.total_return_amount || 0
      };
    }
    if (!stats || !stats.recent_decisions) return { pct: 0, amt: 0 };

    const closed = stats.recent_decisions.filter(d => {
      const oc = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
      return oc && (oc.outcome_type === "profit" || oc.outcome_type === "loss");
    });

    if (closed.length === 0) return { pct: 0, amt: 0 };

    const totalInvested = closed.reduce((sum, d) => sum + (d.investment_amount || 0), 0);
    const totalReturnAmt = closed.reduce((sum, d) => {
      const oc = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
      const pnl = oc?.actual_return_percent ? (d.investment_amount * (oc.actual_return_percent / 100)) : 0;
      return sum + pnl;
    }, 0);

    const pct = totalInvested > 0 ? (totalReturnAmt / totalInvested) * 100 : 0;

    return { pct, amt: totalReturnAmt };
  }, [isPractice, practicePortfolio, stats]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className={cn("w-12 h-12 animate-spin", primaryText)} />
        <p className="text-gray-400 text-sm tracking-widest uppercase font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-400 text-sm text-center max-w-md">{error}</p>
        <button
          onClick={loadData}
          className={cn("px-4 py-2 rounded-lg font-medium transition-colors", primaryBg, "text-white hover:opacity-90")}
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredWatchlist = watchlist
    .filter(item => {
      if (watchlistFilter === "All") return true;
      if (watchlistFilter === "Watching") return item.status !== "bought";
      if (watchlistFilter === "Bought") return item.status === "bought";
      return true;
    })
    .filter(item =>
      searchQuery === "" ||
      item.asset_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const portfolioItems = (isPractice ? practicePositions : (stats?.recent_decisions || []))
    .map((item: any) => {
      const isPracticeItem = isPractice;
      const oc = !isPracticeItem && item.outcome ? (Array.isArray(item.outcome) ? item.outcome[0] : item.outcome) : null;

      const changePct = isPracticeItem ? (item.return_percent || 0) : (oc?.actual_return_percent || 0);
      const isUp = changePct >= 0;

      const entryPrice = isPracticeItem ? item.entry_price : (oc?.entry_price || 0);
      const currentPrice = isPracticeItem ? item.current_price : (oc?.exit_price || 0);
      const qty = isPracticeItem ? item.quantity : 1;
      const invAmt = isPracticeItem ? (entryPrice * qty) : item.investment_amount;
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
    })
    .filter((item: any) => {
      if (portfolioFilter === "All") return true;
      if (portfolioFilter === "Gainers") return item.isUp && item.changePct > 0;
      if (portfolioFilter === "Losers") return !item.isUp || item.changePct < 0;
      return true;
    })
    .filter(item =>
      searchQuery === "" ||
      item.asset_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination
  const totalPortfolioPages = Math.ceil(portfolioItems.length / itemsPerPage);
  const paginatedPortfolio = portfolioItems.slice(
    (portfolioPage - 1) * itemsPerPage,
    portfolioPage * itemsPerPage
  );

  const totalWatchlistPages = Math.ceil(filteredWatchlist.length / itemsPerPage);
  const paginatedWatchlist = filteredWatchlist.slice(
    (watchlistPage - 1) * itemsPerPage,
    watchlistPage * itemsPerPage
  );

  const biasString = stats?.top_bias === "none" ? "CLEAN" : stats?.top_bias?.split("_").join(" ") || "N/A";
  const biasCount = stats?.top_bias && stats?.bias_breakdown ? (stats.bias_breakdown[stats.top_bias] || 0) : 0;

  return (
    <div className="min-h-screen bg-[#07090E] p-4 sm:p-6 lg:p-8 font-sans text-white pb-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* TOP ROW - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={isPractice ? "Total Deployed Capital" : "Total Tracked Capital"}
            value={`₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            subtitle={isPractice ? "Virtual portfolio value" : "Sum of all investments"}
            icon={DollarSign}
            color={primaryBg}
            trend={totalReturn.pct !== 0 ? {
              direction: totalReturn.pct >= 0 ? 'up' : 'down',
              value: `${totalReturn.pct >= 0 ? '+' : ''}${totalReturn.pct.toFixed(1)}%`
            } : undefined}
          />

          <MetricCard
            title="Win Rate"
            value={`${stats?.win_rate || 0}%`}
            subtitle={`${stats?.total_decisions || 0} total trades`}
            icon={Target}
            color="bg-blue-500"
          />

          <MetricCard
            title="Current Streak"
            value={`${stats?.current_streak || 0}`}
            subtitle="Days of consistent logging"
            icon={Flame}
            color="bg-orange-500"
          />

          <MetricCard
            title="Biggest Bias"
            value={biasString}
            subtitle={stats?.top_bias === "none" ? "No leaks detected" : `${biasCount} occurrences`}
            icon={Brain}
            color="bg-purple-500"
          />
        </div>

        {/* CHART SECTION */}
        <motion.div custom={3} variants={fade} initial="hidden" animate="visible"
          className="bg-[#11131A]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-400 font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gray-500" /> Portfolio Performance
            </h3>
            <div className="flex bg-[#1A1C23] rounded-full p-1 border border-white/5">
              {["1D", "1W", "1M", "6M", "1Y"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => setChartTimeframe(btn as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300",
                    chartTimeframe === btn
                      ? `${primaryBg} text-white shadow-md`
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[300px] w-full">
            <PerformanceChart data={chartData} timeframe={chartTimeframe} color={hexColor} />

            {/* Y-Axis Labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-medium text-gray-600 pr-4 h-full pt-2">
              <span>+15%</span>
              <span>+10%</span>
              <span>+5%</span>
              <span>0%</span>
              <span>-5%</span>
            </div>
          </div>
        </motion.div>

        {/* BOTTOM ROW - Portfolio & Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Portfolio Overview */}
          <motion.div custom={4} variants={fade} initial="hidden" animate="visible"
            className="lg:col-span-2 bg-[#11131A]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-400 font-medium flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Portfolio Overview
              </h3>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#1A1C23] border border-white/5 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/20 w-48"
                  />
                </div>
                {/* Filter */}
                <div className="flex bg-[#1A1C23] rounded-full p-1 border border-white/5">
                  {["All", "Gainers", "Losers"].map((btn: any) => (
                    <button
                      key={btn}
                      onClick={() => setPortfolioFilter(btn)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300",
                        portfolioFilter === btn ? `${primaryBg} text-white shadow-md` : "text-gray-500 hover:text-white"
                      )}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-gray-500 text-[11px] font-semibold tracking-wider uppercase border-b border-white/5">
                    <th className="pb-4 pl-2 text-left">Asset</th>
                    <th className="pb-4 text-center">Entry</th>
                    <th className="pb-4 text-center">Current</th>
                    <th className="pb-4 text-center">Qty</th>
                    <th className="pb-4 text-center">Invested</th>
                    <th className="pb-4 text-right pr-4">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {paginatedPortfolio.map((item: any) => (
                    <tr key={item.id || item.asset_name} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-2 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1A1C23] flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                            <span className="text-xs font-bold text-gray-400 uppercase">{item.asset_name.charAt(0)}</span>
                          </div>
                          <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{item.asset_name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-400 font-medium text-center align-middle">
                        ₹{item.entryPrice?.toLocaleString("en-IN") || "--"}
                      </td>
                      <td className="py-4 text-gray-400 font-medium text-center align-middle">
                        ₹{item.currentPrice?.toLocaleString("en-IN") || "--"}
                      </td>
                      <td className="py-4 align-middle">
                        <div className="flex justify-center items-center">
                          <span className="text-gray-500 text-xs font-bold text-center bg-white/[0.02] rounded-lg px-3 py-1.5">
                            {item.qty}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-gray-300 text-center align-middle">
                        ₹{item.invAmt?.toLocaleString("en-IN") || "0"}
                      </td>
                      <td className="py-4 pr-4 align-middle">
                        <div className="flex flex-col items-end justify-center">
                          <span className={cn("text-sm font-bold leading-none mb-1", item.isUp ? "text-emerald-400" : "text-red-400")}>
                            {item.changeAmt > 0 ? "+" : ""}₹{Math.abs(item.changeAmt).toLocaleString("en-IN", {maximumFractionDigits:0})}
                          </span>
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded leading-none",
                            item.isUp ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10")}>
                            {item.changePct > 0 ? "+" : ""}{item.changePct?.toFixed(2) || "0.00"}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedPortfolio.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                          <Search className="w-8 h-8 mb-1" />
                          <p className="text-sm font-medium">
                            {portfolioItems.length === 0 ? "No investments logged yet." : "No assets match your search."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPortfolioPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-400">
                  Showing {((portfolioPage - 1) * itemsPerPage) + 1} to {Math.min(portfolioPage * itemsPerPage, portfolioItems.length)} of {portfolioItems.length} assets
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPortfolioPage(Math.max(1, portfolioPage - 1))}
                    disabled={portfolioPage === 1}
                    className="p-2 rounded-lg border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-400 px-3">
                    {portfolioPage} of {totalPortfolioPages}
                  </span>
                  <button
                    onClick={() => setPortfolioPage(Math.min(totalPortfolioPages, portfolioPage + 1))}
                    disabled={portfolioPage === totalPortfolioPages}
                    className="p-2 rounded-lg border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Watchlist */}
          <motion.div custom={5} variants={fade} initial="hidden" animate="visible"
            className="lg:col-span-1 bg-[#11131A]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-400 font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" /> Watchlist
              </h3>
              <div className="flex bg-[#1A1C23] rounded-full p-1 border border-white/5">
                {["All", "Watching", "Bought"].map((btn: any) => (
                  <button
                    key={btn}
                    onClick={() => setWatchlistFilter(btn)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300",
                      watchlistFilter === btn ? `${primaryBg} text-white shadow-md` : "text-gray-500 hover:text-white"
                    )}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {paginatedWatchlist.map((item) => {
                const diff = (item.current_price || 0) - (item.price_when_added || 0);
                const pct = item.price_when_added ? (diff / item.price_when_added) * 100 : 0;
                const isUp = pct >= 0;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] transition-all cursor-pointer border border-transparent hover:border-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A1C23] flex items-center justify-center font-bold text-gray-400 border border-white/5 group-hover:border-white/10 transition-colors">
                        {item.asset_name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate max-w-[120px] text-gray-200 group-hover:text-white transition-colors">
                          {item.asset_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                            {item.asset_type || "EQUITY"}
                          </span>
                          <span className={cn("w-1.5 h-1.5 rounded-full", item.status === "bought" ? "bg-blue-500" : "bg-gray-500")}></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                        ₹{item.current_price?.toLocaleString("en-IN") || "--"}
                      </p>
                      <p className={cn("text-[11px] font-bold mt-0.5", isUp ? "text-emerald-500" : "text-red-500")}>
                        {isUp ? "+" : ""}{pct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
              {paginatedWatchlist.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center opacity-40">
                  <Search className="w-10 h-10 text-gray-500 mb-3" />
                  <p className="text-gray-400 text-sm font-medium">
                    {filteredWatchlist.length === 0 ? "No assets tracked yet." : "No assets match your filters."}
                  </p>
                </div>
              )}
            </div>

            {/* Watchlist Pagination */}
            {totalWatchlistPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/5">
                <button
                  onClick={() => setWatchlistPage(Math.max(1, watchlistPage - 1))}
                  disabled={watchlistPage === 1}
                  className="p-1.5 rounded border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-xs text-gray-400 px-2">
                  {watchlistPage} / {totalWatchlistPages}
                </span>
                <button
                  onClick={() => setWatchlistPage(Math.min(totalWatchlistPages, watchlistPage + 1))}
                  disabled={watchlistPage === totalWatchlistPages}
                  className="p-1.5 rounded border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
