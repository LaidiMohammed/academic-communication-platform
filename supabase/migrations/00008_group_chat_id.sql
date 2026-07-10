-- Add chat_id to groups for direct chat navigation
ALTER TABLE groups ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES chats(id) ON DELETE SET NULL;
