-- Add level, subjects, sessions to memberships
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS level TEXT DEFAULT '';
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '[]';
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS sessions_total INT DEFAULT 4;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS sessions_used INT DEFAULT 0;

-- Add level, subjects to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS level TEXT DEFAULT '';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '[]';
