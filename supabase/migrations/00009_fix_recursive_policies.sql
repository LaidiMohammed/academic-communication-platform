-- Fix infinite RLS recursion on chat_participants and group_members
-- Same pattern as 00002: SECURITY DEFINER functions bypass RLS

CREATE OR REPLACE FUNCTION public.is_chat_participant(chat_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_participants WHERE chat_id = is_chat_participant.chat_id AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(group_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = is_group_member.group_id AND user_id = auth.uid());
$$;

-- Fix chat_participants SELECT policy (was self-referential)
DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;
CREATE POLICY "Users can view chat participants"
  ON chat_participants FOR SELECT
  USING (public.is_chat_participant(chat_id));

-- Fix group_members SELECT policy (was self-referential)
DROP POLICY IF EXISTS "Members can view group membership" ON group_members;
CREATE POLICY "Members can view group membership"
  ON group_members FOR SELECT
  USING (public.is_group_member(group_id));
