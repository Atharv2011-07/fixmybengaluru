
CREATE OR REPLACE FUNCTION public.reports_log_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
REVOKE EXECUTE ON FUNCTION public.reports_log_status() FROM PUBLIC, anon, authenticated;
