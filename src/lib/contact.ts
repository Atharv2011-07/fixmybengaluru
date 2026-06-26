import { getPublicContact } from "@/lib/contact.functions";

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
  const data = await getPublicContact();
  return (data as SiteContact) ?? null;
}