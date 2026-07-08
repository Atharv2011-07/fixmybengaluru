export const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };

// Reports imported from the official BBMP potholes dashboard use this exact
// reporter_name so they can be flagged with a "Government / Official" badge.
export const GOV_REPORTER_NAME = "BBMP – Official Record";

export function isOfficialReport(report: { reporter_name?: string | null }): boolean {
  return report.reporter_name === GOV_REPORTER_NAME;
}

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
  "Vijayanagar",
  "Basaveshwaranagar",
  "Rajarajeshwari Nagar",
  "Kengeri",
  "Nagarbhavi",
  "Yeshwanthpur",
  "Peenya",
  "Vidyaranyapura",
  "Sahakar Nagar",
  "Sanjaynagar",
  "Byatarayanapura",
  "KR Puram",
  "Ramamurthy Nagar",
  "Banaswadi",
  "Kammanahalli",
  "Frazer Town",
  "Shivajinagar",
  "Basavanagudi",
  "Chamrajpet",
  "Chickpet",
  "Gandhinagar",
  "Shanthinagar",
  "Wilson Garden",
  "Uttarahalli",
  "Kumaraswamy Layout",
  "Girinagar",
  "Bommanahalli",
  "Anekal",
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
  Vijayanagar: { lat: 12.9634, lng: 77.5385 },
  Basaveshwaranagar: { lat: 12.9915, lng: 77.5386 },
  "Rajarajeshwari Nagar": { lat: 12.9279, lng: 77.5183 },
  Kengeri: { lat: 12.9166, lng: 77.4826 },
  Nagarbhavi: { lat: 12.96, lng: 77.51 },
  Yeshwanthpur: { lat: 13.0284, lng: 77.5546 },
  Peenya: { lat: 13.0287, lng: 77.5195 },
  Vidyaranyapura: { lat: 13.0846, lng: 77.5561 },
  "Sahakar Nagar": { lat: 13.0577, lng: 77.59 },
  Sanjaynagar: { lat: 13.035, lng: 77.572 },
  Byatarayanapura: { lat: 13.062, lng: 77.594 },
  "KR Puram": { lat: 13.008, lng: 77.696 },
  "Ramamurthy Nagar": { lat: 13.0159, lng: 77.6774 },
  Banaswadi: { lat: 13.0138, lng: 77.651 },
  Kammanahalli: { lat: 13.0165, lng: 77.641 },
  "Frazer Town": { lat: 12.9985, lng: 77.6155 },
  Shivajinagar: { lat: 12.985, lng: 77.605 },
  Basavanagudi: { lat: 12.942, lng: 77.573 },
  Chamrajpet: { lat: 12.958, lng: 77.572 },
  Chickpet: { lat: 12.968, lng: 77.579 },
  Gandhinagar: { lat: 12.978, lng: 77.573 },
  Shanthinagar: { lat: 12.956, lng: 77.6 },
  "Wilson Garden": { lat: 12.949, lng: 77.596 },
  Uttarahalli: { lat: 12.907, lng: 77.546 },
  "Kumaraswamy Layout": { lat: 12.907, lng: 77.558 },
  Girinagar: { lat: 12.943, lng: 77.546 },
  Bommanahalli: { lat: 12.901, lng: 77.618 },
  Anekal: { lat: 12.711, lng: 77.696 },
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
  ward: string;
  mp: string;
  mpConstituency: string;
}

