-- ═══════════════════════════════════════════
-- TradeoffX Database Schema - Practice Mode
-- ═══════════════════════════════════════════

-- 1. Alter decisions table to support mode
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS mode text DEFAULT 'real' CHECK (mode IN ('real', 'practice'));

-- 2. Practice Portfolio
CREATE TABLE IF NOT EXISTS practice_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  virtual_capital numeric DEFAULT 1000000,
  current_value numeric DEFAULT 1000000,
  total_return_percent numeric DEFAULT 0,
  total_return_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Practice Positions
CREATE TABLE IF NOT EXISTS practice_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  decision_id uuid REFERENCES decisions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  asset_name text NOT NULL,
  asset_type text NOT NULL,
  quantity numeric NOT NULL,
  entry_price numeric NOT NULL,
  current_price numeric NOT NULL,
  investment_amount numeric NOT NULL,
  current_value numeric NOT NULL,
  return_amount numeric DEFAULT 0,
  return_percent numeric DEFAULT 0,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  exit_price numeric
);

-- 4. Market Prices Cache
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_symbol text NOT NULL UNIQUE,
  asset_name text,
  current_price numeric NOT NULL,
  previous_close numeric,
  change_percent numeric,
  last_updated timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════

ALTER TABLE practice_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

-- Practice Portfolio Policies
CREATE POLICY "Users can view own practice portfolio" ON practice_portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own practice portfolio" ON practice_portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own practice portfolio" ON practice_portfolio FOR UPDATE USING (auth.uid() = user_id);

-- Practice Positions Policies
CREATE POLICY "Users can view own practice positions" ON practice_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own practice positions" ON practice_positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own practice positions" ON practice_positions FOR UPDATE USING (auth.uid() = user_id);

-- Market Prices Policies
CREATE POLICY "Anyone can view market prices" ON market_prices FOR SELECT USING (true);
CREATE POLICY "Anyone can insert market prices" ON market_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update market prices" ON market_prices FOR UPDATE USING (true);

-- ═══════════════════════════════════════════
-- AUTO-CREATE PRACTICE PORTFOLIO ON SIGN UP
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user_practice_portfolio()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.practice_portfolio (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created_practice_portfolio
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_practice_portfolio();

-- ═══════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_decisions_mode ON decisions(mode);
CREATE INDEX IF NOT EXISTS idx_practice_positions_user_id ON practice_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_positions_status ON practice_positions(status);
CREATE INDEX IF NOT EXISTS idx_market_prices_symbol ON market_prices(asset_symbol);
