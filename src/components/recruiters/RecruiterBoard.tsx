"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Linkedin, Mail, Twitter, Globe, ExternalLink,
  Copy, CheckCircle2, ChevronDown, ChevronUp,
  Send, Clock, Star, Users, Building2,
  Sparkles, X, Loader2, Phone, MessageSquare,
  Target, TrendingUp, AlertCircle, Check,
  Filter, Search,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

type Outreach = {
  id: string;
  channel: string;
  sentAt: string | null;
  repliedAt: string | null;
  outcome: string | null;
};

type Recruiter = {
  id: string;
  name: string;
  title: string | null;
  firm: string;
  firmType: string;
  tier: string;
  rolesFocus: string;
  stagesFocus: string;
  industriesFocus: string;
  geoFocus: string;
  email: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  website: string | null;
  firmWebsite: string | null;
  approachMethod: string;
  approachScript: string;
  insiderNote: string | null;
  placedRoles: string | null;
  status: string;
  lastContactedAt: string | null;
  nextFollowUp: string | null;
  notes: string | null;
  rating: number | null;
  outreaches: Outreach[];
};

// ── Config maps ─────────────────────────────────────────────

const TIER_META: Record<string, { label: string; color: string; bg: string; priority: string }> = {
  s: { label: "S-Tier",  color: "text-yellow-300",    bg: "bg-yellow-400/10 border-yellow-400/30", priority: "Must Contact First" },
  a: { label: "A-Tier",  color: "text-accent-soft",   bg: "bg-accent/10 border-accent/25",         priority: "High Priority" },
  b: { label: "B-Tier",  color: "text-slate-300",     bg: "bg-slate-700/50 border-slate-600/40",   priority: "Good to Have" },
  c: { label: "C-Tier",  color: "text-slate-500",     bg: "bg-slate-800/50 border-slate-700/30",   priority: "Low Priority" },
};

const FIRM_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  "vc-talent":   { label: "VC Talent",    icon: "💰", color: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
  "exec-search": { label: "Exec Search",  icon: "🎯", color: "bg-signal-amber/10 text-signal-amber border-signal-amber/20" },
  "boutique":    { label: "Boutique",     icon: "✨", color: "bg-sky-500/10 text-sky-300 border-sky-500/20" },
  "independent": { label: "Independent",  icon: "👤", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  "staffing":    { label: "Staffing",     icon: "🏢", color: "bg-slate-600/50 text-slate-300 border-slate-600/30" },
};

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  "not-contacted":      { label: "Not Contacted",    color: "text-slate-500",       dot: "bg-slate-600" },
  "outreach-sent":      { label: "Outreach Sent",    color: "text-signal-amber",    dot: "bg-signal-amber" },
  "replied":            { label: "Replied",           color: "text-sky-400",         dot: "bg-sky-400" },
  "active-relationship":{ label: "Active",            color: "text-signal-green",    dot: "bg-signal-green animate-pulse" },
  "placed":             { label: "Placed 🎉",          color: "text-signal-green",   dot: "bg-signal-green" },
  "dormant":            { label: "Dormant",            color: "text-slate-600",      dot: "bg-slate-700" },
};

const APPROACH_META: Record<string, { label: string; icon: React.ReactNode }> = {
  "linkedin-dm":   { label: "LinkedIn DM",     icon: <Linkedin className="w-3 h-3" /> },
  "email":         { label: "Email",           icon: <Mail className="w-3 h-3" /> },
  "warm-intro":    { label: "Warm Intro",      icon: <Users className="w-3 h-3" /> },
  "apply-to-firm": { label: "Apply to Firm",   icon: <Globe className="w-3 h-3" /> },
  "event":         { label: "Meet at Event",   icon: <Phone className="w-3 h-3" /> },
};

const STATUS_FLOW = [
  "not-contacted",
  "outreach-sent",
  "replied",
  "active-relationship",
  "placed",
];

// ── Single Recruiter Card ──────────────────────────────────

