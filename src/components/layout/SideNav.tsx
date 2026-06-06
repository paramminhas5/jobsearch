"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Telescope,
  Kanban,
  Megaphone,
  TrendingUp,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/opportunities", label: "Opportunities", icon: Telescope },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/brand", label: "Brand Engine", icon: Megaphone },
  { href: "/growth", label: "Growth Loop", icon: TrendingUp },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-ink-900 border-r border-ink-700 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-ink-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-soft flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">Career OS</div>
            <div className="text-xs text-slate-500">Executive Engine</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">
          Workspace
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-accent/10 text-accent-soft border border-accent/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-ink-700"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-accent/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1 border-t border-ink-700 pt-4">
        <Link
          href="/settings"
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
            pathname === "/settings"
              ? "bg-accent/10 text-accent-soft border border-accent/20"
              : "text-slate-400 hover:text-slate-100 hover:bg-ink-700"
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </Link>

        {/* User pill */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center text-xs font-bold text-white">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-300 truncate">You</div>
            <div className="text-[10px] text-slate-500 truncate">Executive Mode</div>
          </div>
          <div className="glow-dot bg-signal-green" />
        </div>
      </div>
    </aside>
  );
}
