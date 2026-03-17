import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: admin }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("display_name, avatar_url, target_words_per_day")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <AppShell user={user} profile={profile} isAdmin>
      {children}
    </AppShell>
  );
}
