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
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div>
          <h1 className="font-syne text-4xl font-bold text-[#f0f0f0]">Practice Portfolio</h1>
          <p className="text-[#5a5a5a] text-sm mt-1">{isPractice ? "Virtual capital. real discipline. Zero regret tuition." : "Switch to Practice Mode to use this view."}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => loadData(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] border border-[#222] text-[#f0f0f0] text-sm hover:border-[#333] transition-colors">
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin text-[#10B981]")} /> Refresh
          </button>
          <button onClick={handleReset} className="px-4 py-2 rounded-full border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] text-sm hover:bg-[#ef4444]/20 transition-colors">
            Reset Portfolio
          </button>
        </div>
      </motion.div>

      {error && <div className="p-4 rounded-[8px] bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm">{error}</div>}

      {/* Stats Row 1 */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        {[
          { label: "VIRTUAL CAPITAL", value: `₹${Number(portfolio?.virtual_capital || 0).toLocaleString()}`, icon: <Wallet className="w-4 h-4 text-[#10B981]" /> },
          { label: "CURRENT VALUE", value: `₹${Number(portfolio?.current_value || 0).toLocaleString()}`, icon: <Gamepad2 className="w-4 h-4 text-[#10B981]" /> },
          { label: "TOTAL RETURN", value: `${Number(portfolio?.total_return_amount || 0) >= 0 ? "+" : "-"}₹${Math.abs(Number(portfolio?.total_return_amount || 0)).toLocaleString()}`, icon: Number(portfolio?.total_return_amount || 0) >= 0 ? <TrendingUp className="w-4 h-4 text-[#10B981]" /> : <TrendingDown className="w-4 h-4 text-[#ef4444]" />, positive: Number(portfolio?.total_return_amount || 0) >= 0 },
          { label: "OPEN P&L (LIVE)", value: `${computedOpenPnL >= 0 ? "+" : "-"}₹${Math.abs(computedOpenPnL).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: computedOpenPnL >= 0 ? <TrendingUp className="w-4 h-4 text-[#10B981]" /> : <TrendingDown className="w-4 h-4 text-[#ef4444]" />, positive: computedOpenPnL >= 0 },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-[#222] rounded-[8px] p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] text-[#5a5a5a] uppercase tracking-widest">{s.label}</span>
              {s.icon}
            </div>
            <div className={cn("font-mono text-xl font-bold", (s as any).positive === false ? "text-[#ef4444]" : "text-[#f0f0f0]")}>{s.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Stats Row 2 */}
      {metrics && (
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
          {[
            { label: "FREE CAPITAL", value: `₹${Number(metrics.free_capital).toLocaleString()}`, icon: <RefreshCw className="w-4 h-4 text-[#10B981]" /> },
            { label: "OPEN POSITIONS", value: `${metrics.open_positions}`, icon: <Gamepad2 className="w-4 h-4 text-[#10B981]" /> },
            { label: "UNREALIZED P&L", value: `${computedOpenPnL >= 0 ? "+" : "-"}₹${Math.abs(computedOpenPnL).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: computedOpenPnL >= 0 ? <TrendingUp className="w-4 h-4 text-[#10B981]" /> : <TrendingDown className="w-4 h-4 text-[#ef4444]" />, positive: computedOpenPnL >= 0 },
          ].map((s) => (
            <div key={s.label} className="bg-[#111] border border-[#222] rounded-[8px] p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-[#5a5a5a] uppercase tracking-widest">{s.label}</span>
                {s.icon}
              </div>
              <div className={cn("font-mono text-xl font-bold", (s as any).positive === false ? "text-[#ef4444]" : "text-[#f0f0f0]")}>{s.value}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Main Grid */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        {/* Price Lookup */}
        <div className="lg:col-span-7 bg-[#111] border border-[#222] rounded-[8px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] text-[#5a5a5a] uppercase tracking-widest mb-1">Stock Price Fetcher</p>
              <h2 className="text-[#f0f0f0] text-sm font-medium">Live quote lookup</h2>
            </div>
            <span className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">Practice Mode</span>
          </div>
          <div className="relative">
            <input type="text" value={priceLookupQuery} onChange={(e) => setPriceLookupQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookupStockPrice()} placeholder="Search by symbol or company name" className="w-full bg-[#161616] border border-[#222] rounded-[8px] px-4 py-3 text-[#f0f0f0] text-sm placeholder:text-[#5a5a5a] focus:outline-none focus:border-[#10B981] transition-colors" />
            <button onClick={() => handleLookupStockPrice()} disabled={priceLookupLoading} className="absolute right-2 top-2 px-4 py-1.5 rounded-[6px] bg-[#10B981] text-[#0A0A14] text-xs font-bold disabled:opacity-50 transition-opacity">
              {priceLookupLoading ? "..." : "Fetch"}
            </button>
          </div>
          {priceLookupError && <p className="mt-3 text-xs text-[#ef4444]">{priceLookupError}</p>}
          {stockSuggestions.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {stockSuggestions.map((asset) => (
                <button key={asset.symbol} onClick={() => handleLookupStockPrice(asset.name)} className="text-left bg-[#161616] border border-[#222] rounded-[6px] px-3 py-2 hover:border-[#10B981]/40 transition-colors">
                  <div className="text-sm font-medium text-[#f0f0f0]">{asset.name}</div>
                  <div className="text-[10px] text-[#5a5a5a] uppercase tracking-widest">{asset.symbol}</div>
                </button>
              ))}
            </div>
          )}
          {priceLookupResult && (
            <div className="mt-5 bg-[#161616] border border-[#222] rounded-[8px] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#5a5a5a] uppercase tracking-widest mb-1">{priceLookupSymbol}</p>
                  <p className="font-mono text-2xl font-bold text-[#f0f0f0]">₹{priceLookupResult.current_price.toFixed(2)}</p>
                </div>
                {priceLookupResult.change_percent != null && (
                  <span className={cn("font-mono text-sm font-bold px-3 py-1 rounded-full", priceLookupResult.change_percent >= 0 ? "text-[#10B981] bg-[#10B981]/10" : "text-[#ef4444] bg-[#ef4444]/10")}>
                    {priceLookupResult.change_percent >= 0 ? "+" : ""}{priceLookupResult.change_percent.toFixed(2)}%
                  </span>
                )}
              </div>
              {priceLookupResult.last_updated && <p className="text-[10px] text-[#5a5a5a] mt-2">Updated {new Date(priceLookupResult.last_updated).toLocaleTimeString("en-IN")}</p>}
            </div>
          )}
        </div>

        {/* Live Feed */}
        <div className="lg:col-span-5 bg-[#111] border border-[#222] rounded-[8px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] text-[#5a5a5a] uppercase tracking-widest mb-1">Live Price Refresh</p>
              <h2 className="text-[#f0f0f0] text-sm font-medium">Open position feed</h2>
            </div>
            <span className={cn("text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border", openAssetNames.length ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" : "bg-[#222] text-[#5a5a5a] border-[#333]")}>
              {openAssetNames.length ? "Streaming" : "Idle"}
            </span>
          </div>
          <p className="text-[10px] text-[#5a5a5a] mb-4">{lastPriceRefresh ? `Last refreshed at ${lastPriceRefresh}` : "Fetching prices..."}</p>
          <div className="space-y-2">
            {openAssetNames.length === 0 ? (
              <p className="text-sm text-[#5a5a5a] py-6 text-center">Open a practice trade to see live prices here.</p>
            ) : openAssetNames.map((assetName) => {
              const price = livePrices[assetName];
              return (
                <div key={assetName} className="flex items-center justify-between bg-[#161616] border border-[#222] rounded-[6px] px-4 py-3 hover:border-[#333] transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#f0f0f0]">{assetName}</p>
                    <p className="text-[10px] text-[#5a5a5a]">Live stock price</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-[#f0f0f0]">{price ? `₹${price.current_price.toFixed(2)}` : "–"}</p>
                    {price?.change_percent != null && (
                      <p className={cn("text-[11px] font-mono font-bold", price.change_percent >= 0 ? "text-[#10B981]" : "text-[#ef4444]")}>
                        {price.change_percent >= 0 ? "+" : ""}{price.change_percent.toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Open Positions */}
      <motion.div className="bg-[#111] border border-[#222] rounded-[8px] p-5 shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
        <h2 className="text-[#f0f0f0] text-sm font-medium mb-5">Open Positions</h2>
        {positions.filter((p) => p.status === "open").length === 0 ? (
          <p className="text-[#5a5a5a] text-sm py-10 text-center">No practice trades yet. ₹10,00,000 is just sitting there. 🎮</p>
        ) : (
          <div className="space-y-3">
            {positions.filter((p) => p.status === "open").map((position) => {
              const livePrice = livePrices[position.asset_name];
              const mark = livePrice?.current_price ?? Number(position.current_price);
              const priceChange = livePrice?.change_percent;
              const pnl = mark * Number(position.quantity) - Number(position.investment_amount);
              const pnlPct = Number(position.investment_amount) > 0 ? (pnl / Number(position.investment_amount)) * 100 : 0;
              return (
                <motion.div key={position.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between bg-[#161616] border border-[#222] rounded-[6px] px-4 py-4 hover:border-[#333] transition-colors gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-syne font-bold text-[#f0f0f0] text-sm">{position.asset_name}</p>
                    <p className="text-[10px] text-[#5a5a5a] uppercase tracking-widest mt-0.5">{position.asset_type.replace("_", " ")} • QTY {position.quantity}</p>
                    <p className="text-[11px] text-[#5a5a5a] mt-1">
                      Entry ₹{Number(position.entry_price).toFixed(2)} • Live ₹{mark.toFixed(2)}
                      {priceChange != null && (
                        <span className={cn("ml-2 font-mono", priceChange >= 0 ? "text-[#10B981]" : "text-[#ef4444]")}>
                          {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-mono font-bold text-sm", pnl >= 0 ? "text-[#10B981]" : "text-[#ef4444]")}>{pnl >= 0 ? "+" : "-"}₹{Math.abs(pnl).toFixed(2)}</p>
                    <p className={cn("text-[11px] font-mono", pnl >= 0 ? "text-[#10B981]" : "text-[#ef4444]")}>{pnl >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%</p>
                  </div>
                  <button onClick={() => handleClosePosition(position)} disabled={closingPositionId === position.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] text-xs hover:bg-[#ef4444]/20 disabled:opacity-50 transition-colors flex-shrink-0">
                    <XCircle className="w-3.5 h-3.5" />{closingPositionId === position.id ? "Closing..." : "Close"}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Closed Positions */}
      <motion.div className="bg-[#111] border border-[#222] rounded-[8px] p-5 shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
        <h2 className="text-[#f0f0f0] text-sm font-medium mb-5">Closed Positions</h2>
        {positions.filter((p) => p.status === "closed").length === 0 ? (
          <p className="text-[#5a5a5a] text-sm py-8 text-center">No closed practice trades yet. Close a position to see how your thesis played out.</p>
        ) : (
          <div className="space-y-2">
            {positions.filter((p) => p.status === "closed").map((position) => (
              <div key={position.id} className="flex items-center justify-between bg-[#161616] border border-[#222] rounded-[6px] px-4 py-3 hover:border-[#333] transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#f0f0f0]">{position.asset_name}</p>
                  <p className="text-[10px] text-[#5a5a5a] mt-0.5">Closed {position.closed_at ? new Date(position.closed_at).toLocaleDateString("en-IN") : "-"} • Exit ₹{Number(position.exit_price || 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className={cn("font-mono font-bold text-sm", Number(position.return_amount) >= 0 ? "text-[#10B981]" : "text-[#ef4444]")}>{Number(position.return_amount) >= 0 ? "+" : "-"}₹{Math.abs(Number(position.return_amount)).toFixed(2)}</p>
                  <p className={cn("text-[11px] font-mono", Number(position.return_percent) >= 0 ? "text-[#10B981]" : "text-[#ef4444]")}>{Number(position.return_percent) >= 0 ? "+" : ""}{Number(position.return_percent).toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
  );
}