// Approximate Lok Sabha (MP) constituency + sitting member per assembly seat.
const MP_BY_CONSTITUENCY: Record<string, { mp: string; mpConstituency: string }> = {
  "BTM Layout": { mp: "Tejasvi Surya", mpConstituency: "Bangalore South" },
  "C.V. Raman Nagar": { mp: "PC Mohan", mpConstituency: "Bangalore Central" },
  Mahadevapura: { mp: "PC Mohan", mpConstituency: "Bangalore Central" },
  Jayanagar: { mp: "Tejasvi Surya", mpConstituency: "Bangalore South" },
  Bommanahalli: { mp: "Tejasvi Surya", mpConstituency: "Bangalore South" },
  Malleshwaram: { mp: "Shobha Karandlaje", mpConstituency: "Bangalore North" },
  Hebbal: { mp: "Shobha Karandlaje", mpConstituency: "Bangalore North" },
  Banashankari: { mp: "Tejasvi Surya", mpConstituency: "Bangalore South" },
  Yelahanka: { mp: "Dr. CN Manjunath", mpConstituency: "Bangalore Rural" },
  Rajajinagar: { mp: "PC Mohan", mpConstituency: "Bangalore Central" },
  Padmanabhanagar: { mp: "Tejasvi Surya", mpConstituency: "Bangalore South" },
  "Vijay Nagar": { mp: "Tejasvi Surya", mpConstituency: "Bangalore South" },
  "Govindraj Nagar": { mp: "Tejasvi Surya", mpConstituency: "Bangalore South" },
  Chickpet: { mp: "Tejasvi Surya", mpConstituency: "Bangalore South" },
  Basavanagudi: { mp: "Tejasvi Surya", mpConstituency: "Bangalore South" },
  Anekal: { mp: "Dr. CN Manjunath", mpConstituency: "Bangalore Rural" },
  Rajarajeshwarinagar: { mp: "Dr. CN Manjunath", mpConstituency: "Bangalore Rural" },
  Yeshwanthpur: { mp: "Shobha Karandlaje", mpConstituency: "Bangalore North" },
  Dasarahalli: { mp: "Shobha Karandlaje", mpConstituency: "Bangalore North" },
  Byatarayanapura: { mp: "Shobha Karandlaje", mpConstituency: "Bangalore North" },
  Krishnarajapuram: { mp: "Shobha Karandlaje", mpConstituency: "Bangalore North" },
  Pulakeshinagar: { mp: "Shobha Karandlaje", mpConstituency: "Bangalore North" },
  Sarvagnanagar: { mp: "PC Mohan", mpConstituency: "Bangalore Central" },
  Shivajinagar: { mp: "PC Mohan", mpConstituency: "Bangalore Central" },
  "Shanti Nagar": { mp: "PC Mohan", mpConstituency: "Bangalore Central" },
  "Gandhi Nagar": { mp: "PC Mohan", mpConstituency: "Bangalore Central" },
  Chamrajpet: { mp: "PC Mohan", mpConstituency: "Bangalore Central" },
  "Bangalore South": { mp: "Tejasvi Surya", mpConstituency: "Bangalore South" },
};

