"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  adminNavigation,
  workspaceNavigation,
  workspaceQuickActions,
} from "@/lib/app-navigation";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
}

export function CommandPalette({
  open,
  onOpenChange,
  isAdmin = false,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const entries = React.useMemo(() => {
    const base = [...workspaceQuickActions, ...workspaceNavigation];
    return isAdmin ? [...base, ...adminNavigation] : base;
  }, [isAdmin]);

  const filtered = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return entries;

    return entries.filter((entry) => {
      const haystack = [entry.label, entry.description, ...(entry.keyword ?? [])]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [entries, query]);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[1.5rem] border-border/80 bg-surface-elevated/95 p-0 shadow-[0_30px_100px_rgba(7,19,31,0.3)]">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="border-b border-border/70 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background/70 px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Jump to a page, start a session, or add a word"
              className="h-auto border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
            <kbd className="hidden rounded-lg border border-border/70 bg-surface px-2 py-1 text-xs text-muted-foreground sm:inline-flex">
              Ctrl K
            </kbd>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-3">
          {filtered.length > 0 ? (
            filtered.map((entry) => {
              const Icon = entry.icon;

              return (
                <button
                  key={`${entry.href}-${entry.label}`}
                  type="button"
                  className="flex w-full items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-border/70 hover:bg-background/60"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(entry.href);
                  }}
                >
                  <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-surface">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{entry.label}</p>
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/80 px-6 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">No matching command</p>
                <p className="text-sm text-muted-foreground">
                  Try searching for dashboard, words, progress, or add a word.
                </p>
              </div>
              <Link
                href="/words/add"
                className="text-sm font-medium text-primary"
                onClick={() => onOpenChange(false)}
              >
                Go to add word
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
