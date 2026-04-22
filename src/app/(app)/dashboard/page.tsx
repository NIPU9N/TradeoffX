"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, ArrowUpRight, ArrowDownRight, ChevronRight, AlertCircle, Camera, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchDashboard } from "@/lib/api";
import type { DashboardStats } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      const data = await fetchDashboard();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh when tab regains focus (after navigating back from logging a decision)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") loadData(true);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-tx-primary animate-spin" />
        <p className="text-tx-text-secondary font-syne">Mapping your investor DNA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="p-4 rounded-full bg-tx-danger/10 border border-tx-danger/30">
          <AlertCircle className="w-10 h-10 text-tx-danger" />
        </div>
        <h2 className="font-syne text-2xl font-bold">Something went wrong</h2>
        <p className="text-tx-text-secondary max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-tx-primary text-tx-bg font-bold rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-12 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Bar */}
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="font-syne text-4xl font-bold mb-2">Decision Intelligence Hub</h1>
          <p className="text-tx-text-secondary text-lg">
            {stats.pending_reviews.length > 0
              ? `You have ${stats.pending_reviews.length} decisions awaiting review. Don't ghost your portfolio.`
              : "All clear! Every trade is documented and reviewed."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-tx-card border border-tx-border rounded-xl text-sm text-tx-text-secondary hover:text-white hover:border-tx-primary transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-tx-primary")} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <div className="flex items-center gap-2 bg-tx-card/50 border border-tx-border px-4 py-2 rounded-full backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-tx-primary animate-pulse"></div>
            <span className="text-sm font-medium text-tx-text-secondary">Live Data</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Decisions */}
        <div className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-sm text-tx-text-secondary font-medium">Decisions Logged</span>
            <BookOpen className="w-5 h-5 text-tx-primary" />
          </div>
          <div className="relative z-10">
            <span className="font-mono text-5xl font-bold text-white block mb-1">{stats.total_decisions}</span>
            <span className="text-sm text-tx-primary font-medium">Logged & Locked</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-tx-primary opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
        </div>

        {/* Win Rate */}
        <div className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-sm text-tx-text-secondary font-medium">Win Rate</span>
            {/* SVG ring showing actual win rate */}
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(0,255,148,0.15)" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="12" fill="none"
                stroke="#00ff94" strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 12}`}
                strokeDashoffset={`${2 * Math.PI * 12 * (1 - stats.win_rate / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
          </div>
          <div className="relative z-10">
            <span className="font-mono text-5xl font-bold text-white block mb-1">{stats.win_rate}%</span>
            <span className="text-sm text-tx-text-muted">
              {stats.win_rate === 0 ? "Review trades to track wins." : stats.win_rate > 50 ? "Beating the odds." : "Room for improvement."}
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-sm text-tx-text-secondary font-medium">Day Streak</span>
          </div>
          <div className="relative z-10">
            <span className="font-syne text-5xl font-bold text-tx-accent block mb-1 drop-shadow-[0_0_12px_rgba(255,184,0,0.4)]">🔥 {stats.current_streak}</span>
            <span className="text-sm text-tx-text-muted">Longest: {stats.longest_streak} days</span>
          </div>
        </div>

        {/* Logic Score */}
        <div className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-sm text-tx-text-secondary font-medium">Logic-Driven Decisions</span>
            <Brain className="w-5 h-5 text-tx-secondary" />
          </div>
          <div className="relative z-10">
            <span className="font-mono text-5xl font-bold text-tx-secondary block mb-1 drop-shadow-[0_0_12px_rgba(123,97,255,0.4)]">{stats.logic_score}%</span>
            <span className="text-sm text-tx-text-muted">{stats.emotion_score}% still emotional. Work on it.</span>
          </div>
        </div>
      </motion.div>

      {/* Middle Section - Recent Decisions */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-tx-border">
          <h2 className="font-syne text-xl font-bold">Recent Decisions</h2>
          <Link href="/decisions" className="text-sm text-tx-primary font-medium hover:underline flex items-center">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-tx-border/50 text-xs text-tx-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Asset</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium max-w-[200px]">Thesis</th>
                <th className="px-6 py-4 font-medium">Confidence</th>
                <th className="px-6 py-4 font-medium">Emotion</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {stats.recent_decisions.map((decision) => (
                <tr 
                  key={decision.id} 
                  onClick={() => router.push(`/decisions/${decision.id}`)}
                  className="border-b border-tx-border/30 hover:bg-tx-primary/5 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-syne font-bold text-white group-hover:text-tx-primary transition-colors">{decision.asset_name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-tx-card text-tx-text-secondary text-[10px] border border-tx-border uppercase whitespace-nowrap">
                      {decision.asset_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-tx-text-secondary">{new Date(decision.decision_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-6 py-4 max-w-[200px] truncate text-tx-text-secondary italic">{decision.thesis}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{decision.confidence_level}/10</span>
                      <div className="w-12 h-1.5 bg-tx-bg rounded-full overflow-hidden">
                        <div className="h-full bg-tx-secondary" style={{ width: `${decision.confidence_level * 10}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{decision.emotion}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      decision.status === "reviewed" ? "bg-tx-primary/10 text-tx-primary border-tx-primary/30" :
                      decision.status === "pending_review" ? "bg-orange-500/10 text-orange-400 border-orange-500/30" :
                      "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    )}>
                      {decision.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold">
                    {(() => {
                      const oc = Array.isArray(decision.outcome) ? decision.outcome[0] : decision.outcome;
                      if (oc?.outcome_type === "profit") {
                        return <span className="text-tx-primary flex items-center justify-end"><ArrowUpRight className="w-4 h-4 mr-1" /> +{oc.actual_return_percent}%</span>;
                      }
                      if (oc?.outcome_type === "loss") {
                        return <span className="text-tx-danger flex items-center justify-end"><ArrowDownRight className="w-4 h-4 mr-1" /> {oc.actual_return_percent}%</span>;
                      }
                      return <span className="text-tx-text-muted">—</span>;
                    })()}
                  </td>
                </tr>
              ))}
              {stats.recent_decisions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-tx-text-secondary">
                    No decisions logged yet. Start by logging your first trade!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bottom Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biggest Bias Card */}
        <div className="glass-card p-8 flex flex-col justify-between relative overflow-hidden">
          <div>
            <h3 className="font-syne text-xl font-bold mb-6">Your Biggest Bias Right Now</h3>
            <div className={cn(
              "font-syne font-bold text-tx-danger mb-4 drop-shadow-[0_0_15px_rgba(255,77,77,0.3)] uppercase break-words",
              stats.top_bias.length > 10 ? "text-4xl tracking-normal" : "text-6xl tracking-[0.1em]"
            )}>
              {stats.top_bias === "none" ? "CLEAN" : stats.top_bias.split('_').join(' ')}
            </div>
            <p className="text-tx-text-secondary mb-6">
              {stats.top_bias === "none" 
                ? "No behavioral leaks detected yet. Solid."
                : `Detected in ${stats.bias_breakdown[stats.top_bias] || 0} of your recent trades.`}
            </p>
            
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-xs text-tx-text-secondary mb-1">
                <span className="uppercase">{stats.top_bias === "none" ? "Logic" : stats.top_bias.split('_').join(' ')}</span>
                <span>Other Factors</span>
              </div>
              <div className="h-2 w-full bg-tx-bg rounded-full overflow-hidden flex">
                <div className="bg-tx-danger h-full" style={{ width: `${stats.emotion_score}%` }}></div>
                <div className="bg-tx-text-muted h-full" style={{ width: `${stats.logic_score}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-tx-text-muted bg-tx-bg p-4 rounded-xl border border-tx-border/50">
            <Camera className="w-5 h-5 text-tx-danger" />
            <span className="italic text-sm">Caught in 4K. Again. 📸</span>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-tx-danger opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Needs Attention Card */}
        <div className="glass-card p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-syne text-xl font-bold mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-400 mr-2" />
              Awaiting Review
            </h3>
            
            <div className="space-y-4 mb-8">
              {stats.pending_reviews.slice(0, 3).map((trade) => (
                <div key={trade.id} className="flex justify-between items-center p-4 bg-tx-bg/50 border border-tx-border rounded-xl">
                  <div>
                    <p className="font-bold font-syne">{trade.asset_name}</p>
                    <p className="text-xs text-tx-text-secondary capitalize">
                      <span className="text-[10px] text-tx-text-muted uppercase whitespace-nowrap">{trade.asset_type.replace('_', ' ')}</span> • {new Date(trade.decision_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link 
                    href={`/review?id=${trade.id}`}
                    className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    Review Now &rarr;
                  </Link>
                </div>
              ))}
              {stats.pending_reviews.length === 0 && (
                <div className="p-10 text-center text-tx-text-secondary italic">
                  No trades pending review. Stay disciplined.
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center italic text-sm text-tx-text-muted">
            "Your portfolio called. It wants an explanation."
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
