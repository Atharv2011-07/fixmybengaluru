CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.site_contact (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  address TEXT,
  hours TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_contact TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_contact TO authenticated;
GRANT ALL ON public.site_contact TO service_role;

ALTER TABLE public.site_contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contact info" ON public.site_contact
  FOR SELECT USING (true);

CREATE POLICY "Admins can update contact info" ON public.site_contact
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert contact info" ON public.site_contact
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_contact_updated_at
  BEFORE UPDATE ON public.site_contact
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_contact (phone, email, whatsapp, address, hours, description)
VALUES (
  '+91 94806 85700',
  'support@fixmybengaluru.in',
  '+91 94806 85700',
  'BBMP Head Office, N R Square, Bengaluru, Karnataka 560002',
  'Mon–Sat, 9:00 AM – 6:00 PM',
  'Reach out to the FixMyBengaluru team for support, partnerships, or to escalate a critical road hazard.'
);