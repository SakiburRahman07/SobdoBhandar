import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3, BrainCircuit, Sparkles, Trophy, Zap } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative z-10 min-h-screen">
      <header className="border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="SobdoBhandar" width={48} height={48} className="rounded-[1.1rem] shadow-[0_15px_40px_rgba(73,198,255,0.22)]" />
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-foreground">SobdoBhandar</p>
              <p className="text-xs text-muted-foreground">English-to-Bangla vocabulary learning</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-2xl">
              <Link href="/signup">
                Start free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="size-3.5" />
              Premium vocabulary cockpit
            </div>
            <div className="space-y-5">
              <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Bangla-first vocabulary learning that actually sticks.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Spaced repetition, active recall, daily missions, and motivating analytics so every saved English word has a better chance of becoming permanent memory.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-2xl px-7 text-base">
                <Link href="/signup">
                  Start learning free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl px-7 text-base">
                <Link href="/login">Existing account? Log in</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="v2-card rounded-[1.5rem] p-4">
                <p className="font-display text-3xl font-semibold text-foreground">SM-2</p>
                <p className="mt-2 text-sm text-muted-foreground">Scientifically timed review scheduling</p>
              </div>
              <div className="v2-card rounded-[1.5rem] p-4">
                <p className="font-display text-3xl font-semibold text-foreground">BN + EN</p>
                <p className="mt-2 text-sm text-muted-foreground">Readable bilingual study design without clutter</p>
              </div>
              <div className="v2-card rounded-[1.5rem] p-4">
                <p className="font-display text-3xl font-semibold text-foreground">Focus</p>
                <p className="mt-2 text-sm text-muted-foreground">Daily mission and distraction-light review mode</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="v2-card relative overflow-hidden rounded-[2rem] border p-5 shadow-[0_30px_90px_rgba(7,19,31,0.2)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(73,198,255,0.2),transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(253,186,77,0.14),transparent_30%)]" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-primary">Today&apos;s mission</p>
                    <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">Review 18 due words</h2>
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">78% done</div>
                </div>
                <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/55 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Focus card</span>
                    <span>12 / 18</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-background/70">
                    <div className="h-full w-[78%] rounded-full bg-[linear-gradient(90deg,#49c6ff,#34d399,#fdba4d)]" />
                  </div>
                  <div className="mt-6 rounded-[1.5rem] border border-border/70 bg-surface p-5 text-center">
                    <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">English word</p>
                    <p className="mt-3 font-display text-4xl font-semibold text-foreground">resilient</p>
                    <p className="mt-8 text-sm uppercase tracking-[0.22em] text-muted-foreground">Bangla meaning</p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">A clear Bangla meaning appears here during review</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-foreground">21 days</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
                    <p className="text-sm text-muted-foreground">Mastery</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-foreground">64%</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
                    <p className="text-sm text-muted-foreground">Words saved</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-foreground">312</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: BrainCircuit,
                title: "Spaced repetition built in",
                description: "Every review updates schedule, difficulty, and next due date using the current core product logic.",
              },
              {
                icon: Zap,
                title: "Active recall first",
                description: "Focus mode encourages thinking before revealing meaning, making each review more effective.",
              },
              {
                icon: BarChart3,
                title: "Motivating analytics",
                description: "Mastery, streak, consistency, and review volume stay visible without feeling overwhelming.",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="v2-card rounded-[1.75rem] p-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">How it works</p>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground">A premium workflow around the same trusted logic</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                V2 keeps the existing spaced repetition engine, Supabase-backed word data, and progress tracking intact while making the experience feel clearer and far more motivating.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["1", "Add words", "Use a richer entry flow with AI-assisted metadata, pronunciation, examples, and Bangla meaning."],
                ["2", "Review daily", "A mission-first workspace helps you finish due cards without getting lost in the product."],
                ["3", "Track mastery", "Read streak, consistency, hard words, and analytics that explain what to do next."],
              ].map(([index, title, description]) => (
                <div key={title} className="v2-card rounded-[1.75rem] p-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 font-display text-xl font-semibold text-primary">
                    {index}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="v2-card rounded-[2rem] p-8 text-center sm:p-10">
            <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Trophy className="size-7" />
            </div>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight text-foreground">Make daily study feel rewarding</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Build a durable English-to-Bangla vocabulary habit with a calmer, faster, and more motivating workspace.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-2xl px-7 text-base">
                <Link href="/signup">Create your account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl px-7 text-base">
                <Link href="/login">Go to login</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-background/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 SobdoBhandar. Built for focused bilingual learning.</p>
          <p>Spaced repetition + active recall + progress tracking</p>
        </div>
      </footer>
    </div>
  );
}
