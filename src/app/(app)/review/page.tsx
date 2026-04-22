"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Decision } from "@/types";

// ── ReviewContent (inner, needs useSearchParams) ────────────────────────────
function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const decisionId = searchParams.get("id");

  const [decision, setDecision] = useState<Decision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScore, setShowScore] = useState(false);

  // Outcome form state
  const [outcomeType, setOutcomeType] = useState<"profit" | "loss" | "breakeven">("profit");
  const [returnPct, setReturnPct] = useState<number>(0);
  const [thesisValidation, setThesisValidation] = useState<"right" | "partial" | "wrong">("right");
  const [exitDriver, setExitDriver] = useState<"planned" | "panic" | "greed" | "boredom" | "new_info">("planned");
  const [learnedLesson, setLearnedLesson] = useState("");
  const [scoreData, setScoreData] = useState<any>(null);

  const [pendingReviews, setPendingReviews] = useState<Decision[]>([]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        if (!decisionId) {
          // Fetch pending reviews if no specific decision is selected
          const res = await fetch('/api/dashboard');
          if (!res.ok) throw new Error("Failed to load pending reviews");
          const json = await res.json();
          setPendingReviews(json.pending_reviews || []);
        } else {
          // Fetch specific decision
          const res = await fetch(`/api/decisions/${decisionId}`);
          if (!res.ok) throw new Error("Decision not found");
          const json = await res.json();
          setDecision(json.decision);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [decisionId]);

  const handleSubmit = async () => {
    if (!decisionId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision_id: decisionId,
          outcome_type: outcomeType,
          actual_return_percent: returnPct,
          was_thesis_correct: thesisValidation === "partial" ? "partially_right" : thesisValidation,
          exit_emotion: exitDriver === "new_info" ? "new_information" : exitDriver,
          learnings: learnedLesson,
          would_repeat: thesisValidation === "right" ? "yes" : thesisValidation === "partial" ? "maybe" : "no",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save outcome");
      setScoreData(json.outcome);
      setShowScore(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-tx-primary animate-spin" />
        <p className="text-tx-text-secondary font-syne">Recalling the trade details...</p>
      </div>
    );
  }

  // ── No Decision Selected (Picker) ────────────────────────────────────────
  if (!decisionId && !error) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="font-syne text-4xl font-bold mb-2">Outcome Review</h1>
          <p className="text-tx-text-secondary">
            Select a completed trade below to document its outcome and analyze your decision quality.
          </p>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-tx-primary/10 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-tx-primary" />
            </div>
            <h2 className="font-syne text-2xl font-bold mb-2">All Caught Up!</h2>
            <p className="text-tx-text-secondary mb-6">You have no trades waiting for an outcome review.</p>
            <Link href="/new" className="px-6 py-3 bg-tx-primary text-tx-bg font-syne font-bold rounded-xl hover:bg-tx-primary/90 transition-all shadow-glow">
              Log a New Trade
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingReviews.map((trade) => (
              <Link key={trade.id} href={`/review?id=${trade.id}`} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between group hover:border-tx-primary/50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-syne text-xl font-bold text-white group-hover:text-tx-primary transition-colors">{trade.asset_name}</h3>
                    <span className="px-2 py-0.5 rounded bg-tx-bg text-tx-text-secondary text-xs border border-tx-border uppercase">
                      {trade.asset_type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-tx-text-muted mb-2">
                    Opened: {new Date(trade.decision_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-tx-text-secondary italic max-w-xl truncate">"{trade.thesis}"</p>
                </div>
                <div className="mt-4 md:mt-0 flex shrink-0">
                  <div className="px-5 py-2.5 bg-tx-primary/10 text-tx-primary border border-tx-primary/30 rounded-lg text-sm font-medium group-hover:bg-tx-primary group-hover:text-tx-bg transition-colors flex items-center gap-2">
                    Review Outcome <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && !decision) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-tx-danger" />
        <h2 className="font-syne text-2xl font-bold">Review Blocked</h2>
        <p className="text-tx-text-secondary max-w-md">{error}</p>
        <Link href="/decisions" className="mt-4 text-tx-primary hover:underline">
          ← Back to My Decisions
        </Link>
      </div>
    );
  }

  if (!decision) return null;

  // ── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-syne text-4xl font-bold mb-2">Close the Loop</h1>
        <p className="text-tx-text-secondary">
          What actually happened vs what you thought would happen.
        </p>
      </div>

      {/* Decision Badge */}
      <div className="mb-8 w-full md:w-96">
        <div className="w-full bg-tx-primary/5 border border-tx-primary/30 rounded-xl px-4 py-3">
          <span className="font-syne font-bold text-white uppercase">
            {decision.asset_name} • Opened {new Date(decision.decision_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left — THEN */}
        <div className="flex-[0.45] space-y-4 opacity-80 hover:opacity-100 transition-opacity duration-500">
          <span className="text-xs font-bold text-tx-text-muted tracking-widest uppercase">THEN</span>
          <div className="glass-card p-6 border-tx-border/50 bg-tx-bg/80">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="font-syne text-2xl font-bold text-white">{decision.asset_name}</h3>
              <span className="px-2 py-0.5 rounded bg-tx-card text-tx-text-secondary text-xs border border-tx-border uppercase">
                {decision.asset_type.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-tx-text-secondary mb-6">
              {new Date(decision.decision_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <div className="mb-6">
              <p className="text-sm text-tx-text-muted mb-2">Thesis</p>
              <p className="text-sm italic text-tx-text-secondary">"{decision.thesis}"</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-tx-border/30">
              <div>
                <p className="text-xs text-tx-text-muted mb-1">Target</p>
                <p className="font-mono text-white">₹{decision.target_price ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-tx-text-muted mb-1">Stop Loss</p>
                <p className="font-mono text-white">₹{decision.stop_loss ?? "—"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-tx-text-muted">Confidence</span>
                  <span className="font-mono text-white">{decision.confidence_level}/10</span>
                </div>
                <div className="w-full h-1.5 bg-tx-bg rounded-full overflow-hidden">
                  <div className="h-full bg-tx-secondary opacity-50" style={{ width: `${decision.confidence_level * 10}%` }} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-tx-text-muted">Emotion at entry</span>
                <span className="px-2 py-1 rounded bg-tx-card border border-tx-border text-tx-text-secondary text-xs capitalize">
                  {decision.emotion}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-tx-text-muted">Driver</span>
                <span className="px-2 py-1 rounded bg-tx-card border border-tx-border text-tx-text-secondary text-xs capitalize">
                  {decision.decision_type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — NOW */}
        <div className="flex-[0.55] space-y-4">
          <span className="text-xs font-bold text-white tracking-widest uppercase">NOW</span>
          <AnimatePresence mode="wait">
            {!showScore ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                {/* Outcome Type */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: "profit" as const, label: "🟢 Profit", color: "hover:border-tx-primary" },
                    { val: "loss" as const, label: "🔴 Loss", color: "hover:border-tx-danger" },
                    { val: "breakeven" as const, label: "⚪ Breakeven", color: "hover:border-white" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setOutcomeType(opt.val)}
                      className={cn(
                        "p-4 rounded-xl border bg-tx-card text-left transition-all",
                        outcomeType === opt.val
                          ? opt.color.replace("hover:", "") + " bg-opacity-20"
                          : "border-tx-border text-tx-text-secondary",
                        opt.color
                      )}
                    >
                      <span className="font-medium text-white text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* Return % */}
                <div>
                  <label className="block text-sm text-tx-text-secondary mb-3">Actual Return (%)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={returnPct}
                      onChange={(e) => setReturnPct(parseFloat(e.target.value) || 0)}
                      className="w-1/2 bg-tx-card border border-tx-border rounded-xl px-4 py-3 font-mono text-white focus:outline-none focus:border-tx-primary"
                    />
                    <div className={cn("text-2xl font-mono font-bold", outcomeType === "profit" ? "text-tx-primary" : "text-tx-danger")}>
                      {outcomeType === "profit" ? "+" : ""}{returnPct}%
                    </div>
                  </div>
                </div>

                {/* Thesis correct? */}
                <div>
                  <label className="block text-sm text-tx-text-secondary mb-3">Was your thesis correct?</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: "✅ Right", val: "right" as const },
                      { label: "⚡ Partial", val: "partial" as const },
                      { label: "❌ Wrong", val: "wrong" as const },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setThesisValidation(opt.val)}
                        className={cn(
                          "px-3 py-2 bg-tx-card border rounded-lg text-sm transition-colors",
                          thesisValidation === opt.val ? "border-tx-primary text-white bg-tx-primary/10" : "border-tx-border text-tx-text-secondary hover:border-tx-primary"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exit driver */}
                <div>
                  <label className="block text-sm text-tx-text-secondary mb-3">What drove your exit?</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "📊 Planned", val: "planned" as const },
                      { label: "😰 Panic", val: "panic" as const },
                      { label: "🤑 Greed", val: "greed" as const },
                      { label: "😴 Boredom", val: "boredom" as const },
                      { label: "💡 New Info", val: "new_info" as const },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setExitDriver(opt.val)}
                        className={cn(
                          "px-3 py-2 bg-tx-card border rounded-lg text-sm transition-colors",
                          exitDriver === opt.val ? "border-tx-primary text-white bg-tx-primary/10" : "border-tx-border text-tx-text-secondary hover:border-tx-primary"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learnings */}
                <div>
                  <label className="block text-sm text-tx-text-secondary mb-3">What did you learn?</label>
                  <textarea
                    value={learnedLesson}
                    onChange={(e) => setLearnedLesson(e.target.value)}
                    placeholder="e.g. I panic sold at -8% when my stop loss was -15%..."
                    className="w-full min-h-[120px] bg-tx-card border border-tx-border rounded-xl p-4 text-white focus:outline-none focus:border-tx-primary transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-tx-primary text-tx-bg font-syne font-bold rounded-xl hover:bg-tx-primary/90 transition-colors shadow-glow disabled:opacity-50"
                >
                  {isSubmitting ? "Finalizing Review..." : "Close This Trade →"}
                </button>
                {error && <p className="text-tx-danger text-sm text-center">{error}</p>}
              </motion.div>
            ) : (
              <motion.div key="score" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 border-tx-secondary/50 shadow-glow-purple relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-tx-secondary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h3 className="font-syne text-xl text-tx-text-secondary mb-2">Decision Quality Score</h3>
                <div className="font-syne text-7xl font-bold text-tx-secondary mb-8 drop-shadow-[0_0_15px_rgba(123,97,255,0.4)]">
                  {scoreData?.overall_quality_score ?? "—"} <span className="text-3xl text-tx-text-muted">/ 10</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Thesis Clarity", score: scoreData?.thesis_clarity_score },
                    { label: "Risk Mgmt", score: scoreData?.risk_management_score },
                    { label: "Emotional Control", score: scoreData?.emotional_control_score },
                    { label: "Process", score: scoreData?.process_score },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-full border-4 border-tx-secondary/20 border-t-tx-secondary flex items-center justify-center mb-2">
                        <span className="font-mono text-sm font-bold text-white">{m.score ?? "—"}</span>
                      </div>
                      <span className="text-xs text-tx-text-secondary block">{m.label}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-tx-bg/50 border border-tx-border rounded-xl p-4 mb-6">
                  <p className="text-tx-text-primary text-sm font-medium">
                    {thesisValidation === "right"
                      ? "Great job! Your thesis was correct. This is how high-quality decisions are built."
                      : "Even if the outcome wasn't ideal, logging this review makes you a better investor."}
                  </p>
                </div>
                <Link href="/dashboard" className="w-full py-3 bg-tx-card border border-tx-border text-white font-syne font-bold rounded-xl hover:bg-tx-bg transition-colors flex items-center justify-center gap-2">
                  Back to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function OutcomeReview() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-tx-primary animate-spin" />
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
