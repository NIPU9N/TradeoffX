"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Minus, Brain, BarChart2, Calendar, DollarSign, Target, Shield,
  Loader2, AlertCircle, CheckCircle2, Clock, XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Decision, Outcome } from "@/types";

type DecisionWithOutcome = Decision & { outcome?: Outcome[] | null };

export default function DecisionDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [decision, setDecision] = useState<DecisionWithOutcome | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/decisions/${id}`);
        if (!res.ok) throw new Error("Decision not found");
        const json = await res.json();
        setDecision(json.decision);
      } catch (err: any) {
        setError(err.message || "Failed to load decision");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 text-tx-primary animate-spin" />
        <p className="text-tx-text-secondary font-syne">Loading decision...</p>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-tx-danger" />
        <h2 className="font-syne text-2xl font-bold">Decision Not Found</h2>
        <p className="text-tx-text-secondary">{error || "This decision doesn't exist."}</p>
        <Link href="/decisions" className="mt-4 text-tx-primary hover:underline">← Back to My Decisions</Link>
      </div>
    );
  }

  const outcome = Array.isArray(decision.outcome) ? decision.outcome[0] : decision.outcome;
  const isReviewed = decision.status === "reviewed";

  const statusConfig = {
    open: { label: "Open", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    pending_review: { label: "Pending Review", icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
    reviewed: { label: "Reviewed", icon: CheckCircle2, color: "text-tx-primary", bg: "bg-tx-primary/10", border: "border-tx-primary/30" },
  };
  const statusCfg = statusConfig[decision.status];
  const StatusIcon = statusCfg.icon;

  const emotionColors: Record<string, string> = {
    calm: "text-tx-primary bg-tx-primary/10 border-tx-primary/30",
    excited: "text-tx-accent bg-tx-accent/10 border-tx-accent/30",
    anxious: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    fomo: "text-tx-danger bg-tx-danger/10 border-tx-danger/30",
    greedy: "text-tx-danger bg-tx-danger/10 border-tx-danger/30",
    uncertain: "text-gray-400 bg-gray-500/10 border-gray-500/30",
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto pb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-10 gap-6 flex-wrap">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-tx-text-secondary hover:text-white transition-colors text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="font-syne text-5xl font-black text-white">{decision.asset_name}</h1>
            <span className="px-3 py-1 rounded-lg bg-tx-card border border-tx-border text-tx-text-secondary text-sm uppercase font-mono">
              {decision.asset_type.replace("_", " ")}
            </span>
            <span className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold", statusCfg.color, statusCfg.bg, statusCfg.border)}>
              <StatusIcon className="w-3 h-3" /> {statusCfg.label}
            </span>
          </div>
          <p className="text-tx-text-secondary mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(decision.decision_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* CTA */}
        {!isReviewed && (
          <Link
            href={`/review?id=${decision.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-tx-primary text-tx-bg font-syne font-bold rounded-xl hover:bg-tx-primary/90 transition-all shadow-glow active:scale-95 whitespace-nowrap"
          >
            Close the Loop →
          </Link>
        )}
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: "Invested", value: `₹${decision.investment_amount.toLocaleString("en-IN")}`, color: "text-white" },
          { icon: Target, label: "Target", value: decision.target_price ? `₹${decision.target_price}` : "—", color: "text-tx-primary" },
          { icon: Shield, label: "Stop Loss", value: decision.stop_loss ? `₹${decision.stop_loss}` : "—", color: "text-tx-danger" },
          { icon: BarChart2, label: "Risk/Reward", value: decision.risk_reward_ratio ? `${decision.risk_reward_ratio}x` : "—", color: "text-tx-secondary" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-tx-text-muted" />
              <span className="text-xs text-tx-text-muted uppercase tracking-wide font-bold">{stat.label}</span>
            </div>
            <div className={cn("font-mono font-bold text-2xl", stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left Column (The Why + The Check) ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Thesis */}
          <div className="glass-card p-6">
            <h2 className="font-syne text-sm font-bold text-tx-text-muted uppercase tracking-widest mb-4">📌 The Thesis</h2>
            <p className="text-white text-base leading-relaxed italic">"{decision.thesis}"</p>
          </div>

          {/* What Would Make Me Wrong */}
          <div className="glass-card p-6 border-tx-danger/20">
            <h2 className="font-syne text-sm font-bold text-tx-text-muted uppercase tracking-widest mb-4">⚠️ What Would Make Me Wrong</h2>
            <p className="text-tx-text-secondary text-sm leading-relaxed">{decision.what_would_make_me_wrong}</p>
          </div>

          {/* The Check */}
          <div className="glass-card p-6">
            <h2 className="font-syne text-sm font-bold text-tx-text-muted uppercase tracking-widest mb-5">🧠 The Check</h2>
            <div className="space-y-4">
              {/* Confidence */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-tx-text-secondary">Confidence Level</span>
                  <span className="font-mono text-white font-bold">{decision.confidence_level}/10</span>
                </div>
                <div className="w-full h-2 bg-tx-bg rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", decision.confidence_level >= 7 ? "bg-tx-primary" : decision.confidence_level >= 5 ? "bg-tx-accent" : "bg-tx-danger")}
                    style={{ width: `${decision.confidence_level * 10}%` }}
                  />
                </div>
              </div>

              {/* Emotion + Decision Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-tx-text-muted mb-2">Emotion at Entry</p>
                  <span className={cn("px-3 py-1.5 rounded-lg border text-xs font-bold capitalize block text-center", emotionColors[decision.emotion] || "text-white border-tx-border")}>
                    {decision.emotion === "fomo" ? "😰 FOMO" :
                     decision.emotion === "excited" ? "😁 Excited" :
                     decision.emotion === "anxious" ? "😟 Anxious" :
                     decision.emotion === "greedy" ? "🤑 Greedy" :
                     decision.emotion === "uncertain" ? "🤔 Uncertain" :
                     "😌 Calm"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-tx-text-muted mb-2">Decision Driver</p>
                  <span className={cn("px-3 py-1.5 rounded-lg border text-xs font-bold capitalize block text-center",
                    decision.decision_type === "logic" ? "text-tx-primary bg-tx-primary/10 border-tx-primary/30" :
                    decision.decision_type === "emotion" ? "text-tx-danger bg-tx-danger/10 border-tx-danger/30" :
                    "text-tx-accent bg-tx-accent/10 border-tx-accent/30"
                  )}>
                    {decision.decision_type === "logic" ? "📊 Logic" : decision.decision_type === "emotion" ? "❤️ Emotion" : "⚖️ Mixed"}
                  </span>
                </div>
              </div>

              {/* Checklist */}
              <div className="flex items-center gap-2 pt-2">
                {decision.checklist_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-tx-primary" />
                ) : (
                  <XCircle className="w-4 h-4 text-tx-danger" />
                )}
                <span className={cn("text-sm", decision.checklist_completed ? "text-tx-primary" : "text-tx-danger")}>
                  Pre-trade checklist {decision.checklist_completed ? "completed" : "skipped"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column (Technicals + Outcome) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Technical Indicators */}
          {(decision.rsi_value || decision.trend || decision.ma_50_position || decision.overall_technical_verdict) && (
            <div className="glass-card p-6">
              <h2 className="font-syne text-sm font-bold text-tx-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Technical Indicators
              </h2>
              <div className="space-y-3">
                {decision.rsi_value && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-tx-text-muted">RSI</span>
                    <span className={cn("font-mono text-sm font-bold", (decision.rsi_value ?? 0) > 70 ? "text-tx-danger" : (decision.rsi_value ?? 0) < 30 ? "text-tx-primary" : "text-tx-accent")}>
                      {decision.rsi_value} <span className="text-tx-text-muted capitalize">({decision.rsi_signal})</span>
                    </span>
                  </div>
                )}
                {decision.trend && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-tx-text-muted">Trend</span>
                    <span className={cn("flex items-center gap-1 text-sm font-bold",
                      decision.trend === "uptrend" ? "text-tx-primary" :
                      decision.trend === "downtrend" ? "text-tx-danger" : "text-tx-accent"
                    )}>
                      {decision.trend === "uptrend" ? <TrendingUp className="w-3 h-3" /> : decision.trend === "downtrend" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {decision.trend}
                    </span>
                  </div>
                )}
                {decision.ma_50_position && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-tx-text-muted">50 MA</span>
                    <span className={cn("text-sm font-bold capitalize", decision.ma_50_position === "above" ? "text-tx-primary" : "text-tx-danger")}>
                      Price {decision.ma_50_position}
                    </span>
                  </div>
                )}
                {decision.overall_technical_verdict && (
                  <div className="pt-3 border-t border-tx-border/30">
                    <p className="text-xs text-tx-text-muted mb-1">Verdict</p>
                    <p className="text-sm text-white font-medium capitalize">{decision.overall_technical_verdict}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Outcome Card */}
          {isReviewed && outcome ? (
            <div className={cn("glass-card p-6 border-2", outcome.outcome_type === "profit" ? "border-tx-primary/40 shadow-glow" : outcome.outcome_type === "loss" ? "border-tx-danger/40" : "border-tx-border")}>
              <h2 className="font-syne text-sm font-bold text-tx-text-muted uppercase tracking-widest mb-4">📊 Outcome</h2>
              <div className="text-center mb-6">
                <div className={cn("font-syne text-6xl font-black mb-1", outcome.outcome_type === "profit" ? "text-tx-primary" : outcome.outcome_type === "loss" ? "text-tx-danger" : "text-white")}>
                  {outcome.outcome_type === "profit" ? <ArrowUpRight className="inline w-12 h-12" /> : outcome.outcome_type === "loss" ? <ArrowDownRight className="inline w-12 h-12" /> : null}
                  {outcome.actual_return_percent !== null ? `${outcome.actual_return_percent > 0 ? "+" : ""}${outcome.actual_return_percent}%` : "—"}
                </div>
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold capitalize border",
                  outcome.outcome_type === "profit" ? "text-tx-primary bg-tx-primary/10 border-tx-primary/30" :
                  outcome.outcome_type === "loss" ? "text-tx-danger bg-tx-danger/10 border-tx-danger/30" :
                  "text-white bg-tx-card border-tx-border"
                )}>
                  {outcome.outcome_type.replace("_", " ")}
                </span>
              </div>
              {outcome.overall_quality_score && (
                <div className="text-center py-4 border-t border-tx-border/30">
                  <p className="text-xs text-tx-text-muted mb-1">Decision Quality Score</p>
                  <p className="font-syne text-3xl font-black text-tx-secondary">{outcome.overall_quality_score}<span className="text-lg text-tx-text-muted">/10</span></p>
                </div>
              )}
              {outcome.learnings && (
                <div className="mt-4 pt-4 border-t border-tx-border/30">
                  <p className="text-xs text-tx-text-muted mb-2 flex items-center gap-1"><Brain className="w-3 h-3" /> What I Learned</p>
                  <p className="text-sm text-tx-text-secondary italic">"{outcome.learnings}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-6 text-center border-dashed border-tx-border">
              <Clock className="w-10 h-10 text-tx-text-muted mx-auto mb-3" />
              <p className="text-tx-text-secondary text-sm mb-4">This trade hasn&apos;t been reviewed yet.</p>
              <Link
                href={`/review?id=${decision.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-tx-primary text-tx-bg font-syne font-bold rounded-xl text-sm hover:bg-tx-primary/90 transition-all shadow-glow"
              >
                Close the Loop →
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
