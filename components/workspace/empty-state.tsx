import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
}: EmptyStateProps) {
  return (
    <Card className="v2-card overflow-hidden">
      <CardContent className="flex flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <div className="relative flex size-16 items-center justify-center rounded-3xl border border-border/70 bg-surface-elevated shadow-[0_20px_45px_rgba(7,19,31,0.14)]">
          <div className="absolute inset-2 rounded-2xl bg-[radial-gradient(circle,_rgba(73,198,255,0.16),transparent_70%)]" />
          <Icon className="relative z-10 size-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {actionHref && actionLabel ? (
            <Button asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Button asChild variant="outline">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
