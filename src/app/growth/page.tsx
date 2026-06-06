import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  TrendingUp, Target, Zap, CheckCircle2, Circle,
  Clock, BookOpen, Users, FileText, Code, Briefcase,
  AlertTriangle, Star, ChevronRight, BarChart3,
} from "lucide-react";

async function getGrowthData() {
  const [tasks, insights, skills] = await Promise.all([
    db.growthTask.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
    }),
    db.marketInsight.findMany({ where: { isActive: true }, orderBy: { date: "desc" } }),
    db.skill.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: [{ isGap: "desc" }, { inDemand: "desc" }],
    }),
  ]);

  const completionRate = tasks.length
    ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100)
    : 0;

  return { tasks, insights, skills, completionRate };
}

const categoryConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  skill:       { icon: <BookOpen className="w-4 h-4" />,  label: "Skill Building",  color: "text-sky-400 bg-sky-400/10 border-sky-400/20" },
  credential:  { icon: <Star className="w-4 h-4" />,      label: "Credentials",     color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  project:     { icon: <Code className="w-4 h-4" />,      label: "Projects",        color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  content:     { icon: <FileText className="w-4 h-4" />,  label: "Content",         color: "text-accent-soft bg-accent/10 border-accent/20" },
  network:     { icon: <Users className="w-4 h-4" />,     label: "Networking",      color: "text-signal-green bg-signal-green/10 border-signal-green/20" },
  application: { icon: <Briefcase className="w-4 h-4" />, label: "Applications",    color: "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20" },
};

const priorityDot: Record<string, string> = {
  high: "bg-signal-red",
  medium: "bg-signal-amber",
  low: "bg-slate-500",
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  todo:        { icon: <Circle className="w-4 h-4" />,      color: "text-slate-500" },
  in_progress: { icon: <Clock className="w-4 h-4" />,       color: "text-signal-amber" },
  done:        { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-signal-green" },
  skipped:     { icon: <Circle className="w-4 h-4" />,      color: "text-slate-700" },
};

export default async function GrowthPage() {
  const { tasks, insights, skills, completionRate } = await getGrowthData();

  const byCategory = tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const gapSkills = skills.filter((s) => s.isGap);
  const hotSkills = skills.filter((s) => s.inDemand);
  const activeTasks = tasks.filter((t) => t.status !== "done" && t.status !== "skipped");
  const highPriority = activeTasks.filter((t) => t.priority === "high");

  return (
    <div className="space-y-6 pb-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-amber">{activeTasks.length}</div>
          <div className="text-xs text-slate-500">Active Tasks</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-red">{highPriority.length}</div>
          <div className="text-xs text-slate-500">High Priority</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-green">{completionRate}%</div>
          <div className="text-xs text-slate-500">Completion Rate</div>
          <div className="progress-bar mt-1">
            <div className="progress-fill bg-signal-green" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-accent-soft">{gapSkills.length}</div>
          <div className="text-xs text-slate-500">Skill Gaps</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-5">

          {/* High Priority */}
          {highPriority.length > 0 && (
            <div className="card p-5 border-signal-red/20">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-signal-red" />
                <span className="section-title text-sm">High Priority — Do Now</span>
              </div>
              <div className="space-y-2">
                {highPriority.map((task) => {
                  const st = statusConfig[task.status] ?? statusConfig.todo;
                  const cat = categoryConfig[task.category];
                  return (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-signal-red/5 border border-signal-red/15 hover:border-signal-red/30 transition-colors group cursor-pointer">
                      <button className={cn("mt-0.5 shrink-0 transition-colors hover:text-signal-green", st.color)}>
                        {st.icon}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-100">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          {cat && (
                            <span className={cn("badge text-[10px]", cat.color)}>
                              {cat.icon}
                              {cat.label}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-[10px] text-signal-amber">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                          {task.estimatedHours && (
                            <span className="text-[10px] text-slate-500">~{task.estimatedHours}h</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* By Category */}
          {Object.entries(byCategory).map(([category, categoryTasks]) => {
            const config = categoryConfig[category];
            const activeCat = categoryTasks.filter((t) => t.status !== "done");
            if (activeCat.length === 0) return null;
            return (
              <div key={category} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("flex items-center gap-2 badge", config?.color ?? "badge-slate")}>
                    {config?.icon}
                    <span className="font-semibold">{config?.label ?? category}</span>
                    <span className="font-bold">{activeCat.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {activeCat.map((task) => {
                    const st = statusConfig[task.status] ?? statusConfig.todo;
                    return (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-ink-700/40 border border-ink-600/30 hover:border-accent/20 transition-colors cursor-pointer group">
                        <button className={cn("mt-0.5 shrink-0 hover:text-signal-green transition-colors", st.color)}>
                          {st.icon}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-sm font-medium", task.status === "done" ? "line-through text-slate-500" : "text-slate-200")}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-xs text-slate-500 mt-0.5">{task.description}</div>
                          )}
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", priorityDot[task.priority])} />
                            {task.relatedSkill && (
                              <span className="text-[10px] text-slate-500">→ {task.relatedSkill}</span>
                            )}
                            {task.relatedRole && (
                              <span className="text-[10px] text-accent/60">for {task.relatedRole}</span>
                            )}
                            {task.resourceUrl && (
                              <a href={task.resourceUrl} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-accent-soft hover:underline">
                                Resource ↗
                              </a>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-0.5" />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Insights + Gaps */}
        <div className="space-y-5">
          {/* Skill Gaps Roadmap */}
          {gapSkills.length > 0 && (
            <div className="card p-5 border-signal-amber/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-signal-amber" />
                <span className="section-title text-sm">Gap Roadmap</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Close these to unlock top roles</p>
              <div className="space-y-2">
                {gapSkills.map((skill) => (
                  <div key={skill.id} className="p-3 rounded-xl bg-signal-amber/5 border border-signal-amber/15">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200">{skill.name}</span>
                      <span className="badge bg-signal-amber/10 text-signal-amber border-signal-amber/20 text-[10px] capitalize">
                        {skill.level}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 capitalize">{skill.category} skill</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hot Skills */}
          {hotSkills.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-signal-green" />
                <span className="section-title text-sm">🔥 In-Demand Skills</span>
              </div>
              <div className="space-y-2">
                {hotSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-2.5 rounded-lg bg-signal-green/5 border border-signal-green/15">
                    <span className="text-xs text-slate-200">{skill.name}</span>
                    <span className="badge-green text-[10px] capitalize">{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Insights */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-accent-soft" />
              <span className="section-title text-sm">Market Intelligence</span>
            </div>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="p-3 rounded-xl bg-ink-700/50 border border-ink-600/30">
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                      insight.category === "salary" ? "bg-signal-green" :
                      insight.category === "skill-demand" ? "bg-signal-amber" :
                      insight.category === "role-trend" ? "bg-accent" : "bg-sky-400"
                    )} />
                    <div>
                      <div className="text-xs font-semibold text-slate-200 leading-snug">{insight.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{insight.body}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What Would It Take */}
          <div className="card p-5 border-accent/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-accent-soft" />
              <span className="section-title text-sm">"What would it take?"</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Pick a dream role and get a personalized gap-closing roadmap.
            </p>
            <div className="space-y-2">
              {["VC Partner at Tier-1 Firm", "CEO of Series C Startup", "Fractional CPO Portfolio"].map((role) => (
                <button key={role} className="w-full text-left p-2.5 rounded-lg bg-ink-700/50 border border-ink-600/30 hover:border-accent/30 hover:bg-accent/5 transition-all text-xs text-slate-400 hover:text-slate-200 flex items-center justify-between group">
                  {role}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-accent-soft transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
