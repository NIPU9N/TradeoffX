import type { Decision, Outcome, Pattern, Profile, DashboardStats, CreateDecisionInput, CreateOutcomeInput, UpdateProfileInput } from "@/types";

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
export async function fetchDashboard(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/dashboard");
}

// ── Decisions ──
export async function createDecision(data: CreateDecisionInput): Promise<{ decision: Decision }> {
  return apiFetch("/api/decisions", { method: "POST", body: JSON.stringify(data) });
}

export async function getDecisions(filters?: {
  status?: string;
  asset_type?: string;
  emotion?: string;
  limit?: number;
  offset?: number;
}): Promise<{ decisions: Decision[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.asset_type) params.set("asset_type", filters.asset_type);
  if (filters?.emotion) params.set("emotion", filters.emotion);
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

// ── Patterns ──
export async function getPatterns(): Promise<{ patterns: Pattern[] }> {
  return apiFetch("/api/patterns");
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
