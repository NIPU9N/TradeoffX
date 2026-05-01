"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Plus, Trash2, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Search, AlertCircle, Loader2, RefreshCw, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMode } from "@/context/ModeContext";
import { getWatchlist, createWatchlistItem, updateWatchlistItem, deleteWatchlistItem } from "@/lib/api";
import type { WatchlistItem, CreateWatchlistInput } from "@/types";
import { KNOWN_ASSETS } from "@/lib/assets";
import { useRouter } from "next/navigation";

type FilterTab = "all" | "watching" | "bought" | "skipped" | "review_due";

const SKIP_REASONS = [
  "Valuation too high", "Thesis invalidated", "Better opportunity found",
  "Macro headwinds", "Management concerns", "Position sizing", "Other"
];

// ---------- Add Modal ----------
function AddModal({ onClose, onAdd, mode }: { onClose: () => void; onAdd: (item: WatchlistItem) => void; mode: string }) {
  const [form, setForm] = useState<CreateWatchlistInput & { mode: string }>({
    asset_name: "", asset_symbol: "", asset_type: "stock",
    watching_thesis: "", what_would_make_me_buy: "", what_would_make_me_skip: "",
    target_entry_price: null, max_entry_price: null,
    review_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    mode,
  });
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = KNOWN_ASSETS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  const selectAsset = async (asset: typeof KNOWN_ASSETS[0]) => {
    setSearch(asset.name);
    setSearchOpen(false);
    setForm(f => ({ ...f, asset_name: asset.name, asset_symbol: asset.symbol, asset_type: asset.type }));
    setFetchingPrice(true);
    try {
      const res = await fetch(`/api/prices?symbol=${asset.symbol}`);
      const data = await res.json();
      if (data.current_price) setForm(f => ({ ...f, target_entry_price: data.current_price }));
    } catch (_) {}
    setFetchingPrice(false);
  };

  const handleSubmit = async () => {
    if (!form.asset_name) return setError("Asset name is required");
    if (!form.watching_thesis || form.watching_thesis.length < 10) return setError("Thesis must be at least 10 characters");
    setSaving(true);
    try {
      const { item } = await createWatchlistItem(form);
      onAdd(item);
      onClose();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0D0D17] border border-tx-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-syne text-2xl font-bold flex items-center gap-2"><Eye className="w-6 h-6 text-tx-primary" /> Add to Watchlist</h2>
          <button onClick={onClose} className="p-2 hover:bg-tx-card rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-5">
          {/* Asset Search */}
          <div className="relative">
            <label className="block text-sm text-tx-text-secondary mb-2">Stock / Asset *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-text-muted" />
              <input value={search} onChange={e => { setSearch(e.target.value); setSearchOpen(true); setForm(f => ({ ...f, asset_name: e.target.value, asset_symbol: "" })); }}
                onFocus={() => setSearchOpen(true)} onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                placeholder="Search by name or symbol..." className="w-full bg-tx-bg border border-tx-border rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-tx-primary" />
              {fetchingPrice && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-tx-primary" />}
            </div>
            {searchOpen && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#0D0D17] border border-tx-border rounded-xl overflow-hidden shadow-xl">
                {suggestions.map(a => (
                  <button key={a.symbol} onMouseDown={() => selectAsset(a)}
                    className="w-full px-4 py-3 flex justify-between items-center hover:bg-tx-primary/10 transition-colors">
                    <div className="text-left"><p className="text-sm font-medium text-white">{a.name}</p><p className="text-xs text-tx-text-muted">{a.type}</p></div>
                    <span className="text-xs font-mono text-tx-primary bg-tx-primary/10 px-2 py-1 rounded">{a.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Thesis */}
          <div>
            <label className="block text-sm text-tx-text-secondary mb-2">Why are you watching this? *</label>
            <textarea value={form.watching_thesis} onChange={e => setForm(f => ({ ...f, watching_thesis: e.target.value }))}
              placeholder="What's the thesis? What catalyst are you waiting for?" rows={3}
              className="w-full bg-tx-bg border border-tx-border rounded-xl p-3 text-white resize-none focus:outline-none focus:border-tx-primary" />
          </div>

          {/* Buy / Skip conditions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-tx-text-secondary mb-2">What would make you buy?</label>
              <textarea value={form.what_would_make_me_buy ?? ""} onChange={e => setForm(f => ({ ...f, what_would_make_me_buy: e.target.value }))}
                placeholder="e.g. Price drops to ₹1200, Q3 margins improve..." rows={2}
                className="w-full bg-tx-bg border border-tx-border rounded-xl p-3 text-white resize-none focus:outline-none focus:border-emerald-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-tx-text-secondary mb-2">What would make you skip?</label>
              <textarea value={form.what_would_make_me_skip ?? ""} onChange={e => setForm(f => ({ ...f, what_would_make_me_skip: e.target.value }))}
                placeholder="e.g. Revenue misses, valuation > 30x PE..." rows={2}
                className="w-full bg-tx-bg border border-tx-border rounded-xl p-3 text-white resize-none focus:outline-none focus:border-red-500 text-sm" />
            </div>
          </div>

          {/* Price targets */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-tx-text-secondary mb-2">Target Entry (₹)</label>
              <input type="number" value={form.target_entry_price ?? ""} onChange={e => setForm(f => ({ ...f, target_entry_price: parseFloat(e.target.value) || null }))}
                className="w-full bg-tx-bg border border-tx-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-tx-primary" />
            </div>
            <div>
              <label className="block text-xs text-tx-text-secondary mb-2">Max Entry (₹)</label>
              <input type="number" value={form.max_entry_price ?? ""} onChange={e => setForm(f => ({ ...f, max_entry_price: parseFloat(e.target.value) || null }))}
                className="w-full bg-tx-bg border border-tx-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-tx-primary" />
            </div>
            <div>
              <label className="block text-xs text-tx-text-secondary mb-2">Review Date</label>
              <input type="date" value={form.review_date ?? ""} onChange={e => setForm(f => ({ ...f, review_date: e.target.value }))}
                style={{ colorScheme: "dark" }} className="w-full bg-tx-bg border border-tx-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-tx-primary" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 border border-tx-border rounded-xl text-tx-text-secondary hover:text-white transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-3 bg-tx-primary text-tx-bg font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Add to Watchlist"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ---------- Skip Modal ----------
function SkipModal({ item, onClose, onSkip }: { item: WatchlistItem; onClose: () => void; onSkip: (id: string, reason: string, learned: string) => void }) {
  const [reason, setReason] = useState(SKIP_REASONS[0]);
  const [learned, setLearned] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0D0D17] border border-tx-border rounded-2xl p-6 w-full max-w-md">
        <h2 className="font-syne text-xl font-bold mb-1">Skip {item.asset_name}</h2>
        <p className="text-tx-text-secondary text-sm mb-5">What made you decide against this one?</p>
        <div className="space-y-4">
          <select value={reason} onChange={e => setReason(e.target.value)}
            className="w-full bg-tx-bg border border-tx-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-tx-primary">
            {SKIP_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <textarea value={learned} onChange={e => setLearned(e.target.value)}
            placeholder="What did you learn from watching this? (optional)" rows={3}
            className="w-full bg-tx-bg border border-tx-border rounded-xl p-3 text-white resize-none focus:outline-none focus:border-tx-primary text-sm" />
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-tx-border rounded-xl text-tx-text-secondary hover:text-white">Cancel</button>
            <button onClick={() => onSkip(item.id, reason, learned)}
              className="flex-1 py-3 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-xl hover:bg-red-500/30">Mark Skipped</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ---------- Watchlist Card ----------
function WatchlistCard({ item, onRefresh, onBuy, onSkip, onDelete }:
  { item: WatchlistItem; onRefresh: () => void; onBuy: () => void; onSkip: () => void; onDelete: () => void }) {
  const priceChange = item.price_when_added && item.current_price
    ? ((item.current_price - item.price_when_added) / item.price_when_added) * 100 : null;
  const isReviewDue = item.review_date && new Date(item.review_date) <= new Date() && item.status === "watching";
  const isAtTarget = item.target_entry_price && item.current_price && item.current_price <= item.target_entry_price;
  const isAboveMax = item.max_entry_price && item.current_price && item.current_price > item.max_entry_price;
  const watchedDays = Math.floor((Date.now() - new Date(item.watched_since).getTime()) / 86400000);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 border border-tx-border hover:border-tx-primary/30 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-syne font-bold text-white text-lg">{item.asset_name}</h3>
            {item.asset_symbol && <span className="text-xs font-mono text-tx-primary bg-tx-primary/10 px-2 py-0.5 rounded border border-tx-primary/20">{item.asset_symbol}</span>}
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium",
              item.status === "watching" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
              item.status === "bought" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
              "bg-red-500/10 text-red-400 border-red-500/30"
            )}>{item.status}</span>
          </div>
          <p className="text-xs text-tx-text-muted mt-1">Watching for {watchedDays}d · {item.asset_type}</p>
        </div>
        <div className="text-right">
          {item.current_price ? (
            <>
              <div className="font-mono font-bold text-white">₹{item.current_price.toLocaleString()}</div>
              {priceChange !== null && (
                <div className={cn("flex items-center justify-end gap-1 text-xs font-medium mt-0.5",
                  priceChange >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}% since added
                </div>
              )}
            </>
          ) : <span className="text-tx-text-muted text-sm">No price</span>}
        </div>
      </div>

      {/* Alerts */}
      <div className="flex flex-wrap gap-2 mb-3">
        {isAtTarget && <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">🎯 At Target Price</span>}
        {isAboveMax && <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg">⚠️ Above Max Entry</span>}
        {isReviewDue && <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-lg">🔔 Review Due</span>}
      </div>

      {/* Thesis */}
      <p className="text-sm text-tx-text-secondary italic mb-4 line-clamp-2">"{item.watching_thesis}"</p>

      {/* Price targets */}
      {(item.target_entry_price || item.max_entry_price) && (
        <div className="flex gap-4 text-xs text-tx-text-muted mb-4">
          {item.target_entry_price && <span>🎯 Target: <span className="text-white font-mono">₹{item.target_entry_price}</span></span>}
          {item.max_entry_price && <span>🚫 Max: <span className="text-white font-mono">₹{item.max_entry_price}</span></span>}
        </div>
      )}

      {/* Actions */}
      {item.status === "watching" && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={onBuy} className="flex items-center gap-1 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors">
            <CheckCircle className="w-3.5 h-3.5" /> Mark as Bought
          </button>
          <button onClick={onSkip} className="flex items-center gap-1 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors">
            <XCircle className="w-3.5 h-3.5" /> Skip
          </button>
          <button onClick={onRefresh} className="flex items-center gap-1 px-3 py-2 bg-tx-card border border-tx-border rounded-lg text-xs text-tx-text-secondary hover:text-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={onDelete} className="ml-auto p-2 text-tx-text-muted hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      {item.status !== "watching" && item.action_taken && (
        <p className="text-xs text-tx-text-muted italic">Reason: {item.action_taken}</p>
      )}
    </motion.div>
  );
}

// ---------- Main Page ----------
export default function WatchlistPage() {
  const { mode, isPractice } = useMode();
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [skipItem, setSkipItem] = useState<WatchlistItem | null>(null);
  const accent = isPractice ? "text-tx-primary" : "text-yellow-400";

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const { items: data } = await getWatchlist({ mode });
      setItems(data);
    } catch (_) {}
    setIsLoading(false);
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const t = setInterval(() => load(true), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  const filtered = items.filter(i => {
    if (filter === "all") return true;
    if (filter === "review_due") return i.status === "watching" && i.review_date && new Date(i.review_date) <= new Date();
    return i.status === filter;
  });

  const counts = {
    watching: items.filter(i => i.status === "watching").length,
    bought: items.filter(i => i.status === "bought").length,
    skipped: items.filter(i => i.status === "skipped").length,
    review_due: items.filter(i => i.status === "watching" && i.review_date && new Date(i.review_date) <= new Date()).length,
  };

  const handleRefreshPrice = async (item: WatchlistItem) => {
    if (!item.asset_symbol) return;
    await updateWatchlistItem(item.id, { refresh_price: true, asset_symbol: item.asset_symbol } as any);
    load(true);
  };

  const handleBuy = (item: WatchlistItem) => {
    const params = new URLSearchParams({ prefill_asset: item.asset_name, prefill_thesis: item.watching_thesis });
    router.push(`/new?${params.toString()}`);
  };

  const handleSkip = async (id: string, reason: string, learned: string) => {
    await updateWatchlistItem(id, { status: "skipped", action_taken: reason, what_i_learned: learned || null } as any);
    setSkipItem(null);
    load(true);
  };

  const handleDelete = async (id: string) => {
    await deleteWatchlistItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: `All (${items.length})` },
    { key: "watching", label: `Watching (${counts.watching})` },
    { key: "bought", label: `Bought (${counts.bought})` },
    { key: "skipped", label: `Skipped (${counts.skipped})` },
    { key: "review_due", label: `Review Due${counts.review_due > 0 ? ` 🔔${counts.review_due}` : ""}` },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-syne text-4xl font-bold flex items-center gap-3">
            <Eye className={cn("w-9 h-9", accent)} /> Watchlist
          </h1>
          <p className="text-tx-text-secondary mt-2">Stocks you're considering. Your pre-decision journal.</p>
          <span className={cn("inline-flex mt-3 px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-widest",
            isPractice ? "bg-tx-primary/10 text-tx-primary border-tx-primary/30" : "bg-yellow-400/10 text-yellow-400 border-yellow-400/30")}>
            {isPractice ? "Practice Mode" : "Real Money Mode"}
          </span>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-3 bg-tx-primary text-tx-bg font-bold rounded-xl hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" /> Add Stock
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Watching", value: counts.watching, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Bought", value: counts.bought, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Skipped", value: counts.skipped, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          { label: "Review Due", value: counts.review_due, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
        ].map(s => (
          <div key={s.label} className={cn("glass-card p-5 border", s.bg)}>
            <div className={cn("font-mono text-4xl font-bold", s.color)}>{s.value}</div>
            <div className="text-sm text-tx-text-secondary mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-tx-border pb-4">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors",
              filter === t.key ? "bg-tx-primary text-tx-bg" : "text-tx-text-secondary hover:text-white bg-tx-card border border-tx-border")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-tx-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-tx-text-secondary">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-syne text-lg">No stocks here yet.</p>
          <p className="text-sm mt-1">Add stocks you're considering to start your pre-decision journal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map(item => (
              <WatchlistCard key={item.id} item={item}
                onRefresh={() => handleRefreshPrice(item)}
                onBuy={() => handleBuy(item)}
                onSkip={() => setSkipItem(item)}
                onDelete={() => handleDelete(item.id)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {showAdd && <AddModal mode={mode} onClose={() => setShowAdd(false)} onAdd={item => { setItems(prev => [item, ...prev]); }} />}
      {skipItem && <SkipModal item={skipItem} onClose={() => setSkipItem(null)} onSkip={handleSkip} />}
    </div>
  );
}
