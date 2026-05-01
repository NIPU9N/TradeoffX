import type { Decision, Outcome, Pattern, Profile, DashboardStats, CreateDecisionInput, CreateOutcomeInput, UpdateProfileInput, WatchlistItem, CreateWatchlistInput } from "@/types";

const API_BASE = "";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}

// ── Dashboard ──
export async function fetchDashboard(mode?: string): Promise<DashboardStats> {
  const qs = mode ? `?mode=${mode}` : "";
  return apiFetch<DashboardStats>(`/api/dashboard${qs}`);
}

// ── Decisions ──
export async function createDecision(data: CreateDecisionInput): Promise<{ decision: Decision }> {
  return apiFetch("/api/decisions", { method: "POST", body: JSON.stringify(data) });
}

export async function getDecisions(filters?: {
  status?: string;
  asset_type?: string;
  emotion?: string;
  mode?: string;
  limit?: number;
  offset?: number;
}): Promise<{ decisions: Decision[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.asset_type) params.set("asset_type", filters.asset_type);
  if (filters?.emotion) params.set("emotion", filters.emotion);
  if (filters?.mode) params.set("mode", filters.mode);
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.offset) params.set("offset", String(filters.offset));
  const qs = params.toString();
  return apiFetch(`/api/decisions${qs ? `?${qs}` : ""}`);
}

export async function getDecision(id: string): Promise<{ decision: Decision }> {
  return apiFetch(`/api/decisions/${id}`);
}

export async function updateDecisionStatus(id: string, status: string): Promise<{ decision: Decision }> {
  return apiFetch(`/api/decisions/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function deleteDecision(id: string): Promise<{ message: string }> {
  return apiFetch(`/api/decisions/${id}`, { method: "DELETE" });
}

// ── Outcomes ──
export async function createOutcome(data: CreateOutcomeInput): Promise<{ outcome: Outcome }> {
  return apiFetch("/api/outcomes", { method: "POST", body: JSON.stringify(data) });
}

export async function getOutcome(decisionId: string): Promise<{ outcome: Outcome }> {
  return apiFetch(`/api/outcomes/${decisionId}`);
}

// ── Practice Mode ──
export async function createPracticePosition(data: {
  decision_id: string;
  asset_name: string;
  asset_type: string;
  quantity: number;
  entry_price: number;
}) {
  return apiFetch("/api/practice/positions", { method: "POST", body: JSON.stringify(data) });
}

export async function getPracticePositions(): Promise<{ positions: any[] }> {
  return apiFetch("/api/practice/positions");
}

export async function getPracticePortfolio(): Promise<{
  portfolio: any;
  metrics: {
    deployed_capital: number;
    free_capital: number;
    unrealized_pnl: number;
    open_positions: number;
  };
}> {
  return apiFetch("/api/practice/portfolio");
}

export async function closePracticePosition(id: string, exit_price: number) {
  return apiFetch(`/api/practice/positions/${id}/close`, {
    method: "POST",
    body: JSON.stringify({ exit_price }),
  });
}

export async function resetPracticePortfolio() {
  return apiFetch("/api/practice/portfolio/reset", { method: "POST" });
}

// ── Patterns ──
export async function getPatterns(mode?: string): Promise<{ patterns: Pattern[] }> {
  const qs = mode ? `?mode=${mode}` : "";
  return apiFetch(`/api/patterns${qs}`);
}

export async function generatePatterns(): Promise<{ patterns: Pattern[] }> {
  return apiFetch("/api/patterns/generate", { method: "POST" });
}

// ── Profile ──
export async function getProfile(): Promise<{ profile: Profile }> {
  return apiFetch("/api/profile");
}

export async function updateProfile(data: UpdateProfileInput): Promise<{ profile: Profile }> {
  return apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify(data) });
}

// ── Watchlist ──
export async function getWatchlist(filters?: { mode?: string; status?: string }): Promise<{ items: WatchlistItem[] }> {
  const params = new URLSearchParams();
  if (filters?.mode) params.set("mode", filters.mode);
  if (filters?.status) params.set("status", filters.status);
  const qs = params.toString();
  return apiFetch(`/api/watchlist${qs ? `?${qs}` : ""}`);
}

export async function createWatchlistItem(data: CreateWatchlistInput & { mode: string }): Promise<{ item: WatchlistItem }> {
  return apiFetch("/api/watchlist", { method: "POST", body: JSON.stringify(data) });
}

export async function updateWatchlistItem(id: string, updates: Partial<WatchlistItem>): Promise<{ item: WatchlistItem }> {
  return apiFetch(`/api/watchlist/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
}

export async function deleteWatchlistItem(id: string): Promise<{ message: string }> {
  return apiFetch(`/api/watchlist/${id}`, { method: "DELETE" });
}
