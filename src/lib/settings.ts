import { getPublicSettings, type SiteSettings } from "@/lib/settings.functions";

export type { SiteSettings };

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "default",
  map_height_px: 480,
  map_width_px: 440,
  map_mobile_vh: 32,
  show_legend: true,
  show_hero: true,
  show_dotfield: true,
  show_blobcursor: true,
  hero_title: "Fix Bengaluru's roads, together",
  hero_subtitle:
    "Spot a pothole? Report it in one tap, watch it move through repair, and back the worst ones with your vote.",
  updated_at: new Date(0).toISOString(),
};

export async function fetchSettings(): Promise<SiteSettings> {
  const data = await getPublicSettings();
  return (data as SiteSettings) ?? DEFAULT_SETTINGS;
}