// area → assembly constituency, MLA and ward.
const AREA_BASE: Record<string, { constituency: string; representative: string; ward: string }> = {
  Koramangala: { constituency: "BTM Layout", representative: "Ramalinga Reddy", ward: "Koramangala (Ward 151)" },
  Indiranagar: { constituency: "C.V. Raman Nagar", representative: "S. Raghu", ward: "Hoysala Nagar (Ward 80)" },
  Whitefield: { constituency: "Mahadevapura", representative: "Manjula S. Aravind Limbavali", ward: "Hagadur (Ward 84)" },
  Jayanagar: { constituency: "Jayanagar", representative: "C. K. Ramamurthy", ward: "Jayanagar (Ward 170)" },
  "HSR Layout": { constituency: "Bommanahalli", representative: "M. Satish Reddy", ward: "HSR Layout (Ward 174)" },
  Marathahalli: { constituency: "Mahadevapura", representative: "Manjula S. Aravind Limbavali", ward: "Marathahalli (Ward 85)" },
  "Electronic City": { constituency: "Bommanahalli", representative: "M. Satish Reddy", ward: "Singasandra (Ward 192)" },
  "BTM Layout": { constituency: "BTM Layout", representative: "Ramalinga Reddy", ward: "BTM Layout (Ward 176)" },
  Malleshwaram: { constituency: "Malleshwaram", representative: "Dr. C. N. Ashwath Narayan", ward: "Malleshwaram (Ward 45)" },
  Hebbal: { constituency: "Hebbal", representative: "Byrathi Suresh", ward: "Hebbal (Ward 21)" },
  Banashankari: { constituency: "Banashankari", representative: "P. R. Ramesh", ward: "Banashankari (Ward 154)" },
  Yelahanka: { constituency: "Yelahanka", representative: "S. R. Vishwanath", ward: "Yelahanka (Ward 6)" },
  Rajajinagar: { constituency: "Rajajinagar", representative: "S. Suresh Kumar", ward: "Rajajinagar (Ward 99)" },
  "JP Nagar": { constituency: "Padmanabhanagar", representative: "R. Ashoka", ward: "JP Nagar (Ward 178)" },
  Bellandur: { constituency: "Mahadevapura", representative: "Manjula S. Aravind Limbavali", ward: "Bellandur (Ward 150)" },
  "Sarjapur Road": { constituency: "Mahadevapura", representative: "Manjula S. Aravind Limbavali", ward: "Bellandur (Ward 150)" },
  Vijayanagar: { constituency: "Vijay Nagar", representative: "M. Krishnappa", ward: "Vijayanagar (Ward 104)" },
  Basaveshwaranagar: { constituency: "Rajajinagar", representative: "S. Suresh Kumar", ward: "Basaveshwara Nagar (Ward 98)" },
  "Rajarajeshwari Nagar": { constituency: "Rajarajeshwarinagar", representative: "Munirathna", ward: "RR Nagar (Ward 160)" },
  Kengeri: { constituency: "Rajarajeshwarinagar", representative: "Munirathna", ward: "Kengeri (Ward 159)" },
  Nagarbhavi: { constituency: "Govindraj Nagar", representative: "Priya Krishna", ward: "Nagarabhavi (Ward 103)" },
  Yeshwanthpur: { constituency: "Yeshwanthpur", representative: "S. T. Somashekar", ward: "Yeshwanthpura (Ward 35)" },
  Peenya: { constituency: "Dasarahalli", representative: "R. Manjunath", ward: "Peenya (Ward 41)" },
  Vidyaranyapura: { constituency: "Byatarayanapura", representative: "Krishna Byre Gowda", ward: "Vidyaranyapura (Ward 9)" },
  "Sahakar Nagar": { constituency: "Byatarayanapura", representative: "Krishna Byre Gowda", ward: "Sahakar Nagar (Ward 19)" },
  Sanjaynagar: { constituency: "Hebbal", representative: "Byrathi Suresh", ward: "Sanjaya Nagar (Ward 20)" },
  Byatarayanapura: { constituency: "Byatarayanapura", representative: "Krishna Byre Gowda", ward: "Byatarayanapura (Ward 8)" },
  "KR Puram": { constituency: "Krishnarajapuram", representative: "B. A. Basavaraja", ward: "KR Puram (Ward 53)" },
  "Ramamurthy Nagar": { constituency: "Krishnarajapuram", representative: "B. A. Basavaraja", ward: "Ramamurthy Nagar (Ward 57)" },
  Banaswadi: { constituency: "Sarvagnanagar", representative: "K. J. George", ward: "Banaswadi (Ward 26)" },
  Kammanahalli: { constituency: "Sarvagnanagar", representative: "K. J. George", ward: "Kacharakanahalli (Ward 30)" },
  "Frazer Town": { constituency: "Pulakeshinagar", representative: "A. C. Srinivasa", ward: "Jayamahal (Ward 32)" },
  Shivajinagar: { constituency: "Shivajinagar", representative: "Rizwan Arshad", ward: "Shivaji Nagar (Ward 92)" },
  Basavanagudi: { constituency: "Basavanagudi", representative: "L. A. Ravi Subramanya", ward: "Basavanagudi (Ward 154)" },
  Chamrajpet: { constituency: "Chamrajpet", representative: "B. Z. Zameer Ahmed Khan", ward: "Chamarajapete (Ward 122)" },
  Chickpet: { constituency: "Chickpet", representative: "Uday B. Garudachar", ward: "Chickpete (Ward 119)" },
  Gandhinagar: { constituency: "Gandhi Nagar", representative: "Dinesh Gundu Rao", ward: "Gandhinagar (Ward 94)" },
  Shanthinagar: { constituency: "Shanti Nagar", representative: "N. A. Haris", ward: "Shanti Nagar (Ward 117)" },
  "Wilson Garden": { constituency: "Shanti Nagar", representative: "N. A. Haris", ward: "Sudham Nagar (Ward 118)" },
  Uttarahalli: { constituency: "Bangalore South", representative: "M. Krishnappa", ward: "Uttarahalli (Ward 188)" },
  "Kumaraswamy Layout": { constituency: "Padmanabhanagar", representative: "R. Ashoka", ward: "Kumaraswamy Layout (Ward 184)" },
  Girinagar: { constituency: "Basavanagudi", representative: "L. A. Ravi Subramanya", ward: "Girinagar (Ward 156)" },
  Bommanahalli: { constituency: "Bommanahalli", representative: "M. Satish Reddy", ward: "Bommanahalli (Ward 191)" },
  Anekal: { constituency: "Anekal", representative: "B. Shivanna", ward: "Anekal Town" },
};

