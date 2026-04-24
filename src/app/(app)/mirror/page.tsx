"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Share, Brain, TrendingDown, TrendingUp, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pattern } from "@/types";
import { useMode } from "@/context/ModeContext";

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
  }
};

const BIAS_LABELS: Record<string, string> = {
  fomo: "FOMO",
  panic_sell: "Panic Sell",
  overconfidence: "Overconfidence",
  loss_aversion: "Loss Aversion",
  greed: "Greed",
  tips_from_others: "Tips from Others",
};

const BIAS_COLORS: Record<string, string> = {
  fomo: "bg-tx-danger",
  panic_sell: "bg-orange-500",
  overconfidence: "bg-tx-accent",
  loss_aversion: "bg-tx-secondary",
  greed: "bg-tx-danger",
  tips_from_others: "bg-red-400",
};

interface MirrorStats {
  total_decisions: number;
  this_month_decisions: number;
  decisions_change_pct: number | null;
  logic_pct: number;
  emotion_pct: number;
  emotion_loss_rate: number;
  avg_logic_return: string | null;
  avg_calm_return: string | null;
  high_conviction_win_rate: number | null;
  fomo_loss_rate: number | null;
  bias_breakdown: { name: string; val: number }[];
  top_bias: string | null;
}

export default function PatternMirror() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [stats, setStats] = useState<MirrorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mode, isPractice } = useMode();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [patternsRes, mirrorRes] = await Promise.all([
          fetch(`/api/patterns?mode=${mode}`),
          fetch(`/api/mirror?mode=${mode}`),
        ]);
        const patternsJson = await patternsRes.json();
        const mirrorJson = await mirrorRes.json();
        setPatterns(patternsJson.patterns || []);
        if (mirrorRes.ok) setStats(mirrorJson);
      } catch (err: any) {
        setError(err.message || "Failed to load patterns");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [mode]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const genRes = await fetch(`/api/patterns/generate?mode=${mode}`, { method: "POST" });
      if (!genRes.ok) {
        const errorData = await genRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed with status ${genRes.status}`);
      }
      // Reload both patterns and stats
      const [patternsRes, mirrorRes] = await Promise.all([
        fetch(`/api/patterns?mode=${mode}`),
        fetch(`/api/mirror?mode=${mode}`),
      ]);
      const patternsJson = await patternsRes.json();
      const mirrorJson = await mirrorRes.json();
      setPatterns(patternsJson.patterns || []);
      if (mirrorRes.ok) setStats(mirrorJson);
    } catch (err: any) {
      setError(err.message || "AI Analysis failed. Try logging more decisions.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Dynamic month/year
  const now = new Date();
  const currentMonth = now.toLocaleString("default", { month: "long" });
  const currentYear = now.getFullYear();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleString("default", { month: "long" });

  // Derive bias bars from stats
  const biasBars = stats?.bias_breakdown?.length
    ? stats.bias_breakdown.map((b) => ({
        name: BIAS_LABELS[b.name] || b.name.replace(/_/g, " "),
        val: b.val,
        color: BIAS_COLORS[b.name] || "bg-tx-secondary",
      }))
    : [];

  // Build dynamic edge/kryptonite items
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (stats) {
    if (stats.avg_calm_return !== null) strengths.push(`Your calm trades average +${stats.avg_calm_return}% returns`);
    if (stats.high_conviction_win_rate !== null) strengths.push(`High conviction (8+) trades: ${stats.high_conviction_win_rate}% win rate`);
    if (stats.avg_logic_return !== null) strengths.push(`Logic-driven exits averaged +${stats.avg_logic_return}% returns`);
    if (strengths.length === 0) strengths.push("Log more decisions to discover your strengths");

    if (stats.fomo_loss_rate !== null) weaknesses.push(`FOMO trades: ${stats.fomo_loss_rate}% loss rate`);
    if (stats.emotion_loss_rate > 0) weaknesses.push(`${stats.emotion_loss_rate}% of emotion-driven exits lost money`);
    if (stats.top_bias) weaknesses.push(`Top bias pattern: ${BIAS_LABELS[stats.top_bias] || stats.top_bias}`);
    if (weaknesses.length === 0) weaknesses.push("Not enough reviewed decisions to identify weaknesses yet");
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-tx-secondary animate-spin" />
        <p className="text-tx-text-secondary font-syne italic">Cleaning the mirror...</p>
      </div>
    );
  }
  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-12 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="text-center md:text-left">
          <h1 className="font-syne text-4xl font-bold mb-3 relative inline-block">
            Your Pattern Mirror
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-tx-secondary to-tx-primary rounded-full shadow-glow-purple"></div>
          </h1>
          <div className="flex items-center gap-3 mt-4 justify-center md:justify-start flex-wrap">
            <p className="text-tx-text-secondary">This is what your decisions reveal about you. No cap.</p>
            <span className="px-2 py-1 bg-tx-card text-tx-text-secondary text-xs rounded-full border border-tx-border">
              {isPractice ? "Practice Lens" : "Real Money Lens"}
            </span>
            <span className="px-2 py-1 bg-tx-secondary/20 text-tx-secondary text-xs rounded-full border border-tx-secondary/30 flex items-center font-medium">
              <Sparkles className="w-3 h-3 mr-1" /> AI Powered
            </span>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-tx-secondary text-tx-bg font-syne font-bold rounded-xl shadow-glow-purple hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Decisions...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Generate Fresh Insights
            </>
          )}
        </button>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-tx-danger/10 border border-tx-danger/30 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-tx-danger shrink-0" />
          <div>
            <h4 className="font-bold text-tx-danger mb-1">Analysis Limited</h4>
            <p className="text-sm text-tx-danger/80">{error}</p>
          </div>
        </motion.div>
      )}

      {/* AI Insight Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {patterns.length > 0 ? patterns.slice(0, 3).map((insight) => (
          <div key={insight.id} className="glass-card p-6 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border-tx-secondary/30 hover:shadow-glow-purple cursor-pointer">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%]"></div>
            
            <div className="mb-6 flex justify-between items-start relative z-10">
              <span className="px-2 py-1 bg-tx-secondary/20 text-tx-secondary text-[10px] font-bold tracking-wider rounded border border-tx-secondary/30 uppercase">
                {insight.pattern_type.replace(/_/g, ' ')}
              </span>
              <Brain className="w-5 h-5 text-tx-secondary/50" />
            </div>
            
            <h3 className="font-syne text-xl font-bold text-white mb-6 relative z-10 leading-snug">
              &quot;{insight.pattern_text}&quot;
            </h3>
            
            <div className="relative z-10">
              <div className="flex justify-between text-xs text-tx-text-muted mb-2">
                <span>Confidence: {insight.confidence_percent}%</span>
              </div>
              <div className="w-full h-1 bg-tx-bg rounded-full overflow-hidden">
                <div className="h-full bg-tx-secondary" style={{ width: `${insight.confidence_percent}%` }}></div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-3 py-20 text-center glass-card border-dashed">
            <Brain className="w-12 h-12 text-tx-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-tx-text-secondary">No AI insights generated yet. Click &quot;Generate Fresh Insights&quot; to start.</p>
          </div>
        )}
      </motion.div>

      {/* Bias Breakdown — DYNAMIC */}
      <motion.div variants={itemVariants} className="glass-card p-8">
        <h2 className="font-syne text-2xl font-bold mb-8">Where Your Emotions Are Costing You</h2>
        
        <div className="space-y-6 max-w-3xl">
          {biasBars.length > 0 ? biasBars.map((bias, i) => (
            <div key={bias.name} className="flex items-center gap-4 group cursor-pointer">
              <div className="w-32 text-sm font-medium text-tx-text-secondary group-hover:text-white transition-colors">
                {bias.name}
              </div>
              <div className="flex-1 h-6 bg-tx-bg rounded overflow-hidden flex items-center relative">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${bias.val}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={cn("h-full", bias.color)}
                ></motion.div>
                {/* Visual blocks like in spec */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, #000 8px, #000 10px)" }}></div>
              </div>
              <div className="w-12 text-right font-mono font-bold text-white">
                {bias.val}%
              </div>
            </div>
          )) : (
            <div className="py-12 text-center">
              <p className="text-tx-text-secondary">No bias data yet. Log decisions with emotional tags to see your bias breakdown.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Decision DNA + Edge vs Kryptonite — DYNAMIC */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DNA */}
        <div className="glass-card p-8">
          <h3 className="font-syne text-xl font-bold mb-6">Your Decision DNA</h3>
          <div className="flex items-end gap-6 mb-6">
            <div>
              <span className="font-mono text-5xl font-bold text-tx-primary block">{stats?.logic_pct ?? 0}%</span>
              <span className="text-sm text-tx-primary font-medium">Logic driven</span>
            </div>
            <div className="pb-2 text-tx-text-muted text-2xl font-light">vs</div>
            <div>
              <span className="font-mono text-5xl font-bold text-tx-danger block">{stats?.emotion_pct ?? 0}%</span>
              <span className="text-sm text-tx-danger font-medium">Emotion driven</span>
            </div>
          </div>
          <p className="text-sm text-tx-text-secondary italic mb-4">
            {stats && stats.emotion_loss_rate > 0 ? (
              <>{stats.emotion_loss_rate}% of your emotion-driven exits lost money.<br /></>
            ) : null}
            {stats?.avg_logic_return ? (
              <>Your logic-driven exits averaged +{stats.avg_logic_return}% returns.</>
            ) : (
              <>Review more decisions to see return breakdowns.</>
            )}
          </p>
          <div className="w-full h-px bg-tx-border"></div>
          <p className="text-sm text-white font-medium mt-4">The data doesn&apos;t lie.</p>
        </div>

        {/* Edge vs Kryptonite */}
        <div className="glass-card p-8">
          <h3 className="font-syne text-xl font-bold mb-6">Your Edge vs Your Kryptonite</h3>
          
          <div className="space-y-6">
            <div>
              <span className="text-xs text-tx-primary font-bold uppercase tracking-wider mb-3 block">What&apos;s working:</span>
              <ul className="space-y-2 text-sm text-tx-text-secondary">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-tx-primary">✓</span> {s}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <span className="text-xs text-tx-danger font-bold uppercase tracking-wider mb-3 block">What&apos;s killing you:</span>
              <ul className="space-y-2 text-sm text-tx-text-secondary">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-tx-danger">✗</span> {w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Section — DYNAMIC */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t border-tx-border/50">
        
        {/* Left: Monthly Share Card */}
        <div className="flex flex-col items-center lg:items-start">
          <div className="text-center lg:text-left mb-8">
            <h2 className="font-syne text-2xl font-bold mb-2">Your Pattern Mirror — {currentMonth} {currentYear}</h2>
            <p className="text-tx-text-secondary text-sm">Screenshot and share this. Awareness is the first step.</p>
          </div>

          <div className="w-full max-w-lg glass-card p-8 bg-gradient-to-br from-[#13131F] to-[#0A0A14] border-t border-t-tx-secondary/30 relative overflow-hidden group shadow-2xl">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-tx-secondary opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-tx-primary opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-6 h-6 rounded bg-[rgba(0,255,148,0.1)] flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-tx-primary rounded-sm rotate-45"></div>
              </div>
              <span className="font-syne font-bold text-white text-sm">TradeoffX • {currentMonth} {currentYear}</span>
            </div>

            <div className="space-y-4 mb-10">
              {patterns.slice(0, 3).map((p, i) => {
                const dotColors = ["bg-tx-danger", "bg-tx-accent", "bg-tx-primary"];
                const glowColors = [
                  "shadow-[0_0_8px_rgba(255,77,77,0.8)]",
                  "shadow-[0_0_8px_rgba(255,184,0,0.8)]",
                  "shadow-[0_0_8px_rgba(0,255,148,0.8)]",
                ];
                return (
                  <div key={p.id} className="flex items-start gap-3">
                    <div className={cn("w-2 h-2 rounded-full mt-1.5", dotColors[i], glowColors[i])}></div>
                    <p className="text-sm font-medium text-white">{p.pattern_text}</p>
                  </div>
                );
              })}
              {patterns.length === 0 && (
                <p className="text-sm text-tx-text-muted italic">Generate insights to populate your share card.</p>
              )}
            </div>

            <div className="text-xs text-tx-text-secondary italic">
              &quot;The missing layer between you and better returns&quot;
            </div>
          </div>
        </div>

          <button className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl font-syne font-bold text-white bg-gradient-to-r from-tx-primary to-tx-secondary hover:opacity-90 transition-opacity shadow-glow self-center lg:self-start">
            <Share className="w-4 h-4" /> Share Your Pattern Mirror
          </button>
        </div>

        {/* Right: Deep Dive Stats — DYNAMIC */}
        <div className="flex flex-col justify-center space-y-6 lg:pl-8">
          <div>
            <h3 className="font-syne text-3xl font-bold mb-2">Deep Dive: {currentMonth} {currentYear}</h3>
            <p className="text-sm text-tx-text-secondary mb-6">The math behind your mirror. Don&apos;t look away.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-tx-bg border border-tx-border rounded-xl p-6 transition-all hover:border-tx-primary/50 hover:shadow-glow group cursor-default">
              <div className="text-xs text-tx-text-muted mb-2 uppercase tracking-wide font-bold group-hover:text-tx-primary transition-colors">Decisions Logged</div>
              <div className="text-4xl font-mono font-bold text-white group-hover:scale-105 origin-left transition-transform">{stats?.this_month_decisions ?? 0}</div>
              {stats?.decisions_change_pct !== null && stats?.decisions_change_pct !== undefined ? (
                <div className={cn("text-xs mt-3 flex items-center", stats.decisions_change_pct >= 0 ? "text-tx-primary" : "text-tx-danger")}>
                  {stats.decisions_change_pct >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(stats.decisions_change_pct)}% vs last month
                </div>
              ) : (
                <div className="text-xs text-tx-text-muted mt-3">First month tracking</div>
              )}
            </div>
            <div className="bg-tx-bg border border-tx-border rounded-xl p-6 transition-all hover:border-tx-danger/50 hover:shadow-[0_0_15px_rgba(255,77,77,0.15)] group cursor-default">
              <div className="text-xs text-tx-text-muted mb-2 uppercase tracking-wide font-bold group-hover:text-tx-danger transition-colors">Biggest Leak</div>
              <div className="text-xl font-syne font-bold text-tx-danger truncate group-hover:scale-105 origin-left transition-transform">
                {stats?.top_bias ? (BIAS_LABELS[stats.top_bias] || stats.top_bias.replace(/_/g, " ")) : "None yet"}
              </div>
              <div className="text-xs text-tx-danger mt-3">
                {stats?.top_bias ? "Top emotional bias" : "Log more decisions"}
              </div>
            </div>
          </div>

          <div className="glass-card p-6 mt-4 relative overflow-hidden group border-tx-secondary/30 hover:shadow-glow-purple transition-all duration-300">
             <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110">
                <Brain className="w-32 h-32 text-tx-secondary" />
             </div>
             <h4 className="text-xs font-bold text-tx-secondary mb-3 uppercase tracking-wider flex items-center relative z-10">
               <Sparkles className="w-4 h-4 mr-2"/> AI Protocol for {nextMonth} {currentYear}
             </h4>
             <p className="text-sm text-tx-text-secondary leading-relaxed relative z-10">
               {patterns.length > 0 ? (
                 <>
                   &quot;Based on your patterns, your biggest area for improvement is <span className="text-white font-medium">{patterns[0].pattern_type.replace(/_/g, " ")}</span>.&quot;
                   <br /><br />
                   <span className="inline-block px-3 py-2 bg-tx-secondary/10 border border-tx-secondary/30 rounded-lg text-white font-medium shadow-inner">
                     Protocol: Before each trade, pause and check — is this decision driven by {stats?.top_bias ? (BIAS_LABELS[stats.top_bias] || stats.top_bias).toLowerCase() : "emotion"}? If yes, wait 15 minutes before executing.
                   </span>
                 </>
               ) : (
                 <>Generate insights to unlock your AI Protocol.</>
               )}
             </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
