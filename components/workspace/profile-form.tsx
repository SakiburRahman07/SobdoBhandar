"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Target } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { UserProfileRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormProps {
  userId: string;
  profile: UserProfileRecord | null;
}

export function ProfileForm({ userId, profile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [targetWords, setTargetWords] = useState(profile?.target_words_per_day ?? 10);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      id: userId,
      display_name: displayName || null,
      bio: bio || null,
      target_words_per_day: targetWords,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("user_profiles").upsert(payload);

    if (error) {
      toast.error("Could not save your profile.");
      setSaving(false);
      return;
    }

    toast.success("Profile updated.");
    router.refresh();
    setSaving(false);
  };

  return (
    <div className="v2-card rounded-[1.75rem] p-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold text-foreground">Identity and goals</h2>
        <p className="text-sm text-muted-foreground">Update the name, bio, and daily target that shape your learning rhythm.</p>
      </div>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="How your name appears" className="h-12 rounded-2xl border-border/80 bg-background/60" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="A short note about your goals, pace, or study style"
            className="min-h-28 w-full rounded-[1.25rem] border border-border/80 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-[3px] focus:ring-ring/40"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="target" className="flex items-center gap-2">
            <Target className="size-4" />
            Daily target
          </Label>
          <div className="grid gap-3 sm:grid-cols-4">
            {[10, 15, 20, 30].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTargetWords(value)}
                className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
                  targetWords === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/80 bg-background/60 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                }`}
              >
                <span className="font-display text-2xl font-semibold">{value}</span>
                <span className="mt-1 block text-xs">words / day</span>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="rounded-2xl">
          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Save profile updates
        </Button>
      </div>
    </div>
  );
}
