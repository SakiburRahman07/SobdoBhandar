import Link from "next/link";
import { LibraryBig, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { WordListItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/page-header";
import { WordsExplorer } from "@/components/workspace/words-explorer";

function normalizeInitialWord(word: WordListItem) {
  return {
    ...word,
    review_schedule: Array.isArray(word.review_schedule)
      ? word.review_schedule[0] ?? null
      : (word.review_schedule ?? null),
  };
}

export default async function WordsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const selectWithPin = `
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

  const selectWithoutPin = `
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

  let supportsPinned = true;
  const wordsWithPinQuery = await supabase
    .from("words")
    .select(selectWithPin)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(0, 29);

  let initialWords: WordListItem[] = [];

  if (wordsWithPinQuery.error && wordsWithPinQuery.error.message.includes("is_pinned")) {
    supportsPinned = false;
    const wordsWithoutPinQuery = await supabase
      .from("words")
      .select(selectWithoutPin)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, 29);

    initialWords = ((wordsWithoutPinQuery.data || []) as WordListItem[]).map((word) =>
      normalizeInitialWord({
        ...word,
        is_pinned: false,
      }),
    );
  } else {
    initialWords = ((wordsWithPinQuery.data || []) as WordListItem[]).map(normalizeInitialWord);
  }

  const [{ count: total }, { count: due }, { count: easy }, { count: hard }] = await Promise.all([
    supabase.from("words").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("review_schedule").select("id", { count: "exact", head: true }).eq("user_id", user.id).lte("next_review_date", new Date().toISOString().split("T")[0]),
    supabase.from("words").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("difficulty", "easy"),
    supabase.from("words").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("difficulty", "hard"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Word library"
        title="Product-grade vocabulary management"
        description="Search, filter, edit, pin, and inspect a large word collection with smoother large-list performance."
        action={
          <Button asChild className="rounded-2xl">
            <Link href="/words/add">
              <Plus className="mr-2 size-4" />
              Add word
            </Link>
          </Button>
        }
      />

      <div className="w-fit rounded-full border border-border/70 bg-background/50 px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
        <LibraryBig className="size-4 text-primary" />
        Virtualized rendering is active for smoother scaling
      </div>

      <WordsExplorer
        userId={user.id}
        initialWords={initialWords}
        initialHasMore={initialWords.length === 30}
        initialSupportsPinned={supportsPinned}
        stats={{
          total: total ?? 0,
          easy: easy ?? 0,
          hard: hard ?? 0,
          due: due ?? 0,
        }}
      />
    </div>
  );
}
