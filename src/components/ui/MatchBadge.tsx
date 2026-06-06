import { cn } from "@/lib/utils";

interface MatchBadgeProps {
  score: number;
  size?: "sm" | "md";
  className?: string;
}

export function MatchBadge({ score, size = "md", className }: MatchBadgeProps) {
  const color =
    score >= 85
      ? "bg-signal-green/15 text-signal-green border-signal-green/25"
      : score >= 70
      ? "bg-accent/15 text-accent-soft border-accent/25"
      : score >= 55
      ? "bg-signal-amber/15 text-signal-amber border-signal-amber/25"
      : "bg-signal-red/10 text-signal-red border-signal-red/20";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5",
        color,
        className
      )}
    >
      {score}% match
    </span>
  );
}
