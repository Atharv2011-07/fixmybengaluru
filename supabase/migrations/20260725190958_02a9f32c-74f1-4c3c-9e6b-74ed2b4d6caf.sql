
CREATE TABLE public.fix_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  submitter_user_id uuid,
  submitter_name text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  distance_m double precision NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  image_urls text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.fix_submissions TO authenticated;
GRANT SELECT ON public.fix_submissions TO anon;
GRANT ALL ON public.fix_submissions TO service_role;

ALTER TABLE public.fix_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fix submissions viewable by everyone"
  ON public.fix_submissions FOR SELECT USING (true);

CREATE POLICY "Anyone can create fix submissions"
  ON public.fix_submissions FOR INSERT
  WITH CHECK (submitter_user_id IS NULL OR auth.uid() = submitter_user_id);

CREATE INDEX fix_submissions_report_id_idx ON public.fix_submissions(report_id);

-- Haversine distance in metres
CREATE OR REPLACE FUNCTION public.haversine_m(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
RETURNS double precision
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  SELECT 2 * 6371000 * asin(
    sqrt(
      power(sin(radians(lat2 - lat1) / 2), 2)
      + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
    )
  )
$$;

-- Submit a fix verification; auto-resolves the report if within 100m.
CREATE OR REPLACE FUNCTION public.submit_fix_verification(
  _report_id uuid,
  _lat double precision,
  _lng double precision,
  _image_urls text[],
  _submitter_name text
)
RETURNS public.fix_submissions
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.reports%ROWTYPE;
  dist double precision;
  is_verified boolean;
  row_out public.fix_submissions;
BEGIN
  SELECT * INTO r FROM public.reports WHERE id = _report_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Report not found';
  END IF;

  IF COALESCE(array_length(_image_urls, 1), 0) = 0 THEN
    RAISE EXCEPTION 'At least one photo is required';
  END IF;

  dist := public.haversine_m(r.latitude, r.longitude, _lat, _lng);
  is_verified := dist <= 100;

  INSERT INTO public.fix_submissions (report_id, submitter_user_id, submitter_name, latitude, longitude, distance_m, verified, image_urls)
  VALUES (_report_id, auth.uid(), NULLIF(_submitter_name, ''), _lat, _lng, dist, is_verified, _image_urls)
  RETURNING * INTO row_out;

  IF is_verified AND r.status <> 'resolved' THEN
    UPDATE public.reports SET status = 'resolved', updated_at = now() WHERE id = _report_id;
  END IF;

  RETURN row_out;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_fix_verification(uuid, double precision, double precision, text[], text) TO anon, authenticated;
