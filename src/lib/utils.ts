import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact && amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-signal-green";
  if (score >= 60) return "text-signal-amber";
  return "text-signal-red";
}

export function getScoreBg(score: number): string {
  if (score >= 80) return "bg-signal-green";
  if (score >= 60) return "bg-signal-amber";
  return "bg-signal-red";
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    discovered: "Discovered",
    applied: "Applied",
    screen: "Screen",
    interview_1: "Interview I",
    interview_2: "Interview II",
    final: "Final Round",
    offer: "Offer",
    closed_won: "Accepted 🎉",
    closed_lost: "Closed",
  };
  return labels[stage] ?? stage;
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    discovered: "text-slate-400",
    applied: "text-accent-soft",
    screen: "text-sky-400",
    interview_1: "text-violet-400",
    interview_2: "text-purple-400",
    final: "text-fuchsia-400",
    offer: "text-signal-green",
    closed_won: "text-signal-green",
    closed_lost: "text-slate-500",
  };
  return colors[stage] ?? "text-slate-400";
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}
