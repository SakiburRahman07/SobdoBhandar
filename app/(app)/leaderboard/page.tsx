import { Crown, Flame, Medal, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { maskEmail } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/workspace/empty-state";
import { PageHeader } from "@/components/workspace/page-header";

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="size-6 text-amber-300" />;
  if (rank === 2) return <Medal className="size-6 text-slate-300" />;
  if (rank === 3) return <Medal className="size-6 text-orange-300" />;
  return <span className="font-display text-xl font-semibold text-muted-foreground">#{rank}</span>;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profiles }, { data: words }, { data: progressRows }] = await Promise.all([
    supabase.from("user_profiles").select("id, email, display_name, avatar_url"),
    supabase.from("words").select("user_id"),
    supabase.from("daily_progress").select("user_id, date, streak_count").order("date", { ascending: false }),
  ]);

  const wordCountMap = new Map<string, number>();
  for (const word of words || []) {
    wordCountMap.set(word.user_id, (wordCountMap.get(word.user_id) ?? 0) + 1);
  }

  const latestStreakMap = new Map<string, number>();
  for (const row of progressRows || []) {
    if (!latestStreakMap.has(row.user_id)) {
      latestStreakMap.set(row.user_id, row.streak_count ?? 0);
    }
  }

  const entries = (profiles || [])
    .map((profile) => ({
      user_id: profile.id,
      display_name: profile.display_name,
      email: profile.email,
      avatar_url: profile.avatar_url,
      total_words: wordCountMap.get(profile.id) ?? 0,
      current_streak: latestStreakMap.get(profile.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.total_words !== a.total_words) return b.total_words - a.total_words;
      return b.current_streak - a.current_streak;
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const topTen = entries.slice(0, 10);
  const currentUserEntry = entries.find((entry) => entry.user_id === user.id) || null;
  const topThree = topTen.slice(0, 3);

  if (!entries.length) {
    return (
      <EmptyState
        icon={Trophy}
        title="The leaderboard is still empty"
        description="Once users begin saving words and reviewing consistently, this board will start to feel alive."
        actionHref="/words/add"
        actionLabel="Add your first word"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Leaderboard"
        title="Competitive, but still friendly"
        description="Live word counts and current streaks without the clutter of a noisy social feed."
      />

      <section className="grid gap-4 lg:grid-cols-3">
        {topThree.map((entry, index) => (
          <div key={entry.user_id} className={`v2-card rounded-[1.75rem] p-6 ${index === 0 ? "border-amber-300/25 bg-[radial-gradient(circle_at_top,_rgba(253,186,77,0.18),transparent_55%),var(--surface)]" : ""}`}>
            <div className="flex items-center justify-between">
              {getRankIcon(entry.rank)}
              <Badge variant="outline" className="rounded-full border-border/70 bg-surface px-3 py-1 text-muted-foreground">
                {entry.total_words} words
              </Badge>
            </div>
            <Avatar className="mt-6 size-16 border border-border/70">
              <AvatarImage src={entry.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 font-display text-xl text-primary">
                {(entry.display_name || entry.email || "?").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">{entry.display_name || maskEmail(entry.email)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Current streak: {entry.current_streak} day{entry.current_streak === 1 ? "" : "s"}</p>
          </div>
        ))}
      </section>

      <section className="v2-card rounded-[1.75rem] p-4 sm:p-5">
        <div className="space-y-3">
          {topTen.map((entry) => {
            const isCurrentUser = entry.user_id === user.id;
            return (
              <div
                key={entry.user_id}
                className={`flex flex-col gap-4 rounded-[1.5rem] border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  isCurrentUser
                    ? "border-primary/25 bg-primary/10 shadow-[0_16px_34px_rgba(73,198,255,0.14)]"
                    : "border-border/70 bg-background/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-surface">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className="size-12 border border-border/70">
                    <AvatarImage src={entry.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(entry.display_name || entry.email || "?").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{entry.display_name || maskEmail(entry.email)}</p>
                      {isCurrentUser ? (
                        <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 text-primary">
                          You
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.total_words} saved words</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface px-3 py-1.5">
                    <Flame className="size-3.5 text-amber-300" />
                    {entry.current_streak} day streak
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {currentUserEntry && currentUserEntry.rank > 10 ? (
        <section className="v2-card rounded-[1.75rem] border border-primary/20 bg-primary/10 p-5">
          <p className="text-sm font-medium text-primary">Your position</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-3xl font-semibold text-foreground">#{currentUserEntry.rank}</p>
              <p className="text-sm text-muted-foreground">{currentUserEntry.total_words} words, {currentUserEntry.current_streak} day streak</p>
            </div>
            <Badge variant="outline" className="w-fit rounded-full border-primary/20 bg-background/40 px-3 py-1.5 text-primary">
              Keep reviewing to climb the board
            </Badge>
          </div>
        </section>
      ) : null}
    </div>
  );
}
