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