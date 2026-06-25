import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean }> => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    return { isAdmin: !!data };
  });

export const deleteReportAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reportId: string }) => {
    if (!data?.reportId) throw new Error("reportId is required");
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

    // Clean up associated storage images before removing the row.
    const { data: report } = await supabaseAdmin
      .from("reports")
      .select("image_urls")
      .eq("id", data.reportId)
      .maybeSingle();
    const paths = (report?.image_urls ?? []) as string[];
    if (paths.length) {
      await supabaseAdmin.storage.from("pothole-images").remove(paths);
    }

    // Child rows cascade on delete.
    const { error } = await supabaseAdmin.from("reports").delete().eq("id", data.reportId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const STATUSES = ["submitted", "under_review", "assigned", "in_progress", "resolved"] as const;

export const updateReportStatusAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reportId: string; status: string }) => {
    if (!data?.reportId) throw new Error("reportId is required");
    if (!STATUSES.includes(data.status as (typeof STATUSES)[number])) {
      throw new Error("Invalid status");
    }
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
    const { error } = await supabaseAdmin
      .from("reports")
      .update({ status: data.status })
      .eq("id", data.reportId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });