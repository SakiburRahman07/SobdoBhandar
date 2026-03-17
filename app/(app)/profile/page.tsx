import { CalendarDays, Flame, Mail, Target, Trophy, UserCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { UserProfileRecord } from "@/lib/types";
import { formatBanglaDate } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MetricCard } from "@/components/workspace/metric-card";
import { PageHeader } from "@/components/workspace/page-header";
import { ProfileForm } from "@/components/workspace/profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profileQuery = await supabase
    .from("user_profiles")
    .select("id, email, display_name, avatar_url, bio, target_words_per_day, notification_enabled, onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileQuery.error
    ? (
        await supabase
          .from("user_profiles")
          .select("id, email, display_name, avatar_url, bio, target_words_per_day, notification_enabled")
          .eq("id", user.id)
          .maybeSingle()
      ).data
    : profileQuery.data) as UserProfileRecord | null;

  const [{ count: totalWords }, { data: progressRows }] = await Promise.all([
    supabase.from("words").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("daily_progress").select("streak_count, words_reviewed").eq("user_id", user.id),
  ]);

  const longestStreak = progressRows?.reduce((max, row) => Math.max(max, row.streak_count ?? 0), 0) ?? 0;
  const totalReviewed = progressRows?.reduce((sum, row) => sum + (row.words_reviewed ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Your learning identity"
        description="Goals, personal profile, and live study stats in one place."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total words" value={totalWords ?? 0} hint="Saved vocabulary entries" icon={Trophy} tone="primary" />
        <MetricCard label="Longest streak" value={longestStreak} hint="Best consistency run" icon={Flame} tone="warning" />
        <MetricCard label="Reviewed cards" value={totalReviewed} hint="All-time reviewed volume" icon={Target} tone="success" />
        <MetricCard label="Daily target" value={profile?.target_words_per_day ?? 10} hint="Current mission baseline" icon={CalendarDays} tone="default" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="v2-card rounded-[1.75rem] p-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar className="size-24 border border-border/80">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 font-display text-3xl text-primary">
                {(profile?.display_name || user.email || "U").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <UserCircle2 className="size-3.5" />
                Learning profile
              </div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                {profile?.display_name || user.email?.split("@")[0]}
              </h2>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" />
                {user.email}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {profile?.bio || "Add a short bio to describe your goals, pace, or the kind of vocabulary you want to build."}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Joined</p>
              <p className="mt-2 text-sm text-foreground">{formatBanglaDate(user.created_at || new Date(), true)}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Setup</p>
              <p className="mt-2 text-sm text-foreground">{profile?.onboarding_completed_at ? "Onboarding completed" : "Using inline dashboard setup"}</p>
            </div>
          </div>
        </div>

        <ProfileForm userId={user.id} profile={profile} />
      </section>
    </div>
  );
}
