"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, BookOpen, BarChart2, TrendingUp, AlertTriangle, Shield, CheckCircle2, ChevronDown, Zap, Target, Brain, Sparkles, Star, Users, Trophy, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const Counter = ({ from = 0, to, duration = 2 }) => {
  const [count, setCount] = useState(from);
  useEffect(() => {
    let start = from;
    const diff = to - from;
    const increment = diff / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [from, to, duration]);
  return <>{count.toLocaleString()}</>;
};

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
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
      
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">TradeoffX</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#platform" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Platform</a>
          </nav>
          
          <div className="flex items-center gap-4">
            {isAuthLoading ? (
              <div className="w-24 h-10 bg-slate-800 animate-pulse rounded-lg" />
            ) : user ? (
              <Link href="/dashboard" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                Dashboard
              </Link>
            ) : (
              <>
                <button onClick={handleLogin} className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
                  Log in
                </button>
                <Link href="/onboarding" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-slate-950/80 backdrop-blur-md border-b border-white/5" />
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 rounded-[100%] blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-[100%] blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-[100%] blur-[120px] pointer-events-none" />
        </div>
        
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto w-full">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-8 cursor-pointer hover:border-blue-400/60 hover:bg-blue-500/20 transition-all"
          >
            <motion.span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>✨ India's First Decision Intelligence Platform</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl md:text-8xl font-bold leading-tight mb-6 tracking-tight"
          >
            Stop Trading on Vibes.<br/>
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Trade on Data.
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
          >
            TradeoffX reveals the behavioral patterns costing you money. Master your psychology, build robust options strategies, and track your true edge.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            {isAuthLoading ? (
               <div className="w-48 h-14 bg-slate-800 animate-pulse rounded-xl" />
            ) : user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl text-lg transition-all shadow-[0_0_30px_rgba(59,130,246,0.5)] overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Go to Dashboard
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/onboarding" className="group flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-lg transition-all border border-slate-600 hover:border-slate-400 w-full sm:w-auto">
                    📊 Practice Mode
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/onboarding" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-lg transition-all shadow-[0_0_30px_rgba(59,130,246,0.6)] w-full sm:w-auto overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      🚀 Start Free Trial
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Animated Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto"
          >
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all">
              <p className="text-3xl font-bold text-blue-400 mb-1"><Counter to={2847} duration={2} />+</p>
              <p className="text-sm text-slate-400">Active Traders</p>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all">
              <p className="text-3xl font-bold text-emerald-400 mb-1">₹<Counter to={245} duration={2} />Cr</p>
              <p className="text-sm text-slate-400">Notional Volume</p>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all">
              <p className="text-3xl font-bold text-purple-400 mb-1"><Counter to={89} duration={2} />%</p>
              <p className="text-sm text-slate-400">Avg Win Rate</p>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center"
          >
            <ChevronDown className="w-6 h-6 text-blue-400 animate-bounce" />
          </motion.div>

          {/* Floating UI Element (FOMO Alert) */}
          <motion.div 
            initial={{ opacity: 0, x: 50, rotate: 5 }} 
            animate={{ opacity: 1, x: 0, rotate: 5 }} 
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.05, rotate: 8 }}
            className="absolute -right-4 md:right-10 top-20 md:top-40 w-64 bg-gradient-to-br from-slate-900 to-slate-800/50 backdrop-blur-md border border-red-500/30 rounded-xl p-4 shadow-[0_0_40px_rgba(239,68,68,0.2)] hidden lg:block"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"
              >
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </motion.div>
              <div>
                <p className="text-sm font-bold text-white">FOMO Alert Detected</p>
                <p className="text-xs text-slate-400">Pattern Mirror</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">You are entering 5% above your target price. Historically, this leads to a 65% win rate drop.</p>
          </motion.div>

        </motion.div>
      </section>

      {/* PLATFORM FEATURES */}
      <section id="platform" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Your Complete Trading Ecosystem
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg">
              Not just a broker connection. We provide the tools to build, test, and refine your entire trading system with precision analytics and decision intelligence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            
            {/* Feature 1 - Decision Journal */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, borderColor: "rgba(59, 130, 246, 0.5)" }}
              className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-blue-600/5 rounded-2xl transition-all" />
              <div className="relative z-10">
                <motion.div 
                  className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-all"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <BookOpen className="w-7 h-7 text-blue-400" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-white">Decision Journal</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">The forced-friction workflow. Document your thesis, log emotions, and set strict exit rules before you enter a position.</p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <motion.div 
                      className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    </motion.div>
                    Pre-trade checklists
                  </li>
                  <li className="flex items-center gap-3">
                    <motion.div 
                      className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    </motion.div>
                    Emotional state logging
                  </li>
                  <li className="flex items-center gap-3">
                    <motion.div 
                      className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    </motion.div>
                    Automated outcome tracking
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Feature 2 - P&L Intelligence */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, borderColor: "rgba(34, 197, 94, 0.5)" }}
              className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(34,197,94,0.2)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 to-emerald-600/0 group-hover:from-emerald-600/10 group-hover:to-emerald-600/5 rounded-2xl transition-all" />
              <div className="relative z-10">
                <motion.div 
                  className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/30 transition-all"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <BarChart2 className="w-7 h-7 text-emerald-400" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-white">P&L Intelligence</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">See exactly where you make and lose money. Filter by emotion, strategy, or setup type to find your true edge.</p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <motion.div 
                      className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                    Strategy win rates
                  </li>
                  <li className="flex items-center gap-3">
                    <motion.div 
                      className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                    Emotional impact on P&L
                  </li>
                  <li className="flex items-center gap-3">
                    <motion.div 
                      className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                    Mistake cost analysis
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Feature 3 - Options Strategy Builder */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, borderColor: "rgba(168, 85, 247, 0.5)" }}
              className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-purple-600/5 rounded-2xl transition-all" />
              <div className="relative z-10">
                <motion.div 
                  className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-all"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <TrendingUp className="w-7 h-7 text-purple-400" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-white">Options Strategy Builder</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">Visually build multi-leg options strategies, analyze Greeks, and practice trade with real NSE data.</p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <motion.div 
                      className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    Real-time payoff charts
                  </li>
                  <li className="flex items-center gap-3">
                    <motion.div 
                      className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    Black-Scholes Greeks
                  </li>
                  <li className="flex items-center gap-3">
                    <motion.div 
                      className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    Practice execution
                  </li>
                </ul>
              </div>
            </motion.div>

          </div>

          {/* Advanced Features Row */}
          <div className="grid md:grid-cols-4 gap-6 mt-20">
            {[
              { icon: Brain, label: "Behavioral Insights", color: "blue" },
              { icon: Target, label: "Precision Trading", color: "emerald" },
              { icon: Zap, label: "Real-Time Alerts", color: "yellow" },
              { icon: Shield, label: "Risk Management", color: "red" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 text-center group hover:border-slate-600/60 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 bg-${feature.color}-500/20 group-hover:bg-${feature.color}-500/30 transition-all`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{feature.label}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-32 px-6 relative z-10 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Choose the plan that fits your trading goals</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Practice", price: "FREE", features: ["Unlimited paper trading", "Decision journal", "Basic analytics", "1 year history"], badge: false },
              { name: "Pro", price: "₹1,999", period: "/month", features: ["Everything in Practice", "Advanced Greeks analysis", "Live NSE data feed", "Custom alerts", "Priority support"], badge: true },
              { name: "Elite", price: "₹4,999", period: "/month", features: ["Everything in Pro", "API access", "Strategy backtesting", "1-on-1 coaching", "Premium signals"], badge: false }
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className={`relative rounded-2xl p-8 border transition-all ${
                  plan.badge
                    ? "border-blue-500/50 bg-gradient-to-br from-blue-900/30 to-slate-900/30 shadow-[0_0_40px_rgba(59,130,246,0.2)] scale-105"
                    : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
                }`}
              >
                {plan.badge && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular 🚀
                    </div>
                  </motion.div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-slate-400 ml-2">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-3 text-slate-300">
                      <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    plan.badge
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                      : "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Loved by Traders Across India</h2>
            <p className="text-slate-400 text-lg">Real results from real traders</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Rajeev Sharma", role: "Options Trader", text: "TradeoffX literally changed how I approach trading. The behavioral insights saved me thousands.", avatar: "🎯" },
              { name: "Priya Kapoor", role: "Day Trader", text: "The decision journal forced me to be honest about my mistakes. Best investment I've made.", avatar: "💡" },
              { name: "Arjun Nair", role: "Swing Trader", text: "Greeks analysis is crystal clear. No more guessing. Data-driven decisions only.", avatar: "📊" }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SHOWCASE */}
      <section className="py-24 px-6 relative z-10 bg-gradient-to-r from-slate-900/40 via-blue-900/20 to-slate-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2.8K+", label: "Active Traders", icon: "👥" },
              { value: "₹245Cr", label: "Notional Volume", icon: "💰" },
              { value: "89%", label: "Avg Win Rate", icon: "🎯" },
              { value: "4.9/5", label: "User Rating", icon: "⭐" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-32 px-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-[100%] blur-[120px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-bold mb-6 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Stop Guessing. Start Trading.
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl text-slate-300 mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Join disciplined traders who are optimizing their psychology and strategies every single day.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/onboarding" className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-lg transition-all shadow-[0_0_40px_rgba(59,130,246,0.5)] overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  🚀 Start Free Trial
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="px-10 py-5 border-2 border-slate-600 hover:border-slate-400 text-white font-bold rounded-xl text-lg transition-all hover:bg-slate-800/50">
                📱 Book a Demo
              </button>
            </motion.div>
          </motion.div>

          <motion.p 
            className="text-slate-400 mt-8 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ✓ No credit card required • ✓ Practice mode free forever • ✓ Cancel anytime
          </motion.p>
        </motion.div>

        {/* Footer Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between"
        >
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white">TradeoffX</span>
          </div>
          
          <div className="flex flex-wrap gap-8 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex gap-4 mt-6 md:mt-0">
            {["twitter", "linkedin", "instagram"].map((social) => (
              <motion.a
                key={social}
                href="#"
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600/30 transition-colors"
              >
                {social[0].toUpperCase()}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

    </div>
  );
}
