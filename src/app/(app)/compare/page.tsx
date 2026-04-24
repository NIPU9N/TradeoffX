"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Loader2, TrendingDown, TrendingUp } from "lucide-react";

type ComparisonData = {
  practice_win_rate: number;
  real_win_rate: number;
  practice_logic_driven: number;
  real_logic_driven: number;
  practice_avg_return: number;
  real_avg_return: number;
  practice_avg_confidence: number;
  real_avg_confidence: number;
  practice_fomo_trades: number;
  real_fomo_trades: number;
  practice_stop_loss_honor: number;
  real_stop_loss_honor: number;
};

export default function ComparePage() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/comparison");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load comparison");
        setData(json);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load comparison";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-tx-accent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto py-16">
        <div className="glass-card p-8 border border-tx-accent/30">
          <div className="flex items-center gap-3 mb-3 text-tx-accent">
            <Crown className="w-6 h-6" />
            <h1 className="font-syne text-2xl font-bold">Pro Feature</h1>
          </div>
          <p className="text-tx-text-secondary">{error || "Comparison data unavailable."}</p>
        </div>
      </div>
    );
  }

  const winRateGap = data.real_win_rate - data.practice_win_rate;
  const behaviorGap = data.real_logic_driven - data.practice_logic_driven;
  const returnGap = data.real_avg_return - data.practice_avg_return;

  return (
    <motion.div className="max-w-6xl mx-auto space-y-8 pb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h1 className="font-syne text-4xl font-bold">Practice vs Real</h1>
        <p className="text-tx-text-secondary mt-2">Where performance drops when real money stress kicks in.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GapCard
          title="Win Rate Gap"
          value={`${Math.abs(winRateGap)}%`}
          subtitle={winRateGap >= 0 ? "Real is outperforming practice" : "Practice outperforms real"}
          positive={winRateGap >= 0}
        />
        <GapCard
          title="Logic Discipline Gap"
          value={`${Math.abs(behaviorGap)}%`}
          subtitle={behaviorGap >= 0 ? "More logical with real money" : "Emotion rises with real money"}
          positive={behaviorGap >= 0}
        />
        <GapCard
          title="Return Gap"
          value={`${Math.abs(returnGap).toFixed(2)}%`}
          subtitle={returnGap >= 0 ? "Real returns better" : "Practice returns better"}
          positive={returnGap >= 0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModePanel
          title="Practice Mode"
          stats={[
            ["Win Rate", `${data.practice_win_rate}%`],
            ["Logic Driven", `${data.practice_logic_driven}%`],
            ["Avg Return", `${data.practice_avg_return}%`],
            ["Avg Confidence", `${data.practice_avg_confidence}/10`],
            ["FOMO Trades", `${data.practice_fomo_trades}`],
            ["Stop-loss Honor", `${data.practice_stop_loss_honor}%`],
          ]}
          accent="border-tx-primary/30"
        />
        <ModePanel
          title="Real Money Mode"
          stats={[
            ["Win Rate", `${data.real_win_rate}%`],
            ["Logic Driven", `${data.real_logic_driven}%`],
            ["Avg Return", `${data.real_avg_return}%`],
            ["Avg Confidence", `${data.real_avg_confidence}/10`],
            ["FOMO Trades", `${data.real_fomo_trades}`],
            ["Stop-loss Honor", `${data.real_stop_loss_honor}%`],
          ]}
          accent="border-tx-secondary/30"
        />
      </div>
    </motion.div>
  );
}

function GapCard({
  title,
  value,
  subtitle,
  positive,
}: {
  title: string;
  value: string;
  subtitle: string;
  positive: boolean;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider text-tx-text-secondary">{title}</span>
        {positive ? <TrendingUp className="w-4 h-4 text-tx-primary" /> : <TrendingDown className="w-4 h-4 text-tx-danger" />}
      </div>
      <div className="font-mono text-3xl font-bold mt-2">{value}</div>
      <p className="text-sm text-tx-text-secondary mt-2">{subtitle}</p>
    </div>
  );
}

function ModePanel({
  title,
  stats,
  accent,
}: {
  title: string;
  stats: [string, string][];
  accent: string;
}) {
  return (
    <div className={`glass-card p-6 border ${accent}`}>
      <h2 className="font-syne text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-3">
        {stats.map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm border-b border-tx-border/50 pb-2">
            <span className="text-tx-text-secondary">{k}</span>
            <span className="font-mono text-white">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
