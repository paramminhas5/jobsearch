import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";
import { MatchBadge } from "@/components/ui/MatchBadge";
import { formatCurrency, cn } from "@/lib/utils";
import {
  MapPin, DollarSign, Building2, ExternalLink,
  Sparkles, Filter, Star, TrendingUp, Zap,
} from "lucide-react";

async function getOpportunities() {
  return db.opportunity.findMany({
    where: { userId: DEMO_USER_ID, status: { not: "dismissed" } },
    include: { application: true },
    orderBy: { aiMatchScore: "desc" },
  });
}

const stageColors: Record<string, string> = {
  seed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "series-a": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "series-b": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  growth: "bg-accent/10 text-accent-soft border-accent/20",
  public: "bg-slate-600/50 text-slate-300 border-slate-600",
  vc: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  pe: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const sourceIcons: Record<string, string> = {
  wellfound: "🚀",
  linkedin: "💼",
  "hacker-news": "🤘",
  "exec-search": "🎯",
  "vc-portfolio": "💰",
  direct: "✉️",
  referral: "🤝",
};

export default async function OpportunitiesPage() {
  const opps = await getOpportunities();

  const newOpps = opps.filter((o) => o.status === "new");
  const savedOpps = opps.filter((o) => o.status === "saved");
  const appliedOpps = opps.filter((o) => o.status === "applied");

  const avgScore = opps.length
    ? Math.round(opps.reduce((a, o) => a + (o.aiMatchScore ?? 0), 0) / opps.length)
    : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-2xl font-bold text-slate-100">{opps.length}</div>
          <div className="text-xs text-slate-500">Total Opportunities</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-accent-soft">{newOpps.length}</div>
          <div className="text-xs text-slate-500">New This Week</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-green">{savedOpps.length}</div>
          <div className="text-xs text-slate-500">Saved</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-amber">{avgScore}%</div>
          <div className="text-xs text-slate-500">Avg Match Score</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button className="btn-primary text-xs px-3 py-1.5">
          <Filter className="w-3.5 h-3.5" /> All Roles
        </button>
        {["CPO", "Co-Founder", "VP Product", "VC", "GM", "Consulting"].map((role) => (
          <button key={role} className="btn-secondary text-xs px-3 py-1.5">{role}</button>
        ))}
        <button className="btn-secondary text-xs px-3 py-1.5 ml-auto">
          <Sparkles className="w-3.5 h-3.5" /> Re-run AI Match
        </button>
      </div>

      {/* Opportunity Cards Grid */}
      <div className="space-y-3">
        {opps.map((opp, idx) => (
          <div
            key={opp.id}
            className={cn(
              "card p-5 transition-all duration-200 hover:border-accent/30 hover:shadow-glow",
              opp.aiMatchScore && opp.aiMatchScore >= 90 && "border-signal-green/20"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Rank */}
              <div className="w-7 h-7 rounded-lg bg-ink-700 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">
                {idx + 1}
              </div>

              {/* Company Logo placeholder */}
              <div className="w-10 h-10 rounded-xl bg-ink-700 border border-ink-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-slate-500" />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-100">{opp.title}</h3>
                      {opp.aiMatchScore && opp.aiMatchScore >= 90 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-signal-green bg-signal-green/10 border border-signal-green/20 px-1.5 py-0.5 rounded-full">
                          <Zap className="w-2.5 h-2.5" /> Top Match
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-sm text-slate-400 font-medium">{opp.company}</span>
                      {opp.companyStage && (
                        <span className={cn("badge text-[10px]", stageColors[opp.companyStage] ?? "badge-slate")}>
                          {opp.companyStage.replace("-", " ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <MatchBadge score={opp.aiMatchScore ?? 0} />
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  {(opp.salaryMin || opp.salaryMax) && (
                    <span className="flex items-center gap-1 text-xs text-signal-green font-medium">
                      <DollarSign className="w-3 h-3" />
                      {opp.salaryMin ? formatCurrency(opp.salaryMin, true) : ""}{opp.salaryMin && opp.salaryMax ? " – " : ""}
                      {opp.salaryMax ? formatCurrency(opp.salaryMax, true) : ""}
                      {opp.equityMax ? ` + ${opp.equityMax}% equity` : ""}
                    </span>
                  )}
                  {opp.location && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {opp.isRemote ? "Remote" : opp.location}
                    </span>
                  )}
                  {opp.sourcePlatform && (
                    <span className="text-xs text-slate-500">
                      {sourceIcons[opp.sourcePlatform]} {opp.sourcePlatform.replace("-", " ")}
                    </span>
                  )}
                  {opp.roleType && (
                    <span className="badge-slate text-[10px] capitalize">{opp.roleType}</span>
                  )}
                </div>

                {/* AI Reason */}
                {opp.aiMatchReason && (
                  <div className="mt-3 p-3 rounded-xl bg-ink-700/50 border border-ink-600/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3 h-3 text-accent-soft" />
                      <span className="text-[10px] font-semibold text-accent-soft uppercase tracking-wider">
                        AI Analysis
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{opp.aiMatchReason}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <button className="btn-primary text-xs px-3 py-1.5">
                  <Star className="w-3 h-3" /> Save
                </button>
                {opp.sourceUrl && (
                  <a href={opp.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary text-xs px-3 py-1.5">
                    <ExternalLink className="w-3 h-3" /> View
                  </a>
                )}
                <button className="btn-secondary text-xs px-3 py-1.5">
                  <TrendingUp className="w-3 h-3" /> Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
