"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Loader2, RefreshCw, TrendingDown, TrendingUp, Wallet, XCircle } from "lucide-react";
import { closePracticePosition, getPracticePortfolio, getPracticePositions, resetPracticePortfolio } from "@/lib/api";
import { useMode } from "@/context/ModeContext";
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

type LivePriceData = {
  current_price: number;
  change_percent: number | null;
  last_updated: string | null;
};

type BatchPrices = Record<string, LivePriceData | null>;

export default function PracticePortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, LivePriceData>>({});
  const [lastPriceRefresh, setLastPriceRefresh] = useState<string | null>(null);
  const [priceLookupQuery, setPriceLookupQuery] = useState("");
  const [priceLookupResult, setPriceLookupResult] = useState<LivePriceData | null>(null);
  const [priceLookupSymbol, setPriceLookupSymbol] = useState<string | null>(null);
  const [priceLookupLoading, setPriceLookupLoading] = useState(false);
  const [priceLookupError, setPriceLookupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isPractice } = useMode();

  const symbolByAssetName = useMemo(
    () => Object.fromEntries(KNOWN_ASSETS.map((a) => [a.name, a.symbol])),
    []
  );
  const assetNameBySymbol = useMemo(
    () => Object.fromEntries(KNOWN_ASSETS.map((a) => [a.symbol, a.name])),
    []
  );

  const openAssetNames = useMemo(
    () => positions.filter((p) => p.status === "open").map((p) => p.asset_name),
    [positions]
  );

  const refreshLivePrices = useCallback(async (positionList: Position[]) => {
    try {
      const openSymbols = positionList
        .filter((p) => p.status === "open")
        .map((p) => symbolByAssetName[p.asset_name])
        .filter((s): s is string => Boolean(s));

      if (!openSymbols.length) {
        setLivePrices({});
        return;
      }

      const priceRes = await fetch("/api/prices/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: [...new Set(openSymbols)] }),
      });

      if (!priceRes.ok) return;

      const json: BatchPrices = await priceRes.json();
      const mapped: Record<string, LivePriceData> = {};

      Object.entries(assetNameBySymbol).forEach(([symbol, assetName]) => {
        const price = json?.[symbol];
        if (price?.current_price != null) {
          mapped[assetName] = {
            current_price: price.current_price,
            change_percent: price.change_percent ?? null,
            last_updated: price.last_updated ?? null,
          };
        }
      });

      setLivePrices(mapped);
      setLastPriceRefresh(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Failed to refresh live prices", err);
    }
  }, [assetNameBySymbol, symbolByAssetName]);

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
      await refreshLivePrices(normalized);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load practice portfolio";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshLivePrices]);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshLivePrices(positions);
    }, 10000);

    return () => clearInterval(interval);
  }, [positions, refreshLivePrices]);

  const computedOpenPnL = useMemo(() => {
    return positions
      .filter((p) => p.status === "open")
      .reduce((sum, p) => {
        const mark = livePrices[p.asset_name]?.current_price ?? Number(p.current_price);
        return sum + (mark * Number(p.quantity) - Number(p.investment_amount));
      }, 0);
  }, [positions, livePrices]);

  const handleClosePosition = async (position: Position) => {
    const defaultPrice = livePrices[position.asset_name]?.current_price ?? Number(position.current_price);
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

  const stockSuggestions = useMemo(() => {
    const query = priceLookupQuery.trim().toLowerCase();
    if (!query) return [];
    return KNOWN_ASSETS.filter((asset) =>
      asset.name.toLowerCase().includes(query) || asset.symbol.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [priceLookupQuery]);

  const resolveSymbol = (query: string) => {
    const normalized = query.trim().toLowerCase();
    const exactSymbol = KNOWN_ASSETS.find((asset) => asset.symbol.toLowerCase() === normalized);
    if (exactSymbol) return exactSymbol.symbol;

    const exactName = KNOWN_ASSETS.find((asset) => asset.name.toLowerCase() === normalized);
    if (exactName) return exactName.symbol;

    const partialMatch = KNOWN_ASSETS.find((asset) =>
      asset.name.toLowerCase().includes(normalized) || asset.symbol.toLowerCase().includes(normalized)
    );
    return partialMatch ? partialMatch.symbol : query.trim();
  };

  const handleLookupStockPrice = async (query?: string) => {
    const lookupText = query ?? priceLookupQuery;
    const target = resolveSymbol(lookupText);
    if (!target) {
      setPriceLookupError("Enter a stock symbol or known asset name.");
      return;
    }

    setPriceLookupLoading(true);
    setPriceLookupError(null);

    try {
      const res = await fetch(`/api/prices?symbol=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch symbol price");
      }

      setPriceLookupResult({
        current_price: data.current_price,
        change_percent: data.change_percent ?? null,
        last_updated: data.last_updated ?? null,
      });
      setPriceLookupSymbol(target);
      setPriceLookupQuery(query ? query : lookupText);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Price lookup failed";
      setPriceLookupError(message);
    } finally {
      setPriceLookupLoading(false);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-syne text-4xl font-bold">Practice Portfolio</h1>
          <p className="text-tx-text-secondary mt-2 max-w-2xl">
            {isPractice
              ? "Virtual capital. real discipline. Zero regret tuition."
              : "This view is optimized for Practice Mode, where you can test ideas before committing real capital."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadData(true)}
            className="px-4 py-2 rounded-xl bg-tx-primary text-tx-bg font-semibold transition-all hover:opacity-90"
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin text-tx-bg")} />
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

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className="glass-card p-6 border border-tx-border">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-tx-text-secondary mb-2">Stock price fetcher</p>
              <h2 className="font-syne text-xl font-bold">Live quote lookup</h2>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-[0.3em] bg-tx-primary/10 text-tx-primary border border-tx-primary/20">
              Practice mode
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={priceLookupQuery}
              onChange={(e) => setPriceLookupQuery(e.target.value)}
              placeholder="Search by symbol or company name"
              className="w-full bg-tx-bg border border-tx-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-tx-primary transition-colors"
            />
            <button
              onClick={() => handleLookupStockPrice()}
              disabled={priceLookupLoading}
              className="absolute right-2 top-2 px-4 py-2 rounded-xl bg-tx-primary text-tx-bg font-semibold text-sm transition-all disabled:opacity-50"
            >
              {priceLookupLoading ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {priceLookupError && (
            <p className="mt-3 text-sm text-tx-danger">{priceLookupError}</p>
          )}

          {stockSuggestions.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {stockSuggestions.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => handleLookupStockPrice(asset.name)}
                  className="text-left rounded-xl border border-tx-border bg-tx-card px-3 py-3 text-sm text-white transition hover:border-tx-primary hover:bg-tx-primary/10"
                >
                  <div className="font-semibold">{asset.name}</div>
                  <div className="text-[11px] text-tx-text-secondary uppercase tracking-[0.2em]">{asset.symbol}</div>
                </button>
              ))}
            </div>
          )}

          {priceLookupResult && (
            <div className="mt-5 rounded-3xl border border-tx-border bg-tx-bg/80 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-tx-text-secondary">{priceLookupSymbol}</p>
                  <p className="mt-2 text-2xl font-bold text-white">₹{priceLookupResult.current_price.toFixed(2)}</p>
                </div>
                {priceLookupResult.change_percent != null && (
                  <div className={cn(
                    "rounded-full px-3 py-1 text-sm font-semibold",
                    priceLookupResult.change_percent >= 0 ? "bg-tx-primary/15 text-tx-primary" : "bg-tx-danger/15 text-tx-danger"
                  )}>
                    {priceLookupResult.change_percent >= 0 ? "+" : ""}{priceLookupResult.change_percent.toFixed(2)}%
                  </div>
                )}
              </div>
              {priceLookupResult.last_updated && (
                <p className="mt-3 text-xs text-tx-text-secondary">Updated at {new Date(priceLookupResult.last_updated).toLocaleTimeString("en-IN")}</p>
              )}
            </div>
          )}
        </div>

        <div className="glass-card p-6 border border-tx-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-tx-text-secondary">Live price refresh</p>
              <h2 className="font-syne text-xl font-bold">Open position feed</h2>
            </div>
            <span className="text-xs uppercase tracking-[0.35em] px-3 py-1 rounded-full bg-tx-primary/10 text-tx-primary border border-tx-primary/20">
              {openAssetNames.length ? "Streaming" : "Idle"}
            </span>
          </div>
          <p className="text-sm text-tx-text-secondary">
            {lastPriceRefresh ? `Last refreshed at ${lastPriceRefresh}` : "Fetching latest prices for open practice positions..."}
          </p>
          <div className="mt-5 space-y-3">
            {openAssetNames.length === 0 ? (
              <p className="text-sm text-tx-text-secondary">Open a practice trade to see live price updates here.</p>
            ) : (
              openAssetNames.map((assetName) => {
                const price = livePrices[assetName];
                return (
                  <div key={assetName} className="flex items-center justify-between gap-4 rounded-xl border border-tx-border/70 bg-tx-bg/50 px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{assetName}</p>
                      <p className="text-xs text-tx-text-secondary">Live stock price</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-white">{price ? `₹${price.current_price.toFixed(2)}` : "–"}</p>
                      {price?.change_percent != null && (
                        <p className={cn(
                          "text-xs font-semibold",
                          price.change_percent >= 0 ? "text-tx-primary" : "text-tx-danger"
                        )}>
                          {price.change_percent >= 0 ? "+" : ""}{price.change_percent.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
            <p className="text-tx-text-secondary py-10 text-center">
              No practice trades yet. ₹10,00,000 is just sitting there. Bro what are you waiting for. 🎮
            </p>
          )}
          {positions
            .filter((p) => p.status === "open")
            .map((position) => {
              const livePrice = livePrices[position.asset_name];
              const mark = livePrice?.current_price ?? Number(position.current_price);
              const priceChange = livePrice?.change_percent;
              const pnl = mark * Number(position.quantity) - Number(position.investment_amount);
              const pnlPct = Number(position.investment_amount) > 0 ? (pnl / Number(position.investment_amount)) * 100 : 0;
              return (
                <motion.div key={position.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl border border-tx-border bg-tx-bg/50 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-syne font-bold text-white">{position.asset_name}</div>
                    <div className="text-xs text-tx-text-muted uppercase">{position.asset_type.replace("_", " ")} • Qty {position.quantity}</div>
                    <div className="text-xs text-tx-text-secondary mt-1">
                      Entry ₹{Number(position.entry_price).toFixed(2)} • Live ₹{mark.toFixed(2)}
                      {priceChange != null && (
                        <span className={cn(
                          "ml-3 font-mono text-xs",
                          priceChange >= 0 ? "text-tx-primary" : "text-tx-danger"
                        )}>
                          {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                        </span>
                      )}
                    </div>
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
            <p className="text-tx-text-secondary py-8 text-center">
              No closed practice trades yet. Close a position to see how your thesis played out.
            </p>
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
