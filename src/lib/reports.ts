import { supabase } from "@/integrations/supabase/client";
import type { ReportStatus, Severity } from "./constants";

export interface PotholeReport {
  id: string;
  complaint_id: string;
  user_id: string | null;
  reporter_name: string | null;
  description: string;
  severity: Severity;
  ai_severity: Severity | null;
  ai_analysis: string | null;
  priority_score: number;
  latitude: number;
  longitude: number;
  road_name: string | null;
  landmark: string | null;
  ward: string | null;
  area: string | null;
  status: ReportStatus;
  image_urls: string[];
  upvotes: number;
  is_emergency: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusHistoryEntry {
  id: string;
  report_id: string;
  status: ReportStatus;
  note: string | null;
  created_at: string;
}

export async function fetchReports(): Promise<PotholeReport[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PotholeReport[];
}

export async function fetchReport(id: string): Promise<PotholeReport | null> {
  const { data, error } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as PotholeReport) ?? null;
}

export async function fetchStatusHistory(reportId: string): Promise<StatusHistoryEntry[]> {
  const { data, error } = await supabase
    .from("report_status_history")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as StatusHistoryEntry[];
}

// Private bucket -> generate signed URLs for display.
export async function signImageUrls(paths: string[]): Promise<string[]> {
  if (!paths.length) return [];
  const { data, error } = await supabase.storage
    .from("pothole-images")
    .createSignedUrls(paths, 60 * 60 * 24 * 7);
  if (error) throw error;
  return (data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[];
}

export async function uploadPotholeImages(files: File[], userId: string | null): Promise<string[]> {
  const prefix = userId ?? "guest";
  const paths: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("pothole-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    paths.push(path);
  }
  return paths;
}

export interface NewReportInput {
  description: string;
  severity: Severity;
  ai_severity?: Severity | null;
  ai_analysis?: string | null;
  latitude: number;
  longitude: number;
  road_name?: string | null;
  landmark?: string | null;
  ward?: string | null;
  area?: string | null;
  image_urls: string[];
  is_emergency: boolean;
  reporter_name?: string | null;
}

export async function createReport(input: NewReportInput, userId: string | null): Promise<PotholeReport> {
  const { data, error } = await supabase
    .from("reports")
    .insert({ ...input, user_id: userId })
    .select("*")
    .single();
  if (error) throw error;
  return data as PotholeReport;
}

export async function hasUserVoted(reportId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("report_votes")
    .select("id")
    .eq("report_id", reportId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleVote(reportId: string, userId: string, currentlyVoted: boolean): Promise<void> {
  if (currentlyVoted) {
    const { error } = await supabase
      .from("report_votes")
      .delete()
      .eq("report_id", reportId)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("report_votes").insert({ report_id: reportId, user_id: userId });
    if (error) throw error;
  }
}