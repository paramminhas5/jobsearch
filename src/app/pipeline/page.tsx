import { db } from "@/lib/db";
import { DEMO_USER_ID, PIPELINE_STAGES } from "@/lib/constants";
import { MatchBadge } from "@/components/ui/MatchBadge";
import { formatCurrency, cn, getStageLabel } from "@/lib/utils";
import {
  Building2, Clock, DollarSign, ChevronRight,
  Plus, Calendar, ArrowRight,
} from "lucide-react";
import Link from "next/link";

async function getPipelineData() {
  const applications = await db.application.findMany({
    where: { userId: DEMO_USER_ID },
    include: {
      opportunity: true,
      events: { orderBy: { occurredAt: "desc" }, take: 1 },
      contacts: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const pipeline = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    applications: applications.filter((a) => a.stage === stage.id),
  }));

  const totalValue = applications.reduce(
    (sum, a) => sum + (a.opportunity.salaryMax ?? 0), 0
  );
  const activeCount = applications.filter(
    (a) => !["closed_won", "closed_lost"].includes(a.stage)
  ).length;

  return { pipeline, applications, totalValue, activeCount };
}

const stageGradients: Record<string, string> = {
  discovered: "border-slate-600/40",
  applied: "border-accent/30",
  screen: "border-sky-500/30",
  interview_1: "border-violet-500/30",
  interview_2: "border-purple-500/30",
  final: "border-fuchsia-500/30",
  offer: "border-signal-green/40",
  closed_won: "border-signal-green/50",
  closed_lost: "border-slate-700/30",
};

export default async function PipelinePage() {
  const { pipeline, applications, totalValue, activeCount } = await getPipelineData();

  const upcomingActions = applications.filter(
    (a) => a.nextActionDate && new Date(a.nextActionDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-2xl font-bold text-slate-100">{applications.length}</div>
          <div className="text-xs text-slate-500">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-accent-soft">{activeCount}</div>
          <div className="text-xs text-slate-500">Active</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-green">
            {totalValue > 0 ? formatCurrency(totalValue, true) : "—"}
          </div>
          <div className="text-xs text-slate-500">Pipeline Value</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-amber">{upcomingActions.length}</div>
          <div className="text-xs text-slate-500">Actions This Week</div>
        </div>
      </div>

      {/* Upcoming Actions */}
      {upcomingActions.length > 0 && (
        <div className="card p-5 border-signal-amber/20">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-signal-amber" />
            <span className="section-title text-sm">Actions This Week</span>
          </div>
          <div className="space-y-2">
            {upcomingActions.map((app) => (
              <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-signal-amber/5 border border-signal-amber/15">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-200">{app.opportunity.company}</span>
                  <span className="text-xs text-slate-500 ml-2">{app.opportunity.title}</span>
                </div>
                {app.nextActionNote && (
                  <span className="text-xs text-slate-400 flex-1">{app.nextActionNote}</span>
                )}
                <span className="text-xs text-signal-amber font-medium flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {app.nextActionDate
                    ? new Date(app.nextActionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Application Pipeline</h3>
          <Link href="/opportunities" className="btn-secondary text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Application
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {pipeline.filter((s) => !["closed_won", "closed_lost"].includes(s.id)).map((stage) => (
            <div key={stage.id} className={cn("card p-3 border", stageGradients[stage.id])}>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-xs font-semibold text-slate-300">{stage.label}</span>
                </div>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: stage.color + "25", color: stage.color }}
                >
                  {stage.applications.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-16">
                {stage.applications.length === 0 ? (
                  <div className="text-center py-4 text-[11px] text-slate-600 border-2 border-dashed border-ink-600 rounded-xl">
                    Empty
                  </div>
                ) : (
                  stage.applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-ink-700/60 border border-ink-600/50 hover:border-accent/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-100 truncate">
                          {app.opportunity.company}
                        </span>
                        {app.opportunity.aiMatchScore && (
                          <MatchBadge score={app.opportunity.aiMatchScore} size="sm" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mb-2">
                        {app.opportunity.title}
                      </div>
                      {app.opportunity.salaryMax && (
                        <div className="flex items-center gap-1 text-[11px] text-signal-green font-medium">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(app.opportunity.salaryMax, true)}
                        </div>
                      )}
                      {app.nextActionDate && (
                        <div className="flex items-center gap-1 text-[10px] text-signal-amber mt-1.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(app.nextActionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      )}
                      {/* Stage move hints */}
                      <div className="hidden group-hover:flex items-center gap-1 mt-2">
                        <button className="flex-1 text-[10px] bg-ink-600 hover:bg-ink-500 text-slate-300 rounded-lg py-1 flex items-center justify-center gap-0.5 transition-colors">
                          Move <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closed Roles */}
      {pipeline
        .filter((s) => ["closed_won", "closed_lost"].includes(s.id))
        .filter((s) => s.applications.length > 0)
        .map((stage) => (
          <div key={stage.id} className="card p-5 opacity-60">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-sm font-semibold text-slate-300">{stage.label}</span>
              <span className="badge-slate">{stage.applications.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stage.applications.map((app) => (
                <div key={app.id} className="px-3 py-2 rounded-xl bg-ink-700/30 border border-ink-600/30 text-xs text-slate-400">
                  {app.opportunity.company} — {app.opportunity.title}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
