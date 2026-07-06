-- Fix infinite RLS recursion on profiles table
-- The admin policies were querying profiles itself, causing infinite recursion.
-- Solution: use a SECURITY DEFINER function that bypasses RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- Recreate all admin policies using the helper function

DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;
CREATE POLICY "Admin can manage all profiles"
  ON profiles FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can view all chats" ON chats;
CREATE POLICY "Admin can view all chats"
  ON chats FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage all groups" ON groups;
CREATE POLICY "Admin can manage all groups"
  ON groups FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage all meetings" ON meetings;
CREATE POLICY "Admin can manage all meetings"
  ON meetings FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can view all participants" ON chat_participants;
CREATE POLICY "Admin can view all participants"
  ON chat_participants FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can view all messages" ON messages;
CREATE POLICY "Admin can view all messages"
  ON messages FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete any message" ON messages;
CREATE POLICY "Admin can delete any message"
  ON messages FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can view all group members" ON group_members;
CREATE POLICY "Admin can view all group members"
  ON group_members FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can view all meeting participants" ON meeting_participants;
CREATE POLICY "Admin can view all meeting participants"
  ON meeting_participants FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage all memberships" ON memberships;
CREATE POLICY "Admin can manage all memberships"
  ON memberships FOR ALL
  USING (public.is_admin());
