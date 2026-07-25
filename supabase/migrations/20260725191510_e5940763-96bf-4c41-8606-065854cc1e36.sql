
-- Restrict fix_submissions SELECT to authenticated users only
DROP POLICY IF EXISTS "Fix submissions viewable by everyone" ON public.fix_submissions;
CREATE POLICY "Fix submissions viewable by authenticated"
  ON public.fix_submissions FOR SELECT
  TO authenticated
  USING (true);

REVOKE SELECT ON public.fix_submissions FROM anon;

-- Lock down SECURITY DEFINER functions: revoke public/anon EXECUTE
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reports_log_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_fix_verification(uuid, double precision, double precision, text[], text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_fix_verification(uuid, double precision, double precision, text[], text) TO authenticated;
