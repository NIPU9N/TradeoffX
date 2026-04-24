"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowUpRight, ArrowDownRight, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Decision } from "@/types";
import Link from "next/link";
import { getDecisions } from "@/lib/api";
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

export default function MyDecisions() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { mode } = useMode();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const filterParams: { status?: string, mode?: string } = { mode };
        if (statusFilter !== "All") {
          filterParams.status = statusFilter.toLowerCase().replace(" ", "_");
        }
        const data = await getDecisions(filterParams);
        setDecisions(data.decisions);
      } catch (err: any) {
        setError(err.message || "Failed to load decisions");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [statusFilter, mode]);

  const filteredDecisions = decisions.filter(d =>
    d.asset_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-tx-primary animate-spin" />
        <p className="text-tx-text-secondary font-syne">Retaining your memories...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-syne text-4xl font-bold mb-2">My Decisions</h1>
        <p className="text-tx-text-secondary">
          Every trade you've logged. The good, the bad, and the FOMO.
        </p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <div className="px-4 py-2 bg-tx-card border border-tx-border rounded-full text-sm font-medium text-white">
          Total: {decisions.length}
        </div>
        <div className="px-4 py-2 bg-tx-card border border-tx-border rounded-full text-sm font-medium text-white">
          Win Rate: {decisions.filter(d => d.outcome?.outcome_type === "profit").length > 0 ? Math.round((decisions.filter(d => d.outcome?.outcome_type === "profit").length / decisions.filter(d => d.status === 'reviewed').length) * 100) : 0}%
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex justify-between items-center bg-tx-card/50 p-4 rounded-xl border border-tx-border backdrop-blur-sm">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-text-muted" />
          <input 
            type="text" 
            placeholder="Search by asset name..." 
            className="w-full bg-tx-bg border border-tx-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-tx-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Open", "Pending Review", "Reviewed"].map((filter) => (
            <button 
              key={filter} 
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-colors border",
                statusFilter === filter ? "bg-tx-primary/10 text-tx-primary border-tx-primary/30" : "text-tx-text-secondary hover:text-white hover:bg-tx-bg border-transparent"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDecisions.map((decision) => (
          <Link 
            key={decision.id} 
            href={`/decisions/${decision.id}`}
            className="glass-card p-6 relative group hover:-translate-y-1.5 transition-all duration-300 hover:border-tx-primary/50 hover:shadow-glow cursor-pointer overflow-hidden block"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-syne text-2xl font-bold text-white">{decision.asset_name}</h3>
                <span className="px-2 py-0.5 rounded bg-tx-bg text-tx-text-secondary text-xs border border-tx-border uppercase">
                  {decision.asset_type.replace('_', ' ')}
                </span>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium border",
                decision.status === "reviewed" ? "bg-tx-primary/10 text-tx-primary border-tx-primary/30" :
                decision.status === "pending_review" ? "bg-orange-500/10 text-orange-400 border-orange-500/30" :
                "bg-blue-500/10 text-blue-400 border-blue-500/30"
              )}>
                {decision.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex gap-4 text-sm text-tx-text-secondary mb-4">
              <span>{new Date(decision.decision_date).toLocaleDateString()}</span>
              <span>•</span>
              <span className="font-mono">₹{decision.investment_amount.toLocaleString()}</span>
            </div>
            
            <p className="text-sm text-tx-text-secondary italic line-clamp-2 mb-6">
              "{decision.thesis}"
            </p>
            
            <div className="w-full h-px bg-tx-border mb-6"></div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-16 h-1.5 bg-tx-bg rounded-full overflow-hidden">
                  <div className="h-full bg-tx-secondary" style={{ width: `${decision.confidence_level * 10}%` }}></div>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs border capitalize",
                  decision.emotion === "fomo" ? "bg-tx-danger/10 border-tx-danger/30 text-tx-danger" : 
                  decision.emotion === "excited" ? "bg-tx-accent/10 border-tx-accent/30 text-tx-accent" : 
                  "bg-tx-bg border-tx-border text-tx-text-secondary"
                )}>
                  {decision.emotion}
                </span>
              </div>
              
              <div className="font-mono font-bold">
                {Array.isArray(decision.outcome) && decision.outcome[0]?.outcome_type === "profit" ? (
                  <span className="text-tx-primary flex items-center"><ArrowUpRight className="w-4 h-4 mr-1" /> +{decision.outcome[0].actual_return_percent}%</span>
                ) : Array.isArray(decision.outcome) && decision.outcome[0]?.outcome_type === "loss" ? (
                  <span className="text-tx-danger flex items-center"><ArrowDownRight className="w-4 h-4 mr-1" /> {decision.outcome[0].actual_return_percent}%</span>
                ) : (
                  <span className="text-orange-400 text-sm">Awaiting Review</span>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-tx-card via-tx-card to-transparent pt-12 flex justify-end">
              <span className="text-tx-primary font-medium text-sm flex items-center">
                View Full Decision <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>
          </Link>
        ))}
        {filteredDecisions.length === 0 && (
          <div className="col-span-2 py-20 text-center text-tx-text-secondary bg-tx-card/30 rounded-2xl border border-tx-border border-dashed">
            No decisions match your search or filter.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
