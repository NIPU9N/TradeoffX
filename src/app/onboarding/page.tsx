"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@supabase/ssr";

type Step = 1 | 2 | 3 | 4;

const assetTypes = [
  { id: "stocks", label: "📈 Stocks", desc: "NSE / BSE equity" },
  { id: "fo", label: "⚡ F&O", desc: "Futures & Options" },
  { id: "crypto", label: "🪙 Crypto", desc: "BTC, ETH & more" },
  { id: "mf", label: "🏦 Mutual Funds", desc: "SIPs & lumpsum" },
  { id: "gold", label: "✨ Gold / FD", desc: "Safe haven assets" },
  { id: "mixed", label: "🌐 Mixed", desc: "I trade everything" },
];

const emotionalLeaks = [
  { id: "fomo", label: "😰 FOMO Buying", desc: "I chase stocks after they've already pumped" },
  { id: "panic", label: "😱 Panic Selling", desc: "I sell when markets drop, then regret it" },
  { id: "cutting", label: "✂️ Cutting Winners", desc: "I exit profitable trades too early" },
  { id: "averaging", label: "📉 Averaging Down", desc: "I keep buying falling stocks hoping they recover" },
  { id: "tips", label: "📱 Following Tips", desc: "I act on WhatsApp / YouTube tips" },
  { id: "overconfidence", label: "🦅 Overconfidence", desc: "I over-leverage when I'm on a winning streak" },
];

