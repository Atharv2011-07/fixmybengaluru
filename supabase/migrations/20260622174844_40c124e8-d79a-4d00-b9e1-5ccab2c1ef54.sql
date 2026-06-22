-- 1. Restrict EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reports_log_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
-- has_role is required by RLS policies and authenticated RPC checks
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- 2. Tighten "Anyone can create reports" so it is no longer WITH CHECK (true)
DROP POLICY IF EXISTS "Anyone can create reports" ON public.reports;
CREATE POLICY "Anyone can create reports"
  ON public.reports
  FOR INSERT
  TO public
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 3. Add WITH CHECK to officer/admin report updates
DROP POLICY IF EXISTS "Officers and admins can update any report" ON public.reports;
CREATE POLICY "Officers and admins can update any report"
  ON public.reports
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'officer'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'officer'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- 4. Restrict storage uploads to an owner-scoped folder path
DROP POLICY IF EXISTS "Anyone can upload pothole images" ON storage.objects;
CREATE POLICY "Anyone can upload pothole images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (
    bucket_id = 'pothole-images'
    AND (
      (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
      OR (auth.uid() IS NULL AND (storage.foldername(name))[1] = 'guest')
    )
  );