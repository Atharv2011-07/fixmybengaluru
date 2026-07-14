import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Home, List, Users, HelpCircle, Mail, MapPin, Plus, Search, SlidersHorizontal } from "lucide-react";
import { MapView } from "@/components/map/MapView";
import { CityIntro } from "@/components/CityIntro";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  { color: "#e11d2a", label: "Critical" },
  { color: "#f97316", label: "High" },
  { color: "#eab308", label: "Moderate" },
  { color: "#22c55e", label: "Resolved" },
];

const BOTTOM_NAV = [
  { label: "Home", href: "/", icon: Home },
  { label: "List", href: "/hall-of-shame", icon: List },
  { label: "Community", href: "/community", icon: Users },
  { label: "Quiz", href: "/quiz", icon: HelpCircle },
  { label: "Contact", href: "/contact", icon: Mail },
];

function Index() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
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

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {intro && <CityIntro onDone={() => setIntro(false)} />}

      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapView reports={filtered} />
      </div>

      {/* Top brand + search bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between gap-3 p-3 sm:p-4">
        <a
          href="/"
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-4 py-2 text-sm font-bold shadow-[var(--shadow-card)] backdrop-blur"
        >
          <MapPin className="size-4 text-primary" />
          FixMyBengaluru
          <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {isLoading ? "…" : `${filtered.length}`}
          </span>
        </a>

        <div className="pointer-events-auto flex flex-1 items-center gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search road, area, ward…"
              className="h-10 rounded-full border-border/60 bg-card/90 pl-9 shadow-[var(--shadow-card)] backdrop-blur"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-10 shrink-0 rounded-full border-border/60 bg-card/90 shadow-[var(--shadow-card)] backdrop-blur"
                aria-label="Filters"
              >
                <SlidersHorizontal className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="z-[1100] w-64 space-y-2">
              <FilterSelect value={area} onChange={setArea} placeholder="Area" allLabel="All areas"
                options={BENGALURU_AREAS.map((a) => ({ value: a, label: a }))} />
              <FilterSelect value={status} onChange={setStatus} placeholder="Status" allLabel="All statuses"
                options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_CONFIG[s].label }))} />
              <FilterSelect value={severity} onChange={setSeverity} placeholder="Severity" allLabel="All severity"
                options={SEVERITY_ORDER.map((s) => ({ value: s, label: SEVERITY_CONFIG[s].label }))} />
            </PopoverContent>
          </Popover>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute left-3 top-20 z-[500] hidden flex-wrap gap-2 rounded-lg bg-card/90 p-2 text-[11px] shadow-[var(--shadow-card)] backdrop-blur sm:flex">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1">
            <span className="size-2.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Bottom taskbar */}
      <nav className="absolute inset-x-0 bottom-3 z-[600] flex justify-center px-3 sm:bottom-5">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/60 bg-card/95 p-1.5 shadow-[var(--shadow-float)] backdrop-blur">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-foreground/80 transition hover:bg-muted hover:text-foreground sm:text-sm"
                activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" }}
                activeOptions={{ exact: true }}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/report"
            className="ml-1 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-card)] transition hover:brightness-110 sm:text-sm"
          >
            <Plus className="size-4" />
            Report
          </Link>
        </div>
      </nav>
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
