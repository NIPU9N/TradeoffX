-- Add mode-awareness to saved AI patterns
ALTER TABLE patterns
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'real' CHECK (mode IN ('real', 'practice'));

CREATE INDEX IF NOT EXISTS idx_patterns_user_mode ON patterns(user_id, mode, generated_at DESC);
