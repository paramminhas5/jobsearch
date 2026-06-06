"use client";

import { useState, useTransition, useCallback } from "react";
import { MatchBadge } from "@/components/ui/MatchBadge";
import { formatCurrency, cn } from "@/lib/utils";
import {
  MapPin, DollarSign, Building2, ExternalLink, Sparkles,
  Star, TrendingUp, Zap, ChevronDown, ChevronUp, Loader2,
  Send, FileText, Users, CheckCircle2, X, Clock, Copy,
  BookOpen, ArrowRight, Globe, Briefcase, Target,
} from "lucide-react";

type Opportunity = {
  id: string;
  title: string;
  company: string;
  companyStage: string | null;
  companySize: string | null;
  location: string | null;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  equityMin: number | null;
  equityMax: number | null;
  description: string | null;
  sourceUrl: string | null;
  sourcePlatform: string | null;
  roleType: string | null;
  aiMatchScore: number | null;
  aiMatchReason: string | null;
  aiSalaryEst: number | null;
  status: string;
  discoveredAt: string;
  hasApplication: boolean;
};

type ApplyPackage = {
  resumeTailored: string;
  coverLetter: string;
  outreachEmail: string;
  interviewPrepBrief: string;
  applyChecklist: string[];
};

const SOURCE_META: Record<string, { label: string; icon: string; color: string }> = {
  greenhouse:    { label: "Greenhouse",      icon: "🌿", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  lever:         { label: "Lever",           icon: "⚙️", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  "hacker-news": { label: "HN Hiring",       icon: "🤘", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  remoteok:      { label: "RemoteOK",        icon: "🌍", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  "vc-portfolio":{ label: "VC Portfolio",    icon: "💰", color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  wellfound:     { label: "Wellfound",       icon: "🚀", color: "bg-accent/10 text-accent-soft border-accent/20" },
  "exec-search": { label: "Exec Search",     icon: "🎯", color: "bg-signal-amber/10 text-signal-amber border-signal-amber/20" },
  yc:            { label: "YC",              icon: "🧡", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  referral:      { label: "Referral",        icon: "🤝", color: "bg-signal-green/10 text-signal-green border-signal-green/20" },
};

const STAGE_META: Record<string, string> = {
  seed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "series-a": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "series-b": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  growth: "bg-accent/10 text-accent-soft border-accent/20",
  public: "bg-slate-600/50 text-slate-300 border-slate-600/30",
  vc: "bg-signal-amber/10 text-signal-amber border-signal-amber/20",
};

const STRATEGY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "warm-intro":        { label: "Get a warm intro first", icon: <Users className="w-3 h-3" />,     color: "text-signal-green bg-signal-green/10 border-signal-green/20" },
  "direct-apply":      { label: "Apply directly",        icon: <Send className="w-3 h-3" />,       color: "text-accent-soft bg-accent/10 border-accent/20" },
  "build-relationship":{ label: "Build relationship",    icon: <TrendingUp className="w-3 h-3" />, color: "text-signal-amber bg-signal-amber/10 border-signal-amber/20" },
  "skip":              { label: "Low priority",          icon: <X className="w-3 h-3" />,          color: "text-slate-500 bg-slate-700/30 border-slate-600/20" },
};

interface OpportunityCardProps {
  opp: Opportunity;
  rank: number;
  onApply: (id: string) => Promise<void>;
  onSave: (id: string) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
}

function OpportunityCard({ opp, rank, onApply, onSave, onDismiss }: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyPkg, setApplyPkg] = useState<ApplyPackage | null>(null);
  const [applyTab, setApplyTab] = useState<"cover" | "resume" | "outreach" | "prep" | "checklist">("cover");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [applying, startApplying] = useTransition();

  const sourceMeta = SOURCE_META[opp.sourcePlatform ?? ""] ?? { label: opp.sourcePlatform ?? "Source", icon: "📋", color: "bg-slate-600/50 text-slate-300 border-slate-600/30" };
  const stageMeta = STAGE_META[opp.companyStage ?? ""] ?? "bg-slate-600/50 text-slate-300 border-slate-600/30";
  const strategyKey = opp.aiMatchScore && opp.aiMatchScore >= 88 ? "warm-intro" : opp.aiMatchScore && opp.aiMatchScore >= 72 ? "direct-apply" : "build-relationship";
  const strategy = STRATEGY_META[strategyKey]!;
  const isTopMatch = (opp.aiMatchScore ?? 0) >= 88;

  const handleGeneratePackage = async () => {
    setLoading(true);
    setApplyOpen(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opp.id }),
      });
      if (!res.ok) throw new Error("Failed");
      const pkg = await res.json() as ApplyPackage;
      setApplyPkg(pkg);
    } catch {
      setApplyPkg({
        resumeTailored: "Error generating. Please add your OpenAI key in Settings.",
        coverLetter: "Error generating. Please add your OpenAI key in Settings.",
        outreachEmail: "Error generating. Please add your OpenAI key in Settings.",
        interviewPrepBrief: "Error generating.",
        applyChecklist: ["Add OpenAI key in Settings", `Apply at: ${opp.sourceUrl ?? ""}`],
      });
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className={cn(
      "card transition-all duration-200",
      isTopMatch && "border-signal-green/25 shadow-[0_0_0_1px_rgba(52,211,153,0.15),0_8px_30px_rgba(52,211,153,0.08)]",
      opp.status === "saved" && "border-accent/25",
      opp.status === "applied" && "border-sky-500/25 opacity-80",
    )}>
      {/* ── MAIN ROW ── */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
            rank <= 3 ? "bg-signal-amber/20 text-signal-amber" : "bg-ink-700 text-slate-500"
          )}>
            {rank}
          </div>

          {/* Company icon */}
          <div className="w-10 h-10 rounded-xl bg-ink-700 border border-ink-600 flex items-center justify-center shrink-0 text-lg">
            {opp.company.charAt(0).toUpperCase()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isTopMatch && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-signal-green bg-signal-green/10 border border-signal-green/25 px-2 py-0.5 rounded-full">
                      <Zap className="w-2.5 h-2.5" /> TOP MATCH
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-slate-100 leading-snug">{opp.title}</h3>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-slate-400 font-medium">{opp.company}</span>
                  {opp.companyStage && (
                    <span className={cn("badge text-[10px]", stageMeta)}>
                      {opp.companyStage.replace("-", " ")}
                    </span>
                  )}
                  <span className={cn("badge text-[10px]", sourceMeta.color)}>
                    {sourceMeta.icon} {sourceMeta.label}
                  </span>
                </div>
              </div>
              <MatchBadge score={opp.aiMatchScore ?? 0} />
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
              {(opp.salaryMin || opp.salaryMax || opp.aiSalaryEst) && (
                <span className="flex items-center gap-1 text-xs text-signal-green font-medium">
                  <DollarSign className="w-3 h-3" />
                  {opp.salaryMin
                    ? `${formatCurrency(opp.salaryMin, true)}–${formatCurrency(opp.salaryMax ?? opp.salaryMin, true)}`
                    : `~${formatCurrency(opp.aiSalaryEst ?? 400000, true)} est.`}
                  {opp.equityMax ? <span className="text-violet-400 ml-1">+ {opp.equityMax}% equity</span> : null}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="w-3 h-3" />
                {opp.isRemote ? "Remote" : (opp.location ?? "Location TBD")}
              </span>
              <span className={cn("flex items-center gap-1 text-[11px] border rounded-full px-2 py-0.5", strategy.color)}>
                {strategy.icon} {strategy.label}
              </span>
              {opp.status === "applied" && (
                <span className="flex items-center gap-1 text-xs text-sky-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Applied
                </span>
              )}
              {opp.status === "saved" && (
                <span className="flex items-center gap-1 text-xs text-accent-soft font-medium">
                  <Star className="w-3 h-3 fill-accent-soft" /> Saved
                </span>
              )}
            </div>

            {/* AI reason */}
            {opp.aiMatchReason && (
              <div className="mt-3 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent-soft shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">{opp.aiMatchReason}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleGeneratePackage}
              className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap"
            >
              <Zap className="w-3 h-3" /> Apply
            </button>
            {opp.status !== "saved" && (
              <button
                onClick={() => onSave(opp.id)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                <Star className="w-3 h-3" /> Save
              </button>
            )}
            {opp.sourceUrl && (
              <a
                href={opp.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs px-3 py-1.5 text-center"
              >
                <ExternalLink className="w-3 h-3" /> View
              </a>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-ink-700/60">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Less detail" : "More detail"}
          </button>
          <button
            onClick={() => onDismiss(opp.id)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-signal-red transition-colors ml-auto"
          >
            <X className="w-3 h-3" /> Dismiss
          </button>
        </div>
      </div>

      {/* ── EXPANDED DESCRIPTION ── */}
      {expanded && opp.description && (
        <div className="px-5 pb-5 border-t border-ink-700/60">
          <div className="mt-4 text-xs text-slate-400 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-2">
            {opp.description.slice(0, 1500)}
          </div>
        </div>
      )}

      {/* ── APPLY DRAWER ── */}
      {applyOpen && (
        <div className="border-t border-ink-700/60">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-ink-700/40">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent-soft" />
              <span className="text-sm font-semibold text-slate-200">Apply Package — {opp.title} @ {opp.company}</span>
            </div>
            <button onClick={() => setApplyOpen(false)} className="text-slate-500 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-10 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className="text-sm">Generating your personalised package…</span>
            </div>
          ) : applyPkg && (
            <div className="px-5 pb-5">
              {/* Tabs */}
              <div className="flex gap-1 mt-4 mb-4 overflow-x-auto">
                {([
                  { key: "cover",    label: "Cover Letter",   icon: <FileText className="w-3.5 h-3.5" /> },
                  { key: "resume",   label: "Tailored CV",    icon: <Briefcase className="w-3.5 h-3.5" /> },
                  { key: "outreach", label: "Outreach Email", icon: <Send className="w-3.5 h-3.5" /> },
                  { key: "prep",     label: "Interview Prep", icon: <BookOpen className="w-3.5 h-3.5" /> },
                  { key: "checklist",label: "Checklist",      icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setApplyTab(tab.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                      applyTab === tab.key
                        ? "bg-accent text-white"
                        : "bg-ink-700 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="relative">
                {applyTab !== "checklist" && (
                  <button
                    onClick={() => {
                      const content = {
                        cover: applyPkg.coverLetter,
                        resume: applyPkg.resumeTailored,
                        outreach: applyPkg.outreachEmail,
                        prep: applyPkg.interviewPrepBrief,
                      }[applyTab] ?? "";
                      copyText(content, applyTab);
                    }}
                    className="absolute top-2 right-2 flex items-center gap-1 text-[11px] bg-ink-700 hover:bg-ink-600 text-slate-400 hover:text-slate-100 px-2 py-1 rounded-lg transition-all z-10"
                  >
                    {copied === applyTab ? <><CheckCircle2 className="w-3 h-3 text-signal-green" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                )}

                <div className="bg-ink-900/60 border border-ink-600/40 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
                  {applyTab === "cover"     && applyPkg.coverLetter}
                  {applyTab === "resume"    && applyPkg.resumeTailored}
                  {applyTab === "outreach"  && applyPkg.outreachEmail}
                  {applyTab === "prep"      && applyPkg.interviewPrepBrief}
                  {applyTab === "checklist" && (
                    <ol className="space-y-2 font-sans">
                      {applyPkg.applyChecklist.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-accent/20 text-accent-soft text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-slate-300">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>

              {/* Apply CTA */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => startApplying(() => onApply(opp.id))}
                  className="btn-primary text-sm"
                  disabled={applying}
                >
                  {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Mark as Applied → Move to Pipeline
                </button>
                {opp.sourceUrl && (
                  <a href={opp.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                    <Globe className="w-4 h-4" /> Open Application Page
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN FEED COMPONENT ──────────────────────────────────────

interface OpportunityFeedProps {
  initialOpps: Opportunity[];
}

export function OpportunityFeed({ initialOpps }: OpportunityFeedProps) {
  const [opps, setOpps] = useState(initialOpps);
  const [filter, setFilter] = useState<{
    role: string;
    minScore: number;
    location: string;
    status: string;
    source: string;
  }>({ role: "all", minScore: 0, location: "all", status: "all", source: "all" });
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{ imported: number; sources: Record<string, number> } | null>(null);

  const filtered = opps.filter((o) => {
    if (filter.role !== "all" && o.roleType !== filter.role) return false;
    if (filter.minScore > 0 && (o.aiMatchScore ?? 0) < filter.minScore) return false;
    if (filter.status !== "all" && o.status !== filter.status) return false;
    if (filter.source !== "all" && o.sourcePlatform !== filter.source) return false;
    if (filter.location === "remote" && !o.isRemote) return false;
    return true;
  });

  const handleScrape = async () => {
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await res.json() as { imported: number; sources: Record<string, number>; message?: string };
      setScrapeResult(data);
      // Refresh opportunities
      const oppsRes = await fetch("/api/opportunities");
      const newOpps = await oppsRes.json() as Opportunity[];
      setOpps(newOpps);
    } catch {
      setScrapeResult({ imported: 0, sources: {} });
    } finally {
      setScraping(false);
    }
  };

  const handleApply = useCallback(async (id: string) => {
    await fetch("/api/apply", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: id }),
    });
    setOpps((prev) => prev.map((o) => (o.id === id ? { ...o, status: "applied" } : o)));
  }, []);

  const handleSave = useCallback(async (id: string) => {
    await fetch("/api/opportunities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "saved" }),
    });
    setOpps((prev) => prev.map((o) => (o.id === id ? { ...o, status: "saved" } : o)));
  }, []);

  const handleDismiss = useCallback(async (id: string) => {
    await fetch("/api/opportunities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "dismissed" }),
    });
    setOpps((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const newCount = filtered.filter((o) => o.status === "new").length;
  const savedCount = filtered.filter((o) => o.status === "saved").length;
  const appliedCount = filtered.filter((o) => o.status === "applied").length;
  const avgScore = filtered.length
    ? Math.round(filtered.reduce((a, o) => a + (o.aiMatchScore ?? 0), 0) / filtered.length)
    : 0;

  return (
    <div className="space-y-5 pb-10">
      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="stat-card">
          <div className="text-2xl font-bold text-slate-100">{filtered.length}</div>
          <div className="text-xs text-slate-500">Total Matched</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-accent-soft">{newCount}</div>
          <div className="text-xs text-slate-500">New</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-green">{savedCount}</div>
          <div className="text-xs text-slate-500">Saved</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-sky-400">{appliedCount}</div>
          <div className="text-xs text-slate-500">Applied</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-amber">{avgScore}%</div>
          <div className="text-xs text-slate-500">Avg Match</div>
        </div>
      </div>

      {/* ── SCRAPE BANNER ── */}
      <div className="card p-4 border-accent/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Globe className="w-4.5 h-4.5 text-accent-soft" size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">Live Opportunity Engine</div>
            <div className="text-xs text-slate-500">
              Scans Greenhouse · Lever · HN Who's Hiring · RemoteOK · a16z/Accel/Sequoia/YC portfolios
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {scrapeResult && (
            <span className="text-xs text-signal-green font-medium">
              ✓ +{scrapeResult.imported} new roles imported
            </span>
          )}
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="btn-primary text-sm"
          >
            {scraping ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Scanning…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Scan Now</>
            )}
          </button>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Role filter */}
        <select
          value={filter.role}
          onChange={(e) => setFilter((f) => ({ ...f, role: e.target.value }))}
          className="input text-xs py-1.5 w-auto"
        >
          <option value="all">All Roles</option>
          <option value="cpo">CPO</option>
          <option value="co-founder">Co-Founder</option>
          <option value="vp-product">VP Product</option>
          <option value="vp-growth">VP Growth</option>
          <option value="ceo">CEO</option>
          <option value="cmo">CMO</option>
          <option value="coo">COO</option>
          <option value="gm">GM</option>
          <option value="vc">VC / Investor</option>
          <option value="consulting">Consulting</option>
        </select>

        {/* Min score */}
        <select
          value={filter.minScore}
          onChange={(e) => setFilter((f) => ({ ...f, minScore: parseInt(e.target.value) }))}
          className="input text-xs py-1.5 w-auto"
        >
          <option value={0}>Any Match</option>
          <option value={70}>70%+ Match</option>
          <option value={80}>80%+ Match</option>
          <option value={90}>90%+ Match</option>
        </select>

        {/* Location */}
        <select
          value={filter.location}
          onChange={(e) => setFilter((f) => ({ ...f, location: e.target.value }))}
          className="input text-xs py-1.5 w-auto"
        >
          <option value="all">All Locations</option>
          <option value="remote">Remote Only</option>
        </select>

        {/* Status */}
        <select
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className="input text-xs py-1.5 w-auto"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
        </select>

        {/* Source */}
        <select
          value={filter.source}
          onChange={(e) => setFilter((f) => ({ ...f, source: e.target.value }))}
          className="input text-xs py-1.5 w-auto"
        >
          <option value="all">All Sources</option>
          <option value="greenhouse">Greenhouse</option>
          <option value="lever">Lever</option>
          <option value="hacker-news">HN Hiring</option>
          <option value="remoteok">RemoteOK</option>
          <option value="vc-portfolio">VC Portfolio</option>
          <option value="wellfound">Wellfound</option>
        </select>

        <span className="ml-auto text-xs text-slate-500 font-medium">
          {filtered.length} opportunities
        </span>
      </div>

      {/* ── OPPORTUNITY LIST ── */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Globe className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <div className="text-slate-400 text-sm font-medium">No opportunities match your filters</div>
          <p className="text-slate-600 text-xs mt-1">Try scanning for new roles or adjusting your filters</p>
          <button onClick={handleScrape} className="btn-primary text-sm mt-4 mx-auto">
            <Sparkles className="w-4 h-4" /> Scan for New Roles
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((opp, idx) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              rank={idx + 1}
              onApply={handleApply}
              onSave={handleSave}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
