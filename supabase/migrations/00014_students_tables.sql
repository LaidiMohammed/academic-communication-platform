-- Create students, attendance, reports, and payment_audit tables for admin features

-- Students table: stores additional student data beyond profiles
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_payment')),
  remaining_sessions JSONB DEFAULT '{}',
  date_of_birth TEXT DEFAULT '',
  academic_level TEXT DEFAULT '',
  specialty TEXT DEFAULT '',
  level TEXT DEFAULT '',
  age INTEGER DEFAULT 0
);

-- Attendance table: logs individual session scans by admins
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  previous_balance INTEGER DEFAULT 0,
  new_balance INTEGER DEFAULT 0
);

-- Reports table: persists generated admin reports
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  tier TEXT NOT NULL,
  modules JSONB DEFAULT '[]',
  student_count INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  month TEXT DEFAULT ''
);

-- Payment audit table: logs cash payment and session top-up events
CREATE TABLE IF NOT EXISTS payment_audit (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  sessions_added INTEGER DEFAULT 0,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  admin_operator_id UUID REFERENCES profiles(id),
  previous_balance INTEGER DEFAULT 0,
  new_balance INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_academic_level ON students(academic_level);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_admin ON attendance(admin_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scanned ON attendance(scanned_at);
CREATE INDEX IF NOT EXISTS idx_reports_admin ON reports(admin_id);
CREATE INDEX IF NOT EXISTS idx_reports_tier ON reports(tier);
CREATE INDEX IF NOT EXISTS idx_payment_audit_student ON payment_audit(student_id);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit ENABLE ROW LEVEL SECURITY;

-- Policies: admins can read/write all, users can read own if needed

DROP POLICY IF EXISTS "Admins can manage students" ON students;
CREATE POLICY "Admins can manage students"
  ON students FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage attendance" ON attendance;
CREATE POLICY "Admins can manage attendance"
  ON attendance FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
CREATE POLICY "Admins can manage reports"
  ON reports FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage payment_audit" ON payment_audit;
CREATE POLICY "Admins can manage payment_audit"
  ON payment_audit FOR ALL
  USING (public.is_admin());

-- Triggers: auto-create student record when profile is created with role != 'admin'
CREATE OR REPLACE FUNCTION handle_new_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM 'admin' THEN
    INSERT INTO public.students (id, name, email)
    VALUES (NEW.id, COALESCE(NEW.name, ''), COALESCE(NEW.email, ''))
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_student();
