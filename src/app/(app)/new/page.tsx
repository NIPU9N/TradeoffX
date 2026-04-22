"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, Calendar, Info, Check, Sparkles, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { TechnicalIndicators } from "@/components/TechnicalIndicators";
import { createDecision } from "@/lib/api";
import type { CreateDecisionInput } from "@/types";

const steps = ["1 The Trade", "2 The Why", "3 The Check"];

export default function NewDecision() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<CreateDecisionInput & { unit_price?: number, quantity?: number }>({
    asset_name: "",
    asset_type: "stock",
    investment_amount: 0,
    unit_price: 0,
    quantity: 0,
    decision_date: new Date().toISOString().split('T')[0],
    thesis: "",
    what_would_make_me_wrong: "",
    target_price: null,
    stop_loss: null,
    confidence_level: 7,
    emotion: "calm",
    decision_type: "logic",
    checklist_completed: false,
  });

  const updateFormData = (updates: Partial<CreateDecisionInput & { unit_price?: number, quantity?: number }>) => {
    setFormData(prev => {
      const next = { ...prev, ...updates };
      // Auto-calculate total for stocks if unit price or quantity changes
      if (next.asset_type === 'stock' && (updates.unit_price !== undefined || updates.quantity !== undefined)) {
        next.investment_amount = (next.unit_price || 0) * (next.quantity || 0);
      }
      return next;
    });
  };

  const handleNext = async () => {
    setError(null);
    if (currentStep < steps.length - 1) {
      if (currentStep === 0 && !formData.asset_name) {
        setError("Please enter the asset name.");
        return;
      }
      setCurrentStep((prev) => prev + 1);
    } else {
      if (!formData.thesis || formData.thesis.length < 10) {
        setError("Please provide a more detailed thesis (min 10 chars).");
        return;
      }
      
      try {
        setIsSubmitting(true);
        await createDecision(formData);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err: any) {
        setError(err.message || "Failed to save decision");
        setIsSubmitting(false);
      }
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-syne text-4xl font-bold mb-3 relative inline-block">
          Log a New Decision
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-tx-primary rounded-full shadow-glow"></div>
        </h1>
        <p className="text-tx-text-secondary mt-4">
          Think before you trade. Write before you buy. Your future self is watching.
        </p>
      </div>

      {/* Progress Pills */}
      <div className="flex gap-4 mb-12">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors duration-300",
                isActive ? "bg-tx-primary text-tx-bg" : 
                isCompleted ? "bg-tx-card border border-tx-primary/30 text-tx-primary" : 
                "bg-tx-card border border-tx-border text-tx-text-muted"
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : null}
              {step}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="relative min-h-[500px]">
        {isSubmitting ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-tx-bg z-50 rounded-2xl border border-tx-primary/30 shadow-glow"
          >
            <div className="w-20 h-20 bg-tx-primary/20 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-tx-primary" />
            </div>
            <h2 className="font-syne text-3xl font-bold mb-2">Decision Locked. 🎯</h2>
            <p className="text-tx-text-secondary">Your future self thanks you.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={currentStep}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring" as const, stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="w-full"
            >
              {currentStep === 0 && <StepOne data={formData} update={updateFormData} />}
              {currentStep === 1 && <StepTwo data={formData} update={updateFormData} />}
              {currentStep === 2 && <StepThree data={formData} update={updateFormData} />}
              
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-tx-danger/10 border border-tx-danger/30 rounded-xl flex items-center gap-3 text-tx-danger">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Global Navigation Button */}
      {!isSubmitting && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            className="group flex items-center gap-2 bg-tx-primary hover:bg-tx-primary/90 text-tx-bg font-syne font-bold px-8 py-4 rounded-xl shadow-glow transition-all hover:scale-[1.02] active:scale-95"
          >
            {currentStep === 2 ? "Lock In This Decision" : `Next: ${steps[currentStep + 1].substring(2)}`}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}

function StepOne({ data, update }: { data: CreateDecisionInput & { unit_price?: number, quantity?: number }, update: (u: Partial<CreateDecisionInput & { unit_price?: number, quantity?: number }>) => void }) {
  const assetTypes = [
    { label: "📈 Stock", val: "stock" },
    { label: "🏦 Mutual Fund", val: "mutual_fund" },
    { label: "₿ Crypto", val: "crypto" },
    { label: "🥇 Gold", val: "gold" },
    { label: "🏛️ FD", val: "fd" },
    { label: "➕ Other", val: "other" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-xl font-syne font-bold mb-4">What are you buying?</label>
        <input
          type="text"
          value={data.asset_name}
          onChange={(e) => update({ asset_name: e.target.value })}
          placeholder="e.g. Infosys, Nifty 50 Index Fund, Bitcoin"
          className="w-full bg-tx-bg border border-tx-border rounded-xl px-6 py-4 text-lg text-white focus:outline-none focus:border-tx-primary focus:shadow-glow transition-all"
        />
      </div>

      <div>
        <label className="block text-sm text-tx-text-secondary mb-3">Asset Type</label>
        <div className="flex flex-wrap gap-3">
          {assetTypes.map((type) => (
            <button
              key={type.val}
              onClick={() => update({ asset_type: type.val as any })}
              className={cn(
                "px-4 py-2 rounded-full border transition-all duration-300",
                data.asset_type === type.val ? "bg-tx-primary/10 border-tx-primary text-tx-primary shadow-[0_0_10px_rgba(0,255,148,0.2)]" : "bg-tx-card border-tx-border text-tx-text-secondary hover:text-white"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {data.asset_type === 'stock' ? (
          <>
            <div>
              <label className="block text-sm text-tx-text-secondary mb-3">Per Unit Price (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tx-text-muted font-mono">₹</span>
                <input
                  type="number"
                  value={data.unit_price || ""}
                  onChange={(e) => update({ unit_price: parseFloat(e.target.value) || 0 })}
                  placeholder="2,500"
                  className="w-full bg-tx-card border border-tx-border rounded-xl pl-10 pr-4 py-3 font-mono text-white focus:outline-none focus:border-tx-primary transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-tx-text-secondary mb-3">Total Quantity</label>
              <div className="relative">
                <input
                  type="number"
                  value={data.quantity || ""}
                  onChange={(e) => update({ quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="20"
                  className="w-full bg-tx-card border border-tx-border rounded-xl px-4 py-3 font-mono text-white focus:outline-none focus:border-tx-primary transition-colors"
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm text-tx-text-secondary mb-3">Investment Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tx-text-muted font-mono">₹</span>
              <input
                type="number"
                value={data.investment_amount || ""}
                onChange={(e) => update({ investment_amount: parseFloat(e.target.value) || 0 })}
                placeholder="50,000"
                className="w-full bg-tx-card border border-tx-border rounded-xl pl-10 pr-4 py-3 font-mono text-white focus:outline-none focus:border-tx-primary transition-colors"
              />
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm text-tx-text-secondary mb-3">Date of Decision</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-text-muted" />
            <input
              type="date"
              value={data.decision_date}
              onChange={(e) => update({ decision_date: e.target.value })}
              className="w-full bg-tx-card border border-tx-border rounded-xl pl-10 pr-4 py-3 font-mono text-white focus:outline-none focus:border-tx-primary transition-colors cursor-pointer"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </div>

      {data.asset_type === 'stock' && data.investment_amount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-tx-primary/5 border border-tx-primary/20 rounded-xl flex justify-between items-center"
        >
          <span className="text-sm text-tx-text-secondary">Total Calculated Investment:</span>
          <span className="font-mono font-bold text-tx-primary text-lg">₹{data.investment_amount.toLocaleString()}</span>
        </motion.div>
      )}
    </div>
  );
}

function StepTwo({ data, update }: { data: CreateDecisionInput, update: (u: Partial<CreateDecisionInput>) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-8 h-full">
      <div className="flex-[0.6] space-y-6">
        <div>
          <label className="block text-lg font-syne font-bold mb-1">Your Thesis</label>
          <p className="text-xs text-tx-text-muted mb-3">Why are you really buying this? Be specific. Vague theses = vague outcomes.</p>
          <textarea
            value={data.thesis}
            onChange={(e) => update({ thesis: e.target.value })}
            placeholder="e.g. Infosys Q3 margins improved by 200bps, management guided for strong FY25..."
            className="w-full min-h-[150px] bg-tx-bg border border-tx-border rounded-xl p-4 text-white focus:outline-none focus:border-tx-primary focus:shadow-glow transition-all resize-none"
          ></textarea>
        </div>

        <div>
          <label className="block text-lg font-syne font-bold mb-1">What would make you wrong?</label>
          <textarea
            value={data.what_would_make_me_wrong}
            onChange={(e) => update({ what_would_make_me_wrong: e.target.value })}
            placeholder="e.g. If margins deteriorate next quarter or if broad market sells off..."
            className="w-full min-h-[80px] bg-tx-bg border border-tx-border rounded-xl p-4 text-white focus:outline-none focus:border-tx-danger focus:shadow-[0_0_15px_rgba(255,77,77,0.15)] transition-all resize-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-tx-text-secondary mb-2">Target Price (₹)</label>
            <input 
              type="number" 
              value={data.target_price || ""}
              onChange={(e) => update({ target_price: parseFloat(e.target.value) || null })}
              className="w-full bg-tx-card border border-tx-border rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-tx-primary" 
            />
          </div>
          <div>
            <label className="block text-sm text-tx-text-secondary mb-2">Stop Loss (₹)</label>
            <input 
              type="number" 
              value={data.stop_loss || ""}
              onChange={(e) => update({ stop_loss: parseFloat(e.target.value) || null })}
              className="w-full bg-tx-card border border-tx-border rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-tx-danger" 
            />
          </div>
        </div>
      </div>

      <div className="flex-[0.4]">
        <div className="glass-card p-6 h-full flex flex-col border-tx-secondary/30 bg-gradient-to-b from-tx-secondary/5 to-transparent">
          <h3 className="font-syne font-bold text-lg mb-4 flex items-center text-tx-secondary">
            <Sparkles className="w-4 h-4 mr-2" /> What makes a good thesis?
          </h3>
          <ul className="space-y-3 text-sm text-tx-text-secondary flex-1">
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-tx-secondary mt-1.5 shrink-0"></div>Specific catalyst (earnings, policy)</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-tx-secondary mt-1.5 shrink-0"></div>Valuation anchor (why is it cheap?)</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-tx-secondary mt-1.5 shrink-0"></div>Timeline (when do you expect this?)</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-tx-secondary mt-1.5 shrink-0"></div>Exit conditions (what changes your mind?)</li>
          </ul>
          <div className="pt-6 mt-4 border-t border-tx-border/50 text-xs italic text-tx-text-muted text-center">
            "The investors who win aren't smarter. They're more self aware."
          </div>
        </div>
      </div>
        </div>
      <TechnicalIndicators data={data} update={update} />
    </div>
  );
}

function StepThree({ data, update }: { data: CreateDecisionInput, update: (u: Partial<CreateDecisionInput>) => void }) {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const isWarning = data.emotion === "fomo" || data.emotion === "greedy";

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <label className="block text-xl font-syne font-bold mb-1">Conviction Level</label>
            <p className="text-sm text-tx-text-muted">How strong is your thesis?</p>
          </div>
          <span className="font-mono text-3xl font-bold text-tx-primary">{data.confidence_level}</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={data.confidence_level}
          onChange={(e) => update({ confidence_level: parseInt(e.target.value) })}
          className="w-full accent-tx-primary h-2 bg-tx-card rounded-lg appearance-none cursor-pointer mb-2" 
        />
        <div className="flex justify-between px-1 text-xs text-tx-text-muted font-mono mb-2">
          {[1,2,3,4,5,6,7,8,9,10].map(num => (
            <span key={num} className="flex justify-center w-4">{num}</span>
          ))}
        </div>
        <div className="flex justify-between text-xs text-tx-text-secondary mt-1">
          <span>Pure gut feeling</span>
          <span>Rock solid thesis</span>
        </div>
      </div>

      <div>
        <label className="block text-xl font-syne font-bold mb-1">What are you feeling right now?</label>
        <p className="text-sm text-tx-text-muted mb-4">Be honest. Nobody is watching except future you.</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "😌 Calm and logical", val: "calm", color: "hover:border-tx-primary" },
            { label: "😤 Excited", val: "excited", color: "hover:border-tx-accent" },
            { label: "😰 Anxious", val: "anxious", color: "hover:border-orange-400" },
            { label: "😱 FOMO", val: "fomo", color: "hover:border-tx-danger text-tx-danger border-tx-danger bg-tx-danger/10" },
            { label: "🤑 Greedy", val: "greedy", color: "hover:border-tx-danger" },
            { label: "😕 Uncertain", val: "uncertain", color: "hover:border-white" },
          ].map((emo) => (
            <button
              key={emo.val}
              onClick={() => update({ emotion: emo.val as any })}
              className={cn(
                "px-4 py-3 rounded-full border bg-tx-card text-sm transition-all duration-300",
                data.emotion === emo.val ? emo.color : "border-tx-border text-tx-text-secondary",
                data.emotion !== emo.val && emo.color
              )}
            >
              {emo.label}
            </button>
          ))}
        </div>
      </div>

      {isWarning && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-tx-danger/10 border border-tx-danger rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-tx-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-tx-danger font-medium font-syne">Main character energy. Villain arc portfolio.</p>
            <p className="text-sm text-tx-danger/70">Proceed with extreme caution. 🚨</p>
          </div>
        </motion.div>
      )}

      <div>
        <label className="block text-xl font-syne font-bold mb-4">Before you lock this in...</label>
        <div className="space-y-3">
          {[
            "I have a clear thesis (not just a feeling)",
            "I know exactly when I will exit — win or lose",
            "I can genuinely afford to lose this entire amount",
            "This is my own research, not someone else's tip",
            "I am not buying this because of FOMO"
          ].map((item, i) => {
            const isChecked = checkedItems.includes(i);
            return (
            <label key={i} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleCheck(i); }}>
              <div className={cn(
                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                isChecked ? "bg-tx-primary border-tx-primary" : "border-tx-border group-hover:border-tx-primary"
              )}>
                <Check className={cn("w-3 h-3 transition-colors", isChecked ? "text-tx-bg" : "text-transparent group-hover:text-tx-primary/30")} />
              </div>
              <span className={cn(
                "text-sm transition-colors",
                isChecked ? "text-white" : "text-tx-text-secondary group-hover:text-white"
              )}>{item}</span>
            </label>
          )})}
        </div>
      </div>
    </div>
  );
}
