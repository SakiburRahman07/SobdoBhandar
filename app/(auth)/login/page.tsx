"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Login failed.", { description: error.message });
      setLoading(false);
      return;
    }

    toast.success("Welcome back to your study workspace.");
    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border/70 bg-background/75 shadow-[0_30px_90px_rgba(7,19,31,0.16)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden border-r border-border/70 p-10 lg:block">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="SobdoBhandar" width={52} height={52} className="rounded-[1.1rem] shadow-[0_15px_40px_rgba(73,198,255,0.22)]" />
            <div>
              <p className="font-display text-xl font-semibold text-foreground">SobdoBhandar</p>
              <p className="text-sm text-muted-foreground">Return to your study cockpit</p>
            </div>
          </div>
          <div className="mt-14 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="size-3.5" />
              Premium review workflow
            </div>
            <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-foreground">Pick up your streak right where you left it.</h1>
            <p className="text-sm leading-7 text-muted-foreground">
              Daily mission, virtualized library, focus-mode review, and cleaner analytics are waiting inside.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Log in</p>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground">Enter your account and continue learning</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Your saved words, due reviews, streak, and analytics will all be ready as soon as you sign in.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 rounded-2xl border-border/80 bg-background/60 pl-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="h-12 rounded-2xl border-border/80 bg-background/60 pl-11" />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="h-12 w-full rounded-2xl text-base">
                {loading ? "Logging in..." : "Log in"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>

            <div className="rounded-[1.5rem] border border-border/70 bg-background/45 p-4 text-sm text-muted-foreground">
              <p>New learner? <Link href="/signup" className="font-medium text-primary">Create an account</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
