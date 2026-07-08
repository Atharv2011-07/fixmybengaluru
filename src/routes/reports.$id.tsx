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
  Landmark,
  Building2,
  User,
  HardHat,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { AppHeader } from "@/components/AppHeader";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { OfficialBadge } from "@/components/OfficialBadge";
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
import { buildBbmpWhatsAppUrl, isOfficialReport, constituencyForArea } from "@/lib/constants";
import { contractorForRoad } from "@/lib/constants";
import { useAuth } from "@/lib/useAuth";
import { incrementWspComplaintCount } from "@/lib/profileStats";

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
      <div className="min-h-screen">
        <AppHeader />
        <div className="grid place-items-center py-24 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-muted-foreground">This report doesn&apos;t exist.</p>
          <Button asChild className="mt-4"><Link to="/">Back to map</Link></Button>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_CONFIG[report.status].step;
  const accountability = constituencyForArea(report.area);
  const contractor = contractorForRoad(report.road_name, report.area);

  return (
    <div className="min-h-screen">
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
              {isOfficialReport(report) && <OfficialBadge />}
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
          onClick={() => incrementWspComplaintCount()}
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

        {/* Accountability — who is responsible */}
        <div className="card-elevated mt-4 p-4">
          <h2 className="font-display text-base font-semibold">Who is responsible</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            This pothole falls under the following ward and elected representatives.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <AccountabilityCell
              icon={<Landmark className="size-4" />}
              tier="Ward"
              name={accountability.ward}
              sub="BBMP civic ward"
            />
            <AccountabilityCell
              icon={<User className="size-4" />}
              tier="MLA"
              name={accountability.representative}
              sub={accountability.constituency}
            />
            <AccountabilityCell
              icon={<Building2 className="size-4" />}
              tier="MP"
              name={accountability.mp}
              sub={accountability.mpConstituency}
            />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Mapping is indicative, based on the reported area.
          </p>
          <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
              <HardHat className="size-4" /> Road contractor
            </p>
            <p className="mt-1 font-display text-sm font-bold leading-snug">{contractor.contractor}</p>
            <p className="text-xs text-muted-foreground">
              {contractor.agency} · {report.road_name || report.area || "Bengaluru"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Helpline: {contractor.contact}</p>
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
        <div className="card-elevated relative z-[60] mt-4 overflow-hidden bg-background">
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

function AccountabilityCell({
  icon,
  tier,
  name,
  sub,
}: {
  icon: React.ReactNode;
  tier: string;
  name: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
        {icon} {tier}
      </p>
      <p className="mt-1 font-display text-sm font-bold leading-snug">{name}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.39c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42l-.48-.01c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}