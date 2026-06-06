import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "green" | "amber" | "red" | "accent" | "default";
  className?: string;
}

const accentMap = {
  green: { icon: "text-signal-green", bg: "bg-signal-green/10" },
  amber: { icon: "text-signal-amber", bg: "bg-signal-amber/10" },
  red: { icon: "text-signal-red", bg: "bg-signal-red/10" },
  accent: { icon: "text-accent-soft", bg: "bg-accent/10" },
  default: { icon: "text-slate-400", bg: "bg-ink-700" },
};

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  accent = "default",
  className,
}: StatCardProps) {
  const colors = accentMap[accent];

  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            colors.bg
          )}
        >
          <Icon className={cn("w-4.5 h-4.5", colors.icon)} size={18} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.value > 0 ? "text-signal-green" : "text-signal-red"
            )}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
