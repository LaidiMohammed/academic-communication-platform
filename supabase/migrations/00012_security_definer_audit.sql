-- Audit and harden all SECURITY DEFINER functions
-- SECURITY DEFINER functions run with the privileges of the table owner (superuser).
-- Without an explicit search_path, an attacker can create malicious objects in a
-- schema that appears earlier in the search path, hijacking the function.

-- Fix handle_new_user()
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := CASE
    WHEN NEW.email IN ('hamada.laidi.14@gmail.com', 'hamda.laidi.14@gmail.com') THEN 'admin'
    ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  END;

  INSERT INTO public.profiles (id, email, name, avatar, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email,
    user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix update_chat_on_message()
CREATE OR REPLACE FUNCTION update_chat_on_message()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chats
  SET last_message = NEW.text,
      last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix get_or_create_individual_chat()
CREATE OR REPLACE FUNCTION get_or_create_individual_chat(other_user_id UUID)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_chat_id UUID;
  new_chat_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  SELECT cp1.chat_id INTO existing_chat_id
  FROM public.chat_participants cp1
  JOIN public.chat_participants cp2 ON cp2.chat_id = cp1.chat_id
  JOIN public.chats c ON c.id = cp1.chat_id
  WHERE cp1.user_id = current_user_id
    AND cp2.user_id = other_user_id
    AND c.type = 'individual'
  LIMIT 1;

  IF existing_chat_id IS NOT NULL THEN
    RETURN existing_chat_id;
  END IF;

  INSERT INTO public.chats (type, name, created_by)
  VALUES ('individual', 'Chat', current_user_id)
  RETURNING id INTO new_chat_id;

  INSERT INTO public.chat_participants (chat_id, user_id) VALUES
    (new_chat_id, current_user_id),
    (new_chat_id, other_user_id);

  UPDATE public.chats SET name = (SELECT name FROM public.profiles WHERE id = other_user_id)
  WHERE id = new_chat_id;

  RETURN new_chat_id;
END;
$$ LANGUAGE plpgsql;

-- Fix is_admin() helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql;

-- Grant execute to authenticated role only (principle of least privilege)
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION update_chat_on_message() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_or_create_individual_chat(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION update_chat_on_message() TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_individual_chat(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
