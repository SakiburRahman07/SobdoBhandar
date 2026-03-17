import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  label: string;
  sublabel?: string;
  className?: string;
}

export function ProgressRing({
  value,
  label,
  sublabel,
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg viewBox="0 0 120 120" className="size-36 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r="52"
          className="fill-none stroke-[10] text-border/70"
          stroke="currentColor"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          className="fill-none stroke-[10] text-primary"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-display text-3xl font-semibold">{clamped}%</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sublabel ? <p className="text-xs text-muted-foreground/80">{sublabel}</p> : null}
      </div>
    </div>
  );
}
