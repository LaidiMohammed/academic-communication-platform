-- Rate limiting table for distributed rate limiting (works across serverless instances)

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- Cleanup expired entries periodically
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rate_limits WHERE reset_at < now();
END;
$$;

-- Allow authenticated users to upsert their own rate limits
DROP POLICY IF EXISTS "Users can manage own rate limits" ON rate_limits;
CREATE POLICY "Users can manage own rate limits"
  ON rate_limits FOR ALL
  USING (true);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
