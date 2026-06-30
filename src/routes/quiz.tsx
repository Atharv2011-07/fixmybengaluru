import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Brain, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { AppHeader } from "@/components/AppHeader";
import DotField from "@/components/DotField";
import { Button } from "@/components/ui/button";
import { getDailyQuiz, todayKolkata } from "@/lib/trivia";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Daily Bengaluru Trivia — Pothole Bengaluru" },
      {
        name: "description",
        content: "Test your Bengaluru knowledge with a fresh trivia quiz every day. One attempt per day!",
      },
    ],
  }),
  component: QuizPage,
});

type Attempt = { score: number; total: number };

function QuizPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const today = useMemo(() => todayKolkata(), []);
  const questions = useMemo(() => getDailyQuiz(today, 5), [today]);

  const [checking, setChecking] = useState(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setChecking(false);
      return;
    }
    let active = true;
    supabase
      .from("quiz_attempts")
      .select("score, total")
      .eq("user_id", user.id)
      .eq("quiz_date", today)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data) setAttempt(data as Attempt);
        setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, user, today]);

  const choose = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[current].answer;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, idx]);
  };

  const next = async () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      return;
    }
    // finished — persist
    if (!user) return;
    setSaving(true);
    const finalScore = score;
    const { error } = await supabase
      .from("quiz_attempts")
      .insert({ user_id: user.id, quiz_date: today, score: finalScore, total: questions.length });
    setSaving(false);
    if (error) {
      toast.error("Could not save your result");
    }
    setAttempt({ score: finalScore, total: questions.length });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <section className="relative overflow-hidden border-b border-border/70 bg-gradient-hero text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <DotField bulgeStrength={67} glowRadius={160} />
        </div>
        <div className="relative mx-auto flex max-w-2xl items-center gap-3 px-4 py-6">
          <span className="grid size-11 place-items-center rounded-xl bg-primary-foreground/15 backdrop-blur">
            <Brain className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">Daily Bengaluru Trivia</h1>
            <p className="text-sm text-primary-foreground/80">A fresh 5-question quiz every day. One shot only!</p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {loading || checking ? (
          <div className="grid place-items-center py-20 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : !isAuthenticated ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">Sign in to play the daily quiz.</p>
            <Button asChild className="mt-4">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        ) : attempt ? (
          <ResultCard score={attempt.score} total={attempt.total} alreadyPlayed />
        ) : (
          <div className="card-elevated p-6">
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {current + 1} of {questions.length}</span>
              <span>Score: {score}</span>
            </div>
            <h2 className="font-display text-lg font-semibold">{questions[current].q}</h2>
            <div className="mt-4 space-y-2">
              {questions[current].options.map((opt, i) => {
                const isAnswer = i === questions[current].answer;
                const isPicked = selected === i;
                let cls = "border-border hover:border-primary";
                if (selected !== null) {
                  if (isAnswer) cls = "border-success bg-success/10";
                  else if (isPicked) cls = "border-destructive bg-destructive/10";
                  else cls = "border-border opacity-60";
                }
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={selected !== null}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${cls}`}
                  >
                    <span>{opt}</span>
                    {selected !== null && isAnswer && <CheckCircle2 className="size-4 text-success" />}
                    {selected !== null && isPicked && !isAnswer && <XCircle className="size-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <Button onClick={next} disabled={saving} className="mt-5 w-full">
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : current < questions.length - 1 ? (
                  "Next question"
                ) : (
                  "Finish & see score"
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ score, total, alreadyPlayed }: { score: number; total: number; alreadyPlayed?: boolean }) {
  const pct = Math.round((score / total) * 100);
  return (
    <div className="card-elevated p-8 text-center">
      <p className="text-sm text-muted-foreground">{alreadyPlayed ? "You've already played today" : "Quiz complete!"}</p>
      <p className="mt-3 font-display text-5xl font-bold text-primary">{score}/{total}</p>
      <p className="mt-2 text-sm text-muted-foreground">{pct}% correct</p>
      <p className="mt-4 text-sm">
        {pct === 100
          ? "Perfect! A true Bengalurean 🏆"
          : pct >= 60
            ? "Nice work — come back tomorrow for a new set!"
            : "Better luck tomorrow — a fresh quiz drops daily."}
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">Back to map</Link>
      </Button>
    </div>
  );
}