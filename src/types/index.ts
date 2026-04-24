import { z } from "zod";

// ═══════════════════════════════════════════
// DATABASE TYPES
// ═══════════════════════════════════════════

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  member_since: string;
  total_decisions: number;
  current_streak: number;
  longest_streak: number;
  last_decision_date: string | null;
  plan: "free" | "pro";
  primary_assets: string[] | null;
  biggest_leak: string | null;
  experience_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface Decision {
  id: string;
  user_id: string;
  mode: "real" | "practice";
  // The Trade
  asset_name: string;
  asset_type: "stock" | "mutual_fund" | "crypto" | "gold" | "fd" | "other";
  investment_amount: number;
  decision_date: string;
  // The Why
  thesis: string;
  what_would_make_me_wrong: string;
  target_price: number | null;
  stop_loss: number | null;
  potential_gain_percent: number | null;
  max_loss_percent: number | null;
  risk_reward_ratio: number | null;
  // Technical Indicators
  rsi_value: number | null;
  rsi_signal: "bullish" | "bearish" | "neutral" | null;
  macd_signal: string | null;
  volume_signal: string | null;
  ma_50_position: "above" | "below" | null;
  ma_200_position: "above" | "below" | null;
  fibonacci_level: string | null;
  support_level: number | null;
  resistance_level: number | null;
  trend: "uptrend" | "sideways" | "downtrend" | null;
  candlestick_pattern: string | null;
  custom_indicator_name: string | null;
  custom_indicator_value: string | null;
  custom_indicator_signal: string | null;
  overall_technical_verdict: string | null;
  // The Check
  confidence_level: number;
  emotion: "calm" | "excited" | "anxious" | "fomo" | "greedy" | "uncertain";
  decision_type: "logic" | "mixed" | "emotion";
  checklist_completed: boolean;
  // Status
  status: "open" | "pending_review" | "reviewed";
  created_at: string;
  updated_at: string;
  // Joined
  outcome?: Outcome | null;
}

export interface Outcome {
  id: string;
  decision_id: string;
  user_id: string;
  outcome_type: "profit" | "loss" | "breakeven" | "still_open";
  exit_price: number | null;
  actual_return_percent: number | null;
  was_thesis_correct: "right" | "partially_right" | "wrong" | "too_early";
  exit_emotion: "planned" | "panic" | "greed" | "boredom" | "new_information";
  learnings: string | null;
  would_repeat: "yes" | "no" | "maybe";
  would_repeat_reason: string | null;
  thesis_clarity_score: number;
  risk_management_score: number;
  emotional_control_score: number;
  process_score: number;
  overall_quality_score: number;
  reviewed_at: string;
}

export interface Pattern {
  id: string;
  user_id: string;
  mode: "real" | "practice";
  pattern_text: string;
  confidence_percent: number;
  based_on_decisions: number;
  pattern_type: "bias" | "timing" | "asset_class" | "emotion" | "technical";
  generated_at: string;
}

export interface BiasTag {
  id: string;
  decision_id: string;
  user_id: string;
  bias_type: "fomo" | "panic_sell" | "overconfidence" | "loss_aversion" | "greed" | "tips_from_others";
  created_at: string;
}

export interface PracticePortfolio {
  id: string;
  user_id: string;
  virtual_capital: number;
  current_value: number;
  total_return_percent: number;
  total_return_amount: number;
  created_at: string;
  updated_at: string;
}

export interface PracticePosition {
  id: string;
  user_id: string;
  decision_id: string;
  asset_name: string;
  asset_type: "stock" | "mutual_fund" | "crypto" | "gold" | "fd" | "other";
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
}

export interface MarketPrice {
  id: string;
  asset_symbol: string;
  asset_name: string | null;
  current_price: number;
  previous_close: number | null;
  change_percent: number | null;
  last_updated: string;
}

export interface ModeComparison {
  practice_win_rate: number;
  real_win_rate: number;
  practice_logic_driven: number;
  real_logic_driven: number;
  practice_avg_return: number;
  real_avg_return: number;
  practice_avg_confidence: number;
  real_avg_confidence: number;
  practice_fomo_trades: number;
  real_fomo_trades: number;
  practice_stop_loss_honor: number;
  real_stop_loss_honor: number;
}

export interface DashboardStats {
  mode: "real" | "practice";
  total_decisions: number;
  win_rate: number;
  current_streak: number;
  longest_streak: number;
  logic_score: number;
  emotion_score: number;
  recent_decisions: Decision[];
  pending_reviews: Decision[];
  top_bias: string;
  bias_breakdown: Record<string, number>;
  best_performing_asset_type: string;
  worst_performing_asset_type: string;
}

// ═══════════════════════════════════════════
// ZOD SCHEMAS
// ═══════════════════════════════════════════

export const createDecisionSchema = z.object({
  asset_name: z.string().min(1, "Asset name is required"),
  asset_type: z.enum(["stock", "mutual_fund", "crypto", "gold", "fd", "other"]),
  investment_amount: z.number().positive("Amount must be positive"),
  decision_date: z.string().min(1, "Date is required"),
  thesis: z.string().min(10, "Thesis must be at least 10 characters"),
  what_would_make_me_wrong: z.string().min(5, "This field is required"),
  target_price: z.number().positive().nullable().optional(),
  stop_loss: z.number().positive().nullable().optional(),
  potential_gain_percent: z.number().nullable().optional(),
  max_loss_percent: z.number().nullable().optional(),
  risk_reward_ratio: z.number().nullable().optional(),
  // Technical indicators — all optional
  rsi_value: z.number().min(0).max(100).nullable().optional(),
  rsi_signal: z.enum(["bullish", "bearish", "neutral"]).nullable().optional(),
  macd_signal: z.string().nullable().optional(),
  volume_signal: z.string().nullable().optional(),
  ma_50_position: z.enum(["above", "below"]).nullable().optional(),
  ma_200_position: z.enum(["above", "below"]).nullable().optional(),
  fibonacci_level: z.string().nullable().optional(),
  support_level: z.number().nullable().optional(),
  resistance_level: z.number().nullable().optional(),
  trend: z.enum(["uptrend", "sideways", "downtrend"]).nullable().optional(),
  candlestick_pattern: z.string().nullable().optional(),
  custom_indicator_name: z.string().nullable().optional(),
  custom_indicator_value: z.string().nullable().optional(),
  custom_indicator_signal: z.string().nullable().optional(),
  overall_technical_verdict: z.string().nullable().optional(),
  // The Check
  confidence_level: z.number().int().min(1).max(10),
  emotion: z.enum(["calm", "excited", "anxious", "fomo", "greedy", "uncertain"]),
  decision_type: z.enum(["logic", "mixed", "emotion"]),
  checklist_completed: z.boolean().default(false),
  mode: z.enum(["real", "practice"]).default("real"),
});

export const createOutcomeSchema = z.object({
  decision_id: z.string().uuid(),
  outcome_type: z.enum(["profit", "loss", "breakeven", "still_open"]),
  exit_price: z.number().positive().nullable().optional(),
  actual_return_percent: z.number().nullable().optional(),
  was_thesis_correct: z.enum(["right", "partially_right", "wrong", "too_early"]),
  exit_emotion: z.enum(["planned", "panic", "greed", "boredom", "new_information"]),
  learnings: z.string().nullable().optional(),
  would_repeat: z.enum(["yes", "no", "maybe"]),
  would_repeat_reason: z.string().nullable().optional(),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;
export type CreateOutcomeInput = z.infer<typeof createOutcomeSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