export const AREA_CONSTITUENCY: Record<string, ConstituencyInfo> = Object.fromEntries(
  Object.entries(AREA_BASE).map(([area, base]) => {
    const mp = MP_BY_CONSTITUENCY[base.constituency] ?? {
      mp: "MP unknown",
      mpConstituency: "Bengaluru",
    };
    return [area, { ...base, ...mp }];
  }),
) as Record<string, ConstituencyInfo>;

export function constituencyForArea(area: string | null | undefined): ConstituencyInfo {
  if (area && AREA_CONSTITUENCY[area]) return AREA_CONSTITUENCY[area];
  return {
    constituency: "Unmapped area",
    representative: "Representative unknown",
    ward: "Ward unknown",
    mp: "MP unknown",
    mpConstituency: "Bengaluru",
  };
}

// City-wide accountability coverage stats (indicative, for the landing banner).
export const CITY_STATS = {
  wards: 198,
  mlas: 28,
  mps: 5,
  scope: "All of Bengaluru",
};

// ── Road → contractor mapping ─────────────────────────────────────────────────
// Indicative civil contractors executing BBMP road works. Assigned
// deterministically per road so the same road always shows the same firm.
export interface ContractorInfo {
  contractor: string;
  agency: string;
  contact: string;
}

const ROAD_CONTRACTORS: ContractorInfo[] = [
  { contractor: "Sri Manjunatha Constructions", agency: "BBMP Road Infra Wing", contact: "080-2266-0001" },
  { contractor: "KMV Projects Ltd.", agency: "BBMP Major Roads Division", contact: "080-2266-0002" },
  { contractor: "Nagarjuna Construction Co.", agency: "BBMP Road Infra Wing", contact: "080-2266-0003" },
  { contractor: "RNS Infrastructure Ltd.", agency: "BBMP TenderSURE Cell", contact: "080-2266-0004" },
  { contractor: "B.S. Ramaiah & Sons", agency: "BBMP Ward Works Division", contact: "080-2266-0005" },
  { contractor: "Simplex Infrastructures", agency: "BBMP Major Roads Division", contact: "080-2266-0006" },
  { contractor: "GVPR Engineers Ltd.", agency: "BBMP Road Infra Wing", contact: "080-2266-0007" },
  { contractor: "Ashoka Buildcon Ltd.", agency: "BBMP TenderSURE Cell", contact: "080-2266-0008" },
];

// Stable hash so the same road string maps to the same contractor.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function contractorForRoad(
  road: string | null | undefined,
  area?: string | null,
): ContractorInfo {
  const key = (road?.trim() || area?.trim() || "Bengaluru").toLowerCase();
  return ROAD_CONTRACTORS[hashString(key) % ROAD_CONTRACTORS.length];
}