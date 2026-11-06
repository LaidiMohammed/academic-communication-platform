-- ============================================================
-- BENDELLA SCHOOL — Dashboard views & RPC (Supabase / PostgreSQL)
-- Run these migrations in your Supabase project SQL editor.
-- ============================================================

-- 1) Vue agrégée : stats globales du dashboard (une seule requête)
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT count(*) FROM profiles WHERE role = 'student') AS total_students,
  (SELECT count(*) FROM profiles WHERE role = 'teacher') AS total_teachers,
  (SELECT count(*) FROM profiles WHERE role = 'admin') AS total_admins,
  (SELECT count(*) FROM chats) AS total_chats,
  (SELECT count(*) FROM messages WHERE created_at >= now() - interval '24 hours') AS messages_24h,
  (SELECT coalesce(sum(amount), 0) FROM payments WHERE status = 'completed') AS total_revenue,
  (SELECT count(*) FROM memberships WHERE status = 'active') AS active_memberships;

-- 2) Vue : activité récente (feed du dashboard)
CREATE OR REPLACE VIEW dashboard_activity AS
SELECT
  m.id,
  m.type,
  m.created_at,
  p.name AS actor_name,
  p.avatar AS actor_avatar,
  c.name AS chat_name
FROM messages m
LEFT JOIN profiles p ON p.id = m.sender_id
LEFT JOIN chats c ON c.id = m.chat_id
ORDER BY m.created_at DESC
LIMIT 50;

-- 3) Vue : performance par matière (pour graphique en barres)
CREATE OR REPLACE VIEW dashboard_subject_performance AS
SELECT
  l.subject AS subject,
  round(avg(g.grade)::numeric, 2) AS average_grade,
  count(g.id) AS evaluations
FROM lessons l
LEFT JOIN grades g ON g.lesson_id = l.id
GROUP BY l.subject;

-- 4) Vue : activité par jour (courbe d'activité)
CREATE OR REPLACE VIEW dashboard_daily_activity AS
SELECT
  date(created_at) AS day,
  count(*) AS messages,
  count(DISTINCT sender_id) AS active_users
FROM messages
WHERE created_at >= now() - interval '30 days'
GROUP BY date(created_at)
ORDER BY day;

-- 5) RPC : récupérer toutes les stats du dashboard en UN seul appel
-- Usage: SELECT * FROM dashboard_get_overview();
CREATE OR REPLACE FUNCTION dashboard_get_overview()
RETURNS TABLE (
  total_students int,
  total_teachers int,
  total_admins int,
  total_chats int,
  messages_24h int,
  total_revenue numeric,
  active_memberships int
)
LANGUAGE sql STABLE
AS $$
  SELECT
    total_students,
    total_teachers,
    total_admins,
    total_chats,
    messages_24h,
    total_revenue,
    active_memberships
  FROM dashboard_stats;
$$;

-- 6) RPC : activité récente paginée
CREATE OR REPLACE FUNCTION dashboard_get_activity(limit_n int DEFAULT 10)
RETURNS TABLE (
  id bigint,
  type text,
  created_at timestamptz,
  actor_name text,
  actor_avatar text,
  chat_name text
)
LANGUAGE sql STABLE
AS $$
  SELECT id, type, created_at, actor_name, actor_avatar, chat_name
  FROM dashboard_activity
  LIMIT limit_n;
$$;

-- 7) RPC : performance par matière
CREATE OR REPLACE FUNCTION dashboard_get_subject_performance()
RETURNS TABLE (
  subject text,
  average_grade numeric,
  evaluations int
)
LANGUAGE sql STABLE
AS $$
  SELECT subject, average_grade, evaluations
  FROM dashboard_subject_performance;
$$;

-- 8) RPC : activité quotidienne (30 jours)
CREATE OR REPLACE FUNCTION dashboard_get_daily_activity()
RETURNS TABLE (
  day date,
  messages int,
  active_users int
)
LANGUAGE sql STABLE
AS $$
  SELECT day, messages, active_users
  FROM dashboard_daily_activity;
$$;

-- ============================================================
-- RLS : l'utilisateur ne voit que ses propres données autorisées
-- ============================================================

-- Profils : chaque utilisateur lit son propre profil ; admin lit tous
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_self_read ON profiles;
DROP POLICY IF EXISTS profiles_admin_all ON profiles;
CREATE POLICY profiles_self_read ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_admin_all ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Messages : lecture des messages des chats auxquels on participe
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS messages_participant_read ON messages;
CREATE POLICY messages_participant_read ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_id = messages.chat_id AND cp.user_id = auth.uid()
    )
  );

-- Chats : lecture si participant
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS chats_participant_read ON chats;
CREATE POLICY chats_participant_read ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_id = chats.id AND cp.user_id = auth.uid()
    )
  );

-- Paiements : lecture admin ou propriétaire ; écriture admin uniquement
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payments_owner_or_admin ON payments;
DROP POLICY IF EXISTS payments_admin_insert ON payments;
DROP POLICY IF EXISTS payments_admin_update ON payments;
DROP POLICY IF EXISTS payments_admin_delete ON payments;
CREATE POLICY payments_owner_or_admin ON payments
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
CREATE POLICY payments_admin_insert ON payments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
CREATE POLICY payments_admin_update ON payments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
CREATE POLICY payments_admin_delete ON payments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Salaires : lecture admin uniquement ; écriture admin uniquement
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS salaries_admin_all ON salaries;
CREATE POLICY salaries_admin_all ON salaries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Dépenses : lecture admin uniquement ; écriture admin uniquement
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS expenses_admin_all ON expenses;
CREATE POLICY expenses_admin_all ON expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Profils : écriture admin pour création/modification étudiants
DROP POLICY IF EXISTS profiles_admin_insert ON profiles;
DROP POLICY IF EXISTS profiles_admin_update ON profiles;
DROP POLICY IF EXISTS profiles_admin_delete ON profiles;
CREATE POLICY profiles_admin_insert ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
CREATE POLICY profiles_admin_update ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
CREATE POLICY profiles_admin_delete ON profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- Tables financières (créer si elles n'existent pas encore)
-- ============================================================

CREATE TABLE IF NOT EXISTS salaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  monthly_salary numeric NOT NULL DEFAULT 0,
  salary_paid boolean NOT NULL DEFAULT false,
  salary_paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL DEFAULT 'Autre',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Index performance
CREATE INDEX IF NOT EXISTS idx_salaries_teacher_id ON salaries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);

-- ============================================================
-- Vue financière : résumé revenus / salaires / dépenses
-- ============================================================

CREATE OR REPLACE VIEW dashboard_financial_summary AS
SELECT
  coalesce((
    SELECT sum(amount) FROM payments WHERE status = 'completed'
  ), 0) AS total_revenue,
  coalesce((
    SELECT sum(monthly_salary) FROM salaries
  ), 0) AS total_salaries,
  coalesce((
    SELECT sum(amount) FROM expenses WHERE type = 'expense'
  ), 0) AS total_expenses;

-- ============================================================
-- RPC : résumé financier complet
-- ============================================================

CREATE OR REPLACE FUNCTION dashboard_get_financial_summary()
RETURNS TABLE (
  total_revenue numeric,
  total_salaries numeric,
  total_expenses numeric,
  net_profit numeric
)
LANGUAGE sql STABLE
AS $$
  SELECT
    total_revenue,
    total_salaries,
    total_expenses,
    (total_revenue - total_salaries - total_expenses) AS net_profit
  FROM dashboard_financial_summary;
$$;

-- ============================================================
-- Index de performance pour les requêtes dashboard
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status_user ON payments(status, user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
