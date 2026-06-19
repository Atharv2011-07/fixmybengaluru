import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, ImageOff, MapPin, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import { signImageUrls, type PotholeReport } from "@/lib/reports";

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
      className="card-elevated group flex gap-3 overflow-hidden p-3 transition-shadow hover:shadow-[var(--shadow-float)]"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {thumb ? (
          <img src={thumb} alt="Pothole" className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-5" />
          </div>
        )}
        {report.is_emergency && (
          <span className="absolute left-1 top-1 grid size-5 place-items-center rounded-full bg-destructive text-destructive-foreground">
            <AlertTriangle className="size-3" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
        </div>
        <p className="mt-1 truncate font-display text-sm font-semibold">
          {report.road_name || report.area || "Pothole report"}
        </p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{report.description}</p>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" /> {report.area || "Bengaluru"}
          </span>
          <span className="flex items-center gap-2.5">
            <span className="flex items-center gap-0.5">
              <ArrowUp className="size-3" /> {report.upvotes}
            </span>
            <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}