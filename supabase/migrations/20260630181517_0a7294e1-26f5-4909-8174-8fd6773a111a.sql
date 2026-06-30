CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  map_height_px INT NOT NULL DEFAULT 480,
  map_width_px INT NOT NULL DEFAULT 440,
  map_mobile_vh INT NOT NULL DEFAULT 32,
  show_legend BOOLEAN NOT NULL DEFAULT true,
  show_hero BOOLEAN NOT NULL DEFAULT true,
  show_dotfield BOOLEAN NOT NULL DEFAULT true,
  show_blobcursor BOOLEAN NOT NULL DEFAULT true,
  hero_title TEXT NOT NULL DEFAULT 'Fix Bengaluru''s roads, together',
  hero_subtitle TEXT NOT NULL DEFAULT 'Spot a pothole? Report it in one tap, watch it move through repair, and back the worst ones with your vote.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage site settings"
ON public.site_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings DEFAULT VALUES;