const experienceLevels = [
  { id: "beginner", label: "Just Starting Out", desc: "Less than 1 year in the markets", icon: "🌱" },
  { id: "intermediate", label: "Getting Experienced", desc: "1–3 years of active trading", icon: "📊" },
  { id: "veteran", label: "Seasoned Trader", desc: "3+ years, I know my patterns", icon: "🎯" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedLeak, setSelectedLeak] = useState<string>("");
  const [selectedExperience, setSelectedExperience] = useState<string>("");
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setStep(4);
    }, 2800);
  };

  const handleGoogleSignUp = async () => {
    setIsSigningIn(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const progressPct = step === 1 ? 0 : step === 2 ? 33 : step === 3 ? 66 : 100;

  return (
    <div className="min-h-screen bg-[#08080F] text-white flex flex-col items-center justify-center px-8 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: "radial-gradient(circle, rgba(0,255,148,0.1) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: "radial-gradient(circle, rgba(123,97,255,0.1) 0%, transparent 70%)" }} />
      </div>

      {/* Logo */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-tx-primary/10 border border-tx-primary/30 flex items-center justify-center">
          <Zap className="w-4 h-4 text-tx-primary" />
        </div>
        <span className="font-syne font-bold text-lg text-white">TradeoffX</span>
      </Link>

      {/* Step indicator */}
      {step < 4 && !isCalibrating && (
        <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
          <span className="text-xs text-tx-text-muted font-mono">Step {step} of 3</span>
          <div className="w-32 h-1 bg-tx-bg rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-tx-primary rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Asset DNA ─────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-tx-primary/30 bg-tx-primary/5 text-tx-primary text-xs font-bold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-tx-primary animate-pulse" />
                Welcome to TradeoffX
              </div>
              <h2 className="font-syne text-4xl font-black mb-3">What's your primary battleground?</h2>
              <p className="text-tx-text-secondary mb-10">Select all that apply. We'll tailor your Pattern Mirror accordingly.</p>
              <div className="grid grid-cols-3 gap-4 mb-10">
                {assetTypes.map((asset) => {
                  const selected = selectedAssets.includes(asset.id);
                  return (
                    <button
                      key={asset.id}
                      onClick={() => toggleAsset(asset.id)}
                      className={cn(
                        "p-5 rounded-2xl border text-left transition-all duration-200 active:scale-95",
                        selected
                          ? "border-tx-primary bg-tx-primary/10 shadow-[0_0_20px_rgba(0,255,148,0.15)]"
                          : "border-tx-border bg-tx-bg/50 hover:border-tx-text-secondary"
                      )}
                    >
                      <div className="text-2xl mb-2">{asset.label.split(" ")[0]}</div>
                      <div className={cn("font-syne font-bold text-sm mb-1", selected ? "text-tx-primary" : "text-white")}>
                        {asset.label.split(" ").slice(1).join(" ")}
                      </div>
                      <div className="text-xs text-tx-text-muted">{asset.desc}</div>
                      {selected && (
                        <div className="mt-3 w-5 h-5 rounded-full bg-tx-primary flex items-center justify-center ml-auto">
                          <Check className="w-3 h-3 text-[#08080F]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={selectedAssets.length === 0}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-tx-primary hover:bg-tx-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-[#08080F] font-syne font-bold rounded-xl text-lg transition-all duration-300 shadow-[0_0_20px_rgba(0,255,148,0.3)] active:scale-95"
              >
                Next: Your Biggest Leak <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Emotional Leak ───────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              <h2 className="font-syne text-4xl font-black mb-3">If you had to guess — what's your biggest emotional leak?</h2>
              <p className="text-tx-text-secondary mb-10">Be honest. We won't judge. We'll help you fix it.</p>

              <div className="space-y-3 mb-8">
                {emotionalLeaks.map((leak) => (
                  <button
                    key={leak.id}
                    onClick={() => setSelectedLeak(leak.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.99]",
                      selectedLeak === leak.id
                        ? "border-tx-danger bg-tx-danger/10 shadow-[0_0_20px_rgba(255,77,77,0.15)]"
                        : "border-tx-border bg-tx-bg/50 hover:border-tx-text-secondary"
                    )}
                  >
                    <span className="text-2xl flex-shrink-0">{leak.label.split(" ")[0]}</span>
                    <div className="flex-1">
                      <div className={cn("font-syne font-bold text-sm", selectedLeak === leak.id ? "text-tx-danger" : "text-white")}>
                        {leak.label.split(" ").slice(1).join(" ")}
                      </div>
                      <div className="text-xs text-tx-text-muted mt-0.5">{leak.desc}</div>
                    </div>
                    {selectedLeak === leak.id && (
                      <div className="w-5 h-5 rounded-full bg-tx-danger flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mb-8">
                <p className="text-sm text-tx-text-secondary mb-4 font-medium">How long have you been trading?</p>
                <div className="grid grid-cols-3 gap-3">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedExperience(level.id)}
                      className={cn(
                        "p-4 rounded-xl border text-center transition-all duration-200 active:scale-95",
                        selectedExperience === level.id
                          ? "border-tx-secondary bg-tx-secondary/10 shadow-[0_0_20px_rgba(123,97,255,0.15)]"
                          : "border-tx-border bg-tx-bg/50 hover:border-tx-text-secondary"
                      )}
                    >
                      <div className="text-2xl mb-2">{level.icon}</div>
                      <div className={cn("font-syne font-bold text-xs", selectedExperience === level.id ? "text-tx-secondary" : "text-white")}>{level.label}</div>
                      <div className="text-[10px] text-tx-text-muted mt-1">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalibrate}
                disabled={!selectedLeak || !selectedExperience}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-tx-primary hover:bg-tx-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-[#08080F] font-syne font-bold rounded-xl text-lg transition-all duration-300 shadow-[0_0_20px_rgba(0,255,148,0.3)] active:scale-95"
              >
                Calibrate My Pattern Mirror ✨
              </button>
            </motion.div>
          )}

          {/* ── CALIBRATING ANIMATION ───────────────────── */}
          {isCalibrating && (
            <motion.div
              key="calibrating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-full border-4 border-tx-border border-t-tx-primary mx-auto mb-10 shadow-[0_0_30px_rgba(0,255,148,0.3)]"
              />
              <h2 className="font-syne text-3xl font-black mb-4">Calibrating your<br /><span className="text-tx-primary">Pattern Mirror...</span></h2>
              <motion.div className="space-y-3 mt-8 text-left max-w-sm mx-auto">
                {["Analyzing your trading style...", "Mapping behavioral risk factors...", "Generating your Investor DNA..."].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.7 }}
                    className="flex items-center gap-3 text-sm text-tx-text-secondary"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.7 + 0.3 }}
                      className="w-4 h-4 rounded-full bg-tx-primary/20 border border-tx-primary/50 flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="w-2.5 h-2.5 text-tx-primary" />
                    </motion.div>
                    {msg}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 4: Create Account ───────────────────── */}
          {step === 4 && !isCalibrating && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" as const, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-tx-primary/10 border-2 border-tx-primary/50 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(0,255,148,0.3)]"
              >
                <Check className="w-10 h-10 text-tx-primary" />
              </motion.div>
              <h2 className="font-syne text-5xl font-black mb-4">
                Your Pattern Mirror<br />is <span className="text-tx-primary drop-shadow-[0_0_20px_rgba(0,255,148,0.6)]">ready.</span>
              </h2>
              <p className="text-tx-text-secondary text-lg mb-3">
                We&apos;ve calibrated TradeoffX to your investor profile. Create your free account to unlock it.
              </p>
              <p className="text-tx-text-muted text-sm mb-10 italic">
                &ldquo;The first trade you log is the first step to becoming a better investor.&rdquo;
              </p>
              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <button
                  onClick={handleGoogleSignUp}
                  disabled={isSigningIn}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#08080F] font-syne font-bold rounded-2xl text-lg transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] active:scale-95 disabled:opacity-60"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  {isSigningIn ? "Redirecting..." : "Create Account with Google"}
                </button>
                <p className="text-xs text-tx-text-muted">No credit card required. Free forever.</p>
                <p className="text-xs text-tx-text-muted">
                  Already have an account?{" "}
                  <button onClick={handleGoogleSignUp} className="text-tx-primary hover:underline">Sign in →</button>
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
