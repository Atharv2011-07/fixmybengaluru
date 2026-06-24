DROP POLICY IF EXISTS "Anyone can read community messages" ON public.community_messages;
REVOKE SELECT ON public.community_messages FROM anon;

CREATE POLICY "Signed-in users can read community messages"
  ON public.community_messages FOR SELECT
  TO authenticated
  USING (true);