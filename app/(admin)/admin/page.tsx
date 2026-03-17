import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminConsole } from "@/components/workspace/admin-console";
import { PageHeader } from "@/components/workspace/page-header";

export default async function AdminPage() {
  const supabase = await createClient();

  const [{ data: suggestions }, { count: totalUsers }, { count: totalWords }, { count: totalSuggestions }] = await Promise.all([
    supabase
      .from("suggestions")
      .select("id, user_id, title, description, category, status, admin_response, created_at, updated_at")
      .order("created_at", { ascending: false }),
    supabase.from("user_profiles").select("id", { count: "exact", head: true }),
    supabase.from("words").select("id", { count: "exact", head: true }),
    supabase.from("suggestions").select("id", { count: "exact", head: true }),
  ]);

  const pendingSuggestions = (suggestions || []).filter((item) => item.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Operations and moderation console"
        description="Feedback queue, quick status actions, and live platform volume in one dense but readable workspace."
      />

      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-4 py-2 text-sm text-muted-foreground w-fit">
        <Shield className="size-4 text-primary" />
        Admin-only moderation tools
      </div>

      <AdminConsole
        initialSuggestions={suggestions || []}
        stats={{
          totalUsers: totalUsers ?? 0,
          totalWords: totalWords ?? 0,
          totalSuggestions: totalSuggestions ?? 0,
          pendingSuggestions,
        }}
      />
    </div>
  );
}
