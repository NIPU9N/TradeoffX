"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, ArrowRight, Brain, BarChart2, BookOpen, TrendingUp, Shield, Star, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const features = [
  { icon: BookOpen, color: "text-tx-primary", glow: "rgba(0,255,148,0.15)", border: "border-tx-primary/20", title: "Decision Journal", desc: "Log every trade with full context — your thesis, your emotions, your technicals. Stop trading blind." },
  { icon: Brain, color: "text-tx-secondary", glow: "rgba(123,97,255,0.15)", border: "border-tx-secondary/20", title: "Pattern Mirror", desc: "AI surfaces the behavioral patterns costing you money — FOMO, panic selling, overconfidence." },
  { icon: BarChart2, color: "text-tx-primary", glow: "rgba(0,255,148,0.15)", border: "border-tx-primary/20", title: "Technical Indicators", desc: "A built-in indicator suite forces you to prove your entry is backed by data, not just gut instinct." },
  { icon: TrendingUp, color: "text-tx-accent", glow: "rgba(255,184,0,0.15)", border: "border-tx-accent/20", title: "Outcome Review", desc: "Close the loop. Review outcomes against your original thesis to see where your edge lives." },
];

const stats = [
  { value: "₹14,500", label: "Average monthly savings by users who identified their FOMO bias" },
  { value: "78%", label: "Win rate improvement after 30 days of journaling" },
  { value: "3x", label: "Better risk-adjusted returns for logic-driven decisions" },
];

const testimonials = [
  { name: "Rahul M.", handle: "@rahulnifty50", text: "I didn't realize I was cutting winners at 8% every single time until TradeoffX showed me the data. That one insight paid for 6 months of Pro." },
  { name: "Priya K.", handle: "@pkrishna_trades", text: "It's like a therapist for my portfolio. The Pattern Mirror is genuinely scary accurate — it caught my evening trading problem before I even noticed it." },
  { name: "Akshay V.", handle: "@optionstrader_av", text: "Finally a tool that treats retail investors like professionals. The Technical Indicators section alone changed how I think about entry points." },
];

