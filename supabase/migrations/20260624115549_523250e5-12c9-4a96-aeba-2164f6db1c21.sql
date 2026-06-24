DROP POLICY IF EXISTS "Votes viewable by everyone" ON public.report_votes;

CREATE POLICY "Users can view own votes"
ON public.report_votes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);