-- Performance indexes for hot query paths

-- Messages: compound index for unread count queries (chat list)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_chat_sender_created
  ON messages(chat_id, sender_id, created_at DESC);

-- Messages: support pagination with cursor (id-based)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_chat_id_created_desc
  ON messages(chat_id, created_at DESC);

-- Chat participants: support user lookup + last_read_at
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_participants_user_last_read
  ON chat_participants(user_id, chat_id) INCLUDE (last_read_at);

-- Group members: support role-based access checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_members_group_user_role
  ON group_members(group_id, user_id) INCLUDE (role);

-- Messages: filter call signals efficiently
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_non_call
  ON messages(chat_id, created_at DESC) WHERE text NOT LIKE '__call__%';

-- Meeting participants: support user meeting list queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meeting_participants_user_meeting
  ON meeting_participants(user_id, meeting_id);
