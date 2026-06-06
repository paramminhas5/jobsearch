"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Sparkles } from "lucide-react";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Your career at a glance" },
  "/profile": { title: "Profile Intelligence", subtitle: "Your source of truth" },
  "/opportunities": { title: "Opportunity Engine", subtitle: "AI-ranked executive roles" },
  "/pipeline": { title: "Pipeline", subtitle: "Track every application" },
  "/brand": { title: "Brand Engine", subtitle: "Build your public signal" },
  "/growth": { title: "Growth Loop", subtitle: "Close the gap to your dream role" },
  "/settings": { title: "Settings", subtitle: "Connect your tools" },
};

export function TopBar() {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] ?? { title: "Career OS", subtitle: "" };

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-ink-700 bg-ink-900/80 backdrop-blur-sm">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-slate-100 leading-none mb-0.5">
          {page.title}
        </h1>
        <p className="text-xs text-slate-500">{page.subtitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-ink-800 border border-ink-600 rounded-xl px-3 py-1.5 text-sm text-slate-500 w-52 hover:border-accent/40 transition-colors cursor-pointer">
          <Search className="w-3.5 h-3.5" />
          <span>Search anything…</span>
          <kbd className="ml-auto text-[10px] bg-ink-600 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>

        {/* AI Assist */}
        <button className="btn-primary text-xs px-3 py-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          AI Assist
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-ink-800 border border-ink-600 text-slate-400 hover:text-slate-100 hover:border-accent/40 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>
      </div>
    </header>
  );
}
