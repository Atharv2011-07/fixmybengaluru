import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  Gauge,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { AppHeader } from "@/components/AppHeader";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { MapView } from "@/components/map/MapView";
import { Button } from "@/components/ui/button";
import {
  fetchReport,
  fetchStatusHistory,
  hasUserVoted,
  signImageUrls,
  toggleVote,
} from "@/lib/reports";
import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/constants";
import { buildBbmpWhatsAppUrl } from "@/lib/constants";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/reports/$id")({
  head: () => ({ meta: [{ title: "Report details — Pothole Bengaluru" }] }),
  component: ReportDetail,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center">Report not found.</div>
  ),
});

function ReportDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [voting, setVoting] = useState(false);

  const { data: report, isLoading } = useQuery({ queryKey: ["report", id], queryFn: () => fetchReport(id) });
  const { data: history = [] } = useQuery({ queryKey: ["history", id], queryFn: () => fetchStatusHistory(id) });
  const { data: imgs = [] } = useQuery({
    queryKey: ["images", id, report?.image_urls],
    queryFn: () => signImageUrls(report!.image_urls),
    enabled: !!report?.image_urls.length,
  });
  const { data: voted = false } = useQuery({
    queryKey: ["voted", id, user?.id],
    queryFn: () => hasUserVoted(id, user!.id),
    enabled: !!user,
  });

  const vote = async () => {
    if (!user) {
      toast.info("Sign in to upvote this report");
      navigate({ to: "/auth" });
      return;
    }
    setVoting(true);
    try {
      await toggleVote(id, user.id, voted);
      qc.invalidateQueries({ queryKey: ["voted", id] });
      qc.invalidateQueries({ queryKey: ["report", id] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    } catch {
      toast.error("Could not register your vote");
    } finally {
      setVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="grid place-items-center py-24 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-muted-foreground">This report doesn&apos;t exist.</p>
          <Button asChild className="mt-4"><Link to="/">Back to map</Link></Button>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_CONFIG[report.status].step;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to map
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{report.complaint_id}</p>
            <h1 className="font-display text-2xl font-bold">
              {report.road_name || report.area || "Pothole report"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <SeverityBadge severity={report.severity} />
              <StatusBadge status={report.status} />
              {report.is_emergency && (
                <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                  <AlertTriangle className="size-3" /> Emergency
                </span>
              )}
            </div>
          </div>
          <Button onClick={vote} disabled={voting} variant={voted ? "default" : "outline"} className="gap-1.5">
            {voting ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
            {voted ? "Upvoted" : "Upvote"} · {report.upvotes}
          </Button>
        </div>

        <a
          href={buildBbmpWhatsAppUrl(report)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-semibold text-white shadow-[var(--shadow-card)] transition hover:brightness-105"
        >
          <WhatsAppIcon className="size-5" />
          Report to BBMP on WhatsApp
        </a>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Opens WhatsApp with a pre-filled complaint — just hit send.
        </p>

        {imgs.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {imgs.map((src, i) => (
              <img key={i} src={src} alt={`Pothole ${i + 1}`}
                className="h-56 w-auto shrink-0 rounded-lg border border-border object-cover" />
            ))}
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="card-elevated p-4 md:col-span-2">
            <h2 className="font-display text-base font-semibold">Description</h2>
            <p className="mt-1.5 text-sm text-foreground/90">{report.description}</p>
            {report.ai_analysis && (
              <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm">
                <p className="flex items-center gap-1.5 font-semibold text-accent"><Sparkles className="size-4" /> AI analysis</p>
                <p className="mt-1 text-foreground/90">{report.ai_analysis}</p>
              </div>
            )}
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Meta label="Area" value={report.area} />
              <Meta label="Ward" value={report.ward} />
              <Meta label="Landmark" value={report.landmark} />
              <Meta label="Reported" value={formatDistanceToNow(new Date(report.created_at), { addSuffix: true })} />
            </dl>
          </div>
          <div className="card-elevated flex flex-col items-center justify-center p-4 text-center">
            <Gauge className="size-6 text-accent" />
            <p className="mt-1 font-display text-3xl font-bold">{report.priority_score}</p>
            <p className="text-xs text-muted-foreground">Priority score / 100</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="card-elevated mt-4 p-4">
          <h2 className="font-display text-base font-semibold">Repair timeline</h2>
          <div className="mt-3 space-y-0">
            {STATUS_ORDER.map((s, i) => {
              const cfg = STATUS_CONFIG[s];
              const done = cfg.step <= currentStep;
              const entry = history.find((h) => h.status === s);
              return (
                <div key={s} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${done ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                      {cfg.step}
                    </span>
                    {i < STATUS_ORDER.length - 1 && (
                      <span className={`w-px flex-1 ${done ? "bg-accent" : "bg-border"}`} style={{ minHeight: 22 }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{cfg.label}</p>
                    {entry && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "d MMM yyyy, h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div className="card-elevated mt-4 overflow-hidden">
          <div className="flex items-center gap-1.5 p-4 pb-2 text-sm font-semibold">
            <MapPin className="size-4 text-accent" /> Location
          </div>
          <div className="h-64">
            <MapView reports={[report]} />
          </div>
        </div>
      </main>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}