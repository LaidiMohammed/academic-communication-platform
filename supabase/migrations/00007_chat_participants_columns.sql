-- ==================== CHAT PARTICIPANTS COLUMNS ====================
-- Adds muted and pinned columns to chat_participants table

ALTER TABLE chat_participants ADD COLUMN IF NOT EXISTS muted BOOLEAN DEFAULT false;
ALTER TABLE chat_participants ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;
