export const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };

export type Severity = "minor" | "moderate" | "severe" | "dangerous";
export type ReportStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved";

export const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; description: string; badge: string; pin: string; score: number }
> = {
  minor: {
    label: "Minor",
    description: "Small crack or shallow dip",
    badge: "bg-success/15 text-success border-success/30",
    pin: "oklch(0.64 0.16 150)",
    score: 20,
  },
  moderate: {
    label: "Moderate",
    description: "Noticeable pothole, slows traffic",
    badge: "bg-warning/20 text-warning-foreground border-warning/40",
    pin: "oklch(0.82 0.16 95)",
  score: 45,
  },
  severe: {
    label: "Severe",
    description: "Large, deep — risk to vehicles",
    badge: "bg-[oklch(0.7_0.18_45)]/15 text-[oklch(0.55_0.2_40)] border-[oklch(0.7_0.18_45)]/40",
    pin: "oklch(0.7 0.18 50)",
    score: 70,
  },
  dangerous: {
    label: "Dangerous",
    description: "Hazardous — immediate threat",
    badge: "bg-destructive/15 text-destructive border-destructive/40",
    pin: "oklch(0.58 0.224 27)",
    score: 90,
  },
};

export const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; badge: string; step: number }
> = {
  submitted: { label: "Submitted", badge: "bg-secondary text-secondary-foreground border-border", step: 1 },
  under_review: { label: "Under Review", badge: "bg-accent/15 text-accent border-accent/30", step: 2 },
  assigned: { label: "Assigned", badge: "bg-primary/15 text-primary border-primary/30", step: 3 },
  in_progress: { label: "Repair In Progress", badge: "bg-warning/20 text-warning-foreground border-warning/40", step: 4 },
  resolved: { label: "Resolved", badge: "bg-success/15 text-success border-success/30", step: 5 },
};

export const STATUS_ORDER: ReportStatus[] = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
];

export const SEVERITY_ORDER: Severity[] = ["minor", "moderate", "severe", "dangerous"];

export const BENGALURU_AREAS = [
  "Koramangala",
  "Indiranagar",
  "Whitefield",
  "Jayanagar",
  "HSR Layout",
  "Marathahalli",
  "Electronic City",
  "BTM Layout",
  "Malleshwaram",
  "Hebbal",
  "Banashankari",
  "Yelahanka",
  "Rajajinagar",
  "JP Nagar",
  "Bellandur",
  "Sarjapur Road",
  "Other",
];

// Approximate centre coordinates for each Bengaluru locality.
export const BENGALURU_AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  Koramangala: { lat: 12.9352, lng: 77.6245 },
  Indiranagar: { lat: 12.9719, lng: 77.6412 },
  Whitefield: { lat: 12.9698, lng: 77.75 },
  Jayanagar: { lat: 12.925, lng: 77.5938 },
  "HSR Layout": { lat: 12.9116, lng: 77.6389 },
  Marathahalli: { lat: 12.9591, lng: 77.6974 },
  "Electronic City": { lat: 12.8452, lng: 77.6602 },
  "BTM Layout": { lat: 12.9166, lng: 77.6101 },
  Malleshwaram: { lat: 13.0035, lng: 77.5647 },
  Hebbal: { lat: 13.0358, lng: 77.597 },
  Banashankari: { lat: 12.9255, lng: 77.5468 },
  Yelahanka: { lat: 13.1007, lng: 77.5963 },
  Rajajinagar: { lat: 12.9914, lng: 77.552 },
  "JP Nagar": { lat: 12.9063, lng: 77.5857 },
  Bellandur: { lat: 12.9259, lng: 77.6762 },
  "Sarjapur Road": { lat: 12.9009, lng: 77.6878 },
};

// Returns the closest known Bengaluru area to a coordinate (within ~5km), else "Other".
export function nearestArea(lat: number, lng: number): string {
  let best = "Other";
  let min = Infinity;
  for (const [name, c] of Object.entries(BENGALURU_AREA_COORDS)) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (d < min) {
      min = d;
      best = name;
    }
  }
  // ~0.05 deg ≈ 5.5km guard so far-away pins fall back to "Other".
  return min <= 0.05 ** 2 ? best : "Other";
}

