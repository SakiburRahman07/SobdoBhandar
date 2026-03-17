"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error("Could not create the account.", { description: error.message });
      setLoading(false);
      return;
    }

    toast.success("Account created. Verify your email before logging in.");
    router.push("/login");
    setLoading(false);
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border/70 bg-background/75 shadow-[0_30px_90px_rgba(7,19,31,0.16)] backdrop-blur-xl lg:grid-cols-[0.98fr_1.02fr]">
        <div className="hidden border-r border-border/70 p-10 lg:block">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="SobdoBhandar" width={52} height={52} className="rounded-[1.1rem] shadow-[0_15px_40px_rgba(73,198,255,0.22)]" />
            <div>
              <p className="font-display text-xl font-semibold text-foreground">SobdoBhandar</p>
              <p className="text-sm text-muted-foreground">Build your learning identity</p>
            </div>
          </div>
          <div className="mt-14 space-y-6">
            <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-foreground">Start a calmer, smarter vocabulary habit.</h1>
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />Spaced repetition review schedule</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />Bangla-first word management and analytics</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />Inline setup for your daily target after signup</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Sign up</p>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground">Create your account</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Join the new learning workspace and set up a daily target after your first login.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
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
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="h-12 rounded-2xl border-border/80 bg-background/60 pl-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="confirm-password" type="password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Type the password again" className="h-12 rounded-2xl border-border/80 bg-background/60 pl-11" />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="h-12 w-full rounded-2xl text-base">
                {loading ? "Creating account..." : "Create account"}
                <UserPlus className="ml-2 size-4" />
              </Button>
            </form>

            <div className="rounded-[1.5rem] border border-border/70 bg-background/45 p-4 text-sm text-muted-foreground">
              <p>Already have an account? <Link href="/login" className="font-medium text-primary">Log in</Link></p>
              <p className="mt-2">After signup, verify your email and then finish the inline daily-target setup from the dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