function RecruiterCard({
  recruiter,
  onStatusChange,
  onOutreachLog,
}: {
  recruiter: Recruiter;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onOutreachLog: (id: string, channel: string, message: string) => Promise<void>;
}) {
  const [expanded, setExpanded]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [logging, setLogging]       = useState(false);
  const [editNote, setEditNote]     = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const tier     = TIER_META[recruiter.tier]    ?? TIER_META.b!;
  const firmType = FIRM_TYPE_META[recruiter.firmType] ?? FIRM_TYPE_META.boutique!;
  const status   = STATUS_META[recruiter.status]  ?? STATUS_META["not-contacted"]!;
  const approach = APPROACH_META[recruiter.approachMethod] ?? APPROACH_META["linkedin-dm"]!;

  const roles      = JSON.parse(recruiter.rolesFocus)      as string[];
  const stages     = JSON.parse(recruiter.stagesFocus)     as string[];
  const industries = JSON.parse(recruiter.industriesFocus) as string[];
  const geos       = JSON.parse(recruiter.geoFocus)        as string[];
  const placed     = recruiter.placedRoles ? JSON.parse(recruiter.placedRoles) as string[] : [];

  const copyScript = () => {
    navigator.clipboard.writeText(recruiter.approachScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogOutreach = async () => {
    setLogging(true);
    try {
      await onOutreachLog(recruiter.id, recruiter.approachMethod, recruiter.approachScript);
    } finally {
      setLogging(false);
      setDrawerOpen(false);
    }
  };

  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(recruiter.status) + 1];

  return (
    <div className={cn(
      "card transition-all duration-200",
      recruiter.tier === "s" && "border-yellow-400/20 shadow-[0_0_0_1px_rgba(250,204,21,0.08),0_4px_20px_rgba(250,204,21,0.05)]",
      recruiter.tier === "a" && "border-accent/20",
      recruiter.status === "active-relationship" && "border-signal-green/25",
    )}>
      {/* ── MAIN ROW ── */}
      <div className="p-5">
        <div className="flex items-start gap-4">

          {/* Avatar */}
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 border",
            tier.bg,
          )}>
            {recruiter.name.split(" ").map(n => n[0]).join("").slice(0,2)}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Name + tier */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", tier.bg, tier.color)}>
                    {tier.label}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100">{recruiter.name}</h3>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-slate-400 font-medium">{recruiter.firm}</span>
                  {recruiter.title && (
                    <span className="text-xs text-slate-500">· {recruiter.title}</span>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                <span className={cn("text-xs font-medium", status.color)}>{status.label}</span>
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className={cn("badge text-[10px]", firmType.color)}>
                {firmType.icon} {firmType.label}
              </span>
              <span className="flex items-center gap-1 text-[10px] border rounded-full px-2 py-0.5 bg-ink-700/60 text-slate-400 border-ink-600/40">
                {approach.icon} {approach.label}
              </span>
              {geos.slice(0, 3).map(g => (
                <span key={g} className="badge-slate text-[10px]">{g}</span>
              ))}
            </div>

            {/* Roles focus */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roles.map(r => (
                <span key={r} className="badge-accent text-[10px]">{r}</span>
              ))}
            </div>

            {/* Insider note preview */}
            {recruiter.insiderNote && (
              <div className="mt-3 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-signal-amber shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {recruiter.insiderNote}
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap"
            >
              <Send className="w-3 h-3" /> Reach Out
            </button>
            {recruiter.linkedinUrl && (
              <a
                href={recruiter.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 justify-center"
              >
                <Linkedin className="w-3 h-3" /> LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-ink-700/50">
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Less" : "Full brief + placed roles"}
          </button>

          {/* Quick status advance */}
          {nextStatus && recruiter.status !== "placed" && (
            <button
              onClick={() => onStatusChange(recruiter.id, nextStatus)}
              className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-signal-green transition-colors border border-ink-600/40 hover:border-signal-green/30 px-2.5 py-1 rounded-lg"
            >
              <Check className="w-3 h-3" />
              Mark as {STATUS_META[nextStatus]?.label ?? nextStatus}
            </button>
          )}
        </div>
      </div>

      {/* ── EXPANDED DETAIL ── */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-ink-700/50 space-y-4 pt-4">
          {/* Detail grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Focus Stages</div>
              <div className="flex flex-wrap gap-1">
                {stages.map(s => (
                  <span key={s} className="badge-slate text-[10px] capitalize">{s.replace("-", " ")}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Industries</div>
              <div className="flex flex-wrap gap-1">
                {industries.map(i => (
                  <span key={i} className="badge-slate text-[10px]">{i}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Geographies</div>
              <div className="flex flex-wrap gap-1">
                {geos.map(g => (
                  <span key={g} className="badge-slate text-[10px]">{g}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Insider note full */}
          {recruiter.insiderNote && (
            <div className="p-3 rounded-xl bg-signal-amber/5 border border-signal-amber/15">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-signal-amber" />
                <span className="text-[10px] font-bold text-signal-amber uppercase tracking-wider">Insider Playbook</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{recruiter.insiderNote}</p>
            </div>
          )}

          {/* Placed roles */}
          {placed.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Known Placements</div>
              <div className="flex flex-wrap gap-1.5">
                {placed.map(p => (
                  <span key={p} className="badge bg-signal-green/10 text-signal-green border-signal-green/20 text-[10px]">
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Outreach history */}
          {recruiter.outreaches.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Outreach History</div>
              {recruiter.outreaches.map(o => (
                <div key={o.id} className="flex items-center gap-2 text-xs text-slate-400 p-2 rounded-lg bg-ink-700/40">
                  <MessageSquare className="w-3 h-3 shrink-0" />
                  <span className="capitalize">{o.channel}</span>
                  {o.sentAt && <span>· Sent {new Date(o.sentAt).toLocaleDateString()}</span>}
                  {o.outcome && <span className="text-signal-green ml-auto">→ {o.outcome}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Personal notes */}
          {!showNoteInput ? (
            <button
              onClick={() => { setShowNoteInput(true); setEditNote(recruiter.notes ?? ""); }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3 h-3" />
              {recruiter.notes ? `Notes: ${recruiter.notes.slice(0, 60)}…` : "Add private notes"}
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                className="input text-xs min-h-16 resize-none"
                value={editNote}
                onChange={e => setEditNote(e.target.value)}
                placeholder="Private notes about this recruiter…"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await fetch("/api/recruiters", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: recruiter.id, notes: editNote }),
                    });
                    setShowNoteInput(false);
                  }}
                  className="btn-primary text-xs px-3 py-1"
                >Save</button>
                <button onClick={() => setShowNoteInput(false)} className="btn-ghost text-xs">Cancel</button>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-2 pt-1">
            {recruiter.linkedinUrl && (
              <a href={recruiter.linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-3 py-1.5">
                <Linkedin className="w-3 h-3" /> LinkedIn
              </a>
            )}
            {recruiter.email && (
              <a href={`mailto:${recruiter.email}`} className="btn-secondary text-xs px-3 py-1.5">
                <Mail className="w-3 h-3" /> Email
              </a>
            )}
            {recruiter.twitterUrl && (
              <a href={recruiter.twitterUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-3 py-1.5">
                <Twitter className="w-3 h-3" /> Twitter
              </a>
            )}
            {recruiter.firmWebsite && (
              <a href={recruiter.firmWebsite} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-3 py-1.5">
                <ExternalLink className="w-3 h-3" /> Firm Site
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── OUTREACH DRAWER ── */}
      {drawerOpen && (
        <div className="border-t border-ink-700/50">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-ink-700/40">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent-soft" />
              <span className="text-sm font-semibold text-slate-200">
                Reach Out — {recruiter.name} @ {recruiter.firm}
              </span>
            </div>
            <button onClick={() => setDrawerOpen(false)}>
              <X className="w-4 h-4 text-slate-500 hover:text-slate-200" />
            </button>
          </div>

          <div className="px-5 py-5 space-y-4">
            {/* Approach instructions */}
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/15">
              <div className="flex items-center gap-2 mb-1.5">
                {approach.icon}
                <span className="text-xs font-semibold text-accent-soft uppercase tracking-wider">
                  Recommended Approach: {approach.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {recruiter.approachMethod === "linkedin-dm"   && "Send via LinkedIn InMail or DM. Keep it under 5 lines. Don't attach a resume in the first message."}
                {recruiter.approachMethod === "email"         && "Email directly. Subject line matters — be specific. One crisp paragraph max."}
                {recruiter.approachMethod === "warm-intro"    && "Get a mutual connection to intro you first. A warm intro is 10x more effective than cold outreach at this level."}
                {recruiter.approachMethod === "apply-to-firm" && "Submit your profile via their firm portal first, then follow up directly on LinkedIn."}
                {recruiter.approachMethod === "event"         && "Best approached at industry events. Find where they speak or attend, then connect in person."}
              </p>
            </div>

            {/* Script */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  AI-Crafted Message Script
                </span>
                <button
                  onClick={copyScript}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 bg-ink-700 hover:bg-ink-600 px-2.5 py-1 rounded-lg transition-all"
                >
                  {copied
                    ? <><CheckCircle2 className="w-3 h-3 text-signal-green" /> Copied!</>
                    : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="bg-ink-900/60 border border-ink-600/40 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono max-h-56 overflow-y-auto">
                {recruiter.approachScript}
              </div>
            </div>

            {/* Insider tip */}
            {recruiter.insiderNote && (
              <div className="p-3 rounded-xl bg-signal-amber/5 border border-signal-amber/15">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-signal-amber shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">{recruiter.insiderNote}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleLogOutreach}
                disabled={logging}
                className="btn-primary text-sm"
              >
                {logging
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging…</>
                  : <><CheckCircle2 className="w-4 h-4" /> Mark as Sent → Update Status</>}
              </button>
              {recruiter.linkedinUrl && (
                <a
                  href={recruiter.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  <Linkedin className="w-4 h-4" /> Open LinkedIn
                </a>
              )}
              {recruiter.email && (
                <a
                  href={`mailto:${recruiter.email}?subject=CPO%20%2F%20Senior%20Product%20Leader&body=${encodeURIComponent(recruiter.approachScript)}`}
                  className="btn-secondary text-sm"
                >
                  <Mail className="w-4 h-4" /> Open Email
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Board Component ───────────────────────────────────

interface RecruiterBoardProps {
  initialRecruiters: Recruiter[];
}

export function RecruiterBoard({ initialRecruiters }: RecruiterBoardProps) {
  const [recruiters, setRecruiters] = useState(initialRecruiters);
  const [tierFilter, setTierFilter]       = useState("all");
  const [typeFilter, setTypeFilter]       = useState("all");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [search, setSearch]               = useState("");

  const filtered = recruiters.filter(r => {
    if (tierFilter !== "all"   && r.tier !== tierFilter)         return false;
    if (typeFilter !== "all"   && r.firmType !== typeFilter)     return false;
    if (statusFilter !== "all" && r.status !== statusFilter)     return false;
    if (search) {
      const q = search.toLowerCase();
      const haystack = `${r.name} ${r.firm} ${r.rolesFocus} ${r.industriesFocus}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // Group by tier for display
  const sTier = filtered.filter(r => r.tier === "s");
  const aTier = filtered.filter(r => r.tier === "a");
  const bTier = filtered.filter(r => r.tier === "b");

  const contacted    = recruiters.filter(r => r.status !== "not-contacted").length;
  const active       = recruiters.filter(r => r.status === "active-relationship").length;
  const replied      = recruiters.filter(r => r.status === "replied").length;
  const notContacted = recruiters.filter(r => r.status === "not-contacted").length;

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    await fetch("/api/recruiters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, ...(status === "outreach-sent" ? { lastContactedAt: new Date().toISOString() } : {}) }),
    });
    setRecruiters(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, []);

  const handleOutreachLog = useCallback(async (recruiterId: string, channel: string, message: string) => {
    await fetch("/api/recruiters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recruiterId, channel, message }),
    });
    setRecruiters(prev => prev.map(r =>
      r.id === recruiterId
        ? { ...r, status: "outreach-sent", lastContactedAt: new Date().toISOString() }
        : r
    ));
  }, []);

  return (
    <div className="space-y-6 pb-10">

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="stat-card">
          <div className="text-2xl font-bold text-slate-100">{recruiters.length}</div>
          <div className="text-xs text-slate-500">Total Network</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-red">{notContacted}</div>
          <div className="text-xs text-slate-500">To Contact</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-amber">{contacted}</div>
          <div className="text-xs text-slate-500">Contacted</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-sky-400">{replied}</div>
          <div className="text-xs text-slate-500">Replied</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-green">{active}</div>
          <div className="text-xs text-slate-500">Active Relationships</div>
        </div>
      </div>

      {/* ── STRATEGY BANNER ── */}
      <div className="card p-5 border-yellow-400/15">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0 text-xl">
            🎯
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 mb-1">Executive Recruiter Playbook</div>
            <div className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              At your level, <span className="text-yellow-300 font-medium">S-Tier VC Talent Partners</span> are the highest leverage contacts —
              they place CPOs and co-founders directly into portfolio companies. Start there. Then work
              through <span className="text-accent-soft font-medium">exec search firms</span> like True Search and Riviera who run retained searches for
              unicorn-stage roles. Aim to contact <span className="text-signal-green font-medium">3–5 new recruiters per week</span>.
              A warm intro from your network to any of these contacts multiplies your chances 10×.
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "VC Talent Partners", count: recruiters.filter(r => r.firmType === "vc-talent").length, color: "text-violet-300", note: "Highest leverage" },
            { label: "Exec Search Firms",  count: recruiters.filter(r => r.firmType === "exec-search").length, color: "text-signal-amber", note: "Retained searches" },
            { label: "Boutique / Indie",   count: recruiters.filter(r => ["boutique","independent"].includes(r.firmType)).length, color: "text-sky-300", note: "Faster response" },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl bg-ink-700/50 border border-ink-600/30 text-center">
              <div className={cn("text-xl font-bold", s.color)}>{s.count}</div>
              <div className="text-xs font-medium text-slate-300 mt-0.5">{s.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search recruiters…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input text-xs py-1.5 pl-8 w-44"
          />
        </div>
        <select value={tierFilter}   onChange={e => setTierFilter(e.target.value)}   className="input text-xs py-1.5 w-auto">
          <option value="all">All Tiers</option>
          <option value="s">S-Tier Only</option>
          <option value="a">A-Tier</option>
          <option value="b">B-Tier</option>
        </select>
        <select value={typeFilter}   onChange={e => setTypeFilter(e.target.value)}   className="input text-xs py-1.5 w-auto">
          <option value="all">All Types</option>
          <option value="vc-talent">VC Talent</option>
          <option value="exec-search">Exec Search</option>
          <option value="boutique">Boutique</option>
          <option value="independent">Independent</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input text-xs py-1.5 w-auto">
          <option value="all">All Statuses</option>
          <option value="not-contacted">Not Contacted</option>
          <option value="outreach-sent">Outreach Sent</option>
          <option value="replied">Replied</option>
          <option value="active-relationship">Active</option>
        </select>
        <span className="ml-auto text-xs text-slate-500 font-medium">{filtered.length} recruiters</span>
      </div>

      {/* ── TIER SECTIONS ── */}
      {[
        { tier: "s", label: "S-Tier — VC Talent Partners & Must-Contact Firms", items: sTier, icon: "⭐" },
        { tier: "a", label: "A-Tier — Top Exec Search & Specialist Firms",      items: aTier, icon: "🎯" },
        { tier: "b", label: "B-Tier — Boutique & Independent Recruiters",       items: bTier, icon: "📋" },
      ].map(({ tier, label, items, icon }) => {
        if (items.length === 0) return null;
        const tierMeta = TIER_META[tier]!;
        return (
          <div key={tier} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-base">{icon}</span>
              <h3 className={cn("text-sm font-bold", tierMeta.color)}>{label}</h3>
              <span className={cn("badge text-[10px]", tierMeta.bg, tierMeta.color)}>{items.length}</span>
            </div>
            {items.map(r => (
              <RecruiterCard
                key={r.id}
                recruiter={r}
                onStatusChange={handleStatusChange}
                onOutreachLog={handleOutreachLog}
              />
            ))}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <div className="text-sm text-slate-400 font-medium">No recruiters match your filters</div>
        </div>
      )}
    </div>
  );
}