const steps = [
  { num: "01", color: "text-tx-primary", bg: "bg-tx-primary/10", border: "border-tx-primary/30", title: "Log the decision — before you place the trade", desc: "Write your thesis. Mark your emotion. Add your technical indicators. The act of articulating your 'why' alone filters out half your bad trades." },
  { num: "02", color: "text-tx-secondary", bg: "bg-tx-secondary/10", border: "border-tx-secondary/30", title: "Review the outcome — close the feedback loop", desc: "When the trade plays out, come back. Document what happened vs. what you predicted. Every review is training data for a smarter you." },
  { num: "03", color: "text-tx-accent", bg: "bg-tx-accent/10", border: "border-tx-accent/30", title: "Read your Pattern Mirror — face the data", desc: "Your AI-generated behavioral report shows you what your decisions say about you. Your edge. Your kryptonite. What to do about it." },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthLoading(false);
    }
    checkUser();

    // Invalidate Next.js router cache on auth state change to prevent cached redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#08080F] text-white overflow-x-hidden">

      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-tx-primary/10 border border-tx-primary/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,255,148,0.2)]">
              <Zap className="w-4 h-4 text-tx-primary" />
            </div>
            <span className="font-syne font-bold text-lg text-white">TradeoffX</span>
          </Link>
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-sm text-tx-text-secondary hover:text-white transition-colors">Features</a>
            <a href="#proof" className="text-sm text-tx-text-secondary hover:text-white transition-colors">Why it works</a>
            
            {isAuthLoading ? (
              <div className="w-20 h-8 bg-white/5 animate-pulse rounded-xl" />
            ) : user ? (
              <Link
                href="/dashboard"
                prefetch={false}
                className="px-5 py-2.5 bg-tx-primary hover:bg-tx-primary/90 text-[#08080F] font-syne font-bold rounded-xl text-sm transition-all duration-300 shadow-[0_0_20px_rgba(0,255,148,0.3)] hover:shadow-[0_0_30px_rgba(0,255,148,0.5)] active:scale-95"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleLogin}
                  className="text-sm font-medium text-tx-text-secondary hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <Link
                  href="/onboarding"
                  className="px-5 py-2.5 bg-tx-primary hover:bg-tx-primary/90 text-[#08080F] font-syne font-bold rounded-xl text-sm transition-all duration-300 shadow-[0_0_20px_rgba(0,255,148,0.3)] hover:shadow-[0_0_30px_rgba(0,255,148,0.5)] active:scale-95"
                >
                  Start Free →
                </Link>
              </div>
            )}
          </nav>
        </div>
        <div className="absolute inset-0 -z-10 bg-[#08080F]/80 backdrop-blur-xl border-b border-white/5" />
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 pt-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: "radial-gradient(circle, rgba(0,255,148,0.2) 0%, transparent 70%)" }} />
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.2, 0.12] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "radial-gradient(circle, rgba(123,97,255,0.2) 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        </div>
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-tx-primary/30 bg-tx-primary/5 text-tx-primary text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(0,255,148,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-tx-primary animate-pulse" />
            For Indian Retail Investors
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring" as const, stiffness: 100 }} className="font-syne text-7xl font-black leading-[1.05] mb-6 tracking-tight">
            The <span className="text-tx-primary drop-shadow-[0_0_30px_rgba(0,255,148,0.6)]">Why</span> Behind<br />Every Trade.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-xl text-tx-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop trading on vibes. TradeoffX is a premium investment decision journal that reveals the <strong className="text-white">behavioral patterns costing you money</strong> — so you can finally trade like the investor you want to be.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-4">
            {isAuthLoading ? (
               <div className="w-56 h-14 bg-white/5 animate-pulse rounded-2xl" />
            ) : user ? (
              <Link
                href="/dashboard"
                prefetch={false}
                className="group flex items-center gap-3 px-8 py-4 bg-tx-primary hover:bg-tx-primary/90 text-[#08080F] font-syne font-bold rounded-2xl text-lg transition-all duration-300 shadow-[0_0_30px_rgba(0,255,148,0.3)] hover:shadow-[0_0_50px_rgba(0,255,148,0.5)] active:scale-95"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link
                href="/onboarding"
                className="group flex items-center gap-3 px-8 py-4 bg-tx-primary hover:bg-tx-primary/90 text-[#08080F] font-syne font-bold rounded-2xl text-lg transition-all duration-300 shadow-[0_0_30px_rgba(0,255,148,0.3)] hover:shadow-[0_0_50px_rgba(0,255,148,0.5)] active:scale-95"
              >
                Start Journaling Free
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <Link href="/dashboard" prefetch={false} className="px-8 py-4 border border-white/10 hover:border-white/25 text-tx-text-secondary hover:text-white rounded-2xl text-lg font-medium transition-all duration-300">
              See Dashboard →
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 text-xs text-tx-text-muted">
            Free forever for 50 decisions/month. No credit card required.
          </motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-tx-text-muted">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <section id="proof" className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-3 gap-12 text-center">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <div className="font-syne text-5xl font-black text-tx-primary mb-3 drop-shadow-[0_0_20px_rgba(0,255,148,0.4)]">{s.value}</div>
              <p className="text-sm text-tx-text-secondary leading-relaxed">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-32 px-8 max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-xs font-bold uppercase tracking-widest text-tx-danger mb-6 block">The brutal truth</span>
          <h2 className="font-syne text-5xl font-black mb-8 leading-tight">
            You don&apos;t have a <span className="text-tx-danger drop-shadow-[0_0_20px_rgba(255,77,77,0.5)]">strategy problem.</span><br />
            You have a <span className="text-tx-danger">behaviour problem.</span>
          </h2>
          <p className="text-lg text-tx-text-secondary max-w-3xl mx-auto leading-relaxed">
            FOMO buying. Panic selling. Cutting winners early. Following tips. Averaging down on losers.<br /><br />
            You know these are bad. You do them anyway. <strong className="text-white">Because you&apos;re not tracking the pattern.</strong> TradeoffX is the missing layer that makes your emotional leaks visible — so you can stop repeating them.
          </p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-tx-primary mb-4 block">What&apos;s inside</span>
            <h2 className="font-syne text-5xl font-black">Built for how traders actually think.</h2>
          </motion.div>
          <div className="grid grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className={`relative p-8 rounded-2xl border ${f.border} transition-all duration-300`} style={{ background: `radial-gradient(ellipse at top left, ${f.glow} 0%, transparent 60%), #0D0D1A` }}>
                <div className="mb-6"><f.icon className={`w-8 h-8 ${f.color}`} /></div>
                <h3 className="font-syne text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-tx-text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 px-8 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-tx-secondary mb-4 block">The process</span>
            <h2 className="font-syne text-5xl font-black">Three steps to trading with clarity.</h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-[39px] top-8 bottom-8 w-px bg-gradient-to-b from-tx-primary via-tx-secondary to-tx-accent opacity-30" />
            <div className="space-y-12">
              {steps.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="flex gap-8 items-start">
                  <div className={`w-20 h-20 rounded-full ${step.bg} border ${step.border} flex items-center justify-center flex-shrink-0 z-10`}>
                    <span className={`font-mono font-bold text-lg ${step.color}`}>{step.num}</span>
                  </div>
                  <div className="pt-4">
                    <h3 className="font-syne text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-tx-text-secondary leading-relaxed text-lg">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-tx-primary mb-4 block">What people say</span>
            <h2 className="font-syne text-5xl font-black">Traders who stopped lying to themselves.</h2>
          </motion.div>
          <div className="grid grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-tx-primary/20 transition-all duration-300">
                <div className="flex gap-1 mb-6">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-4 h-4 fill-tx-accent text-tx-accent" />)}</div>
                <p className="text-tx-text-secondary leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-syne font-bold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-tx-text-muted">{t.handle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-8 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(0,255,148,0.08) 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Shield className="w-12 h-12 text-tx-primary mx-auto mb-8 drop-shadow-[0_0_20px_rgba(0,255,148,0.5)]" />
            <h2 className="font-syne text-6xl font-black mb-6 leading-tight">The missing layer between<br />you and better returns.</h2>
            <p className="text-lg text-tx-text-secondary mb-12">Join traders who&apos;ve turned self-awareness into their biggest edge.</p>
            {isAuthLoading ? (
               <div className="w-64 h-16 bg-white/5 animate-pulse rounded-2xl mx-auto" />
            ) : user ? (
              <Link href="/dashboard" prefetch={false} className="group inline-flex items-center gap-3 px-10 py-5 bg-tx-primary hover:bg-tx-primary/90 text-[#08080F] font-syne font-bold rounded-2xl text-xl transition-all duration-300 shadow-[0_0_40px_rgba(0,255,148,0.3)] hover:shadow-[0_0_60px_rgba(0,255,148,0.5)] active:scale-95">
                Go to Dashboard
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link href="/onboarding" className="group inline-flex items-center gap-3 px-10 py-5 bg-tx-primary hover:bg-tx-primary/90 text-[#08080F] font-syne font-bold rounded-2xl text-xl transition-all duration-300 shadow-[0_0_40px_rgba(0,255,148,0.3)] hover:shadow-[0_0_60px_rgba(0,255,148,0.5)] active:scale-95">
                Start for Free
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <p className="mt-4 text-xs text-tx-text-muted">No credit card. No BS. Just clarity.</p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-tx-primary/10 border border-tx-primary/30 flex items-center justify-center">
              <Zap className="w-3 h-3 text-tx-primary" />
            </div>
            <span className="font-syne font-bold text-sm text-white">TradeoffX</span>
          </div>
          <p className="text-xs text-tx-text-muted">© 2026 TradeoffX. Built for the Indian retail investor.</p>
          <p className="text-xs text-tx-text-muted italic">&ldquo;The Why Behind Every Trade.&rdquo;</p>
        </div>
      </footer>
    </div>
  );
}
