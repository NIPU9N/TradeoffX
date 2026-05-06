"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BookOpen, BarChart2, TrendingUp, AlertTriangle, Shield, CheckCircle2, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto w-full">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            India's First Decision Intelligence Platform
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Stop Trading on Vibes.<br/>
            Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Trading on Data.</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            TradeoffX reveals the behavioral patterns costing you money. Master your psychology, build robust options strategies, and track your true edge.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthLoading ? (
               <div className="w-48 h-14 bg-slate-800 animate-pulse rounded-xl" />
            ) : user ? (
              <Link href="/dashboard" className="group flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-lg transition-all w-full sm:w-auto shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link href="/onboarding" className="group flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-lg transition-all border border-slate-700 w-full sm:w-auto">
                  Practice Mode
                </Link>
                <Link href="/onboarding" className="group flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-lg transition-all w-full sm:w-auto shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </>
            )}
          </motion.div>

          {/* Floating UI Element (FOMO Alert) */}
          <motion.div 
            initial={{ opacity: 0, x: 50, rotate: 5 }} 
            animate={{ opacity: 1, x: 0, rotate: 5 }} 
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
            className="absolute -right-4 md:right-10 top-20 md:top-40 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl hidden lg:block"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
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
      <section id="platform" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A complete ecosystem for serious traders.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Not just a broker connection. We provide the tools to build, test, and refine your entire trading system.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/30 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Decision Journal</h3>
              <p className="text-slate-400 mb-6">The forced-friction workflow. Document your thesis, log emotions, and set strict exit rules before you enter.</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Pre-trade checklists</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Emotional state logging</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Automated outcome tracking</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/30 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <BarChart2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">P&L Intelligence</h3>
              <p className="text-slate-400 mb-6">See exactly where you make and lose money. Filter by emotion, strategy, or setup type.</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Strategy win rates</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Emotional impact on P&L</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Mistake cost analysis</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/30 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Options Strategy Builder</h3>
              <p className="text-slate-400 mb-6">Visually build multi-leg options strategies, analyze Greeks, and practice trade with real NSE data.</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Real-time payoff charts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Black-Scholes Greeks</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Practice execution</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-24 px-6 text-center border-t border-slate-800/50 bg-slate-900/20 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your edge?</h2>
          <p className="text-slate-400 mb-8">Join the disciplined traders who are optimizing their psychology and strategies every single day.</p>
          <Link href="/onboarding" className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            Start Your Free Trial
          </Link>
        </div>
      </section>

    </div>
  );
}
