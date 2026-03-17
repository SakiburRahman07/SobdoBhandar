"use client";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckCircle2, Clock3, Loader2, Search, XCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { SuggestionRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminConsoleProps {
  initialSuggestions: SuggestionRecord[];
  stats: {
    totalUsers: number;
    totalWords: number;
    totalSuggestions: number;
    pendingSuggestions: number;
  };
}

export function AdminConsole({ initialSuggestions, stats }: AdminConsoleProps) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const supabase = createClient();
  const parentRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    return suggestions.filter((suggestion) => {
      const matchesStatus = statusFilter === "all" || suggestion.status === statusFilter;
      const haystack = `${suggestion.title} ${suggestion.description} ${suggestion.category}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, suggestions]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 290,
    overscan: 6,
  });

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const adminResponse = responseDrafts[id] || null;
    const { error } = await supabase
      .from("suggestions")
      .update({
        status,
        admin_response: adminResponse,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Could not update the suggestion status.");
      setUpdatingId(null);
      return;
    }

    setSuggestions((current) => current.map((item) => (item.id === id ? { ...item, status, admin_response: adminResponse } : item)));
    toast.success("Suggestion updated.");
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="v2-card rounded-[1.5rem] p-4"><p className="text-sm text-muted-foreground">Total users</p><p className="mt-2 font-display text-3xl font-semibold">{stats.totalUsers}</p></div>
        <div className="v2-card rounded-[1.5rem] p-4"><p className="text-sm text-muted-foreground">Total words</p><p className="mt-2 font-display text-3xl font-semibold">{stats.totalWords}</p></div>
        <div className="v2-card rounded-[1.5rem] p-4"><p className="text-sm text-muted-foreground">Suggestions</p><p className="mt-2 font-display text-3xl font-semibold">{stats.totalSuggestions}</p></div>
        <div className="v2-card rounded-[1.5rem] p-4"><p className="text-sm text-muted-foreground">Pending</p><p className="mt-2 font-display text-3xl font-semibold text-amber-300">{stats.pendingSuggestions}</p></div>
      </section>

      <section className="v2-card rounded-[1.75rem] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, description, or category" className="h-12 rounded-2xl border-border/80 bg-background/60 pl-11" />
          </div>
          <div className="inline-flex rounded-2xl border border-border/80 bg-background/50 p-1">
            {(["all", "pending", "reviewed", "implemented", "rejected"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`rounded-[1rem] px-3 py-2 text-sm transition ${statusFilter === value ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="v2-card rounded-[1.75rem] p-3 sm:p-4">
        {filtered.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/80 px-5 py-12 text-center">
            <p className="font-medium text-foreground">No suggestions match this view</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a different keyword or switch the status filter to inspect more items.</p>
          </div>
        ) : (
          <div ref={parentRef} className="h-[72vh] overflow-auto pr-2">
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative", width: "100%" }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const suggestion = filtered[virtualRow.index];
                if (!suggestion) return null;

                return (
                  <div
                    key={suggestion.id}
                    ref={rowVirtualizer.measureElement}
                    className="absolute left-0 top-0 w-full pb-3"
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    <div className="rounded-[1.5rem] border border-border/70 bg-background/50 p-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3 xl:max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-foreground">{suggestion.title}</p>
                            <Badge variant="outline" className="rounded-full border-border/70 bg-surface px-3 py-1 text-muted-foreground">{suggestion.category}</Badge>
                            <Badge variant="outline" className={`rounded-full ${
                              suggestion.status === "implemented"
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : suggestion.status === "reviewed"
                                  ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
                                  : suggestion.status === "rejected"
                                    ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                                    : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                            }`}>{suggestion.status}</Badge>
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{suggestion.description}</p>
                          <p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(suggestion.created_at))}</p>
                        </div>
                        <div className="flex flex-col gap-2 xl:w-64">
                          <Button variant="outline" className="justify-start rounded-2xl border-sky-400/20 bg-sky-400/10 text-sky-300 hover:bg-sky-400/15" onClick={() => updateStatus(suggestion.id, "reviewed")} disabled={updatingId === suggestion.id}>
                            <CheckCircle2 className="mr-2 size-4" />
                            Mark reviewed
                          </Button>
                          <Button variant="outline" className="justify-start rounded-2xl border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15" onClick={() => updateStatus(suggestion.id, "implemented")} disabled={updatingId === suggestion.id}>
                            <Clock3 className="mr-2 size-4" />
                            Mark implemented
                          </Button>
                          <Button variant="outline" className="justify-start rounded-2xl border-rose-400/20 bg-rose-400/10 text-rose-300 hover:bg-rose-400/15" onClick={() => updateStatus(suggestion.id, "rejected")} disabled={updatingId === suggestion.id}>
                            <XCircle className="mr-2 size-4" />
                            Reject
                          </Button>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <label htmlFor={`response-${suggestion.id}`} className="text-sm font-medium text-foreground">Admin response</label>
                        <textarea
                          id={`response-${suggestion.id}`}
                          value={responseDrafts[suggestion.id] ?? suggestion.admin_response ?? ""}
                          onChange={(event) => setResponseDrafts((current) => ({ ...current, [suggestion.id]: event.target.value }))}
                          className="min-h-28 w-full rounded-[1.25rem] border border-border/80 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-[3px] focus:ring-ring/40"
                          placeholder="Write a short status update for the user"
                        />
                      </div>

                      {updatingId === suggestion.id ? <Loader2 className="mt-4 size-4 animate-spin text-primary" /> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
