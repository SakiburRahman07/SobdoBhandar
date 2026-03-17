import { Award, BarChart3, Flame, Sparkles, Target, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/workspace/empty-state";
import { MetricCard } from "@/components/workspace/metric-card";
import { PageHeader } from "@/components/workspace/page-header";
import { ProgressCharts } from "@/components/workspace/progress-charts";
import { ProgressRing } from "@/components/workspace/progress-ring";
import { SectionCard } from "@/components/workspace/section-card";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: progressRows }, { data: words }, { data: profile }] = await Promise.all([
    supabase
      .from("daily_progress")
      .select("date, words_reviewed, words_learned, streak_count")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(28),
    supabase.from("words").select("difficulty").eq("user_id", user.id),
    supabase.from("user_profiles").select("target_words_per_day").eq("id", user.id).maybeSingle(),
  ]);

  const last14Days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const key = date.toISOString().split("T")[0];
    const row = progressRows?.find((item) => item.date === key);

    return {
      key,
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      shortDate: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date),
      reviewed: row?.words_reviewed ?? 0,
      learned: row?.words_learned ?? 0,
      active: (row?.words_reviewed ?? 0) > 0,
    };
  });

  const totalWords = words?.length ?? 0;
  const easyWords = words?.filter((word) => word.difficulty === "easy").length ?? 0;
  const mediumWords = words?.filter((word) => word.difficulty === "medium").length ?? 0;
  const hardWords = words?.filter((word) => word.difficulty === "hard").length ?? 0;
  const weeklyReviewed = last14Days.slice(-7).reduce((sum, day) => sum + day.reviewed, 0);
  const currentStreak = progressRows?.[0]?.streak_count ?? 0;
  const mastery = totalWords ? Math.round((easyWords / totalWords) * 100) : 0;
  const target = profile?.target_words_per_day ?? 10;
  const recentAverage = Math.round(last14Days.slice(-7).reduce((sum, day) => sum + day.reviewed, 0) / 7);
  const difficultyData = [
    { name: "Easy", value: easyWords, fill: "#34D399" },
    { name: "Medium", value: mediumWords, fill: "#FDBA4D" },
    { name: "Hard", value: hardWords, fill: "#F87171" },
  ].filter((item) => item.value > 0);

  if (!progressRows?.length && !totalWords) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Your analytics will unlock after the first few study actions"
        description="Add words and finish a review session to populate streak, mastery, and consistency insights."
        actionHref="/words/add"
        actionLabel="Add your first word"
        secondaryHref="/learn"
        secondaryLabel="Open learn page"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Progress that actually feels motivating"
        description="See retention, consistency, and mastery in a format that points you toward the next useful move."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total words" value={totalWords} hint="Current library size" icon={BarChart3} tone="primary" />
        <MetricCard label="Current streak" value={currentStreak} hint="Your active review run" icon={Flame} tone="warning" />
        <MetricCard label="Weekly reviewed" value={weeklyReviewed} hint="Reviewed cards in the last 7 days" icon={TrendingUp} tone="success" />
        <MetricCard label="Mastery" value={`${mastery}%`} hint={`${easyWords} words are currently in the easy zone.`} icon={Award} tone="success" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Goal tracking" description="Compare your recent study pace against the current daily target.">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="flex justify-center">
              <ProgressRing
                value={Math.min(100, Math.round((recentAverage / Math.max(target, 1)) * 100))}
                label="Target match"
                sublabel={`${recentAverage} avg vs ${target} target`}
              />
            </div>
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Daily target</p>
                <p className="mt-2 font-display text-3xl font-semibold text-foreground">{target}</p>
                <p className="mt-2 text-sm text-muted-foreground">This is the baseline from your current profile settings.</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent average</p>
                <p className="mt-2 font-display text-3xl font-semibold text-foreground">{recentAverage}</p>
                <p className="mt-2 text-sm text-muted-foreground">Average reviewed cards across the last seven days.</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Consistency strip" description="A simple view of your study rhythm across the last two weeks.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {last14Days.map((day) => (
              <div key={day.key} className="rounded-[1.25rem] border border-border/70 bg-background/50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{day.label}</p>
                  <span className={`size-2.5 rounded-full ${day.active ? "bg-emerald-400" : "bg-border"}`} />
                </div>
                <p className="mt-4 font-display text-2xl font-semibold text-foreground">{day.reviewed}</p>
                <p className="mt-1 text-xs text-muted-foreground">{day.shortDate}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <ProgressCharts dailyData={last14Days} difficultyData={difficultyData} />

      <SectionCard title="Interpretation" description="Quick reading notes that turn charts into action.">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Target className="size-4" />
              Mastery signal
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {mastery >= 60
                ? "A large share of your library has reached the easy bucket, which usually means your schedule is successfully protecting retention."
                : "Your easy bucket is still growing. Keep reviewing consistently so more words can move out of the medium and hard ranges."}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-300">
              <Flame className="size-4" />
              Consistency insight
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {currentStreak >= 7
                ? "A full week of steady reviewing is a strong foundation. Small daily sessions are doing real work for long-term recall."
                : "The streak is still building, so short daily missions matter more than big occasional bursts right now."}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <TrendingUp className="size-4" />
              Next move
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {hardWords > easyWords
                ? "Your hard bucket is larger than the easy bucket, so the next few review sessions should focus on difficult words and due cards."
                : "Your difficulty balance looks healthy. Keep exposure steady and add new words only at a pace your review habit can support."}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
