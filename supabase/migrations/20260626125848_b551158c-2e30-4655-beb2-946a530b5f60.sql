DROP POLICY IF EXISTS "Anyone can view contact info" ON public.site_contact;

CREATE POLICY "Admins can view contact info"
ON public.site_contact
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT ON public.site_contact FROM anon;