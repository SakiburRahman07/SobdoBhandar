"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface OnboardingCardProps {
  userId: string;
  initialTarget?: number | null;
}

const TARGET_OPTIONS = [10, 15, 20, 30];

export function OnboardingCard({ userId, initialTarget = 10 }: OnboardingCardProps) {
  const [target, setTarget] = useState(initialTarget || 10);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);

    const basePayload = {
      id: userId,
      target_words_per_day: target,
      updated_at: new Date().toISOString(),
    };

    const payloadWithOnboarding = {
      ...basePayload,
      onboarding_completed_at: new Date().toISOString(),
    };

    let { error } = await supabase.from("user_profiles").upsert(payloadWithOnboarding);

    if (error && error.message.includes("onboarding_completed_at")) {
      const retry = await supabase.from("user_profiles").upsert(basePayload);
      error = retry.error;
    }

    if (error) {
      toast.error("Setup could not be saved");
      setLoading(false);
      return;
    }

    toast.success("Daily target saved");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="v2-card rounded-[1.75rem] border border-primary/20 bg-[radial-gradient(circle_at_top,_rgba(73,198,255,0.18),transparent_58%),var(--surface)] p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <CheckCircle2 className="size-3.5" />
            First-run setup
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Set your daily learning target
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Choose how many words you want to review each day so the dashboard, mission card, and progress goals feel personal from the start.
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TARGET_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTarget(option)}
                className={`rounded-2xl border px-4 py-4 text-center transition ${
                  target === option
                    ? "border-primary bg-primary/10 text-primary shadow-[0_16px_30px_rgba(73,198,255,0.14)]"
                    : "border-border/70 bg-background/50 text-muted-foreground hover:border-primary/25 hover:text-foreground"
                }`}
              >
                <span className="font-display text-2xl font-semibold">{option}</span>
                <span className="mt-1 block text-xs">words / day</span>
              </button>
            ))}
          </div>

          <Button onClick={handleSave} disabled={loading} className="rounded-2xl">
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Target className="mr-2 size-4" />}
            Use this target
          </Button>
        </div>
      </div>
    </div>
  );
}
