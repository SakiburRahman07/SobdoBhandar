"use client";

import { useMemo, useState } from "react";
import { Bug, CheckCircle2, Clock3, Loader2, MessageSquare, Send, Sparkles, Wrench } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { SuggestionRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SuggestionPortalProps {
  userId: string;
  initialSuggestions: SuggestionRecord[];
}

const categories = [
  { value: "feature", label: "Feature", icon: Sparkles },
  { value: "bug", label: "Bug", icon: Bug },
  { value: "improvement", label: "Improvement", icon: Wrench },
  { value: "general", label: "General", icon: MessageSquare },
];

function getStatusBadge(status: string) {
  if (status === "reviewed") return <Badge variant="outline" className="rounded-full border-sky-400/20 bg-sky-400/10 text-sky-300">Reviewed</Badge>;
  if (status === "implemented") return <Badge variant="outline" className="rounded-full border-emerald-400/20 bg-emerald-400/10 text-emerald-300">Implemented</Badge>;
  if (status === "rejected") return <Badge variant="outline" className="rounded-full border-rose-400/20 bg-rose-400/10 text-rose-300">Rejected</Badge>;
  return <Badge variant="outline" className="rounded-full border-amber-400/20 bg-amber-400/10 text-amber-300">Pending</Badge>;
}

export function SuggestionPortal({ userId, initialSuggestions }: SuggestionPortalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const supabase = createClient();

  const sortedSuggestions = useMemo(
    () => [...suggestions].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
    [suggestions],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);

    const { data, error } = await supabase
      .from("suggestions")
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        category,
      })
      .select()
      .single();

    if (error) {
      toast.error("Could not submit your feedback.");
      setSubmitting(false);
      return;
    }

    setSuggestions((current) => [data, ...current]);
    setTitle("");
    setDescription("");
    setCategory("general");
    setSubmitting(false);
    toast.success("Your feedback was added to the queue.");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="v2-card rounded-[1.75rem] p-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold text-foreground">Send product feedback</h2>
          <p className="text-sm text-muted-foreground">Share feature ideas, improvements, bugs, or general product notes.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
                    category === item.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/80 bg-background/50 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  }`}
                >
                  <Icon className="mb-3 size-4" />
                  <p className="font-medium">{item.label}</p>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">Title</label>
            <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Short summary of your idea" className="h-12 rounded-2xl border-border/80 bg-background/60" />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">Details</label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell us what feels broken, missing, or worth improving"
              className="min-h-40 w-full rounded-[1.25rem] border border-border/80 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-[3px] focus:ring-ring/40"
            />
          </div>

          <Button type="submit" disabled={submitting} className="rounded-2xl">
            {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
            Submit feedback
          </Button>
        </form>
      </section>

      <section className="v2-card rounded-[1.75rem] p-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold text-foreground">Your feedback history</h2>
          <p className="text-sm text-muted-foreground">Track status changes and any admin responses in one place.</p>
        </div>

        <div className="mt-6 space-y-4">
          {sortedSuggestions.length > 0 ? (
            sortedSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="rounded-[1.5rem] border border-border/70 bg-background/50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{suggestion.title}</p>
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{suggestion.description}</p>
                  </div>
                  <Badge variant="outline" className="w-fit rounded-full border-border/70 bg-surface px-3 py-1 text-muted-foreground">
                    <Clock3 className="mr-2 size-3.5" />
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(suggestion.created_at))}
                  </Badge>
                </div>
                {suggestion.admin_response ? (
                  <div className="mt-4 rounded-[1.25rem] border border-primary/20 bg-primary/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <CheckCircle2 className="size-4" />
                      Admin response
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{suggestion.admin_response}</p>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border/80 px-5 py-10 text-center">
              <p className="font-medium text-foreground">No feedback submitted yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Send a feature request or report friction to start the feedback timeline.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
