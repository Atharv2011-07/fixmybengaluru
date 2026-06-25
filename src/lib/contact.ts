import { supabase } from "@/integrations/supabase/client";

export interface SiteContact {
  id: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  hours: string | null;
  description: string | null;
  updated_at: string;
}

export async function fetchContact(): Promise<SiteContact | null> {
  const { data, error } = await supabase
    .from("site_contact" as never)
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as SiteContact) ?? null;
}