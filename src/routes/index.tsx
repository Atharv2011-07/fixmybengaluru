import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Filter,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { MapView } from "@/components/map/MapView";
import DotField from "@/components/DotField";
import { CityIntro } from "@/components/CityIntro";
import { ReportCard } from "@/components/ReportCard";
import { LocationBanner } from "@/components/LocationBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchReports } from "@/lib/reports";
import { fetchSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import {
  BENGALURU_AREAS,
  SEVERITY_CONFIG,
  SEVERITY_ORDER,
  STATUS_CONFIG,
  STATUS_ORDER,
} from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pothole Bengaluru — Live Pothole Map" },
      {
        name: "description",
        content:
          "See every reported pothole across Bengaluru on a live map. Filter by area, ward, status and severity, and track repairs in real time.",
      },
    ],
  }),
  component: Index,
});

const LEGEND = [
  { color: "oklch(0.58 0.224 27)", label: "Critical" },
  { color: "oklch(0.7 0.18 50)", label: "High" },
  { color: "oklch(0.82 0.16 95)", label: "Moderate" },
  { color: "oklch(0.64 0.16 150)", label: "Resolved" },
];

function Index() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });

  const { data: settings = DEFAULT_SETTINGS } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSettings,
  });

  const [intro, setIntro] = useState(true);

  const [search, setSearch] = useState("");
  const [area, setArea] = useState("all");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      if (area !== "all" && r.area !== area) return false;
      if (status !== "all" && r.status !== status) return false;
      if (severity !== "all" && r.severity !== severity) return false;
      if (q) {
        const hay = `${r.complaint_id} ${r.road_name ?? ""} ${r.landmark ?? ""} ${r.area ?? ""} ${r.ward ?? ""} ${r.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reports, search, area, status, severity]);

  const stats = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === "resolved").length;
    const critical = reports.filter((r) => r.severity === "dangerous" && r.status !== "resolved").length;
    return { total, resolved, open: total - resolved, critical };
  }, [reports]);

  return (
    <div className="flex min-h-screen flex-col">
      {intro && <CityIntro onDone={() => setIntro(false)} />}
      <AppHeader />
      <LocationBanner />

      {/* Report centerpiece — Google-search-style focal CTA */}
      <section className="relative flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        <h1 className="font-display text-3xl font-bold text-foreground drop-shadow-sm sm:text-5xl">
          Spotted a pothole?
        </h1>
        <p className="mt-3 max-w-md text-sm text-foreground/80 sm:text-base">
          Report it in seconds. Every report goes straight to the map and to the ward officials.
        </p>

        <div className="relative mt-12 flex items-center justify-center">
          {/* Animated arrows pointing towards the button */}
          <ArrowRight className="report-arrow a-left absolute -left-16 size-9 text-primary sm:-left-24 sm:size-12" strokeWidth={2.5} />
          <ArrowLeft className="report-arrow a-right absolute -right-16 size-9 text-primary sm:-right-24 sm:size-12" strokeWidth={2.5} />
          <ArrowDown className="report-arrow a-top absolute -top-14 size-9 text-primary sm:size-12" strokeWidth={2.5} />
          <ArrowUp className="report-arrow a-bottom absolute -bottom-14 size-9 text-primary sm:size-12" strokeWidth={2.5} />

          <Button
            asChild
            className="report-cta h-auto rounded-2xl px-10 py-6 text-lg font-bold sm:px-16 sm:py-8 sm:text-2xl"
          >
            <Link to="/report">
              <MapPin className="size-6 sm:size-8" /> Report a Pothole
            </Link>
          </Button>
        </div>
      </section>

      {/* Hero stats */}
      {settings.show_hero && (
      <section className="relative overflow-hidden border-b border-border/70 bg-gradient-hero text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          {settings.show_dotfield && <DotField bulgeStrength={67} glowRadius={160} />}
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-6">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {settings.hero_title}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-primary-foreground/80">
            {settings.hero_subtitle}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-xl sm:grid-cols-4">
            <Stat label="Reported" value={stats.total} />
            <Stat label="In progress" value={stats.open} />
            <Stat label="Resolved" value={stats.resolved} />
            <Stat label="Critical" value={stats.critical} />
          </div>
        </div>
      </section>
      )}

      {/* Map + list */}
      <div
        className="relative z-[60] mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-0 lg:[grid-template-columns:minmax(0,var(--map-w))_1fr]"
        style={{ ["--map-w" as string]: `${settings.map_width_px}px` }}
      >
        <div className="flex flex-col">
          <div
            className="relative min-h-[240px] lg:!h-[var(--map-h)]"
            style={{
              height: `${settings.map_mobile_vh}vh`,
              ["--map-h" as string]: `${settings.map_height_px}px`,
            }}
          >
            <MapView reports={filtered} />
            {settings.show_legend && (
            <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap gap-2 rounded-lg bg-card/90 p-2 text-[11px] shadow-[var(--shadow-card)] backdrop-blur">
              {LEGEND.map((l) => (
                <span key={l.label} className="flex items-center gap-1">
                  <span className="size-2.5 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
            )}
          </div>

        </div>

        <aside
          className="flex flex-col border-t border-border/70 lg:border-l lg:border-t-0 lg:[max-height:var(--map-h)]"
          style={{ ["--map-h" as string]: `${settings.map_height_px}px` }}
        >
          {/* Search / filters — placed right above the reports */}
          <section
            className="border-b border-border/70 bg-cover bg-center"
            style={{ backgroundImage: "url('/bg-gradient.svg')" }}
          >
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
              <div className="relative min-w-[160px] flex-1">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search road, area, ward, complaint ID…"
                  className="pl-8"
                />
              </div>
              <FilterSelect value={area} onChange={setArea} placeholder="Area" allLabel="All areas"
                options={BENGALURU_AREAS.map((a) => ({ value: a, label: a }))} />
              <FilterSelect value={status} onChange={setStatus} placeholder="Status" allLabel="All statuses"
                options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_CONFIG[s].label }))} />
              <FilterSelect value={severity} onChange={setSeverity} placeholder="Severity" allLabel="All severity"
                options={SEVERITY_ORDER.map((s) => ({ value: s, label: SEVERITY_CONFIG[s].label }))} />
            </div>
          </section>

          <div className="flex items-center justify-between px-4 py-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Filter className="size-4 text-accent" /> {filtered.length} report{filtered.length === 1 ? "" : "s"}
            </p>
            <Button asChild size="sm" variant="outline" className="gap-1">
              <Link to="/report"><Plus className="size-3.5" /> New</Link>
            </Button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
            {isLoading ? (
              <div className="space-y-2 py-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-muted/60" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No reports match your filters yet.
                <div className="mt-3">
                  <Button asChild size="sm"><Link to="/report">Report a pothole</Link></Button>
                </div>
              </div>
            ) : (
              filtered.map((r) => <ReportCard key={r.id} report={r} />)
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-primary-foreground/10 px-3 py-2 backdrop-blur">
      <p className="font-display text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-primary-foreground/70">{label}</p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  allLabel,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-[1100]">
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
