import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Loader2, Plus, Search } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { MapView } from "@/components/map/MapView";
import { CityIntro } from "@/components/CityIntro";
import { ComicLoader } from "@/components/ComicLoader";
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

  const [intro, setIntro] = useState(false);
  useEffect(() => {
    if (!sessionStorage.getItem("pb-intro-seen")) setIntro(true);
  }, []);

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
    <div className="flex min-h-screen flex-col bg-background">
      {intro && (
        <CityIntro
          onDone={() => {
            sessionStorage.setItem("pb-intro-seen", "1");
            setIntro(false);
          }}
        />
      )}
      <AppHeader />
      <LocationBanner />

      {/* Hero stats */}
      <section className="border-b border-border/70 bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Fix Bengaluru&apos;s roads, together
          </h1>
          <p className="mt-1 max-w-xl text-sm text-primary-foreground/80">
            Spot a pothole? Report it in one tap, watch it move through repair, and back the worst ones with your vote.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-xl sm:grid-cols-4">
            <Stat label="Reported" value={stats.total} />
            <Stat label="In progress" value={stats.open} />
            <Stat label="Resolved" value={stats.resolved} />
            <Stat label="Critical" value={stats.critical} />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border/70 bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <div className="relative min-w-[180px] flex-1">
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

      {/* Map + list */}
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-0 lg:grid-cols-[1fr_380px]">
        <div className="relative h-[45vh] min-h-[320px] lg:h-[calc(100vh-13.5rem)]">
          <MapView reports={filtered} />
          <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap gap-2 rounded-lg bg-card/90 p-2 text-[11px] shadow-[var(--shadow-card)] backdrop-blur">
            {LEGEND.map((l) => (
              <span key={l.label} className="flex items-center gap-1">
                <span className="size-2.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        <aside className="flex flex-col border-t border-border/70 lg:max-h-[calc(100vh-13.5rem)] lg:border-l lg:border-t-0">
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
              <div className="py-10">
                <ComicLoader message="Loading reports" />
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
