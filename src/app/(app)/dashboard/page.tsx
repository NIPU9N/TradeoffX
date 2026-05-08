"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Types
interface Decision {
  id: string;
  asset_name: string;
  asset_type: string;
  thesis: string;
  status: "open" | "pending_review" | "reviewed";
  entry_price: number;
  created_at: string;
  thesis_review_date: string;
  current_price?: number; // Fetched from api/prices or mocked
}

interface Outcome {
  id: string;
  decision_id: string;
  quality_score: number;
  reviewed_at: string;
  outcome_pct: number;
  bias_tags: string[];
}

interface Pattern {
  id: string;
  pattern_label: string;
  frequency_label: string;
  avg_return_impact: number;
}

export default function Dashboard() {
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

  // Time filters
  const [chartTimeframe, setChartTimeframe] = useState("1M");
  const [openPositionsFilter, setOpenPositionsFilter] = useState("All");
  const [hoveredChartPoint, setHoveredChartPoint] = useState<{ date: string; score: number; name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch decisions
        const { data: decisionsData } = await supabase
          .from("decisions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        const decisions = decisionsData || [];
        
        // Fetch outcomes
        const { data: outcomesData } = await supabase
          .from("outcomes")
          .select("*")
          .eq("user_id", user.id);
          
        const outcomes = outcomesData || [];

        // Fetch patterns
        const { data: patternsData } = await supabase
          .from("patterns")
          .select("*")
          .eq("user_id", user.id)
          .order("generated_at", { ascending: false })
          .limit(3);

        const patterns = patternsData || [];

        // 1. Total Portfolio Value (Sum of entry_price for open positions as a mock if live price unavailable)
        const openDecisions = decisions.filter(d => d.status === "open" || d.status === "pending_review");
        // Mock current price as entry_price * random small change
        const openPositions = openDecisions.map(d => {
          const mockChange = (Math.random() - 0.5) * 0.1; // +/- 5%
          const currentPrice = d.entry_price * (1 + mockChange);
          
          // Find if there's an outcome (sometimes pending_review has partial outcome)
          const out = outcomes.find(o => o.decision_id === d.id);
          
          return {
            ...d,
            current_price: currentPrice,
            change_pct: mockChange * 100,
            quality_score: out?.quality_score,
            bias: out?.bias_tags?.[0] || "None"
          };
        });

        const totalPortfolioValue = openPositions.reduce((sum, pos) => sum + pos.current_price, 0) || 0;

        // 2. Return %
        const closedOutcomes = outcomes.filter(o => o.outcome_pct !== null);
        const returnPct = closedOutcomes.length > 0 
          ? closedOutcomes.reduce((sum, o) => sum + (o.outcome_pct || 0), 0) / closedOutcomes.length 
          : 0;
        const returnAmt = (totalPortfolioValue * (returnPct / 100)); // Rough mock for absolute return

        // 3. Decision Count
        const decisionCountTotal = decisions.length;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const decisionCountMonth = decisions.filter(d => {
          const date = new Date(d.created_at);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;

        // 4. Streak
        // Simple mock streak calculation
        const streak = 14; 

        // 5. Avg Quality Score
        const validScores = outcomes.filter(o => o.quality_score !== null);
        const avgQualityScore = validScores.length > 0
          ? Math.round(validScores.reduce((sum, o) => sum + o.quality_score, 0) / validScores.length)
          : 0;
        
        // Mock score trend
        const scoreTrend = 4.2;

        // 6. Chart Data
        const chartData = validScores
          .sort((a, b) => new Date(a.reviewed_at).getTime() - new Date(b.reviewed_at).getTime())
          .slice(-30) // last 30 for chart
          .map(o => {
            const dec = decisions.find(d => d.id === o.decision_id);
            return {
              date: new Date(o.reviewed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              score: o.quality_score,
              name: dec?.asset_name || "Unknown"
            };
          });
        
        if (chartData.length === 0) {
          // Mock data if none exists
          for (let i = 10; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            chartData.push({
              date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              score: 50 + Math.random() * 40,
              name: "Mock Trade"
            });
          }
        }

        // 7. Recent Decisions
        const recentDecisions = decisions.slice(0, 5);

        // 10. Pending Reviews
        const today = new Date();
        const pendingReviews = decisions.filter(d => {
          if (d.status !== 'open') return false;
          const reviewDate = new Date(d.thesis_review_date || d.created_at);
          // If no review date, mock it
          if (!d.thesis_review_date) {
             reviewDate.setDate(reviewDate.getDate() + 7);
          }
          return reviewDate < today;
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
            { id: "1", pattern_label: "FOMO on momentum stocks", frequency_label: "7 of last 10 losing trades", avg_return_impact: -4.2 },
            { id: "2", pattern_label: "Exiting winners too early", frequency_label: "12 of 30 winning trades", avg_return_impact: -8.5 },
            { id: "3", pattern_label: "Revenge trading post-loss", frequency_label: "4 instances detected", avg_return_impact: -12.1 }
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
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 text-[#5a5a5a] animate-spin" />
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

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-24 text-[#f0f0f0]">
      
      {/* SECTION 1 — TOP ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        
        {/* Card 1 — Total Holdings */}
        <div className="lg:col-span-3 bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col justify-between">
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
        <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-[#5a5a5a] text-sm font-medium mb-1">Decisions Logged</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono tracking-tight">{data.decisionCountTotal}</span>
              <span className="text-[#5a5a5a] text-xs">{data.decisionCountMonth} this month</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#161616] border border-[#222] text-xs text-[#5a5a5a]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></div>
              {data.streak}-day streak
            </span>
          </div>
        </div>

        {/* Card 3 — Decision Quality Score */}
        <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-[#5a5a5a] text-sm font-medium mb-1">Avg Quality Score</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono tracking-tight">{data.avgQualityScore}</span>
              <span className="text-[#5a5a5a] text-xs">/ 100</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="text-[#5a5a5a]">Based on {data.reviewedCount} reviewed decisions</span>
            <span className="flex items-center text-[#22c55e]">
              <ArrowUpRight className="w-3 h-3" /> {data.scoreTrend}%
            </span>
          </div>
        </div>

        {/* Card 4 — My Recent Decisions */}
        <div className="lg:col-span-5 bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[#5a5a5a] text-sm font-medium">Recent Decisions</h3>
            <Link href="/decisions" className="text-xs text-[#f0f0f0] hover:text-[#22c55e] transition-colors">See all</Link>
          </div>
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 min-w-max pb-2">
              {data.recentDecisions.map(d => (
                <div key={d.id} className="w-64 bg-[#161616] border border-[#222] rounded p-3 flex flex-col gap-2 shrink-0 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-sm font-semibold">{d.asset_name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#111] border border-[#222] text-[10px] text-[#5a5a5a] uppercase">
                      {d.asset_type}
                    </span>
                  </div>
                  <p className="text-xs text-[#5a5a5a] truncate">{d.thesis}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-mono text-xs">₹{d.entry_price}</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-[#5a5a5a]">
                      <div className={`w-1.5 h-1.5 rounded-full ${d.status === 'open' ? 'bg-white' : d.status === 'reviewed' ? 'bg-[#22c55e]' : 'bg-amber-500'}`} />
                      {d.status === 'pending_review' ? 'Pending' : d.status === 'reviewed' ? 'Reviewed' : 'Open'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>

      {/* SECTION 2 — MAIN CHART + PATTERNS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 70% — Decision Performance Chart */}
        <div className="lg:col-span-8 bg-[#111] border border-[#222] rounded-lg p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#f0f0f0] text-base font-medium">Decision Quality Over Time</h3>
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
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="0" x2="100" y2="0" stroke="#222" strokeWidth="0.5" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="#222" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#222" strokeWidth="0.5" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="#222" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="100" y2="100" stroke="#222" strokeWidth="0.5" />
              
              <polygon points={`${chartPoints} 100,100 0,100`} fill="url(#chartFill)" />
              <polyline points={chartPoints} fill="none" stroke="#22c55e" strokeWidth="1.5" />
            </svg>
            
            {/* Tooltip Hover State */}
            {hoveredChartPoint && (
              <>
                <div 
                  className="absolute top-0 bottom-0 w-px border-l border-dashed border-[#5a5a5a] pointer-events-none"
                  style={{ left: `${hoveredChartPoint.x}%` }}
                />
                <div 
                  className="absolute w-2 h-2 rounded-full bg-[#22c55e] border-2 border-[#111] pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${hoveredChartPoint.x}%`, top: `${100 - hoveredChartPoint.score}%` }}
                />
                <div 
                  className={`absolute z-10 bg-[#161616] border border-[#222] rounded p-3 pointer-events-none shadow-xl ${hoveredChartPoint.x > 50 ? '-translate-x-[110%]' : 'translate-x-[10%]'}`}
                  style={{ left: `${hoveredChartPoint.x}%`, top: '10%' }}
                >
                  <p className="text-[10px] text-[#5a5a5a] mb-1">{hoveredChartPoint.date}</p>
                  <p className="text-xs font-medium text-[#f0f0f0]">{hoveredChartPoint.name}</p>
                  <p className="font-mono text-sm text-[#22c55e] mt-1">Score: {hoveredChartPoint.score}</p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-6 text-[11px] font-mono text-[#5a5a5a]">
              <span>Best decision: <span className="text-[#22c55e]">+{Math.round(bestDecision)} score</span></span>
              <span>Worst decision: <span className="text-[#ef4444]">{Math.round(worstDecision)} score</span></span>
            </div>
          </div>
        </div>

        {/* Right 30% — Behavioral Patterns */}
        <div className="lg:col-span-4 bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col h-full">
          <h3 className="text-[#f0f0f0] text-base font-medium mb-5">Your Patterns</h3>
          <div className="flex-1 flex flex-col gap-3">
            {data.patterns.map((p) => (
              <div key={p.id} className="bg-[#161616] border border-[#222] rounded p-3 group hover:border-[#333] transition-colors">
                <p className="text-sm font-medium text-[#f0f0f0] mb-1">{p.pattern_label}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5a5a5a]">{p.frequency_label}</span>
                  <span className="font-mono text-[#ef4444]">{p.avg_return_impact}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-[10px] text-[#5a5a5a] leading-relaxed">
              Based on {data.reviewedCount} reviewed decisions — update by reviewing {data.pendingReviews.length} pending decisions.
            </p>
            <Link href="/patterns" className="inline-flex items-center gap-1 text-[11px] text-[#f0f0f0] hover:text-[#22c55e] transition-colors uppercase tracking-wider">
              Full analysis <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 3 — BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left — Portfolio Overview Table */}
        <div className="lg:col-span-8 bg-[#111] border border-[#222] rounded-lg p-5 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#f0f0f0] text-base font-medium">Open Positions</h3>
            <div className="flex gap-2">
              {['All', 'Stocks', 'MF', 'Crypto'].map(f => (
                <button 
                  key={f}
                  onClick={() => setOpenPositionsFilter(f)}
                  className={`px-3 py-1 text-[10px] rounded-full border transition-colors ${openPositionsFilter === f ? 'bg-[#161616] border-[#333] text-[#f0f0f0]' : 'border-transparent text-[#5a5a5a] hover:text-[#f0f0f0]'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="text-[#5a5a5a] border-b border-[#222]">
                <th className="pb-3 font-normal">Asset</th>
                <th className="pb-3 font-normal font-mono text-right">Entry Price</th>
                <th className="pb-3 font-normal font-mono text-right">Current Price</th>
                <th className="pb-3 font-normal font-mono text-right">Change %</th>
                <th className="pb-3 font-normal text-center">Quality</th>
                <th className="pb-3 font-normal">Bias Tag</th>
                <th className="pb-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions.map((p, idx) => (
                <tr key={p.id} className={`border-b border-[#222] hover:bg-white/5 transition-colors cursor-pointer ${idx === filteredPositions.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="py-3 font-mono font-medium">{p.asset_name}</td>
                  <td className="py-3 font-mono text-right text-[#5a5a5a]">₹{p.entry_price.toLocaleString("en-IN", {maximumFractionDigits:2})}</td>
                  <td className="py-3 font-mono text-right">₹{p.current_price.toLocaleString("en-IN", {maximumFractionDigits:2})}</td>
                  <td className={`py-3 font-mono text-right ${p.change_pct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {p.change_pct > 0 ? '+' : ''}{p.change_pct.toFixed(2)}%
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded bg-[#161616] border border-[#222] font-mono text-[10px]">
                      {p.quality_score || '--'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="font-mono text-[10px] text-[#5a5a5a] uppercase">{p.bias}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#5a5a5a]">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'open' ? 'bg-white' : 'bg-amber-500'}`} />
                      {p.status === 'open' ? 'Open' : 'Pending'}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPositions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5a5a5a]">No positions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right — Pending Reviews */}
        <div className="lg:col-span-4 bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col h-full">
          <h3 className="text-[#f0f0f0] text-base font-medium mb-5">Awaiting Review</h3>
          <div className="flex-1 flex flex-col gap-0 divide-y divide-[#222]">
            {data.pendingReviews.map(r => {
              const daysOverdue = Math.floor((new Date().getTime() - new Date(r.thesis_review_date || r.created_at).getTime()) / (1000 * 3600 * 24));
              return (
                <div key={r.id} className="py-3 flex items-center justify-between group">
                  <div>
                    <p className="font-mono text-sm">{r.asset_name}</p>
                    <p className={`text-[10px] mt-0.5 ${daysOverdue > 7 ? 'text-amber-500' : 'text-[#5a5a5a]'}`}>
                      {daysOverdue > 0 ? `${daysOverdue} days overdue` : 'Due today'}
                    </p>
                  </div>
                  <Link href={`/review/${r.id}`} className="text-xs text-[#5a5a5a] group-hover:text-[#f0f0f0] transition-colors border border-[#222] rounded px-3 py-1 hover:bg-white/5">
                    Review
                  </Link>
                </div>
              );
            })}
            {data.pendingReviews.length === 0 && (
              <div className="py-8 text-center text-[#5a5a5a] text-sm">
                All caught up. No pending reviews.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
