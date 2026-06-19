
ALTER FUNCTION public.compute_priority(public.pothole_severity, integer, boolean) SET search_path = public;

-- Trigger-only function: should never be called directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reports_set_priority() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reports_log_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_vote_count() FROM PUBLIC, anon, authenticated;
