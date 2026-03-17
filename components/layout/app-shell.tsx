"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Command, LogOut, MoreHorizontal, Plus, Shield, Target } from "lucide-react";
import { signOut } from "@/app/actions";
import { AIChatbot } from "@/components/ai-chatbot";
import { CommandPalette } from "@/components/layout/command-palette";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminNavigation, workspaceNavigation } from "@/lib/app-navigation";
import { cn } from "@/lib/utils";

interface ShellProfile {
  display_name?: string | null;
  avatar_url?: string | null;
  target_words_per_day?: number | null;
}

interface AppShellProps {
  user: User;
  profile?: ShellProfile | null;
  isAdmin?: boolean;
  children: React.ReactNode;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ user, profile, isAdmin = false, children }: AppShellProps) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = React.useState(false);

  const navigation = React.useMemo(
    () => (isAdmin ? [...workspaceNavigation, ...adminNavigation] : workspaceNavigation),
    [isAdmin],
  );

  const displayName = profile?.display_name || user.email?.split("@")[0] || "Learner";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="app-shell-grid pointer-events-none" />
      <div className="app-shell-spotlight pointer-events-none" />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} isAdmin={isAdmin} />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border/70 bg-surface-elevated/85 px-5 py-5 backdrop-blur xl:flex xl:flex-col">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-3xl px-2 py-2">
          <Image
            src="/logo.png"
            alt="SobdoBhandar"
            width={52}
            height={52}
            className="rounded-[1.25rem] shadow-[0_15px_40px_rgba(73,198,255,0.22)]"
          />
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-foreground">SobdoBhandar</p>
            <p className="text-xs text-muted-foreground">Vocabulary cockpit v2</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-start gap-3 rounded-[1.25rem] border px-3 py-3 transition",
                  active
                    ? "border-primary/25 bg-primary/10 shadow-[0_16px_32px_rgba(73,198,255,0.16)]"
                    : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-surface/80 hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border bg-background/70",
                    active ? "border-primary/30 text-primary" : "border-border/70 text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium leading-none">{item.label}</p>
                  <p className="text-xs leading-5 text-muted-foreground">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-[1.75rem] border border-primary/15 bg-[radial-gradient(circle_at_top,_rgba(73,198,255,0.18),transparent_55%),var(--surface)] p-4 shadow-[0_20px_40px_rgba(7,19,31,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Target className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Daily target</p>
                <p className="text-xs text-muted-foreground">{profile?.target_words_per_day ?? 10} reviews planned for each day</p>
              </div>
            </div>
          </div>

          <Button asChild className="w-full justify-center rounded-2xl">
            <Link href="/words/add">
              <Plus className="size-4" />
              Add a new word
            </Link>
          </Button>
        </div>
      </aside>

      <div className="relative min-h-screen xl:pl-72">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <Button
              type="button"
              variant="outline"
              className="hidden flex-1 justify-start rounded-2xl border-border/80 bg-surface/80 text-muted-foreground md:inline-flex"
              onClick={() => setCommandOpen(true)}
            >
              <Command className="size-4 text-primary" />
              Search pages and actions
              <span className="ml-auto rounded-lg border border-border/70 px-2 py-1 text-xs">Ctrl K</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-2xl border-border/80 bg-surface/80 md:hidden"
              onClick={() => setCommandOpen(true)}
              aria-label="Open command palette"
            >
              <Command className="size-4" />
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="h-11 rounded-2xl border-border/80 bg-surface/80 px-3">
                    <Avatar className="size-8 border border-border/80">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {displayName.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left sm:block">
                      <p className="max-w-[12rem] truncate text-sm font-medium text-foreground">{displayName}</p>
                      <p className="max-w-[12rem] truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <MoreHorizontal className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-2xl border-border/80 bg-surface-elevated/95 backdrop-blur-xl">
                  <DropdownMenuLabel className="space-y-1">
                    <p className="font-medium text-foreground">{displayName}</p>
                    <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile and settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/words/add">Add a new word</Link>
                  </DropdownMenuItem>
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="gap-2">
                        <Shield className="size-4 text-primary" />
                        Admin console
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <form action={signOut}>
                    <DropdownMenuItem asChild>
                      <button type="submit" className="flex w-full items-center gap-2 text-rose-400">
                        <LogOut className="size-4" />
                        Sign out
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1440px] flex-col px-4 pb-28 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/92 px-3 py-3 backdrop-blur-xl xl:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
            {workspaceNavigation.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition",
                    active ? "bg-primary/12 text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("size-4", active && "drop-shadow-[0_0_12px_rgba(73,198,255,0.28)]")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {pathname !== "/learn" ? <AIChatbot /> : null}
    </div>
  );
}
