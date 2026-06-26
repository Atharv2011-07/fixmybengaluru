import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ContactUpdateInput {
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  hours: string;
  description: string;
}

export interface PublicSiteContact {
  id: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  hours: string | null;
  description: string | null;
  updated_at: string;
}

// Publicly readable contact details, served through a controlled server
// function so the underlying table is not directly exposed via the Data API.
export const getPublicContact = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSiteContact | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await (supabaseAdmin as any)
      .from("site_contact")
      .select("id, phone, email, whatsapp, address, hours, description, updated_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as PublicSiteContact) ?? null;
  },
);

export const updateContactAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ContactUpdateInput) => {
    if (!data) throw new Error("Contact data is required");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden: admin access required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await (supabaseAdmin as any)
      .from("site_contact")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const payload = {
      phone: data.phone,
      email: data.email,
      whatsapp: data.whatsapp,
      address: data.address,
      hours: data.hours,
      description: data.description,
    };

    if (existing?.id) {
      const { error } = await (supabaseAdmin as any)
        .from("site_contact")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await (supabaseAdmin as any).from("site_contact").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });