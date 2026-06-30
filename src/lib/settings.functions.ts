import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface SiteSettings {
  id: string;
  map_height_px: number;
  map_width_px: number;
  map_mobile_vh: number;
  show_legend: boolean;
  show_hero: boolean;
  show_dotfield: boolean;
  show_blobcursor: boolean;
  hero_title: string;
  hero_subtitle: string;
  updated_at: string;
}

export interface SettingsUpdateInput {
  map_height_px: number;
  map_width_px: number;
  map_mobile_vh: number;
  show_legend: boolean;
  show_hero: boolean;
  show_dotfield: boolean;
  show_blobcursor: boolean;
  hero_title: string;
  hero_subtitle: string;
}

const COLS =
  "id, map_height_px, map_width_px, map_mobile_vh, show_legend, show_hero, show_dotfield, show_blobcursor, hero_title, hero_subtitle, updated_at";

export const getPublicSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await (supabaseAdmin as any)
      .from("site_settings")
      .select(COLS)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as SiteSettings) ?? null;
  },
);

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export const updateSettingsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SettingsUpdateInput) => {
    if (!data) throw new Error("Settings data is required");
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

    const payload = {
      map_height_px: clamp(data.map_height_px, 200, 1200),
      map_width_px: clamp(data.map_width_px, 280, 900),
      map_mobile_vh: clamp(data.map_mobile_vh, 20, 90),
      show_legend: !!data.show_legend,
      show_hero: !!data.show_hero,
      show_dotfield: !!data.show_dotfield,
      show_blobcursor: !!data.show_blobcursor,
      hero_title: String(data.hero_title ?? "").slice(0, 200),
      hero_subtitle: String(data.hero_subtitle ?? "").slice(0, 500),
    };

    const { data: existing } = await (supabaseAdmin as any)
      .from("site_settings")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await (supabaseAdmin as any)
        .from("site_settings")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await (supabaseAdmin as any).from("site_settings").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