// Marker color for the map legend per spec: priority-driven.
export function markerColor(status: ReportStatus, severity: Severity): string {
  if (status === "resolved") return "oklch(0.64 0.16 150)"; // green
  if (severity === "dangerous") return "oklch(0.58 0.224 27)"; // red — critical
  if (severity === "severe") return "oklch(0.7 0.18 50)"; // orange — high
  return "oklch(0.82 0.16 95)"; // yellow — moderate/minor
}

// ── BBMP WhatsApp integration ────────────────────────────────────────────────
// Destination WhatsApp number. Country code + number, no symbols.
export const BBMP_WHATSAPP_NUMBER = "919480685700";

// Public-facing app/website identity used in the message footer.
export const APP_NAME = "FixMyBengaluru";
export const APP_WEBSITE = "https://fixmybengaluru.lovable.app";

export function buildBbmpWhatsAppUrl(report: {
  complaint_id: string;
  description: string;
  severity: Severity;
  reporter_name?: string | null;
  road_name?: string | null;
  landmark?: string | null;
  area?: string | null;
  ward?: string | null;
  latitude: number;
  longitude: number;
  is_emergency?: boolean;
}): string {
  const citizen = report.reporter_name?.trim() || `${APP_NAME} User`;
  const address =
    [report.road_name, report.landmark, report.area].filter(Boolean).join(", ") ||
    `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`;
  const maps = `https://maps.google.com/?q=${report.latitude},${report.longitude}`;

  const lines = [
    `📋 *Citizen Report*`,
    "",
    "",
    `*Citizen Name:* ${citizen}`,
    "",
    `*Complaint Description:* ${report.description}`,
    "",
    `*Severity:* ${SEVERITY_CONFIG[report.severity].label}`,
    "",
    `*Zone:* ${report.area?.trim() || "Unknown Zone"}`,
    "",
    `*Ward:* ${report.ward?.trim() || "Unknown Ward"}`,
    "",
    `*Address:* ${address}`,
    `📍 ${maps}`,
    "",
    `Website: ${APP_NAME} — ${APP_WEBSITE}`,
  ];
  return `https://wa.me/${BBMP_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// ── Hall of Shame: area → constituency / representative ───────────────────────
// Indicative mapping of localities to their assembly constituency & sitting
// representative. Used to rank which constituency has the most open potholes.
export interface ConstituencyInfo {
  constituency: string;
  representative: string;
}

export const AREA_CONSTITUENCY: Record<string, ConstituencyInfo> = {
  Koramangala: { constituency: "BTM Layout", representative: "Ramalinga Reddy" },
  Indiranagar: { constituency: "C.V. Raman Nagar", representative: "S. Raghu" },
  Whitefield: { constituency: "Mahadevapura", representative: "Manjula S. Aravind Limbavali" },
  Jayanagar: { constituency: "Jayanagar", representative: "C. K. Ramamurthy" },
  "HSR Layout": { constituency: "Bommanahalli", representative: "M. Satish Reddy" },
  Marathahalli: { constituency: "Mahadevapura", representative: "Manjula S. Aravind Limbavali" },
  "Electronic City": { constituency: "Bommanahalli", representative: "M. Satish Reddy" },
  "BTM Layout": { constituency: "BTM Layout", representative: "Ramalinga Reddy" },
  Malleshwaram: { constituency: "Malleshwaram", representative: "Dr. C. N. Ashwath Narayan" },
  Hebbal: { constituency: "Hebbal", representative: "Byrathi Suresh" },
  Banashankari: { constituency: "Banashankari", representative: "P. R. Ramesh" },
  Yelahanka: { constituency: "Yelahanka", representative: "S. R. Vishwanath" },
  Rajajinagar: { constituency: "Rajajinagar", representative: "S. Suresh Kumar" },
  "JP Nagar": { constituency: "Padmanabhanagar", representative: "R. Ashoka" },
  Bellandur: { constituency: "Mahadevapura", representative: "Manjula S. Aravind Limbavali" },
  "Sarjapur Road": { constituency: "Mahadevapura", representative: "Manjula S. Aravind Limbavali" },
};

export function constituencyForArea(area: string | null | undefined): ConstituencyInfo {
  if (area && AREA_CONSTITUENCY[area]) return AREA_CONSTITUENCY[area];
  return { constituency: "Unmapped area", representative: "Representative unknown" };
}