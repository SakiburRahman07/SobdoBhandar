"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Clock3, Loader2, Pin, Search, SlidersHorizontal, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { WordListItem } from "@/lib/types";
import { formatRelativeLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/workspace/empty-state";
import { WordDetailsDialog } from "@/components/word-details-dialog";
import { WordEditDialog } from "@/components/word-edit-dialog";

interface WordsExplorerProps {
  userId: string;
  initialWords: WordListItem[];
  initialHasMore: boolean;
  initialSupportsPinned: boolean;
  stats: {
    total: number;
    easy: number;
    hard: number;
    due: number;
  };
}

const PAGE_SIZE = 30;

type SortValue = "newest" | "oldest" | "alpha";
type DifficultyValue = "all" | "easy" | "medium" | "hard";

function normalizeReviewSchedule(word: WordListItem) {
  if (Array.isArray(word.review_schedule)) {
    return word.review_schedule[0] ?? null;
  }

  return word.review_schedule ?? null;
}

export function WordsExplorer({
  userId,
  initialWords,
  initialHasMore,
  initialSupportsPinned,
  stats,
}: WordsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const parentRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const [words, setWords] = useState(initialWords);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [supportsPinned, setSupportsPinned] = useState(initialSupportsPinned);
  const [difficulty, setDifficulty] = useState<DifficultyValue>((searchParams.get("difficulty") as DifficultyValue) || "all");
  const [sort, setSort] = useState<SortValue>((searchParams.get("sort") as SortValue) || "newest");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeQuery, setActiveQuery] = useState(searchParams.get("q") || "");

  const syncUrl = useCallback(
    (nextQuery: string, nextDifficulty: DifficultyValue, nextSort: SortValue) => {
      const params = new URLSearchParams();
      if (nextQuery) params.set("q", nextQuery);
      if (nextDifficulty !== "all") params.set("difficulty", nextDifficulty);
      if (nextSort !== "newest") params.set("sort", nextSort);
      const suffix = params.toString();
      router.replace(suffix ? `/words?${suffix}` : "/words", { scroll: false });
    },
    [router],
  );

  const fetchBatch = useCallback(
    async (offset: number, reset = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoadingMore(true);

      try {
        const baseSelect = `
          id,
          user_id,
          english_word,
          bangla_meaning,
          part_of_speech,
          sub_type,
          verb_forms,
          example_sentence,
          example_sentence_bn,
          pronunciation,
          synonyms,
          antonyms,
          difficulty,
          created_at,
          is_pinned,
          review_schedule(next_review_date, interval_days)
        `;
        const fallbackSelect = `
          id,
          user_id,
          english_word,
          bangla_meaning,
          part_of_speech,
          sub_type,
          verb_forms,
          example_sentence,
          example_sentence_bn,
          pronunciation,
          synonyms,
          antonyms,
          difficulty,
          created_at,
          review_schedule(next_review_date, interval_days)
        `;

        const buildQuery = (selectText: string) => {
          let builder = supabase
            .from("words")
            .select(selectText)
            .eq("user_id", userId)
            .range(offset, offset + PAGE_SIZE - 1);

          if (activeQuery) {
            builder = builder.or(`english_word.ilike.%${activeQuery}%,bangla_meaning.ilike.%${activeQuery}%`);
          }

          if (difficulty !== "all") {
            builder = builder.eq("difficulty", difficulty);
          }

          if (sort === "alpha") {
            builder = builder.order("english_word", { ascending: true });
          } else {
            builder = builder.order("created_at", { ascending: sort === "oldest" });
          }

          return builder;
        };

        let result = await buildQuery(baseSelect);
        let data = result.data as WordListItem[] | null;
        let error = result.error;

        if (error && error.message.includes("is_pinned")) {
          setSupportsPinned(false);
          result = await buildQuery(fallbackSelect);
          data = result.data as WordListItem[] | null;
          error = result.error;
        }

        if (error) {
          toast.error("Could not load the word library.");
          return;
        }

        const normalized = (data || []).map((word) => ({
          ...word,
          review_schedule: normalizeReviewSchedule(word),
        }));

        setWords((current) => (reset ? normalized : [...current, ...normalized]));
        setHasMore(normalized.length === PAGE_SIZE);
      } finally {
        loadingRef.current = false;
        setLoadingMore(false);
      }
    },
    [activeQuery, difficulty, sort, supabase, userId],
  );

  useEffect(() => {
    if (
      activeQuery === (searchParams.get("q") || "") &&
      difficulty === ((searchParams.get("difficulty") as DifficultyValue) || "all") &&
      sort === ((searchParams.get("sort") as SortValue) || "newest")
    ) {
      return;
    }
    syncUrl(activeQuery, difficulty, sort);
  }, [activeQuery, difficulty, sort, searchParams, syncUrl]);

  useEffect(() => {
    setWords([]);
    setHasMore(true);
    void fetchBatch(0, true);
  }, [fetchBatch]);

  const rowVirtualizer = useVirtualizer({
    count: hasMore ? words.length + 1 : words.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 124,
    overscan: 8,
  });

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!lastItem) return;
    if (lastItem.index >= words.length - 4 && hasMore && !loadingMore) {
      void fetchBatch(words.length);
    }
  }, [fetchBatch, hasMore, loadingMore, rowVirtualizer, words.length]);

  const pinnedWords = useMemo(() => words.filter((word) => word.is_pinned), [words]);

  const handleSearchSubmit = () => {
    setActiveQuery(query.trim());
  };

  const togglePin = async (word: WordListItem) => {
    if (!supportsPinned) {
      toast.info("Pinned words need the latest database migration.");
      return;
    }

    const nextPinned = !word.is_pinned;
    const { error } = await supabase.from("words").update({ is_pinned: nextPinned }).eq("id", word.id);

    if (error) {
      toast.error("Could not update the pinned state.");
      return;
    }

    setWords((current) => current.map((item) => (item.id === word.id ? { ...item, is_pinned: nextPinned } : item)));
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="v2-card rounded-[1.5rem] p-4">
          <p className="text-sm text-muted-foreground">Total words</p>
          <p className="mt-2 font-display text-3xl font-semibold">{stats.total}</p>
        </div>
        <div className="v2-card rounded-[1.5rem] p-4">
          <p className="text-sm text-muted-foreground">Due now</p>
          <p className="mt-2 font-display text-3xl font-semibold text-amber-300">{stats.due}</p>
        </div>
        <div className="v2-card rounded-[1.5rem] p-4">
          <p className="text-sm text-muted-foreground">Easy words</p>
          <p className="mt-2 font-display text-3xl font-semibold text-emerald-300">{stats.easy}</p>
        </div>
        <div className="v2-card rounded-[1.5rem] p-4">
          <p className="text-sm text-muted-foreground">Hard words</p>
          <p className="mt-2 font-display text-3xl font-semibold text-rose-300">{stats.hard}</p>
        </div>
      </section>

      <section className="v2-card rounded-[1.75rem] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearchSubmit();
                }}
                placeholder="Search English word or Bangla meaning"
                className="h-12 rounded-2xl border-border/80 bg-background/60 pl-11"
              />
            </div>
            <Button onClick={handleSearchSubmit} className="h-12 rounded-2xl">
              Search
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-2xl border border-border/80 bg-background/50 p-1">
              {(["all", "easy", "medium", "hard"] as DifficultyValue[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDifficulty(value)}
                  className={`rounded-[1rem] px-3 py-2 text-sm transition ${
                    difficulty === value ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}
                >
                  {value === "all" ? "All" : value}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-background/50 px-3 py-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="size-4" />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortValue)}
                className="bg-transparent text-foreground outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="alpha">A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {supportsPinned && pinnedWords.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Pin className="size-4 text-primary" />
            Pinned words
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pinnedWords.map((word) => (
              <div key={word.id} className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-english text-lg font-semibold text-foreground">{word.english_word}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{word.bangla_meaning}</p>
                  </div>
                  <Button variant="outline" size="icon" className="rounded-2xl border-primary/20 bg-background/30" onClick={() => togglePin(word)}>
                    <Star className="size-4 fill-current text-primary" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="v2-card rounded-[1.75rem] p-3 sm:p-4">
        {words.length === 0 && !loadingMore ? (
          <EmptyState
            icon={Sparkles}
            title="No words match this view"
            description="Try a different search term or adjust the current filters to bring matching words back into view."
            actionHref="/words/add"
            actionLabel="Add a new word"
          />
        ) : (
          <div ref={parentRef} className="h-[68vh] overflow-auto pr-2">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const word = words[virtualRow.index];

                if (!word) {
                  return (
                    <div
                      key={`loader-${virtualRow.index}`}
                      className="absolute left-0 top-0 flex w-full items-center justify-center py-8"
                      style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                      {hasMore ? <Loader2 className="size-5 animate-spin text-primary" /> : null}
                    </div>
                  );
                }

                const schedule = normalizeReviewSchedule(word);
                const dueLabel = formatRelativeLabel(schedule?.next_review_date);
                const isDue = schedule?.next_review_date ? new Date(schedule.next_review_date) <= new Date() : false;

                return (
                  <div
                    key={word.id}
                    className="absolute left-0 top-0 w-full pb-3"
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    <div className="rounded-[1.5rem] border border-border/70 bg-background/50 p-4 transition hover:border-primary/20 hover:bg-background/65">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-english text-xl font-semibold text-foreground">{word.english_word}</p>
                            {word.part_of_speech ? (
                              <Badge variant="outline" className="rounded-full border-border/70 bg-surface px-3 py-1 text-muted-foreground">
                                {word.part_of_speech}
                              </Badge>
                            ) : null}
                            <Badge
                              variant="outline"
                              className={
                                word.difficulty === "easy"
                                  ? "rounded-full border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                  : word.difficulty === "hard"
                                    ? "rounded-full border-rose-400/20 bg-rose-400/10 text-rose-300"
                                    : "rounded-full border-amber-400/20 bg-amber-400/10 text-amber-300"
                              }
                            >
                              {word.difficulty}
                            </Badge>
                            {schedule?.next_review_date ? (
                              <Badge variant="outline" className={`rounded-full px-3 py-1 ${isDue ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : "border-border/70 bg-surface text-muted-foreground"}`}>
                                <Clock3 className="mr-2 size-3.5" />
                                {dueLabel}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{word.bangla_meaning}</p>
                          {word.example_sentence ? (
                            <p className="mt-3 font-english text-sm leading-6 text-muted-foreground">
                              {word.example_sentence}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          {supportsPinned ? (
                            <Button variant="outline" size="icon" className="rounded-2xl border-border/80 bg-background/60" onClick={() => togglePin(word)}>
                              <Star className={`size-4 ${word.is_pinned ? "fill-current text-primary" : "text-muted-foreground"}`} />
                            </Button>
                          ) : null}
                          <WordEditDialog word={word}>
                            <Button variant="outline" className="rounded-2xl border-border/80 bg-background/60">
                              Edit
                            </Button>
                          </WordEditDialog>
                          <WordDetailsDialog word={word}>
                            <Button className="rounded-2xl">Details</Button>
                          </WordDetailsDialog>
                        </div>
                      </div>
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


