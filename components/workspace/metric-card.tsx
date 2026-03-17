import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "default" | "primary" | "success" | "warning" | "danger";

const toneMap: Record<Tone, string> = {
  default:
    "border-border/70 bg-surface/85 text-foreground shadow-[0_18px_45px_rgba(7,19,31,0.08)]",
  primary:
    "border-primary/20 bg-[radial-gradient(circle_at_top,_rgba(73,198,255,0.22),transparent_55%),var(--surface)] text-foreground shadow-[0_20px_40px_rgba(73,198,255,0.12)]",
  success:
    "border-emerald-400/20 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.18),transparent_55%),var(--surface)] text-foreground shadow-[0_20px_40px_rgba(52,211,153,0.12)]",
  warning:
    "border-amber-400/20 bg-[radial-gradient(circle_at_top,_rgba(253,186,77,0.18),transparent_55%),var(--surface)] text-foreground shadow-[0_20px_40px_rgba(253,186,77,0.12)]",
  danger:
    "border-rose-400/20 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.18),transparent_55%),var(--surface)] text-foreground shadow-[0_20px_40px_rgba(248,113,113,0.12)]",
};

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
  trend?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("v2-card gap-0 overflow-hidden", toneMap[tone], className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-end gap-3">
            <p className="font-display text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            {trend ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/50 px-2 py-1 text-xs font-medium text-muted-foreground">
                <ArrowUpRight className="size-3" />
                {trend}
              </span>
            ) : null}
          </div>
          {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
        </div>

        <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-background/60 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
