import { Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/workspace/page-header";
import { SuggestionPortal } from "@/components/workspace/suggestion-portal";

export default async function SuggestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: suggestions } = await supabase
    .from("suggestions")
    .select("id, user_id, title, description, category, status, admin_response, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Feedback"
        title="A real product feedback loop"
        description="Ideas, bugs, and improvement requests with status visibility and admin responses."
      />

      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-4 py-2 text-sm text-muted-foreground w-fit">
        <Lightbulb className="size-4 text-primary" />
        Feedback status is visible after every admin update
      </div>

      <SuggestionPortal userId={user.id} initialSuggestions={suggestions || []} />
    </div>
  );
}
