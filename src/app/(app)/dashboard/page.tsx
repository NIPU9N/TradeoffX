"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useMode } from "@/context/ModeContext";
import { KNOWN_ASSETS } from "@/lib/assets";

interface Outcome {
  id: string;
  decision_id: string;
  quality_score: number;
  reviewed_at: string;
  actual_return_percent: number;
  exit_emotion: string;
  outcome_type: string;
}

interface Decision {
  id: string;
  asset_name: string;
  asset_type: string;
  thesis: string;
  status: "open" | "pending_review" | "reviewed";
  entry_price: number;
  created_at: string;
  decision_date: string;
  outcome?: Outcome | Outcome[];
}

interface Pattern {
  id: string;
  pattern_text: string;
  confidence_percent: number;
  based_on_decisions: number;
  pattern_type: string;
}

export default function Dashboard() {
  const { mode } = useMode(); // "real" or "practice"
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState<{
    totalCapitalInvested: number;
    unrealizedPnL: number;
    unrealizedPct: number;
    totalRealizedPnL: number;
    totalRealizedPct: number;
    decisionCountTotal: number;
    decisionCountMonth: number;
    streak: number;
    biggestBias: string;
    biasCount: number;
    recentDecisions: any[];
    chartData: { date: string; score: number; name: string }[];
    patterns: Pattern[];
    openPositions: { 
      id: string; 
      asset_name: string; 
      asset_type: string; 
      status: string; 
      investment_amount: number; 
      entry_price: number | null; 
      current_price?: number | null;
      return_percent?: number | null;
      quality_score?: number; 
      bias_tag: string 
    }[];
    pendingReviews: any[];
    reviewedCount: number;
  } | null>(null);

  const [livePrices, setLivePrices] = useState<Record<string, { current_price: number; change_percent: number | null }>>({});
  const [pricesRefreshing, setPricesRefreshing] = useState(false);

  const symbolByName = useMemo(
    () => Object.fromEntries(KNOWN_ASSETS.map(a => [a.name, a.symbol])),
    []
  );
  const nameBySymbol = useMemo(
    () => Object.fromEntries(KNOWN_ASSETS.map(a => [a.symbol, a.name])),
    []
  );

  const [chartTimeframe, setChartTimeframe] = useState("1M");
  const [openPositionsFilter, setOpenPositionsFilter] = useState("All");
  const [hoveredChartPoint, setHoveredChartPoint] = useState<{ date: string; score: number; name: string; x: number; y: number } | null>(null);

  const refreshLivePrices = useCallback(async (assetNames: string[]) => {
    if (assetNames.length === 0) return;
    setPricesRefreshing(true);
    try {
      const symbols = assetNames
        .map(name => symbolByName[name])
        .filter((s): s is string => Boolean(s));
      if (!symbols.length) return;
      const res = await fetch("/api/prices/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: [...new Set(symbols)] }),
      });
      if (!res.ok) return;
      const json = await res.json();
      const mapped: Record<string, { current_price: number; change_percent: number | null }> = {};
      Object.entries(nameBySymbol).forEach(([symbol, name]) => {
        const p = (json as any)?.[symbol];
        if (p?.current_price != null) {
          mapped[name] = { current_price: p.current_price, change_percent: p.change_percent ?? null };
        }
      });
      setLivePrices(mapped);
    } catch (e) {
      console.error("Failed to fetch live prices", e);
    } finally {
      setPricesRefreshing(false);
    }
  }, [symbolByName, nameBySymbol]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch decisions with outcomes
        const { data: decisionsData } = await supabase
          .from("decisions")
          .select("*, outcome:outcomes(*)")
          .eq("user_id", user.id)
          .eq("mode", mode)
          .order("created_at", { ascending: false });

        const decisions = (decisionsData || []) as any[];
        
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Fetch patterns
        const { data: patternsData } = await supabase
          .from("patterns")
          .select("*")
          .eq("user_id", user.id)
          .eq("mode", mode)
          .order("generated_at", { ascending: false })
          .limit(3);

        const patterns = (patternsData || []) as Pattern[];

        // --- CLOSED / REVIEWED DECISIONS (needed for chart) ---
        const closedDecisions = decisions.filter(d => {
          const outArr = Array.isArray(d.outcome) ? d.outcome : (d.outcome ? [d.outcome] : []);
          return outArr.length > 0 && outArr[0].outcome_type && outArr[0].outcome_type !== 'still_open';
        });

        // --- FETCH MODE-SPECIFIC DATA FROM EXISTING APIS ---
        let totalCapitalInvested = 0;
        let unrealizedPnL = 0;
        let unrealizedPct = 0;
        let totalRealizedPnL = 0;
        let totalRealizedPct = 0;
        let openPositions: any[] = [];

        if (mode === 'practice') {
          // Practice: use /api/practice/portfolio and /api/practice/positions
          const [portfolioResponse, positionsResponse] = await Promise.all([
            fetch('/api/practice/portfolio'),
            fetch('/api/practice/positions'),
          ]);

          const portfolioJson = await portfolioResponse.json();
          const positionsJson = await positionsResponse.json();

          const metrics = portfolioJson?.metrics || {
            deployed_capital: 0,
            free_capital: 0,
            unrealized_pnl: 0,
            open_positions: 0,
          };

          totalCapitalInvested = Number(metrics.deployed_capital || 0);
          unrealizedPnL = Number(metrics.unrealized_pnl || 0);
          unrealizedPct = totalCapitalInvested > 0 ? (unrealizedPnL / totalCapitalInvested) * 100 : 0;

          const positions = Array.isArray(positionsJson?.positions) ? positionsJson.positions : [];
          openPositions = positions
            .filter((p: any) => p.status === 'open')
            .map((p: any) => {
              const decision = Array.isArray(p.decisions) ? p.decisions[0] : p.decisions;
              const biasTag = decision?.emotion && decision.emotion !== 'calm'
                ? String(decision.emotion).toUpperCase()
                : 'NONE';

              return {
                id: p.decision_id || p.id,
                asset_name: p.asset_name,
                asset_type: p.asset_type,
                status: p.status,
                investment_amount: Number(p.investment_amount || 0),
                entry_price: p.entry_price != null ? Number(p.entry_price) : null,
                current_price: p.current_price != null ? Number(p.current_price) : null,
                return_percent: p.return_percent != null ? Number(p.return_percent) : 0,
                bias_tag: biasTag,
                quality_score: undefined,
              };
            });
        } else {
          // Real: use /api/pl for realized P&L, and decisions for open positions
          const plResponse = await fetch('/api/pl?mode=real');
          const plJson = await plResponse.json();
          const summary = plJson?.summary || {};

          totalRealizedPnL = Number(summary.total_pnl || 0);
          totalRealizedPct = Number(summary.overall_return_pct || 0);

          const openDecisions = decisions.filter(d => d.status === 'open' || d.status === 'pending_review');
          totalCapitalInvested = openDecisions.reduce((sum: number, d: any) => sum + Number(d.investment_amount || 0), 0);

          openPositions = openDecisions.map((d: any) => {
            const outArr = Array.isArray(d.outcome) ? d.outcome : (d.outcome ? [d.outcome] : []);
            const out = outArr[0];
            const biasTag = d.emotion && d.emotion !== 'calm' ? String(d.emotion).toUpperCase() : 'NONE';

            return {
              id: d.id,
              asset_name: d.asset_name,
              asset_type: d.asset_type,
              status: d.status,
              investment_amount: Number(d.investment_amount || 0),
              entry_price: d.entry_price != null ? Number(d.entry_price) : null,
              current_price: null,
              return_percent: out?.actual_return_percent != null ? Number(out.actual_return_percent) : null,
              bias_tag: biasTag,
              quality_score: out?.overall_quality_score || out?.quality_score || undefined,
            };
          });
        }

        // --- DECISION COUNT ---
        const decisionCountTotal = decisions.length;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const decisionCountMonth = decisions.filter(d => {
          const date = new Date(d.created_at);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;

        // --- STREAK ---
        const streak = profile?.current_streak || 0;

        // --- BIGGEST BIAS (from emotion field on losing trades) ---
        const emotionCounts: Record<string, number> = {};
        decisions.forEach(d => {
          if (d.emotion && d.emotion !== 'calm') {
            emotionCounts[d.emotion] = (emotionCounts[d.emotion] || 0) + 1;
          }
        });
        const biggestBiasEntry = Object.entries(emotionCounts).sort(([,a],[,b]) => b - a)[0];
        const biggestBias = biggestBiasEntry ? String(biggestBiasEntry[0]).toUpperCase() : 'NONE';
        const biasCount = biggestBiasEntry ? biggestBiasEntry[1] : 0;

        // --- QUALITY SCORE for chart ---
        const validScores = closedDecisions.map(d => {
          const outArr = Array.isArray(d.outcome) ? d.outcome : [d.outcome];
          return outArr[0].overall_quality_score || outArr[0].quality_score || 0;
        }).filter(s => s > 0);

        // --- CHART DATA ---
        const chartData = closedDecisions
          .filter(d => { const o = Array.isArray(d.outcome) ? d.outcome[0] : d.outcome as any; return o?.reviewed_at; })
          .sort((a, b) => {
            const oA = (Array.isArray(a.outcome) ? a.outcome[0] : a.outcome) as any;
            const oB = (Array.isArray(b.outcome) ? b.outcome[0] : b.outcome) as any;
            return new Date(oA.reviewed_at).getTime() - new Date(oB.reviewed_at).getTime();
          })
          .slice(-30)
          .map(d => {
            const out = (Array.isArray(d.outcome) ? d.outcome[0] : d.outcome) as any;
            return {
              date: new Date(out.reviewed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              score: out.overall_quality_score || out.quality_score || 0,
              name: d.asset_name || "Unknown"
            };
          });

        if (chartData.length === 0) {
          for (let i = 10; i >= 0; i--) {
            const dt = new Date(); dt.setDate(dt.getDate() - i);
            chartData.push({ date: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }), score: Math.floor(50 + Math.random() * 40), name: "No Data Yet" });
          }
        }

        // --- RECENT DECISIONS ---
        const recentDecisions = decisions.slice(0, 5);

        // --- PENDING REVIEWS: ALL open or pending_review decisions ---
        const pendingReviews = decisions.filter(d => d.status === 'open' || d.status === 'pending_review');

        setData({
          totalCapitalInvested,
          unrealizedPnL,
          unrealizedPct,
          totalRealizedPnL,
          totalRealizedPct,
          decisionCountTotal,
          decisionCountMonth,
          streak,
          biggestBias,
          biasCount,
          recentDecisions,
          chartData,
          patterns: patterns.length > 0 ? patterns : [
            { id: "1", pattern_text: "Need more data to analyze patterns.", confidence_percent: 0, based_on_decisions: 0, pattern_type: "info" }
          ],
          openPositions,
          pendingReviews,
          reviewedCount: validScores.length
        });

        // Kick off live price fetch after state is set
        const assetNames = openPositions.map(p => p.asset_name);
        if (assetNames.length > 0) {
          void refreshLivePrices(assetNames);
        }

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [mode]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-tx-accent animate-spin" />
        <p className="text-sm text-tx-text-secondary font-mono">Fetching intelligence...</p>
      </div>
    );
  }

  // Handle Chart Interaction
  const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = Math.max(0, Math.min(1, x / rect.width));
    const idx = Math.min(data.chartData.length - 1, Math.round(percentX * (data.chartData.length - 1)));
    
    setHoveredChartPoint({
      ...data.chartData[idx],
      x: (idx / (data.chartData.length - 1)) * 100,
      y
    });
  };

  const chartMax = 100;
  const chartMin = 0;
  const chartPoints = data.chartData.map((d, i) => {
    const x = (i / (data.chartData.length - 1)) * 100;
    const y = 100 - ((d.score - chartMin) / (chartMax - chartMin)) * 100;
    return `${x},${y}`;
  }).join(' ');

  const bestDecision = Math.max(...data.chartData.map(d => d.score));
  const worstDecision = Math.min(...data.chartData.map(d => d.score));

  const derivedData = useMemo(() => {
    if (!data) return null;
    let totalInvested = 0;
    let totalCurrentValue = 0;
    
    const enrichedPositions = data.openPositions.map(p => {
      const lp = livePrices[p.asset_name];
      const livePrice = lp?.current_price;
      
      const currentPrice = livePrice || p.current_price || p.entry_price || 0;
      const invested = p.investment_amount;
      const quantity = p.entry_price && p.entry_price > 0 ? invested / p.entry_price : 0;
      const currentValue = quantity * currentPrice;
      
      let returnPct = p.return_percent;
      if (p.status === 'open' || p.status === 'pending_review') {
          if (p.entry_price && p.entry_price > 0 && currentPrice > 0) {
             returnPct = ((currentPrice - p.entry_price) / p.entry_price) * 100;
          }
      }
      
      if (p.status === 'open' || p.status === 'pending_review') {
         totalInvested += invested;
         totalCurrentValue += currentValue;
      }
      
      return {
        ...p,
        display_current_price: currentPrice,
        display_return_percent: returnPct
      };
    });
    
    let unrealizedPnL = data.unrealizedPnL;
    let unrealizedPct = data.unrealizedPct;
    
    if (totalInvested > 0 && Object.keys(livePrices).length > 0) {
      unrealizedPnL = totalCurrentValue - totalInvested;
      unrealizedPct = (unrealizedPnL / totalInvested) * 100;
    }
    
    return {
      unrealizedPnL,
      unrealizedPct,
      enrichedPositions
    };
  }, [data, livePrices]);

  const filteredPositions = (derivedData?.enrichedPositions || data.openPositions).filter(p => {
    if (openPositionsFilter === "All") return true;
    if (openPositionsFilter === "Stocks") return p.asset_type === "stock";
    if (openPositionsFilter === "MF") return p.asset_type === "mutual_fund";
    if (openPositionsFilter === "Crypto") return p.asset_type === "crypto";
    return true;
  });

  const isPractice = mode === "practice";

  return (
    <div className="space-y-6 pb-24 text-[#f0f0f0] font-sans antialiased">
      
      {/* HEADER SECTION (To distinguish mode) */}
      <div className="flex justify-between items-end mb-6 border-b border-[#222] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f0] mb-1">Dashboard</h1>
          <p className="text-sm text-[#5a5a5a]">
            {isPractice ? "Practice Environment" : "Real Portfolio"} Overview
          </p>
        </div>
      </div>

      {/* SECTION 1 — TOP ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        
        {/* Card 1 — Total Capital Invested */}
        <div className="lg:col-span-3 bg-[#111] border border-[#222] rounded-[8px] p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-[#5a5a5a] text-sm font-medium mb-1">Capital Invested</h3>
            <h2 className="text-3xl font-mono tracking-tight text-[#f0f0f0]">₹{data.totalCapitalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</h2>
            <p className="text-[10px] text-[#5a5a5a] mt-1">{data.openPositions.length} open position{data.openPositions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="mt-4">
            <span className={`font-mono text-xs ${(isPractice ? (derivedData?.unrealizedPnL ?? data.unrealizedPnL) : data.totalRealizedPnL) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {isPractice ? (
                <>{(derivedData?.unrealizedPnL ?? data.unrealizedPnL) >= 0 ? '+' : ''}{(derivedData?.unrealizedPct ?? data.unrealizedPct).toFixed(2)}% unrealized</>
              ) : (
                <>{data.totalRealizedPct >= 0 ? '+' : ''}{data.totalRealizedPct.toFixed(2)}% realized</>
              )}
            </span>
          </div>
        </div>

        {/* Card 2 — Decisions Logged */}
        <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-[8px] p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-[#5a5a5a] text-sm font-medium mb-1">Decisions Logged</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono tracking-tight">{data.decisionCountTotal}</span>
              <span className="text-[#5a5a5a] text-xs">{data.decisionCountMonth} this month</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#161616] border border-[#222] text-xs text-[#f0f0f0]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></div>
              {data.streak}-day streak
            </span>
          </div>
        </div>

        {/* Card 3 — Unrealized P&L (practice) / Total Profit (real) */}
        <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-[8px] p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-[#5a5a5a] text-sm font-medium mb-1">
              {isPractice ? 'Unrealized P&L' : 'Total Profit Made'}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-mono tracking-tight ${(isPractice ? (derivedData?.unrealizedPnL ?? data.unrealizedPnL) : data.totalRealizedPnL) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {(isPractice ? (derivedData?.unrealizedPnL ?? data.unrealizedPnL) : data.totalRealizedPnL) >= 0 ? '+' : ''}₹{Math.abs(isPractice ? (derivedData?.unrealizedPnL ?? data.unrealizedPnL) : data.totalRealizedPnL).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="mt-4 text-xs">
            <span className={`font-mono ${(isPractice ? (derivedData?.unrealizedPct ?? data.unrealizedPct) : data.totalRealizedPct) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {(isPractice ? (derivedData?.unrealizedPct ?? data.unrealizedPct) : data.totalRealizedPct) >= 0 ? '+' : ''}{(isPractice ? (derivedData?.unrealizedPct ?? data.unrealizedPct) : data.totalRealizedPct).toFixed(2)}%
            </span>
            <span className="text-[#5a5a5a] ml-1">{isPractice ? 'on open positions' : 'across closed trades'}</span>
          </div>
        </div>

        {/* Card 4 — My Recent Decisions */}
        <div className="lg:col-span-5 bg-[#111] border border-[#222] rounded-[8px] p-5 flex flex-col shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[#5a5a5a] text-sm font-medium">My Recent Decisions</h3>
            <Link href="/decisions" className="text-xs text-[#f0f0f0] hover:text-[#22c55e] transition-colors">See all</Link>
          </div>
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 min-w-max pb-2">
              {data.recentDecisions.map(d => (
                <div key={d.id} className="w-64 bg-[#161616] border border-[#222] rounded-[6px] p-3 flex flex-col gap-2 shrink-0 hover:border-[#333] transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-sm font-bold text-[#f0f0f0]">{d.asset_name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#111] border border-[#222] text-[10px] text-[#f0f0f0] uppercase">
                      {d.asset_type}
                    </span>
                  </div>
                  <p className="text-xs text-[#5a5a5a] truncate">{d.thesis}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-mono text-xs text-[#f0f0f0]">₹{(d.entry_price || 0).toLocaleString("en-IN")}</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-[#f0f0f0]">
                      <div className={`w-1.5 h-1.5 rounded-full ${d.status === 'open' ? 'bg-white' : d.status === 'reviewed' ? 'bg-[#22c55e]' : 'bg-amber-500'}`} />
                      {d.status === 'pending_review' ? 'Pending Review' : d.status === 'reviewed' ? 'Reviewed' : 'Open'}
                    </span>
                  </div>
                </div>
              ))}
              {data.recentDecisions.length === 0 && (
                <div className="flex items-center justify-center w-full h-full text-xs text-[#5a5a5a]">
                  No decisions logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>

      {/* SECTION 2 — MAIN CHART + PATTERNS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 70% — Decision Performance Chart */}
        <div className="lg:col-span-8 bg-[#111] border border-[#222] rounded-[8px] p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#f0f0f0] text-sm font-medium">Decision Quality Over Time</h3>
            <div className="flex bg-[#161616] border border-[#222] rounded-full p-0.5">
              {['1W', '1M', '3M', '6M', '1Y'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setChartTimeframe(t)}
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${chartTimeframe === t ? 'bg-[#222] text-[#f0f0f0]' : 'text-[#5a5a5a] hover:text-[#f0f0f0]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div 
            className="relative h-[240px] w-full"
            onMouseMove={handleChartMouseMove}
            onMouseLeave={() => setHoveredChartPoint(null)}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPractice ? "#10B981" : "#22c55e"} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={isPractice ? "#10B981" : "#22c55e"} stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="0" x2="100" y2="0" stroke="#222" strokeWidth="0.5" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="#222" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#222" strokeWidth="0.5" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="#222" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="100" y2="100" stroke="#222" strokeWidth="0.5" />
              
              <polygon points={`${chartPoints} 100,100 0,100`} fill="url(#chartFill)" />
              <polyline points={chartPoints} fill="none" stroke={isPractice ? "#10B981" : "#22c55e"} strokeWidth="1.5" />
            </svg>
            
            {/* Tooltip Hover State */}
            {hoveredChartPoint && (
              <>
                <div 
                  className="absolute top-0 bottom-0 w-px border-l border-dashed border-[#5a5a5a] pointer-events-none"
                  style={{ left: `${hoveredChartPoint.x}%` }}
                />
                <div 
                  className={`absolute w-2 h-2 rounded-full border-2 border-[#111] pointer-events-none -translate-x-1/2 -translate-y-1/2 ${isPractice ? 'bg-[#10B981]' : 'bg-[#22c55e]'}`}
                  style={{ left: `${hoveredChartPoint.x}%`, top: `${100 - hoveredChartPoint.score}%` }}
                />
                <div 
                  className={`absolute z-10 bg-[#161616] border border-[#222] rounded-[6px] p-3 pointer-events-none shadow-xl min-w-[140px] ${hoveredChartPoint.x > 50 ? '-translate-x-[110%]' : 'translate-x-[10%]'}`}
                  style={{ left: `${hoveredChartPoint.x}%`, top: '10%' }}
                >
                  <p className="text-[10px] text-[#5a5a5a] mb-1 font-mono">{hoveredChartPoint.date}</p>
                  <p className="text-xs font-medium text-[#f0f0f0] truncate">{hoveredChartPoint.name}</p>
                  <p className={`font-mono text-sm mt-1 ${isPractice ? 'text-[#10B981]' : 'text-[#22c55e]'}`}>Score: {hoveredChartPoint.score}</p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-6 text-[11px] font-mono text-[#5a5a5a]">
              <span>Best decision: <span className={isPractice ? 'text-[#10B981]' : 'text-[#22c55e]'}>+{Math.round(bestDecision)} score</span></span>
              <span>Worst decision: <span className="text-[#ef4444]">{Math.round(worstDecision)} score</span></span>
            </div>
          </div>
        </div>

        {/* Right 30% — Behavioral Patterns */}
        <div className="lg:col-span-4 bg-[#111] border border-[#222] rounded-[8px] p-5 flex flex-col h-full shadow-sm">
          <h3 className="text-[#f0f0f0] text-sm font-medium mb-5">Your Patterns</h3>
          <div className="flex-1 flex flex-col gap-3">
            {data.patterns.map((p) => (
              <div key={p.id} className="bg-[#161616] border border-[#222] rounded-[6px] p-3 hover:border-[#333] transition-colors">
                <p className="text-sm font-medium text-[#f0f0f0] mb-1">{p.pattern_text}</p>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-[#5a5a5a]">{p.based_on_decisions} instances detected</span>
                  {p.pattern_type === 'info' ? null : (
                    <span className="font-mono text-[#ef4444]">-{Math.floor(Math.random() * 10) + 1}% avg</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-[10px] text-[#5a5a5a] leading-relaxed">
              Based on {data.reviewedCount} reviewed decisions — update by reviewing {data.pendingReviews.length} pending decisions.
            </p>
            <Link href="/patterns" className="inline-flex items-center gap-1 text-[11px] text-[#f0f0f0] hover:text-[#22c55e] transition-colors uppercase tracking-wider font-medium">
              Full analysis <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 3 — BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left — Portfolio Overview Table */}
        <div className="lg:col-span-8 bg-[#111] border border-[#222] rounded-[8px] p-5 overflow-x-auto shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#f0f0f0] text-sm font-medium">Open Positions</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => data && void refreshLivePrices(data.openPositions.map(p => p.asset_name))}
                disabled={pricesRefreshing}
                className="flex items-center gap-1 text-[10px] text-[#5a5a5a] hover:text-[#f0f0f0] transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${pricesRefreshing ? 'animate-spin' : ''}`} />
                {pricesRefreshing ? 'Fetching...' : 'Live prices'}
              </button>
              <div className="flex gap-2">
                {['All', 'Stocks', 'MF', 'Crypto'].map(f => (
                  <button
                    key={f}
                    onClick={() => setOpenPositionsFilter(f)}
                    className={`px-3 py-1 text-[10px] font-medium rounded-full border transition-colors ${openPositionsFilter === f ? 'bg-[#161616] border-[#333] text-[#f0f0f0]' : 'border-transparent text-[#5a5a5a] hover:text-[#f0f0f0]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="text-[#5a5a5a] border-b border-[#222]">
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium font-mono text-right">Invested (₹)</th>
                <th className="pb-3 font-medium font-mono text-right">Entry Price (₹)</th>
                <th className="pb-3 font-medium font-mono text-right">Current (₹)</th>
                <th className="pb-3 font-medium font-mono text-right">Return %</th>
                <th className="pb-3 pl-6 font-medium">Bias Tag</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions.map((p) => {
                const lp = livePrices[p.asset_name];
                const livePrice = lp?.current_price ?? null;
                const changePct = lp?.change_percent ?? null;
                
                return (
                  <tr key={p.id} className="border-b border-[#222] last:border-b-0 hover:bg-white/5 transition-colors group">
                    <td className="py-3 font-mono font-medium text-[#f0f0f0] group-hover:text-[#22c55e] transition-colors">
                      <Link href={`/decisions/${p.id}`}>{p.asset_name}</Link>
                    </td>
                    <td className="py-3 font-mono text-right text-[#5a5a5a]">
                      ₹{(p.investment_amount || 0).toLocaleString("en-IN", {maximumFractionDigits:0})}
                    </td>
                    <td className="py-3 font-mono text-right text-[#f0f0f0]">
                      {p.entry_price != null ? `₹${Number(p.entry_price).toFixed(2)}` : <span className="text-[#333]">—</span>}
                    </td>
                    <td className="py-3 font-mono text-right text-[#f0f0f0]">
                      {p.display_current_price != null 
                        ? `₹${Number(p.display_current_price).toFixed(2)}` 
                        : <span className="text-[#333]">—</span>}
                    </td>
                    <td className="py-3 font-mono text-right">
                      {p.display_return_percent != null
                        ? <span className={Number(p.display_return_percent) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                            {Number(p.display_return_percent) > 0 ? '+' : ''}{Number(p.display_return_percent).toFixed(2)}%
                          </span>
                        : <span className="text-[#333]">—</span>}
                    </td>
                    <td className="py-3 pl-6">
                      <span className="font-mono text-[10px] text-[#5a5a5a] uppercase">{p.bias_tag}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#f0f0f0]">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'open' ? 'bg-[#5a5a5a]' : 'bg-amber-500'}`} />
                        {p.status === 'open' ? 'Open' : 'Pending'}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPositions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5a5a5a] font-mono">No positions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right side: stacked Pending Reviews + Biggest Bias */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Biggest Bias Card */}
          <div className="bg-[#111] border border-[#222] rounded-[8px] p-5 shadow-sm">
            <h3 className="text-[#5a5a5a] text-sm font-medium mb-3">Biggest Bias</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-mono font-bold text-[#f0f0f0]">{data.biggestBias}</span>
              <span className="font-mono text-xs text-[#5a5a5a]">{data.biasCount} occurrence{data.biasCount !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-[10px] text-[#5a5a5a] mt-2">Most frequent emotional trigger across your decisions.</p>
          </div>

          {/* Awaiting Review */}
          <div className="bg-[#111] border border-[#222] rounded-[8px] p-5 flex flex-col flex-1 shadow-sm min-h-0">
            <h3 className="text-[#f0f0f0] text-sm font-medium mb-4">Awaiting Review</h3>
            <div className="flex flex-col gap-0 divide-y divide-[#222] overflow-y-auto max-h-[240px]">
              {data.pendingReviews.map(r => {
                const daysSince = Math.floor((new Date().getTime() - new Date(r.created_at).getTime()) / (1000 * 3600 * 24));
                return (
                  <div key={r.id} className="py-3 flex items-center justify-between group">
                    <div>
                      <p className="font-mono text-sm text-[#f0f0f0]">{r.asset_name}</p>
                      <p className={`text-[10px] mt-0.5 font-medium ${daysSince > 7 ? 'text-[#ef4444]' : 'text-amber-500'}`}>
                        {daysSince} day{daysSince !== 1 ? 's' : ''} since entry
                      </p>
                    </div>
                    <Link href={`/review/${r.id}`} className="text-xs font-medium text-[#f0f0f0] border border-[#222] rounded px-3 py-1 hover:bg-[#222] transition-colors">
                      Review now
                    </Link>
                  </div>
                );
              })}
              {data.pendingReviews.length === 0 && (
                <div className="py-8 text-center text-[#5a5a5a] text-xs">
                  All caught up. No pending reviews.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
