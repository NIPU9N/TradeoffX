"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Brain, ArrowUpRight, ArrowDownRight, ChevronRight,
  AlertCircle, RefreshCw, Loader2, Eye, TrendingUp, TrendingDown,
  Flame, Target, BarChart3, Clock, CheckCircle2, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchDashboard, getWatchlist } from "@/lib/api";
import type { DashboardStats, WatchlistItem } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMode } from "@/context/ModeContext";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, type: "spring" as const, stiffness: 260, damping: 24 } }),
};

// Mini sparkline SVG
function Sparkline({ up }: { up: boolean }) {
  const pts = up
    ? "0,28 12,22 24,25 36,15 48,18 60,10 72,14 84,6 96,9 108,2"
    : "0,4 12,10 24,7 36,18 48,14 60,22 72,19 84,26 96,23 108,30";
  return (
    <svg width="108" height="32" viewBox="0 0 108 32" fill="none">
      <defs>
        <linearGradient id={`sg${up}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? "#4EA8FF" : "#FF4D4D"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={up ? "#4EA8FF" : "#FF4D4D"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={up ? "#4EA8FF" : "#FF4D4D"} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Win rate ring
function WinRing({ rate }: { rate: number }) {
  const r = 22, circ = 2 * Math.PI * r;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(78,168,255,0.12)" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke="#4EA8FF" strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - rate / 100)}
        strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "reviewed" | "pending">("all");

  const router = useRouter();
  const { mode, isPractice } = useMode();

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      const data = await fetchDashboard(mode);
      setStats(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [mode]);

  useEffect(() => { void loadData(); }, [loadData]);
  useEffect(() => {
    getWatchlist({ mode }).then(({ items }) => setWatchlistItems(items)).catch(() => {});
  }, [mode]);
  useEffect(() => {
    const fn = () => { if (document.visibilityState === "visible") loadData(true); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [loadData]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <Loader2 className="w-10 h-10 text-tx-primary animate-spin" />
      <p className="text-tx-text-secondary font-syne text-sm tracking-widest uppercase">Mapping your investor DNA...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center">
      <div className="p-4 rounded-full bg-tx-danger/10 border border-tx-danger/30">
        <AlertCircle className="w-10 h-10 text-tx-danger" />
      </div>
      <h2 className="font-syne text-2xl font-bold">Something went wrong</h2>
      <p className="text-tx-text-secondary max-w-md">{error}</p>
      <button onClick={() => loadData()} className="mt-4 px-6 py-2.5 bg-tx-primary text-[#08080F] font-bold rounded-xl text-sm">Retry</button>
    </div>
  );

  if (!stats) return null;

  const filteredDecisions = stats.recent_decisions.filter(d => {
    if (activeTab === "reviewed") return d.status === "reviewed";
    if (activeTab === "pending") return d.status === "pending_review";
    return true;
  });

  const watching = watchlistItems.filter(i => i.status === "watching").length;
  const bought = watchlistItems.filter(i => i.status === "bought").length;
  const overdue = watchlistItems.filter(i => i.status === "watching" && i.review_date && new Date(i.review_date) <= new Date());

  return (
    <div className="max-w-[1400px] mx-auto pb-12 space-y-6">

      {/* ── TOP BAR ── */}
      <motion.div custom={0} variants={fade} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
              isPractice ? "bg-tx-primary/10 text-tx-primary border-tx-primary/25" : "bg-yellow-400/10 text-yellow-400 border-yellow-400/25"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isPractice ? "bg-tx-primary" : "bg-yellow-400")} />
              {isPractice ? "Practice Mode" : "Real Money Mode"}
            </span>
          </div>
          <h1 className="font-syne text-3xl font-bold text-white">
            {isPractice ? "Practice Studio" : "Portfolio Command"}
          </h1>
          <p className="text-tx-text-secondary text-sm mt-1">
            {isPractice ? "Virtual capital · Real lessons · Zero risk" : "Real trades · Full accountability · Stay disciplined"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-tx-border bg-tx-card/50 text-xs text-tx-text-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Data
          </div>
          <button onClick={() => loadData(true)} disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-tx-primary text-[#08080F] font-semibold rounded-xl text-sm disabled:opacity-50 transition-all hover:brightness-110">
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? "..." : "Refresh"}
          </button>
        </div>
      </motion.div>
      {/* ── MARKET PULSE HERO ── */}
      <motion.div custom={1} variants={fade} initial="hidden" animate="visible"
        className="glass-card overflow-hidden p-6 relative border border-white/10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-tx-primary/20 via-transparent to-emerald-400/10 blur-3xl" />
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-tx-primary/15 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-tx-primary">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Pulse Live
              </span>
              <span className="text-[11px] uppercase tracking-[0.25em] text-tx-text-secondary">Updated every time you refresh</span>
            </div>
            <div className="space-y-3">
              <h2 className="font-syne text-3xl sm:text-4xl font-bold text-white">Dashboard intelligence with momentum, bias and trade pulse.</h2>
              <p className="text-tx-text-secondary max-w-2xl leading-7">See your trading edge in motion through live trend curves, behavior heat, and confidence momentum — all inside your existing TradeoffX workflow.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Edge Score", value: `${stats.win_rate + 8}%`, note: "Success cadence" },
                { label: "Emotion Drag", value: `${stats.emotion_score}%`, note: "Higher means more noise", highlight: true },
                { label: "Bias Saturation", value: `${Object.keys(stats.bias_breakdown).length}`, note: "Total bias categories" },
                { label: "Review Velocity", value: `${stats.pending_reviews.length}`, note: "Pending decisions" },
              ].map((item, index) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-tx-text-secondary mb-2">{item.label}</p>
                  <p className={cn("font-syne text-3xl font-bold", item.highlight ? "text-orange-400" : "text-white")}>{item.value}</p>
                  <p className="text-[11px] text-tx-text-muted mt-2">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex-1 rounded-[32px] border border-white/10 bg-[#01060f]/90 p-5 shadow-2xl shadow-cyan-500/5 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-tx-text-secondary">Trend summary</p>
                <h3 className="font-syne text-2xl font-bold text-white">Momentum curve</h3>
              </div>
              <span className="rounded-full bg-slate-950/60 px-3 py-1 text-[11px] text-tx-text-secondary uppercase tracking-[0.2em]">Alpha +12</span>
            </div>
            <div className="relative h-[240px] overflow-hidden">
              <svg viewBox="0 0 360 220" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="dashGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4EA8FF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#82E3A7" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <path d="M0 180 C 70 190 120 90 170 120 C 220 150 280 60 360 90" fill="none" stroke="url(#dashGradient)" strokeWidth="4" strokeLinecap="round" />
                <circle cx="0" cy="180" r="5" fill="#4EA8FF" />
                <circle cx="170" cy="120" r="6" fill="#82E3A7" />
                <circle cx="360" cy="90" r="5" fill="#38BDF8" />
              </svg>
              <div className="absolute inset-x-0 bottom-0 flex justify-between px-3 pb-4 text-[11px] text-tx-text-secondary">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[
                { label: "Calm execution", value: `${100 - stats.emotion_score}%`, accent: "emerald" },
                { label: "Bias control", value: `${stats.logic_score}%`, accent: "cyan" },
                { label: "Win momentum", value: `${stats.win_rate}%`, accent: "blue" },
                { label: "Review load", value: `${stats.pending_reviews.length}`, accent: "amber" },
              ].map((block) => (
                <div key={block.label} className="rounded-3xl bg-slate-950/80 p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-tx-text-secondary">{block.label}</p>
                    <span className={cn("text-xs font-semibold", block.accent === "amber" ? "text-orange-400" : block.accent === "emerald" ? "text-emerald-400" : block.accent === "cyan" ? "text-cyan-400" : "text-blue-400")}>{block.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-width duration-700", block.accent === "amber" ? "bg-orange-400" : block.accent === "emerald" ? "bg-emerald-400" : block.accent === "cyan" ? "bg-cyan-400" : "bg-blue-400")} style={{ width: block.value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Decisions Logged */}
        <motion.div custom={2} variants={fade} initial="hidden" animate="visible"
          className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-tx-primary/10">
              <BookOpen className="w-4 h-4 text-tx-primary" />
            </div>
            <Sparkline up={true} />
          </div>
          <p className="text-tx-text-secondary text-xs mb-1">Decisions Logged</p>
          <p className="font-mono text-4xl font-bold text-white">{stats.total_decisions}</p>
          <p className="text-tx-primary text-xs mt-1 font-medium">Logged &amp; Locked</p>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-tx-primary opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity" />
        </motion.div>

        {/* Win Rate */}
        <motion.div custom={3} variants={fade} initial="hidden" animate="visible"
          className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-tx-text-secondary text-xs mb-1">Win Rate</p>
              <p className="font-mono text-4xl font-bold text-white">{stats.win_rate}%</p>
              <p className="text-xs mt-1 text-tx-text-muted">
                {stats.win_rate > 50 ? "Beating the odds" : stats.win_rate === 0 ? "Log trades to track" : "Room to improve"}
              </p>
            </div>
            <div className="relative flex-shrink-0">
              <WinRing rate={stats.win_rate} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-tx-primary rotate-90">{stats.win_rate}%</span>
            </div>
          </div>
        </motion.div>

        {/* Day Streak */}
        <motion.div custom={4} variants={fade} initial="hidden" animate="visible"
          className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <p className="text-tx-text-secondary text-xs mb-1">Day Streak</p>
          <p className="font-mono text-4xl font-bold text-orange-400">{stats.current_streak}</p>
          <p className="text-tx-text-muted text-xs mt-1">Longest: {stats.longest_streak} days</p>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-orange-500 opacity-5 rounded-full blur-2xl" />
        </motion.div>

        {/* Logic Score */}
        <motion.div custom={5} variants={fade} initial="hidden" animate="visible"
          className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-tx-secondary/10">
              <Brain className="w-4 h-4 text-tx-secondary" />
            </div>
            <Sparkline up={stats.logic_score > 50} />
          </div>
          <p className="text-tx-text-secondary text-xs mb-1">Logic-Driven</p>
          <p className="font-mono text-4xl font-bold text-tx-secondary">{stats.logic_score}%</p>
          <p className="text-tx-text-muted text-xs mt-1">{stats.emotion_score}% still emotional</p>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-tx-secondary opacity-5 rounded-full blur-2xl" />
        </motion.div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT: Recent Decisions Table (spans 2 cols) */}
        <motion.div custom={5} variants={fade} initial="hidden" animate="visible"
          className="xl:col-span-2 glass-card overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-tx-border gap-4">
            <div>
              <h2 className="font-syne text-lg font-bold text-white">Recent Decisions</h2>
              <p className="text-tx-text-secondary text-xs mt-0.5">{stats.recent_decisions.length} total entries</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter Tabs */}
              <div className="flex bg-tx-card rounded-lg p-1 border border-tx-border text-xs">
                {(["all","reviewed","pending"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={cn("px-3 py-1.5 rounded-md font-medium capitalize transition-all",
                      activeTab === tab ? "bg-tx-primary text-[#08080F]" : "text-tx-text-secondary hover:text-white"
                    )}>
                    {tab === "pending" ? "Pending" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <Link href="/decisions" className="flex items-center gap-1 text-xs text-tx-primary font-medium hover:underline px-2">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-tx-border/50 text-[10px] text-tx-text-muted uppercase tracking-widest">
                  <th className="px-6 py-3 font-medium">Asset</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Confidence</th>
                  <th className="px-6 py-3 font-medium">Emotion</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Return</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-tx-border/20">
                {filteredDecisions.map((d) => {
                  const oc = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome;
                  const isProfit = oc?.outcome_type === "profit";
                  const isLoss = oc?.outcome_type === "loss";
                  return (
                    <tr key={d.id} onClick={() => router.push(`/decisions/${d.id}`)}
                      className="hover:bg-tx-primary/5 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-tx-secondary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-tx-secondary font-bold text-xs">{d.asset_name.slice(0,2).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-syne font-bold text-white group-hover:text-tx-primary transition-colors text-sm">{d.asset_name}</p>
                            <p className="text-[10px] text-tx-text-muted uppercase">{d.asset_type.replace("_"," ")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-tx-text-secondary text-xs">
                        {new Date(d.decision_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-tx-bg rounded-full overflow-hidden">
                            <div className="h-full bg-tx-secondary rounded-full" style={{ width: `${d.confidence_level * 10}%` }} />
                          </div>
                          <span className="text-xs text-tx-text-muted font-mono">{d.confidence_level}/10</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-tx-text-secondary text-xs">{d.emotion}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-semibold border",
                          d.status === "reviewed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          d.status === "pending_review" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                          "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        )}>
                          {d.status.replace("_"," ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sm">
                        {isProfit ? (
                          <span className="text-tx-primary flex items-center justify-end gap-0.5">
                            <ArrowUpRight className="w-3.5 h-3.5" />+{oc?.actual_return_percent}%
                          </span>
                        ) : isLoss ? (
                          <span className="text-tx-danger flex items-center justify-end gap-0.5">
                            <ArrowDownRight className="w-3.5 h-3.5" />{oc?.actual_return_percent}%
                          </span>
                        ) : <span className="text-tx-text-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
                {filteredDecisions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-tx-text-secondary text-sm italic">
                      {isPractice ? "No practice decisions yet. Start experimenting." : "No trades logged yet. Log your first decision."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Biggest Bias */}
          <motion.div custom={6} variants={fade} initial="hidden" animate="visible"
            className="glass-card p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne text-sm font-bold text-tx-text-secondary uppercase tracking-widest">Biggest Bias</h3>
              <div className="p-1.5 rounded-lg bg-tx-danger/10">
                <AlertCircle className="w-4 h-4 text-tx-danger" />
              </div>
            </div>
            <p className={cn(
              "font-syne font-bold text-tx-danger uppercase tracking-wide leading-none mb-3",
              stats.top_bias.length > 10 ? "text-2xl" : "text-4xl"
            )}>
              {stats.top_bias === "none" ? "CLEAN" : stats.top_bias.split("_").join(" ")}
            </p>
            <p className="text-tx-text-secondary text-xs leading-relaxed">
              {stats.top_bias === "none"
                ? "No behavioral leaks detected. Solid execution so far."
                : `Detected in ${stats.bias_breakdown[stats.top_bias] || 0} of your recent trades. Awareness is step one.`}
            </p>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-tx-danger opacity-5 rounded-full blur-2xl" />
          </motion.div>

          {/* Watchlist Snapshot */}
          <motion.div custom={7} variants={fade} initial="hidden" animate="visible">
            <Link href="/watchlist" className="glass-card p-6 relative overflow-hidden group block hover:border-tx-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-syne text-sm font-bold text-tx-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <Eye className={cn("w-4 h-4", isPractice ? "text-tx-primary" : "text-yellow-400")} />
                  Watchlist
                </h3>
                <ChevronRight className="w-4 h-4 text-tx-text-muted group-hover:text-white transition-colors" />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Watching", count: watching, color: "text-blue-400" },
                  { label: "Bought", count: bought, color: "text-emerald-400" },
                  { label: "Skipped", count: watchlistItems.filter(i => i.status === "skipped").length, color: "text-red-400" },
                ].map(s => (
                  <div key={s.label} className="text-center bg-tx-bg/50 rounded-xl p-3">
                    <div className={cn("font-mono text-2xl font-bold", s.color)}>{s.count}</div>
                    <div className="text-[10px] text-tx-text-muted mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {overdue.length > 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  <span className="text-xs text-yellow-400 font-medium">{overdue.length} review{overdue.length > 1 ? "s" : ""} overdue</span>
                </div>
              ) : (
                <p className="text-xs text-tx-text-muted italic">All reviews up to date.</p>
              )}
            </Link>
          </motion.div>

          {/* Pending Reviews */}
          <motion.div custom={8} variants={fade} initial="hidden" animate="visible"
            className="glass-card p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne text-sm font-bold text-tx-text-secondary uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                Awaiting Review
              </h3>
              <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5 font-bold">
                {stats.pending_reviews.length}
              </span>
            </div>
            <div className="space-y-2">
              {stats.pending_reviews.slice(0, 3).map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-tx-bg/50 border border-tx-border/60 rounded-xl hover:border-tx-primary/30 transition-colors">
                  <div>
                    <p className="font-syne font-bold text-sm text-white">{t.asset_name}</p>
                    <p className="text-[10px] text-tx-text-muted">{new Date(t.decision_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <Link href={`/review?id=${t.id}`}
                    className="px-3 py-1.5 bg-tx-primary/10 hover:bg-tx-primary/20 text-tx-primary border border-tx-primary/30 rounded-lg text-xs font-semibold transition-colors">
                    Review →
                  </Link>
                </div>
              ))}
              {stats.pending_reviews.length === 0 && (
                <div className="flex flex-col items-center py-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-sm text-tx-text-secondary">All caught up!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── BOTTOM STRIP: Quick Nav Cards ── */}
      <motion.div custom={9} variants={fade} initial="hidden" animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "P&L Analysis", sub: "Emotion vs returns", icon: BarChart3, href: "/pl", color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Pattern Mirror", sub: "Your behaviour map", icon: Brain, href: "/mirror", color: "text-tx-secondary", bg: "bg-tx-secondary/10" },
          { label: "Outcome Review", sub: "Close open trades", icon: Target, href: "/review", color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: isPractice ? "Practice Portfolio" : "My Decisions", sub: isPractice ? "Virtual positions" : "All logged trades", icon: isPractice ? TrendingUp : BookOpen, href: isPractice ? "/practice" : "/decisions", color: "text-tx-primary", bg: "bg-tx-primary/10" },
        ].map((item, i) => (
          <Link key={i} href={item.href}
            className="glass-card p-5 flex items-center gap-4 group hover:-translate-y-1 hover:border-tx-primary/25 transition-all duration-300">
            <div className={cn("p-2.5 rounded-xl flex-shrink-0", item.bg)}>
              <item.icon className={cn("w-5 h-5", item.color)} />
            </div>
            <div className="min-w-0">
              <p className="font-syne font-bold text-sm text-white group-hover:text-tx-primary transition-colors truncate">{item.label}</p>
              <p className="text-[11px] text-tx-text-muted truncate">{item.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-tx-text-muted group-hover:text-white ml-auto transition-colors flex-shrink-0" />
          </Link>
        ))}
      </motion.div>

    </div>
  );
}
