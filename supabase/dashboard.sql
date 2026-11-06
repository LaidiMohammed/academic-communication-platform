-- ============================================================
-- BENDELLA SCHOOL — Dashboard, finances & RLS (idempotent)
-- À exécuter dans Supabase → SQL Editor.
-- Corrige la récursion RLS de profiles et provisionne les tables
-- financières utilisées par le tableau de bord.
-- ============================================================

-- ------------------------------------------------------------
-- 0) Helper admin (SECURITY DEFINER = contourne la RLS)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- ------------------------------------------------------------
-- 1) Tables financières manquantes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL DEFAULT 'manual',
  plan_title TEXT NOT NULL DEFAULT 'Paiement manuel',
  amount NUMERIC NOT NULL DEFAULT 0,
  is_yearly BOOLEAN DEFAULT false,
  currency TEXT DEFAULT 'dzd',
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  checkout_id TEXT,
  invoice_id TEXT,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS level TEXT DEFAULT '';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '[]';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'manual';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS plan_title TEXT DEFAULT 'Paiement manuel';

CREATE TABLE IF NOT EXISTS public.salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT '',
  monthly_salary NUMERIC NOT NULL DEFAULT 0,
  salary_paid BOOLEAN NOT NULL DEFAULT false,
  salary_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'expense'
    CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL DEFAULT 'Autre',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.payments(paid_at);
CREATE INDEX IF NOT EXISTS idx_salaries_teacher ON public.salaries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON public.expenses(type);

-- ------------------------------------------------------------
-- 2) Nettoyage des anciennes policies récursives
--    (on supprime TOUTES les policies des tables concernées)
-- ------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'memberships', 'chats', 'chat_participants',
        'messages', 'payments', 'salaries', 'expenses'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Profils : lecture de son profil, administration complète pour les admins
CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_admin_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY profiles_admin_delete ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Memberships
CREATE POLICY memberships_select_own ON public.memberships
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY memberships_admin_all ON public.memberships
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Chats / messages / participants (lecture participative + admin)
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chats_select_participant ON public.chats
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.chat_id = chats.id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY chats_insert_own ON public.chats
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY chat_participants_select_own ON public.chat_participants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY chat_participants_insert_own ON public.chat_participants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY messages_select_participant ON public.messages
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.chat_id = messages.chat_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY messages_insert_own ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY messages_delete_own ON public.messages
  FOR DELETE TO authenticated
  USING (auth.uid() = sender_id OR public.is_admin());

-- Paiements : le propriétaire voit les siens, l'admin gère tout
CREATE POLICY payments_select_own ON public.payments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY payments_admin_insert ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY payments_admin_update ON public.payments
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY payments_admin_delete ON public.payments
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Salaires & dépenses : admin uniquement
CREATE POLICY salaries_admin_all ON public.salaries
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY expenses_admin_all ON public.expenses
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 3) Vues agrégées
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
  (SELECT count(*)::int FROM public.profiles WHERE role = 'student') AS total_students,
  (SELECT count(*)::int FROM public.profiles WHERE role = 'teacher') AS total_teachers,
  (SELECT count(*)::int FROM public.profiles WHERE role = 'admin') AS total_admins,
  (SELECT count(*)::int FROM public.chats) AS total_chats,
  (SELECT count(*)::int FROM public.messages
     WHERE created_at >= now() - interval '24 hours') AS messages_24h,
  (SELECT coalesce(sum(amount), 0) FROM public.payments
     WHERE status = 'completed') AS total_revenue,
  (SELECT count(*)::int FROM public.memberships
     WHERE expires_at IS NOT NULL AND expires_at > now()) AS active_memberships;

CREATE OR REPLACE VIEW public.dashboard_activity AS
SELECT
  m.id,
  m.type,
  m.created_at,
  p.name AS actor_name,
  p.avatar AS actor_avatar,
  c.name AS chat_name
FROM public.messages m
LEFT JOIN public.profiles p ON p.id = m.sender_id
LEFT JOIN public.chats c ON c.id = m.chat_id
ORDER BY m.created_at DESC
LIMIT 50;

-- Pas de table "grades" : on renvoie le volume de leçons par matière.
CREATE OR REPLACE VIEW public.dashboard_subject_performance AS
SELECT
  l.subject::text AS subject,
  0::numeric AS average_grade,
  count(*)::int AS evaluations
FROM public.lessons l
GROUP BY l.subject;

CREATE OR REPLACE VIEW public.dashboard_daily_activity AS
SELECT
  date(created_at) AS day,
  count(*)::int AS messages,
  count(DISTINCT sender_id)::int AS active_users
FROM public.messages
WHERE created_at >= now() - interval '30 days'
GROUP BY date(created_at)
ORDER BY day;

CREATE OR REPLACE VIEW public.dashboard_financial_summary AS
SELECT
  (SELECT coalesce(sum(amount), 0) FROM public.payments
     WHERE status = 'completed') AS total_revenue,
  (SELECT coalesce(sum(monthly_salary), 0) FROM public.salaries) AS total_salaries,
  (SELECT coalesce(sum(amount), 0) FROM public.expenses
     WHERE type = 'expense') AS total_expenses;

-- ------------------------------------------------------------
-- 4) Fonctions RPC utilisées par lib/dashboard.ts
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.dashboard_get_overview()
RETURNS TABLE (
  total_students int,
  total_teachers int,
  total_admins int,
  total_chats int,
  messages_24h int,
  total_revenue numeric,
  active_memberships int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    total_students, total_teachers, total_admins, total_chats,
    messages_24h, total_revenue, active_memberships
  FROM public.dashboard_stats;
$$;

CREATE OR REPLACE FUNCTION public.dashboard_get_activity(limit_n int DEFAULT 10)
RETURNS TABLE (
  id bigint,
  type text,
  created_at timestamptz,
  actor_name text,
  actor_avatar text,
  chat_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, type, created_at, actor_name, actor_avatar, chat_name
  FROM public.dashboard_activity
  LIMIT greatest(limit_n, 1);
$$;

CREATE OR REPLACE FUNCTION public.dashboard_get_subject_performance()
RETURNS TABLE (
  subject text,
  average_grade numeric,
  evaluations int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT subject, average_grade, evaluations
  FROM public.dashboard_subject_performance;
$$;

CREATE OR REPLACE FUNCTION public.dashboard_get_daily_activity()
RETURNS TABLE (
  day date,
  messages int,
  active_users int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT day, messages, active_users
  FROM public.dashboard_daily_activity;
$$;

CREATE OR REPLACE FUNCTION public.dashboard_get_financial_summary()
RETURNS TABLE (
  total_revenue numeric,
  total_salaries numeric,
  total_expenses numeric,
  net_profit numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    total_revenue,
    total_salaries,
    total_expenses,
    (total_revenue - total_salaries - total_expenses) AS net_profit
  FROM public.dashboard_financial_summary;
$$;

-- ------------------------------------------------------------
-- 5) Recharger le cache de schéma PostgREST
-- ------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
