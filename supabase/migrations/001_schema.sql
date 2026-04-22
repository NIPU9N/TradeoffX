-- ═══════════════════════════════════════════
-- TradeoffX Database Schema
-- Paste this into Supabase SQL Editor
-- ═══════════════════════════════════════════

-- TABLE 1: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  member_since timestamptz DEFAULT now(),
  total_decisions integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_decision_date date,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  primary_assets text[],
  biggest_leak text,
  experience_level text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE 2: decisions
CREATE TABLE IF NOT EXISTS decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- The Trade
  asset_name text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('stock', 'mutual_fund', 'crypto', 'gold', 'fd', 'other')),
  investment_amount numeric NOT NULL,
  decision_date date NOT NULL,
  -- The Why
  thesis text NOT NULL,
  what_would_make_me_wrong text NOT NULL,
  target_price numeric,
  stop_loss numeric,
  potential_gain_percent numeric,
  max_loss_percent numeric,
  risk_reward_ratio numeric,
  -- Technical Indicators
  rsi_value numeric,
  rsi_signal text CHECK (rsi_signal IN ('bullish', 'bearish', 'neutral') OR rsi_signal IS NULL),
  macd_signal text,
  volume_signal text,
  ma_50_position text CHECK (ma_50_position IN ('above', 'below') OR ma_50_position IS NULL),
  ma_200_position text CHECK (ma_200_position IN ('above', 'below') OR ma_200_position IS NULL),
  fibonacci_level text,
  support_level numeric,
  resistance_level numeric,
  trend text CHECK (trend IN ('uptrend', 'sideways', 'downtrend') OR trend IS NULL),
  candlestick_pattern text,
  custom_indicator_name text,
  custom_indicator_value text,
  custom_indicator_signal text,
  overall_technical_verdict text,
  -- The Check
  confidence_level integer NOT NULL CHECK (confidence_level BETWEEN 1 AND 10),
  emotion text NOT NULL CHECK (emotion IN ('calm', 'excited', 'anxious', 'fomo', 'greedy', 'uncertain')),
  decision_type text NOT NULL CHECK (decision_type IN ('logic', 'mixed', 'emotion')),
  checklist_completed boolean DEFAULT false,
  -- Status
  status text DEFAULT 'open' CHECK (status IN ('open', 'pending_review', 'reviewed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE 3: outcomes
CREATE TABLE IF NOT EXISTS outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid REFERENCES decisions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  outcome_type text CHECK (outcome_type IN ('profit', 'loss', 'breakeven', 'still_open')),
  exit_price numeric,
  actual_return_percent numeric,
  was_thesis_correct text CHECK (was_thesis_correct IN ('right', 'partially_right', 'wrong', 'too_early')),
  exit_emotion text CHECK (exit_emotion IN ('planned', 'panic', 'greed', 'boredom', 'new_information')),
  learnings text,
  would_repeat text CHECK (would_repeat IN ('yes', 'no', 'maybe')),
  would_repeat_reason text,
  thesis_clarity_score integer CHECK (thesis_clarity_score BETWEEN 1 AND 10),
  risk_management_score integer CHECK (risk_management_score BETWEEN 1 AND 10),
  emotional_control_score integer CHECK (emotional_control_score BETWEEN 1 AND 10),
  process_score integer CHECK (process_score BETWEEN 1 AND 10),
  overall_quality_score numeric,
  reviewed_at timestamptz DEFAULT now()
);

-- TABLE 4: patterns
CREATE TABLE IF NOT EXISTS patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pattern_text text,
  confidence_percent integer,
  based_on_decisions integer,
  pattern_type text CHECK (pattern_type IN ('bias', 'timing', 'asset_class', 'emotion', 'technical')),
  generated_at timestamptz DEFAULT now()
);

-- TABLE 5: bias_tags
CREATE TABLE IF NOT EXISTS bias_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bias_type text CHECK (bias_type IN ('fomo', 'panic_sell', 'overconfidence', 'loss_aversion', 'greed', 'tips_from_others')),
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE bias_tags ENABLE ROW LEVEL SECURITY;

-- Profiles (uses id, not user_id)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Decisions
CREATE POLICY "Users can view own decisions" ON decisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own decisions" ON decisions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decisions" ON decisions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decisions" ON decisions FOR DELETE USING (auth.uid() = user_id);

-- Outcomes
CREATE POLICY "Users can view own outcomes" ON outcomes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outcomes" ON outcomes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outcomes" ON outcomes FOR UPDATE USING (auth.uid() = user_id);

-- Patterns
CREATE POLICY "Users can view own patterns" ON patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patterns" ON patterns FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bias Tags
CREATE POLICY "Users can view own bias tags" ON bias_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bias tags" ON bias_tags FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGN UP (trigger)
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, member_since)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);
CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outcomes_decision_id ON outcomes(decision_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_user_id ON outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_bias_tags_user_id ON bias_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_bias_tags_decision_id ON bias_tags(decision_id);
