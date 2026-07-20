import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, ImageOff, MapPin, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import { OfficialBadge } from "./OfficialBadge";
import { signImageUrls, type PotholeReport } from "@/lib/reports";
import { isOfficialReport } from "@/lib/constants";

export function ReportCard({ report }: { report: PotholeReport }) {
  const { data: imgs } = useQuery({
    queryKey: ["thumb", report.id, report.image_urls],
    queryFn: () => signImageUrls(report.image_urls.slice(0, 1)),
    enabled: report.image_urls.length > 0,
    staleTime: 1000 * 60 * 30,
  });
  const thumb = imgs?.[0];

  return (
    <Link
      to="/reports/$id"
      params={{ id: report.id }}
      className="card-elevated group relative block overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)] active:translate-y-0"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {thumb ? (
          <img
            src={thumb}
            alt={report.road_name || report.area || "Pothole"}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-x-2 top-2 flex flex-wrap items-center gap-1">
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
          {isOfficialReport(report) && <OfficialBadge />}
          {report.is_emergency && (
            <span className="ml-auto grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground shadow">
              <AlertTriangle className="size-3.5" />
            </span>
          )}
        </div>
        <div className="absolute inset-x-3 bottom-2 text-white">
          <p className="line-clamp-1 font-display text-base font-semibold drop-shadow-sm">
            {report.road_name || report.area || "Pothole report"}
          </p>
          <div className="mt-0.5 flex items-center justify-between text-[11px] text-white/85">
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{report.area || "Bengaluru"}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="flex items-center gap-0.5">
                <ArrowUp className="size-3" /> {report.upvotes}
              </span>
              <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}