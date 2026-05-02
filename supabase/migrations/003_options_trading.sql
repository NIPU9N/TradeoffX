-- ═══════════════════════════════════════════
-- Options Trading Tables (Migration 003)
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════

-- TABLE: option_chains
-- Stores cached option chain data fetched by GitHub Actions from NSE
CREATE TABLE IF NOT EXISTS option_chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL UNIQUE,       -- e.g., 'NIFTY', 'BANKNIFTY'
  data jsonb NOT NULL,               -- Full NSE option chain JSON payload
  underlying_value numeric,          -- Spot price at time of fetch
  timestamp text,                    -- Timestamp string from NSE response
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_option_chains_symbol ON option_chains(symbol);

ALTER TABLE option_chains ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read cached option chains
CREATE POLICY "Public read access to option chains"
  ON option_chains FOR SELECT USING (true);

-- Only authenticated users (or service role via GH Actions) can write
CREATE POLICY "Authenticated users can insert option chains"
  ON option_chains FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update option chains"
  ON option_chains FOR UPDATE USING (auth.role() = 'authenticated');


-- TABLE: strategy_legs
-- Stores individual legs of a complex option strategy linked to a decision
CREATE TABLE IF NOT EXISTS strategy_legs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Leg details
  leg_type text NOT NULL CHECK (leg_type IN ('call', 'put', 'equity', 'future')),
  strike numeric,                   -- Nullable for equity/futures
  expiry date,                      -- Nullable for equity
  transaction_type text NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity integer NOT NULL,
  entry_price numeric NOT NULL,     -- Premium paid/received per unit

  -- Exit tracking
  exit_price numeric,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'expired')),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_strategy_legs_decision_id ON strategy_legs(decision_id);

ALTER TABLE strategy_legs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strategy legs"
  ON strategy_legs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategy legs"
  ON strategy_legs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategy legs"
  ON strategy_legs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategy legs"
  ON strategy_legs FOR DELETE USING (auth.uid() = user_id);
