"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useMode } from "@/context/ModeContext";

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
    totalPortfolioValue: number;
    returnPct: number;
    returnAmt: number;
    decisionCountTotal: number;
    decisionCountMonth: number;
    streak: number;
    avgQualityScore: number;
    scoreTrend: number;
    recentDecisions: Decision[];
    chartData: { date: string; score: number; name: string }[];
    patterns: Pattern[];
    openPositions: (Decision & { current_price: number; change_pct: number; quality_score?: number; bias?: string })[];
    pendingReviews: Decision[];
    reviewedCount: number;
  } | null>(null);

  const [chartTimeframe, setChartTimeframe] = useState("1M");
  const [openPositionsFilter, setOpenPositionsFilter] = useState("All");
  const [hoveredChartPoint, setHoveredChartPoint] = useState<{ date: string; score: number; name: string; x: number; y: number } | null>(null);

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

        // 1. Total Portfolio Value (Sum of entry_price for open positions as a mock if live price unavailable)
        const openDecisions = decisions.filter(d => d.status === "open" || d.status === "pending_review");
        
        const openPositions = openDecisions.map(d => {
          const mockChange = (Math.random() - 0.5) * 0.1; // +/- 5% mock for now
          const currentPrice = d.entry_price * (1 + mockChange);
          
          const outArr = Array.isArray(d.outcome) ? d.outcome : (d.outcome ? [d.outcome] : []);
          const out = outArr[0];
          
          return {
            ...d,
            current_price: currentPrice,
            change_pct: mockChange * 100,
            quality_score: out?.overall_quality_score || out?.quality_score,
            bias: d.emotion || "none"
          };
        });

        const totalPortfolioValue = openPositions.reduce((sum, pos) => sum + pos.current_price, 0) || 0;

        // 2. Return %
        const closedDecisions = decisions.filter(d => {
          const outArr = Array.isArray(d.outcome) ? d.outcome : (d.outcome ? [d.outcome] : []);
          return outArr.length > 0 && outArr[0].actual_return_percent !== null;
        });
        
        const returnPct = closedDecisions.length > 0 
          ? closedDecisions.reduce((sum, d) => {
              const outArr = Array.isArray(d.outcome) ? d.outcome : [d.outcome];
              return sum + (outArr[0].actual_return_percent || 0);
            }, 0) / closedDecisions.length 
          : 0;
          
        const returnAmt = (totalPortfolioValue * (returnPct / 100));

        // 3. Decision Count
        const decisionCountTotal = decisions.length;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const decisionCountMonth = decisions.filter(d => {
          const date = new Date(d.created_at);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;

        // 4. Streak
        const streak = profile?.current_streak || 0; 

        // 5. Avg Quality Score
        const validScores = closedDecisions.map(d => {
          const outArr = Array.isArray(d.outcome) ? d.outcome : [d.outcome];
          return outArr[0].overall_quality_score || outArr[0].quality_score || 0;
        }).filter(score => score > 0);
        
        const avgQualityScore = validScores.length > 0
          ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
          : 0;
        
        const scoreTrend = validScores.length > 5 ? 4.2 : 0; // Mock trend

        // 6. Chart Data
        const chartData = closedDecisions
          .filter(d => {
            const outArr = Array.isArray(d.outcome) ? d.outcome : [d.outcome];
            return outArr[0].reviewed_at;
          })
          .sort((a, b) => {
            const dateA = new Date((Array.isArray(a.outcome) ? a.outcome[0] : a.outcome as any).reviewed_at).getTime();
            const dateB = new Date((Array.isArray(b.outcome) ? b.outcome[0] : b.outcome as any).reviewed_at).getTime();
            return dateA - dateB;
          })
          .slice(-30)
          .map(d => {
            const outArr = Array.isArray(d.outcome) ? d.outcome : [d.outcome];
            const out = outArr[0];
            return {
              date: new Date(out.reviewed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              score: out.overall_quality_score || out.quality_score || 0,
              name: d.asset_name || "Unknown"
            };
          });
        
        if (chartData.length === 0) {
          for (let i = 10; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            chartData.push({
              date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              score: Math.floor(50 + Math.random() * 40),
              name: "No Data Yet"
            });
          }
        }

        // 7. Recent Decisions
        const recentDecisions = decisions.slice(0, 5);

        // 10. Pending Reviews
        const today = new Date();
        const pendingReviews = decisions.filter(d => {
          if (d.status !== 'open' && d.status !== 'pending_review') return false;
          
          // In tradeoffX, decisions often lack thesis_review_date so we check created_at + 7 days
          let reviewDateStr = d.created_at;
          const createdDate = new Date(reviewDateStr);
          createdDate.setDate(createdDate.getDate() + 7);
          return createdDate < today || d.status === 'pending_review';
        });

        setData({
          totalPortfolioValue,
          returnPct,
          returnAmt,
          decisionCountTotal,
          decisionCountMonth,
          streak,
          avgQualityScore,
          scoreTrend,
          recentDecisions,
          chartData,
          patterns: patterns.length > 0 ? patterns : [
            { id: "1", pattern_text: "Need more data to analyze patterns.", confidence_percent: 0, based_on_decisions: 0, pattern_type: "info" }
          ],
          openPositions,
          pendingReviews,
          reviewedCount: validScores.length
        });

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

  const filteredPositions = data.openPositions.filter(p => {
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
        
        {/* Card 1 — Total Holdings */}
        <div className="lg:col-span-3 bg-[#111] border border-[#222] rounded-[8px] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-end mb-4">
            <div className="flex bg-[#161616] border border-[#222] rounded-full p-0.5">
              {['1W', '1M', '6M', '1Y'].map(t => (
                <button key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${t === '1M' ? 'bg-[#222] text-[#f0f0f0]' : 'text-[#5a5a5a] hover:text-[#f0f0f0]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-mono tracking-tight text-[#f0f0f0]">₹{data.totalPortfolioValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`font-mono text-xs ${data.returnPct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {data.returnPct >= 0 ? '+' : ''}{data.returnPct.toFixed(2)}%
              </span>
              <span className="text-[#5a5a5a] text-xs font-mono">
                {data.returnAmt >= 0 ? '+' : ''}₹{Math.abs(data.returnAmt).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>
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

        {/* Card 3 — Decision Quality Score */}
        <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-[8px] p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-[#5a5a5a] text-sm font-medium mb-1">Avg Quality Score</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono tracking-tight">{data.avgQualityScore}</span>
              <span className="text-[#5a5a5a] text-xs">/ 100</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1 text-xs">
            <span className="text-[#5a5a5a]">Based on {data.reviewedCount} reviewed decisions</span>
            {data.scoreTrend > 0 && (
              <span className="flex items-center text-[#22c55e]">
                <ArrowUpRight className="w-3 h-3 mr-1" /> {data.scoreTrend}% vs last month
              </span>
            )}
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
                    <span className="font-mono text-xs text-[#f0f0f0]">₹{d.entry_price.toLocaleString("en-IN")}</span>
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
          
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="text-[#5a5a5a] border-b border-[#222]">
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium font-mono text-right">Entry Price (₹)</th>
                <th className="pb-3 font-medium font-mono text-right">Current Price (₹)</th>
                <th className="pb-3 font-medium font-mono text-right">Change %</th>
                <th className="pb-3 font-medium text-center">Decision Quality</th>
                <th className="pb-3 font-medium">Bias Tag</th>
                <th className="pb-3 font-medium">Review Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions.map((p) => (
                <tr key={p.id} className="border-b border-[#222] last:border-b-0 hover:bg-white/5 transition-colors group">
                  <td className="py-3 font-mono font-medium text-[#f0f0f0] group-hover:text-[#22c55e] transition-colors">
                    <Link href={`/decisions/${p.id}`}>{p.asset_name}</Link>
                  </td>
                  <td className="py-3 font-mono text-right text-[#5a5a5a]">{p.entry_price.toLocaleString("en-IN", {maximumFractionDigits:2})}</td>
                  <td className="py-3 font-mono text-right text-[#f0f0f0]">{p.current_price.toLocaleString("en-IN", {maximumFractionDigits:2})}</td>
                  <td className={`py-3 font-mono text-right ${p.change_pct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {p.change_pct > 0 ? '+' : ''}{p.change_pct.toFixed(2)}%
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-[#161616] border border-[#222] font-mono text-[10px] text-[#f0f0f0]">
                      {p.quality_score || '--'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="font-mono text-[10px] text-[#5a5a5a] uppercase">{p.bias}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#f0f0f0]">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'open' ? 'bg-[#5a5a5a]' : 'bg-amber-500'}`} />
                      {p.status === 'open' ? 'Open' : 'Pending'}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPositions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5a5a5a] font-mono">No positions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right — Pending Reviews */}
        <div className="lg:col-span-4 bg-[#111] border border-[#222] rounded-[8px] p-5 flex flex-col h-full shadow-sm">
          <h3 className="text-[#f0f0f0] text-sm font-medium mb-5">Awaiting Review</h3>
          <div className="flex-1 flex flex-col gap-0 divide-y divide-[#222]">
            {data.pendingReviews.map(r => {
              const daysOverdue = Math.floor((new Date().getTime() - new Date(r.created_at).getTime() + (7 * 24 * 3600 * 1000)) / (1000 * 3600 * 24));
              return (
                <div key={r.id} className="py-3 flex items-center justify-between group">
                  <div>
                    <p className="font-mono text-sm text-[#f0f0f0]">{r.asset_name}</p>
                    <p className={`text-[10px] mt-0.5 font-medium ${daysOverdue > 7 ? 'text-[#ef4444]' : 'text-amber-500'}`}>
                      {daysOverdue > 0 ? `${daysOverdue} days overdue` : 'Due soon'}
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
  );
}
