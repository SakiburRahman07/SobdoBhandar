import Link from "next/link";
import { BookOpenCheck, BrainCircuit, Clock3, Flame, Plus, Sparkles, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getGreeting, isoDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/workspace/empty-state";
import { MetricCard } from "@/components/workspace/metric-card";
import { OnboardingCard } from "@/components/workspace/onboarding-card";
import { PageHeader } from "@/components/workspace/page-header";
import { ProgressRing } from "@/components/workspace/progress-ring";
import { SectionCard } from "@/components/workspace/section-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const today = isoDate();

  const profileQuery = await supabase
    .from("user_profiles")
    .select("display_name, target_words_per_day, onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileQuery.error
    ? (
        await supabase
          .from("user_profiles")
          .select("display_name, target_words_per_day")
          .eq("id", user.id)
          .maybeSingle()
      ).data
    : profileQuery.data;

  const [
    { count: totalWords },
    { count: dueToday },
    { data: progressRows },
    { data: wordDifficulties },
    { data: dueRows },
    { data: recentWords },
    { data: hardWords },
  ] = await Promise.all([
    supabase.from("words").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("review_schedule").select("id", { count: "exact", head: true }).eq("user_id", user.id).lte("next_review_date", today),
    supabase
      .from("daily_progress")
      .select("date, words_reviewed, words_learned, streak_count")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(7),
    supabase.from("words").select("difficulty").eq("user_id", user.id),
    supabase
      .from("review_schedule")
      .select("next_review_date, interval_days, repetitions, words!inner(id, english_word, bangla_meaning, difficulty)")
      .eq("user_id", user.id)
      .lte("next_review_date", today)
      .order("next_review_date", { ascending: true })
      .limit(4),
    supabase
      .from("words")
      .select("id, english_word, bangla_meaning, difficulty, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("words").select("id, english_word, bangla_meaning, difficulty").eq("user_id", user.id).eq("difficulty", "hard").limit(4),
  ]);

  const targetWords = profile?.target_words_per_day ?? 10;
  const todayProgress = progressRows?.find((row) => row.date === today);
  const wordsReviewedToday = todayProgress?.words_reviewed ?? 0;
  const weeklyReviewed = progressRows?.reduce((sum, row) => sum + (row.words_reviewed ?? 0), 0) ?? 0;
  const currentStreak = progressRows?.[0]?.streak_count ?? 0;
  const easyWords = wordDifficulties?.filter((word) => word.difficulty === "easy").length ?? 0;
  const hardCount = wordDifficulties?.filter((word) => word.difficulty === "hard").length ?? 0;
  const mastery = totalWords ? Math.round((easyWords / totalWords) * 100) : 0;
  const missionTarget = Math.max(targetWords, dueToday ?? 0, 1);
  const missionProgress = Math.min(100, Math.round((wordsReviewedToday / missionTarget) * 100));
  const needsOnboarding = !profile || !("onboarding_completed_at" in profile) || !(profile as { onboarding_completed_at?: string | null }).onboarding_completed_at;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Study cockpit"
        title={`${getGreeting()}${profile?.display_name ? `, ${profile.display_name}` : ""}`}
        description="A calmer dashboard for due reviews, mastery signals, and the next best action."
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/words/add">
                <Plus className="mr-2 size-4" />
                Add word
              </Link>
            </Button>
            <Button asChild className="rounded-2xl">
              <Link href="/learn">
                <BookOpenCheck className="mr-2 size-4" />
                Today&apos;s mission
              </Link>
            </Button>
          </div>
        }
      />

      {needsOnboarding ? <OnboardingCard userId={user.id} initialTarget={targetWords} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total words" value={totalWords ?? 0} hint="Your active vocabulary library" icon={BrainCircuit} tone="primary" />
        <MetricCard
          label="Due now"
          value={dueToday ?? 0}
          hint={(dueToday ?? 0) > 0 ? "Clear the due queue to protect your streak." : "Nothing urgent is waiting right now."}
          icon={Clock3}
          tone={(dueToday ?? 0) > 0 ? "warning" : "success"}
        />
        <MetricCard label="Current streak" value={`${currentStreak}`} hint="Consistency is compounding your retention." icon={Flame} tone="warning" />
        <MetricCard label="Mastery" value={`${mastery}%`} hint={`${easyWords} words are currently in the easy zone.`} icon={Star} tone="success" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr]">
        <SectionCard title="Today&apos;s mission" description="Keep one clear target in front of you and reduce decision fatigue.">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="size-3.5" />
                Daily mission
              </div>
              <div className="space-y-3">
                <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">Finish {missionTarget} review actions and protect your momentum</h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  This target blends today&apos;s due pressure with your daily goal so the dashboard always points you toward the highest-value study block.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reviewed today</p>
                  <p className="mt-2 font-display text-2xl font-semibold">{wordsReviewedToday}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Daily target</p>
                  <p className="mt-2 font-display text-2xl font-semibold">{missionTarget}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Weekly reviewed</p>
                  <p className="mt-2 font-display text-2xl font-semibold">{weeklyReviewed}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Mission progress</span>
                  <span>{wordsReviewedToday}/{missionTarget}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-background/70">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#49c6ff,#34d399)] transition-all" style={{ width: `${missionProgress}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-2xl">
                  <Link href="/learn">
                    <BookOpenCheck className="mr-2 size-4" />
                    Start review focus mode
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl">
                  <Link href="/progress">Open analytics</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-[2rem] border border-border/70 bg-background/40 p-6">
              <ProgressRing value={missionProgress} label="Goal reached" sublabel={`${dueToday ?? 0} due today`} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Quick focus" description="Jump straight into the next useful action without hunting through menus." contentClassName="space-y-4">
          <Link href="/learn" className="block rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4 transition hover:border-primary/35 hover:bg-primary/12">
            <p className="font-medium text-foreground">Due reviews in focus mode</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {(dueToday ?? 0) > 0 ? `${dueToday} cards are waiting in the queue.` : "No card is due right now, so this is a great moment to add fresh vocabulary."}
            </p>
          </Link>
          <Link href="/words" className="block rounded-[1.5rem] border border-border/70 bg-background/50 p-4 transition hover:border-border hover:bg-background/70">
            <p className="font-medium text-foreground">Manage the library</p>
            <p className="mt-1 text-sm text-muted-foreground">Search, edit, pin, and inspect difficult words with the new virtualized workspace.</p>
          </Link>
          <Link href="/suggest" className="block rounded-[1.5rem] border border-border/70 bg-background/50 p-4 transition hover:border-border hover:bg-background/70">
            <p className="font-medium text-foreground">Share product feedback</p>
            <p className="mt-1 text-sm text-muted-foreground">Send ideas, report friction, and track responses from the product queue.</p>
          </Link>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Due queue preview" description="A short look at the next cards that are ready for review.">
          {dueRows && dueRows.length > 0 ? (
            <div className="space-y-3">
              {dueRows.map((entry) => {
                const word = Array.isArray(entry.words) ? entry.words[0] : entry.words;
                return (
                  <div key={word.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/50 p-4">
                    <div className="space-y-1">
                      <p className="font-english text-lg font-semibold text-foreground">{word.english_word}</p>
                      <p className="text-sm text-muted-foreground">{word.bangla_meaning}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <Badge variant="outline" className="rounded-full border-amber-400/25 bg-amber-400/10 text-amber-300">
                        due now
                      </Badge>
                      <p className="text-xs text-muted-foreground">Interval {entry.interval_days} days</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No cards are due right now"
              description="Your review queue is clear. Add more vocabulary or head to analytics to check how steady your study rhythm has been."
              actionHref="/words/add"
              actionLabel="Add a new word"
              secondaryHref="/progress"
              secondaryLabel="Open analytics"
            />
          )}
        </SectionCard>

        <SectionCard title="Hard zone" description="Keep a visible list of the words that need extra attention.">
          {hardWords && hardWords.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {hardWords.map((word) => (
                <div key={word.id} className="rounded-2xl border border-rose-400/15 bg-rose-400/5 p-4">
                  <p className="font-english text-lg font-semibold text-foreground">{word.english_word}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{word.bangla_meaning}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-rose-300">Hard difficulty</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              title="No hard words right now"
              description={`Only ${hardCount} hard word${hardCount === 1 ? " is" : "s are"} currently being tracked, which is a strong sign that your review balance is improving.`}
              actionHref="/learn"
              actionLabel="Open review session"
            />
          )}
        </SectionCard>
      </section>

      <SectionCard title="Recent additions" description="The newest entries in your library so you can keep momentum visible.">
        {recentWords && recentWords.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentWords.map((word) => (
              <div key={word.id} className="rounded-[1.5rem] border border-border/70 bg-background/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-english text-lg font-semibold text-foreground">{word.english_word}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{word.bangla_meaning}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      word.difficulty === "easy"
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : word.difficulty === "hard"
                          ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                          : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                    }
                  >
                    {word.difficulty}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BrainCircuit}
            title="Your vocabulary library is still empty"
            description="Add your first word to start generating review schedules, dashboard missions, and meaningful analytics."
            actionHref="/words/add"
            actionLabel="Add your first word"
          />
        )}
      </SectionCard>
    </div>
  );
}
