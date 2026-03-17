import { createClient } from "@/lib/supabase/server";
import type { WordWithReview } from "@/lib/types";
import { LearnSession } from "@/components/workspace/learn-session";

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("words")
    .select(`
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
      review_schedule!inner (
        id,
        word_id,
        user_id,
        next_review_date,
        interval_days,
        ease_factor,
        repetitions,
        last_reviewed_at,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .lte("review_schedule.next_review_date", today)
    .order("created_at", { ascending: true });

  const dueWords: WordWithReview[] = (data || []).map((word) => ({
    ...word,
    review_schedule: Array.isArray(word.review_schedule)
      ? word.review_schedule[0] ?? null
      : (word.review_schedule ?? null),
  }));

  return <LearnSession initialWords={dueWords} userId={user.id} />;
}
