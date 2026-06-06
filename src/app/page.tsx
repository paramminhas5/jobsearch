import { db } from "@/lib/db";
import { DEMO_USER_ID, PIPELINE_STAGES } from "@/lib/constants";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { StatCard } from "@/components/ui/StatCard";
import { MatchBadge } from "@/components/ui/MatchBadge";
import { formatCurrency, getStageColor, getStageLabel, cn } from "@/lib/utils";
import {
  Telescope, Kanban, TrendingUp, Megaphone,
  ArrowRight, Zap, Clock, Target, ChevronRight,
  Building2, MapPin, DollarSign, AlertCircle
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const [user, opportunities, applications, growthTasks, brandPosts, insights] =
    await Promise.all([
      db.user.findUnique({ where: { id: DEMO_USER_ID } }),
      db.opportunity.findMany({
        where: { userId: DEMO_USER_ID, status: { not: "dismissed" } },
        orderBy: { aiMatchScore: "desc" },
        take: 5,
      }),
      db.application.findMany({
        where: { userId: DEMO_USER_ID, stage: { notIn: ["closed_won", "closed_lost"] } },
        include: { opportunity: true },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
      db.growthTask.findMany({
        where: { userId: DEMO_USER_ID, status: { in: ["todo", "in_progress"] } },
        orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
        take: 4,
      }),
      db.brandPost.count({ where: { userId: DEMO_USER_ID, status: "draft" } }),
      db.marketInsight.findMany({ where: { isActive: true }, orderBy: { date: "desc" }, take: 3 }),
    ]);

  return { user, opportunities, applications, growthTasks, brandPosts, insights };
}

const priorityColor: Record<string, string> = {
  high: "bg-signal-red/15 text-signal-red border-signal-red/25",
  medium: "bg-signal-amber/15 text-signal-amber border-signal-amber/25",
  low: "bg-slate-700/50 text-slate-400 border-slate-600/30",
};

export default async function DashboardPage() {
  const { user, opportunities, applications, growthTasks, brandPosts, insights } =
    await getDashboardData();

  const topMatch = opportunities[0];
  const newOppCount = opportunities.filter((o) => o.status === "new").length;

  // Pipeline summary
  const stageCounts = PIPELINE_STAGES.slice(0, 6).map((s) => ({
    ...s,
    count: applications.filter((a) => a.stage === s.id).length,
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* ── HERO WELCOME ─────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            {user?.headline ?? "Your career engine is running."}
          </p>
        </div>
        <Link href="/opportunities" className="btn-primary shrink-0">
          <Zap className="w-4 h-4" />
          View New Matches
        </Link>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Score */}
        <div className="stat-card col-span-2 lg:col-span-1 items-center justify-center flex-row gap-4">
          <ScoreRing score={user?.profileScore ?? 0} size={72} />
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Profile Strength</div>
            <div className="text-sm text-slate-300 font-medium">
              {(user?.profileScore ?? 0) < 80 ? "Room to grow" : "Strong signal"}
            </div>
            <Link href="/profile" className="text-xs text-accent-soft hover:text-accent-glow mt-1 flex items-center gap-1">
              Improve <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <StatCard
          label="New Matches Today"
          value={newOppCount}
          sub="AI-ranked for you"
          icon={Telescope}
          accent="accent"
        />
        <StatCard
          label="Active Applications"
          value={applications.length}
          sub="In pipeline"
          icon={Kanban}
          accent="green"
        />
        <StatCard
          label="Growth Tasks"
          value={growthTasks.length}
          sub="Pending actions"
          icon={TrendingUp}
          accent="amber"
        />
      </div>

      {/* ── TOP MATCH SPOTLIGHT ─────────────────────────────────── */}
      {topMatch && (
        <div className="card p-5 border-accent/20 bg-gradient-to-r from-ink-800 to-ink-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-accent-soft" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-accent/60">
                  Top Match
                </span>
                <MatchBadge score={topMatch.aiMatchScore ?? 0} size="sm" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                {topMatch.title} — {topMatch.company}
              </h3>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                {topMatch.aiMatchReason}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {topMatch.salaryMin && topMatch.salaryMax && (
                  <span className="flex items-center gap-1 text-xs text-signal-green font-medium">
                    <DollarSign className="w-3 h-3" />
                    {formatCurrency(topMatch.salaryMin, true)} – {formatCurrency(topMatch.salaryMax, true)}
                  </span>
                )}
                {topMatch.location && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="w-3 h-3" />
                    {topMatch.isRemote ? "Remote" : topMatch.location}
                  </span>
                )}
                <span className="badge-slate capitalize">{topMatch.companyStage?.replace("-", " ")}</span>
                <span className="badge-slate capitalize">{topMatch.sourcePlatform?.replace("-", " ")}</span>
              </div>
            </div>
            <Link href="/opportunities" className="btn-secondary shrink-0 text-xs">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── MAIN GRID ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Pipeline Snapshot */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Kanban className="w-4 h-4 text-accent-soft" />
              <span className="section-title">Pipeline</span>
            </div>
            <Link href="/pipeline" className="btn-ghost text-xs">
              Full view <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Stage pills */}
          <div className="flex gap-2 flex-wrap mb-4">
            {stageCounts.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium"
                style={{ borderColor: s.color + "40", backgroundColor: s.color + "15", color: s.color }}
              >
                <span>{s.label}</span>
                <span className="font-bold">{s.count}</span>
              </div>
            ))}
          </div>

          {/* Application cards */}
          <div className="space-y-2">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No active applications yet.{" "}
                <Link href="/opportunities" className="text-accent-soft hover:underline">
                  Explore opportunities →
                </Link>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-ink-700/50 border border-ink-600/50 hover:border-accent/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-ink-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200 truncate">
                        {app.opportunity.company}
                      </span>
                      <span className={cn("text-xs font-medium", getStageColor(app.stage))}>
                        {getStageLabel(app.stage)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{app.opportunity.title}</div>
                  </div>
                  {app.opportunity.aiMatchScore && (
                    <MatchBadge score={app.opportunity.aiMatchScore} size="sm" />
                  )}
                  {app.nextActionDate && (
                    <span className="flex items-center gap-1 text-xs text-signal-amber shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(app.nextActionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Growth Tasks */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-signal-amber" />
                <span className="section-title text-sm">Growth Tasks</span>
              </div>
              <Link href="/growth" className="btn-ghost text-xs">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {growthTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-ink-700/50 transition-colors">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                    task.priority === "high" ? "bg-signal-red" :
                    task.priority === "medium" ? "bg-signal-amber" : "bg-slate-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-300 leading-snug">{task.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("badge text-[9px] px-1.5 py-0.5 border", priorityColor[task.priority])}>
                        {task.priority}
                      </span>
                      <span className="badge-slate text-[9px]">{task.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Posts Due */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-violet-400" />
                <span className="section-title text-sm">Brand Engine</span>
              </div>
              <Link href="/brand" className="btn-ghost text-xs">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <div className="text-2xl font-bold text-violet-300">{brandPosts}</div>
              <div className="text-xs text-slate-400 mt-0.5">posts ready to publish</div>
              <Link href="/brand" className="text-xs text-violet-400 hover:text-violet-300 mt-2 flex items-center gap-1">
                Review & publish <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Market Insight */}
          {insights[0] && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-signal-amber" />
                <span className="section-title text-sm">Market Pulse</span>
              </div>
              <div className="space-y-3">
                {insights.slice(0, 2).map((insight) => (
                  <div key={insight.id} className="p-3 rounded-xl bg-ink-700/50 border border-ink-600/30">
                    <div className="text-xs font-semibold text-slate-200 leading-snug">{insight.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{insight.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── OPPORTUNITIES PREVIEW ─────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Telescope className="w-4 h-4 text-accent-soft" />
            <span className="section-title">Top Opportunities</span>
          </div>
          <Link href="/opportunities" className="btn-ghost text-xs">
            View all {opportunities.length} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {opportunities.slice(0, 3).map((opp) => (
            <div key={opp.id} className="card-hover p-4 group">
              <div className="flex items-start justify-between mb-2">
                <MatchBadge score={opp.aiMatchScore ?? 0} size="sm" />
                <span className="badge-slate capitalize text-[10px]">
                  {opp.sourcePlatform?.replace("-", " ")}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-100 mt-2">{opp.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">{opp.company}</div>
              {opp.salaryMax && (
                <div className="text-xs text-signal-green font-medium mt-2">
                  Up to {formatCurrency(opp.salaryMax, true)}
                </div>
              )}
              <div className="text-[11px] text-slate-500 mt-2 line-clamp-2">{opp.aiMatchReason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
