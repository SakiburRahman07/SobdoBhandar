import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { WordForm } from "@/components/word-form";
import { PageHeader } from "@/components/workspace/page-header";

export default async function AddWordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Word creation"
        title="Add a rich vocabulary entry"
        description="Capture the English word, Bangla meaning, example, pronunciation, synonyms, antonyms, and AI-assisted metadata in one clean flow."
        action={
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href="/words">
              <ArrowLeft className="mr-2 size-4" />
              Back to library
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.55fr] xl:items-start">
        <WordForm userId={user.id} />

        <aside className="space-y-4">
          <div className="v2-card rounded-[1.75rem] p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="size-4" />
              AI-assisted entry
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Start with the English word and let AI help draft the part of speech, examples, pronunciation, synonyms, antonyms, and Bangla meaning.
            </p>
          </div>
          <div className="v2-card rounded-[1.75rem] p-5">
            <p className="text-sm font-medium text-foreground">High-quality entry checklist</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>Keep the meaning short and student-friendly.</li>
              <li>Use an example sentence that sounds natural.</li>
              <li>Add verb forms when the word is a verb.</li>
              <li>Pronunciation and synonyms make review faster later.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
