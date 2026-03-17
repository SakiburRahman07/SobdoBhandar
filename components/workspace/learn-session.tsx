"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Command,
  Flame,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { difficultyToQuality, calculateNextReview } from "@/lib/spaced-repetition";
import type { WordWithReview } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/workspace/empty-state";
import { Flashcard } from "@/components/flashcard";

interface LearnSessionProps {
  initialWords: WordWithReview[];
  userId: string;
}

export function LearnSession({ initialWords, userId }: LearnSessionProps) {
  const words = initialWords;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState({ easy: 0, medium: 0, hard: 0 });

  const router = useRouter();
  const supabase = createClient();

  const currentWord = words[currentIndex];
  const totalCards = words.length;
  const progressPercent = totalCards ? Math.round((currentIndex / totalCards) * 100) : 0;

  const shortcuts = useMemo(
    () => [
      { key: "Space", label: "Reveal answer" },
      { key: "1", label: "Hard" },
      { key: "2", label: "Medium" },
      { key: "3", label: "Easy" },
    ],
    [],
  );

  const updateDailyProgress = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    const [{ data: existingProgress }, { data: yesterdayProgress }] = await Promise.all([
      supabase
        .from("daily_progress")
        .select("id, words_reviewed, streak_count")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle(),
      supabase
        .from("daily_progress")
        .select("streak_count")
        .eq("user_id", userId)
        .eq("date", yesterdayKey)
        .maybeSingle(),
    ]);

    const newStreak = yesterdayProgress?.streak_count ? yesterdayProgress.streak_count + 1 : 1;

    if (existingProgress) {
      await supabase
        .from("daily_progress")
        .update({
          words_reviewed: existingProgress.words_reviewed + totalCards,
          streak_count: Math.max(existingProgress.streak_count, newStreak),
        })
        .eq("id", existingProgress.id);
      return;
    }

    await supabase.from("daily_progress").insert({
      user_id: userId,
      date: today,
      words_reviewed: totalCards,
      words_learned: 0,
      streak_count: newStreak,
    });
  }, [supabase, totalCards, userId]);

  const handleRate = useCallback(async (difficulty: "hard" | "medium" | "easy") => {
    if (!currentWord?.review_schedule || submitting) return;

    setSubmitting(true);

    const quality = difficultyToQuality(difficulty);
    const reviewData = {
      easeFactor: currentWord.review_schedule.ease_factor,
      interval: currentWord.review_schedule.interval_days,
      repetitions: currentWord.review_schedule.repetitions,
      nextReviewDate: new Date(currentWord.review_schedule.next_review_date),
    };

    const result = calculateNextReview(quality, reviewData);

    const [{ error: scheduleError }, { error: wordError }] = await Promise.all([
      supabase
        .from("review_schedule")
        .update({
          next_review_date: result.nextReviewDate.toISOString().split("T")[0],
          interval_days: result.newInterval,
          ease_factor: result.newEaseFactor,
          repetitions: result.newRepetitions,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", currentWord.review_schedule.id),
      supabase.from("words").update({ difficulty }).eq("id", currentWord.id),
    ]);

    if (scheduleError || wordError) {
      toast.error("Could not update the review state.");
      setSubmitting(false);
      return;
    }

    setSessionStats((prev) => ({
      ...prev,
      [difficulty]: prev[difficulty] + 1,
    }));

    if (currentIndex < words.length - 1) {
      setCurrentIndex((index) => index + 1);
      setShowAnswer(false);
      setSubmitting(false);
      return;
    }

    await updateDailyProgress();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7 },
      colors: ["#49C6FF", "#34D399", "#FDBA4D"],
    });
    setCompleted(true);
    setSubmitting(false);
  }, [currentIndex, currentWord, submitting, supabase, updateDailyProgress, words.length]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!currentWord) return;
      if ((event.target as HTMLElement | null)?.tagName === "INPUT") return;

      if ((event.key === " " || event.key === "Enter") && !showAnswer) {
        event.preventDefault();
        setShowAnswer(true);
        return;
      }

      if (!showAnswer || submitting) return;

      if (event.key === "1") void handleRate("hard");
      if (event.key === "2") void handleRate("medium");
      if (event.key === "3") void handleRate("easy");
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentWord, handleRate, showAnswer, submitting]);

  if (words.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Your review queue is empty"
        description="There is nothing due right now. Add a few new words or head back to the dashboard to plan the next study block."
        actionHref="/words/add"
        actionLabel="Add a new word"
        secondaryHref="/dashboard"
        secondaryLabel="Return to dashboard"
      />
    );
  }

  if (completed) {
    const totalCompleted = sessionStats.easy + sessionStats.medium + sessionStats.hard;

    return (
      <div className="space-y-6">
        <div className="v2-card rounded-[2rem] p-8 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[radial-gradient(circle,_rgba(73,198,255,0.3),rgba(253,186,77,0.18)_60%,transparent_72%)]">
            <CheckCircle2 className="size-10 text-primary" />
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Session complete</p>
            <h1 className="font-display text-4xl font-semibold text-foreground">You finished today&apos;s review sprint</h1>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
              The session has been logged, your next review dates were updated, and your progress charts are ready for the next check-in.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm text-muted-foreground">Easy</p>
              <p className="mt-1 font-display text-3xl font-semibold text-emerald-300">{sessionStats.easy}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
              <p className="text-sm text-muted-foreground">Medium</p>
              <p className="mt-1 font-display text-3xl font-semibold text-amber-300">{sessionStats.medium}</p>
            </div>
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
              <p className="text-sm text-muted-foreground">Hard</p>
              <p className="mt-1 font-display text-3xl font-semibold text-rose-300">{sessionStats.hard}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Cards reviewed this session: {totalCompleted}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-2xl">
              <a href="/dashboard">Go to dashboard</a>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <a href="/words/add">Add another word</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            <BookOpenCheck className="size-3.5" />
            Focus mode
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Focused spaced repetition session</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Press Space or Enter to reveal the answer. Then use 1 for hard, 2 for medium, and 3 for easy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-2xl" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <Badge variant="outline" className="rounded-full border-border/80 bg-surface px-3 py-1 text-muted-foreground">
            <TimerReset className="mr-2 size-3.5" />
            {currentIndex + 1}/{totalCards}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.36fr]">
        <div className="space-y-6">
          <div className="v2-card rounded-[1.75rem] p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Session momentum</span>
              <span>{progressPercent}% complete</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-background/70">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#49c6ff,#34d399,#fdba4d)] transition-all"
                style={{ width: `${Math.max(progressPercent, 8)}%` }}
              />
            </div>
          </div>

          <Flashcard
            word={currentWord}
            showAnswer={showAnswer}
            onFlip={() => setShowAnswer((state) => !state)}
            onRate={handleRate}
          />
        </div>

        <aside className="space-y-4">
          <div className="v2-card rounded-[1.75rem] p-5">
            <p className="text-sm text-muted-foreground">Current run</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Easy</p>
                <p className="mt-1 font-display text-3xl font-semibold text-emerald-300">{sessionStats.easy}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Medium</p>
                <p className="mt-1 font-display text-3xl font-semibold text-amber-300">{sessionStats.medium}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Hard</p>
                <p className="mt-1 font-display text-3xl font-semibold text-rose-300">{sessionStats.hard}</p>
              </div>
            </div>
          </div>

          <div className="v2-card rounded-[1.75rem] p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Command className="size-4" />
              Keyboard shortcuts
            </div>
            <div className="mt-4 space-y-2">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 px-3 py-2 text-sm">
                  <span className="text-foreground">{shortcut.label}</span>
                  <kbd className="rounded-lg border border-border/70 px-2 py-1 text-xs text-muted-foreground">{shortcut.key}</kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="v2-card rounded-[1.75rem] border border-amber-400/20 bg-amber-400/8 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-200">
              <Flame className="size-4" />
              Focus tip
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Try to guess the meaning before flipping the card. That short moment of effort makes recall stronger over time.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
