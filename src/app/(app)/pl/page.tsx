"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Calendar,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from "recharts";
import { cn } from "@/lib/utils";
import { useMode } from "@/context/ModeContext";

interface PLSummary {
  total_pnl: number;
  total_investment: number;
  overall_return_pct: number;
  win_rate: number;
  win_count: number;
  loss_count: number;
  breakeven_count: number;
  biggest_win: number;
  biggest_loss: number;
  trade_count: number;
  top_bias_for_loss: string | null;
  top_bias_leak_amount: number;
  potential_recovery_pct: number;
}

interface MonthlyData {
  month: string;
  amount: number;
}

interface AssetData {
  asset: string;
  amount: number;
}

interface TradeData {
  id: string;
  asset_name: string;
  pnl_amount: number;
  return_pct: number;
  date: string;
  type: string;
  emotion: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ProfitAndLoss() {
  const [data, setData] = useState<{
    summary: PLSummary;
    monthly_data: MonthlyData[];
    asset_data: AssetData[];
    trades: TradeData[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useMode();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/pl?mode=${mode}`);
        if (!res.ok) throw new Error("Failed to load P&L data");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [mode]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-tx-primary animate-spin" />
        <p className="text-tx-text-secondary font-syne italic">Calculating your gains (and pains)...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-tx-danger">Error: {error || "No data available"}</p>
      </div>
    );
  }

  const { summary, monthly_data, asset_data, trades = [] } = data;
  const isProfitable = summary.total_pnl >= 0;

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-syne text-4xl font-bold mb-2">Performance Analytics</h1>
          <p className="text-tx-text-secondary">The cold, hard truth about your capital.</p>
        </div>
        <div className="flex items-center gap-4 bg-tx-card/50 border border-tx-border p-4 rounded-2xl backdrop-blur-md">
          <Calendar className="w-5 h-5 text-tx-text-muted" />
          <span className="text-sm font-medium text-white">All Time Performance</span>
        </div>
      </motion.div>

      {/* Top Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-t-2 border-t-tx-primary/30">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-tx-text-secondary font-bold uppercase tracking-widest">Total P&L</span>
            <div className={cn("p-2 rounded-lg", isProfitable ? "bg-tx-primary/10" : "bg-tx-danger/10")}>
              <DollarSign className={cn("w-4 h-4", isProfitable ? "text-tx-primary" : "text-tx-danger")} />
            </div>
          </div>
          <div className="space-y-1">
            <span className={cn("text-3xl font-mono font-bold", isProfitable ? "text-tx-primary" : "text-tx-danger")}>
              {isProfitable ? "+" : ""}₹{Math.abs(summary.total_pnl).toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-xs">
              {isProfitable ? <ArrowUpRight className="w-3 h-3 text-tx-primary" /> : <ArrowDownRight className="w-3 h-3 text-tx-danger" />}
              <span className={isProfitable ? "text-tx-primary" : "text-tx-danger"}>{Math.abs(summary.overall_return_pct).toFixed(2)}% ROI</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-t-2 border-t-tx-secondary/30">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-tx-text-secondary font-bold uppercase tracking-widest">Win Rate</span>
            <div className="p-2 rounded-lg bg-tx-secondary/10">
              <Target className="w-4 h-4 text-tx-secondary" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-mono font-bold text-white">{summary.win_rate}%</span>
            <p className="text-xs text-tx-text-muted">{summary.win_count} Wins / {summary.loss_count} Losses</p>
          </div>
          <div className="mt-4 w-full h-1 bg-tx-bg rounded-full overflow-hidden">
             <div className="h-full bg-tx-secondary" style={{ width: `${summary.win_rate}%` }}></div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-tx-text-secondary font-bold uppercase tracking-widest">Avg Risk/Reward</span>
            <div className="p-2 rounded-lg bg-tx-accent/10">
              <BarChart3 className="w-4 h-4 text-tx-accent" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-mono font-bold text-white">
              {summary.loss_count > 0 
                ? `1:${(summary.biggest_win / Math.abs(summary.biggest_loss || 1)).toFixed(1)}` 
                : "MAX"}
            </span>
            <p className="text-xs text-tx-text-muted">{summary.loss_count > 0 ? "Based on biggest win/loss" : "No losses yet!"}</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-tx-text-secondary font-bold uppercase tracking-widest">Total Volume</span>
            <div className="p-2 rounded-lg bg-white/5">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-mono font-bold text-white">₹{(summary.total_investment / 100000).toFixed(1)}L</span>
            <p className="text-xs text-tx-text-muted">Over {summary.trade_count} trades</p>
          </div>
        </div>
      </motion.div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cumulative P&L Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-syne text-xl font-bold">P&L Growth</h3>
            <div className="flex gap-2">
               <span className="flex items-center gap-1.5 text-xs text-tx-text-secondary">
                 <div className="w-2 h-2 rounded-full bg-tx-primary"></div> Profit
               </span>
               <span className="flex items-center gap-1.5 text-xs text-tx-text-secondary">
                 <div className="w-2 h-2 rounded-full bg-tx-danger"></div> Loss
               </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly_data}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-tx-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-tx-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-tx-text-muted)', fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-tx-text-muted)', fontSize: 10 }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#13131F', borderColor: 'var(--color-tx-border)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: 'var(--color-tx-primary)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="var(--color-tx-primary)" 
                  fillOpacity={1} 
                  fill="url(#colorAmt)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Asset Distribution */}
        <motion.div variants={itemVariants} className="glass-card p-8">
          <h3 className="font-syne text-xl font-bold mb-8 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-tx-secondary" /> Asset P&L
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={asset_data} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="asset" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-tx-text-secondary)', fontSize: 10, fontWeight: 'bold' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#13131F', borderColor: 'var(--color-tx-border)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {asset_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount >= 0 ? 'var(--color-tx-primary)' : 'var(--color-tx-danger)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Detailed Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Extremes */}
        <div className="glass-card p-8">
          <h3 className="font-syne text-xl font-bold mb-6">Trade Extremes</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-tx-bg/50 rounded-xl border border-tx-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tx-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-tx-primary" />
                </div>
                <div>
                  <p className="text-xs text-tx-text-muted uppercase font-bold">Biggest Win</p>
                  <p className="font-mono text-lg font-bold text-white">₹{summary.biggest_win.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-tx-text-secondary">Emotional state: CALM</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-tx-bg/50 rounded-xl border border-tx-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tx-danger/10 flex items-center justify-center">
                  <TrendingDown className={cn("w-5 h-5", summary.loss_count > 0 ? "text-tx-danger" : "text-tx-text-muted")} />
                </div>
                <div>
                  <p className="text-xs text-tx-text-muted uppercase font-bold">Biggest Loss</p>
                  <p className="font-mono text-lg font-bold text-white">
                    {summary.loss_count > 0 ? `₹${Math.abs(summary.biggest_loss).toLocaleString()}` : "NONE"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-tx-text-secondary">
                  {summary.loss_count > 0 ? "Emotional state: FOMO" : "Keep it up!"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-tx-primary opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
          <h3 className="font-syne text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-tx-accent" /> Intelligence Report
          </h3>
          <div className="space-y-4">
             <div className="p-4 rounded-xl bg-tx-accent/5 border border-tx-accent/20">
               <p className="text-sm text-tx-text-secondary leading-relaxed">
                 Your win rate is <span className="text-tx-accent font-bold">{summary.win_rate}%</span>. 
                 {summary.win_rate >= 50 
                   ? " You're maintaining a positive edge. Keep refining your entry criteria." 
                   : " You're currently below 50%. Focus on high-probability setups to improve your hit rate."}
               </p>
             </div>
             <div className="p-4 rounded-xl bg-white/5 border border-white/10">
               <p className="text-sm text-tx-text-secondary leading-relaxed">
                 {summary.top_bias_for_loss 
                   ? <>
                       The biggest factor in your losses is <span className="text-tx-danger font-bold uppercase">{summary.top_bias_for_loss}</span>. 
                       Eliminating these emotional leaks could recover <span className="text-white font-bold">₹{summary.top_bias_leak_amount.toLocaleString()}</span> ({summary.potential_recovery_pct}% of your total P&L).
                     </>
                   : "No significant emotional leaks detected in your recent losses. You're trading with great discipline!"}
               </p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Trade History Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-8 border-b border-tx-border flex justify-between items-center">
          <h3 className="font-syne text-xl font-bold">Trade History</h3>
          <span className="text-xs text-tx-text-muted uppercase tracking-widest">{trades.length} Completed Trades</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-tx-bg/50 text-[10px] uppercase tracking-widest text-tx-text-muted border-b border-tx-border">
                <th className="px-8 py-4 font-bold">Asset</th>
                <th className="px-8 py-4 font-bold">Date</th>
                <th className="px-8 py-4 font-bold">P&L Amount</th>
                <th className="px-8 py-4 font-bold">Return %</th>
                <th className="px-8 py-4 font-bold text-right">Emotion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tx-border/50 text-sm">
              {trades.map((trade) => {
                const isProfit = trade.pnl_amount >= 0;
                return (
                  <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-syne font-bold text-white">{trade.asset_name}</span>
                        <span className="text-[10px] text-tx-text-muted uppercase whitespace-nowrap">{trade.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-tx-text-secondary">
                      {new Date(trade.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                    </td>
                    <td className={cn("px-8 py-5 font-mono font-bold", isProfit ? "text-tx-primary" : "text-tx-danger")}>
                      {isProfit ? "+" : ""}₹{Math.abs(trade.pnl_amount).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold border",
                        isProfit ? "bg-tx-primary/10 border-tx-primary/30 text-tx-primary" : "bg-tx-danger/10 border-tx-danger/30 text-tx-danger"
                      )}>
                        {isProfit ? "+" : ""}{trade.return_pct}%
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <span className={cn(
                         "text-[10px] px-2 py-1 rounded-full border uppercase",
                         trade.emotion === 'calm' ? "bg-white/5 border-white/10 text-tx-text-secondary" : "bg-tx-accent/10 border-tx-accent/30 text-tx-accent"
                       )}>
                         {trade.emotion}
                       </span>
                    </td>
                  </tr>
                );
              })}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-tx-text-secondary italic">
                    No completed trades found. Review your outcomes to see them here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
