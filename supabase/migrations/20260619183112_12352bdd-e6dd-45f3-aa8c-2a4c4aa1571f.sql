
-- ===== Enums =====
CREATE TYPE public.app_role AS ENUM ('citizen', 'officer', 'admin');
CREATE TYPE public.pothole_severity AS ENUM ('minor', 'moderate', 'severe', 'dangerous');
CREATE TYPE public.report_status AS ENUM ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved');

-- ===== Profiles =====
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ===== User roles =====
CREATE TABLE public.user_roles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- ===== Complaint id sequence =====
CREATE SEQUENCE public.complaint_seq START 1001;

CREATE OR REPLACE FUNCTION public.gen_complaint_id()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'PB-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.complaint_seq')::text, 6, '0')
$$;

-- ===== Reports =====
CREATE TABLE public.reports (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT NOT NULL UNIQUE DEFAULT public.gen_complaint_id(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  reporter_name TEXT,
  description TEXT NOT NULL,
  severity public.pothole_severity NOT NULL DEFAULT 'moderate',
  ai_severity public.pothole_severity,
  ai_analysis TEXT,
  priority_score INTEGER NOT NULL DEFAULT 0,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  road_name TEXT,
  landmark TEXT,
  ward TEXT,
  area TEXT,
  status public.report_status NOT NULL DEFAULT 'submitted',
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  upvotes INTEGER NOT NULL DEFAULT 0,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT, INSERT ON public.reports TO anon;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports viewable by everyone" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Anyone can create reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can update own reports" ON public.reports FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Officers and admins can update any report" ON public.reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'officer') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners or admins can delete reports" ON public.reports FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created ON public.reports(created_at DESC);

-- ===== Priority score helper =====
CREATE OR REPLACE FUNCTION public.compute_priority(_severity public.pothole_severity, _upvotes INTEGER, _emergency BOOLEAN)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (CASE _severity
    WHEN 'minor' THEN 20
    WHEN 'moderate' THEN 45
    WHEN 'severe' THEN 70
    WHEN 'dangerous' THEN 90
    ELSE 40 END)
    + LEAST(_upvotes * 3, 30)
    + (CASE WHEN _emergency THEN 25 ELSE 0 END)
$$;

CREATE OR REPLACE FUNCTION public.reports_set_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.priority_score := LEAST(public.compute_priority(NEW.severity, NEW.upvotes, NEW.is_emergency), 100);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_reports_priority BEFORE INSERT OR UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.reports_set_priority();

-- ===== Status history =====
CREATE TABLE public.report_status_history (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports ON DELETE CASCADE,
  status public.report_status NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.report_status_history TO anon, authenticated;
GRANT INSERT ON public.report_status_history TO authenticated;
GRANT ALL ON public.report_status_history TO service_role;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "History viewable by everyone" ON public.report_status_history FOR SELECT USING (true);

CREATE INDEX idx_history_report ON public.report_status_history(report_id, created_at);

CREATE OR REPLACE FUNCTION public.reports_log_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.report_status_history(report_id, status, note, changed_by)
    VALUES (NEW.id, NEW.status, 'Report submitted', NEW.user_id);
  ELSIF (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.report_status_history(report_id, status, note, changed_by)
    VALUES (NEW.id, NEW.status, 'Status updated', auth.uid());
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_reports_log_status AFTER INSERT OR UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.reports_log_status();

-- ===== Votes =====
CREATE TABLE public.report_votes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (report_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.report_votes TO authenticated;
GRANT SELECT ON public.report_votes TO anon;
GRANT ALL ON public.report_votes TO service_role;
ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes viewable by everyone" ON public.report_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON public.report_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON public.report_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.sync_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.reports SET upvotes = upvotes + 1 WHERE id = NEW.report_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.reports SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.report_id;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER trg_vote_count AFTER INSERT OR DELETE ON public.report_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_vote_count();

-- ===== New user trigger =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
