import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Flame, Loader2, MessageCircle, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { computeStreak, getWspComplaintCount } from "@/lib/profileStats";
import { todayKolkata } from "@/lib/trivia";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — fixmybengaluru" },
      { name: "description", content: "Your reports, BBMP WhatsApp complaints and daily quiz streak." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(true);
  const [reportCount, setReportCount] = useState(0);
  const [wspCount, setWspCount] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user) {
      setBusy(false);
      return;
    }
    let active = true;
    (async () => {
      const [reports, quiz] = await Promise.all([
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quiz_attempts").select("quiz_date").eq("user_id", user.id),
      ]);
      if (!active) return;
      setReportCount(reports.count ?? 0);
      const dates = (quiz.data ?? []).map((r) => r.quiz_date as string);
      setStreak(computeStreak(dates, todayKolkata()));
      setWspCount(getWspComplaintCount());
      setBusy(false);
    })();
    return () => {
      active = false;
    };
  }, [loading, isAuthenticated, user]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <section className="border-b border-border/70 bg-gradient-hero text-primary-foreground">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-6">
          <span className="grid size-11 place-items-center rounded-xl bg-primary-foreground/15 backdrop-blur">
            <UserIcon className="size-6" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold">Your Profile</h1>
            <p className="truncate text-sm text-primary-foreground/80">{user?.email ?? "Track your civic impact"}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {loading || busy ? (
          <div className="grid place-items-center py-20 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : !isAuthenticated ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>
            <Button asChild className="mt-4">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={<FileText className="size-6" />} label="Reports filed" value={reportCount} />
            <StatCard
              icon={<MessageCircle className="size-6" />}
              label="BBMP WhatsApp complaints"
              value={wspCount}
            />
            <StatCard
              icon={<Flame className="size-6" />}
              label="Daily quiz streak"
              value={streak}
              suffix={streak === 1 ? "day" : "days"}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="card-elevated flex flex-col items-center gap-2 p-6 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <p className="font-display text-3xl font-bold">
        {value}
        {suffix ? <span className="ml-1 text-base font-medium text-muted-foreground">{suffix}</span> : null}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}