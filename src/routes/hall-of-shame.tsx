import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Skull, Trophy, ChevronRight, ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { fetchReports } from "@/lib/reports";
import { constituencyForArea } from "@/lib/constants";

export const Route = createFileRoute("/hall-of-shame")({
  head: () => ({
    meta: [
      { title: "Hall of Shame — Pothole Bengaluru" },
      {
        name: "description",
        content:
          "See which Bengaluru constituencies and their representatives have the most unresolved potholes. A transparency leaderboard for accountability.",
      },
    ],
  }),
  component: HallOfShame,
});

interface Row {
  constituency: string;
  representative: string;
  mp: string;
  mpConstituency: string;
  open: number;
  total: number;
  resolved: number;
  emergencies: number;
}

function HallOfShame() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });

  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    for (const r of reports) {
      const info = constituencyForArea(r.area);
      const key = info.constituency;
      const row =
        map.get(key) ??
        {
          constituency: info.constituency,
          representative: info.representative,
          mp: info.mp,
          mpConstituency: info.mpConstituency,
          open: 0,
          total: 0,
          resolved: 0,
          emergencies: 0,
        };
      row.total += 1;
      if (r.status === "resolved") row.resolved += 1;
      else row.open += 1;
      if (r.is_emergency && r.status !== "resolved") row.emergencies += 1;
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => b.open - a.open || b.total - a.total);
  }, [reports]);

  const worst = rows[0];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to map
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
            <Skull className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Hall of Shame</h1>
            <p className="text-sm text-muted-foreground">
              Constituencies ranked by unresolved potholes — accountability, by the numbers.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-24 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No reports yet. Be the first to <Link to="/report" className="text-accent underline">report a pothole</Link>.
          </div>
        ) : (
          <>
            {worst && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent p-5">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-destructive">
                  <Trophy className="size-3.5" /> Most potholes right now
                </p>
                <p className="mt-1 font-display text-2xl font-bold">{worst.constituency}</p>
                <p className="text-sm text-muted-foreground">
                  MLA {worst.representative} · MP {worst.mp} ({worst.mpConstituency})
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-bold text-destructive">{worst.open}</span> unresolved ·{" "}
                  {worst.total} total reports
                </p>
              </div>
            )}

            <ol className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
              {rows.map((row, i) => (
                <li
                  key={row.constituency}
                  className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-destructive/10 font-display text-base font-bold text-destructive">
                    {row.total}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2 truncate">
                      <span className="font-semibold">{row.constituency}</span>
                      <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      <span className="font-medium text-foreground/80">{row.open} unresolved</span>{" "}
                      · {row.representative}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </li>
              ))}
            </ol>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Constituency mapping is indicative, based on the reported area. Counts update live as reports come in.
            </p>
          </>
        )}
      </main>
    </div>
  );
}