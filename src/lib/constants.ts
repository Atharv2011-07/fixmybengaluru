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

// Marker color for the map legend per spec: priority-driven.
export function markerColor(status: ReportStatus, severity: Severity): string {
  if (status === "resolved") return "oklch(0.64 0.16 150)"; // green
  if (severity === "dangerous") return "oklch(0.58 0.224 27)"; // red — critical
  if (severity === "severe") return "oklch(0.7 0.18 50)"; // orange — high
  return "oklch(0.82 0.16 95)"; // yellow — moderate/minor
}