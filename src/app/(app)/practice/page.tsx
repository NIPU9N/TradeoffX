"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Loader2, RefreshCw, TrendingDown, TrendingUp, Wallet, XCircle } from "lucide-react";
import { closePracticePosition, getPracticePortfolio, getPracticePositions, resetPracticePortfolio } from "@/lib/api";
import { KNOWN_ASSETS } from "@/lib/assets";
import { cn } from "@/lib/utils";

type Portfolio = {
  virtual_capital: number;
  current_value: number;
  total_return_percent: number;
  total_return_amount: number;
};

type Position = {
  id: string;
  asset_name: string;
  asset_type: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  investment_amount: number;
  current_value: number;
  return_amount: number;
  return_percent: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at: string | null;
  exit_price: number | null;
};

type PortfolioMetrics = {
  deployed_capital: number;
  free_capital: number;
  unrealized_pnl: number;
  open_positions: number;
};

type BatchPrices = Record<string, { current_price?: number }>;

export default function PracticePortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const symbolByAssetName = useMemo(
    () => Object.fromEntries(KNOWN_ASSETS.map((a) => [a.name, a.symbol])),
    []
  );

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const [{ portfolio: portfolioRes, metrics }, { positions: positionsRes }] = await Promise.all([
        getPracticePortfolio(),
        getPracticePositions(),
      ]);

      const normalized = (positionsRes || []) as Position[];
      setPortfolio(portfolioRes);
      setMetrics(metrics ?? null);
      setPositions(normalized);

      const openSymbols = normalized
        .filter((p) => p.status === "open")
        .map((p) => symbolByAssetName[p.asset_name])
        .filter((s): s is string => Boolean(s));

      if (openSymbols.length) {
        const priceRes = await fetch("/api/prices/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols: [...new Set(openSymbols)] }),
        });
        if (priceRes.ok) {
          const json: BatchPrices = await priceRes.json();
          const mapped: Record<string, number> = {};
          Object.entries(symbolByAssetName).forEach(([assetName, symbol]) => {
            const price = json?.[symbol]?.current_price;
            if (typeof price === "number") mapped[assetName] = price;
          });
          setLivePrices(mapped);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load practice portfolio";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [symbolByAssetName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const computedOpenPnL = useMemo(() => {
    return positions
      .filter((p) => p.status === "open")
      .reduce((sum, p) => {
        const mark = livePrices[p.asset_name] ?? Number(p.current_price);
        return sum + (mark * Number(p.quantity) - Number(p.investment_amount));
      }, 0);
  }, [positions, livePrices]);

  const handleClosePosition = async (position: Position) => {
    const defaultPrice = livePrices[position.asset_name] ?? Number(position.current_price);
    const input = window.prompt(`Exit price for ${position.asset_name}`, String(defaultPrice.toFixed(2)));
    const exitPrice = input ? Number(input) : 0;
    if (!exitPrice || Number.isNaN(exitPrice) || exitPrice <= 0) return;

    try {
      setClosingPositionId(position.id);
      await closePracticePosition(position.id, exitPrice);
      await loadData(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to close position";
      setError(message);
    } finally {
      setClosingPositionId(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset practice portfolio to ₹10,00,000 and clear all positions?")) return;
    try {
      await resetPracticePortfolio();
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset practice portfolio";
      setError(message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-tx-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-syne text-4xl font-bold">Practice Portfolio</h1>
          <p className="text-tx-text-secondary mt-2">Virtual capital. Real discipline. Zero regret tuition.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadData(true)}
            className="px-4 py-2 rounded-xl border border-tx-border bg-tx-card text-tx-text-secondary hover:text-white"
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin text-tx-primary")} />
              Refresh
            </span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl border border-tx-danger/40 bg-tx-danger/10 text-tx-danger hover:bg-tx-danger/20"
          >
            Reset Portfolio
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-tx-danger/10 border border-tx-danger/30 text-tx-danger">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card label="Virtual Capital" value={`₹${Number(portfolio?.virtual_capital || 0).toLocaleString()}`} icon={<Wallet className="w-5 h-5 text-tx-primary" />} />
        <Card label="Current Value" value={`₹${Number(portfolio?.current_value || 0).toLocaleString()}`} icon={<Gamepad2 className="w-5 h-5 text-tx-secondary" />} />
        <Card
          label="Total Return"
          value={`${Number(portfolio?.total_return_amount || 0) >= 0 ? "+" : "-"}₹${Math.abs(Number(portfolio?.total_return_amount || 0)).toLocaleString()}`}
          icon={Number(portfolio?.total_return_amount || 0) >= 0 ? <TrendingUp className="w-5 h-5 text-tx-primary" /> : <TrendingDown className="w-5 h-5 text-tx-danger" />}
        />
        <Card
          label="Open P&L (Live)"
          value={`${computedOpenPnL >= 0 ? "+" : "-"}₹${Math.abs(computedOpenPnL).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          icon={computedOpenPnL >= 0 ? <TrendingUp className="w-5 h-5 text-tx-primary" /> : <TrendingDown className="w-5 h-5 text-tx-danger" />}
        />
      </div>
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            label="Free Capital"
            value={`₹${Number(metrics.free_capital).toLocaleString()}`}
            icon={<RefreshCw className="w-5 h-5 text-tx-secondary" />}
          />
          <Card
            label="Open Positions"
            value={`${metrics.open_positions}`}
            icon={<Gamepad2 className="w-5 h-5 text-tx-primary" />}
          />
          <Card
            label="Unrealized P&L"
            value={`${metrics.unrealized_pnl >= 0 ? "+" : "-"}₹${Math.abs(metrics.unrealized_pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            icon={metrics.unrealized_pnl >= 0 ? <TrendingUp className="w-5 h-5 text-tx-primary" /> : <TrendingDown className="w-5 h-5 text-tx-danger" />}
          />
        </div>
      )}

      <section className="glass-card p-6">
        <h2 className="font-syne text-xl font-bold mb-4">Open Positions</h2>
        <div className="space-y-3">
          {positions.filter((p) => p.status === "open").length === 0 && (
            <p className="text-tx-text-secondary py-10 text-center">No open positions yet. Log a practice decision and execute it.</p>
          )}
          {positions
            .filter((p) => p.status === "open")
            .map((position) => {
              const mark = livePrices[position.asset_name] ?? Number(position.current_price);
              const pnl = mark * Number(position.quantity) - Number(position.investment_amount);
              const pnlPct = Number(position.investment_amount) > 0 ? (pnl / Number(position.investment_amount)) * 100 : 0;
              return (
                <motion.div key={position.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl border border-tx-border bg-tx-bg/50 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-syne font-bold text-white">{position.asset_name}</div>
                    <div className="text-xs text-tx-text-muted uppercase">{position.asset_type.replace("_", " ")} • Qty {position.quantity}</div>
                    <div className="text-xs text-tx-text-secondary mt-1">Entry ₹{Number(position.entry_price).toFixed(2)} • Live ₹{mark.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("font-mono font-bold", pnl >= 0 ? "text-tx-primary" : "text-tx-danger")}>
                      {pnl >= 0 ? "+" : "-"}₹{Math.abs(pnl).toFixed(2)}
                    </div>
                    <div className={cn("text-xs", pnl >= 0 ? "text-tx-primary" : "text-tx-danger")}>
                      {pnl >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                    </div>
                  </div>
                  <button
                    onClick={() => handleClosePosition(position)}
                    disabled={closingPositionId === position.id}
                    className="px-3 py-2 rounded-lg border border-tx-danger/40 bg-tx-danger/10 text-tx-danger hover:bg-tx-danger/20 disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {closingPositionId === position.id ? "Closing..." : "Close"}
                    </span>
                  </button>
                </motion.div>
              );
            })}
        </div>
      </section>

      <section className="glass-card p-6">
        <h2 className="font-syne text-xl font-bold mb-4">Closed Positions</h2>
        <div className="space-y-3">
          {positions.filter((p) => p.status === "closed").length === 0 && (
            <p className="text-tx-text-secondary py-8 text-center">No closed positions yet.</p>
          )}
          {positions
            .filter((p) => p.status === "closed")
            .map((position) => (
              <div key={position.id} className="p-4 rounded-xl border border-tx-border bg-tx-bg/50 flex items-center justify-between">
                <div>
                  <div className="font-medium">{position.asset_name}</div>
                  <div className="text-xs text-tx-text-muted">Closed {position.closed_at ? new Date(position.closed_at).toLocaleDateString("en-IN") : "-"}</div>
                </div>
                <div className={cn("font-mono font-bold", Number(position.return_amount) >= 0 ? "text-tx-primary" : "text-tx-danger")}>
                  {Number(position.return_amount) >= 0 ? "+" : "-"}₹{Math.abs(Number(position.return_amount)).toFixed(2)}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

function Card({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="glass-card p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs uppercase tracking-wider text-tx-text-secondary">{label}</span>
        {icon}
      </div>
      <div className="font-mono text-2xl font-bold">{value}</div>
    </div>
  );
}
