export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { cn, formatDate } from "@/lib/utils";
import {
  User, Briefcase, GraduationCap, Star, TrendingUp,
  Zap, AlertTriangle, CheckCircle2, MapPin, Link2,
  Github, Linkedin, DollarSign, Calendar,
} from "lucide-react";

async function getProfileData() {
  const user = await db.user.findUnique({
    where: { id: DEMO_USER_ID },
    include: {
      experiences: { include: { achievements: true }, orderBy: { startDate: "desc" } },
      educations: { orderBy: { startYear: "desc" } },
      skills: { orderBy: [{ level: "asc" }, { name: "asc" }] },
      achievements: { orderBy: { year: "desc" } },
    },
  });

  const breakdown = {
    basics: user?.headline && user?.summary && user?.location ? 100 : 50,
    experience: Math.min(100, (user?.experiences.length ?? 0) * 35),
    skills: Math.min(100, (user?.skills.length ?? 0) * 7),
    achievements: Math.min(100, (user?.achievements.length ?? 0) * 20),
    brand: user?.linkedinUrl ? 60 : 20,
  };
  const total = Math.round(
    breakdown.basics * 0.2 + breakdown.experience * 0.25 +
    breakdown.skills * 0.2 + breakdown.achievements * 0.25 + breakdown.brand * 0.1
  );

  return { user, breakdown, total };
}

const levelMap: Record<string, { label: string; color: string; width: string }> = {
  learning:     { label: "Learning",     color: "bg-slate-500",        width: "w-1/4" },
  intermediate: { label: "Intermediate", color: "bg-signal-amber",     width: "w-1/2" },
  advanced:     { label: "Advanced",     color: "bg-accent",           width: "w-3/4" },
  expert:       { label: "Expert",       color: "bg-signal-green",     width: "w-full" },
};

const categoryColors: Record<string, string> = {
  product:    "bg-blue-500/10 text-blue-300 border-blue-500/20",
  growth:     "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  technical:  "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  leadership: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  domain:     "bg-amber-500/10 text-amber-300 border-amber-500/20",
  tool:       "bg-slate-600/50 text-slate-300 border-slate-600/30",
};

export default async function ProfilePage() {
  const { user, breakdown, total } = await getProfileData();
  if (!user) return <div className="text-slate-400">User not found</div>;

  const gapSkills = user.skills.filter((s) => s.isGap);
  const expertSkills = user.skills.filter((s) => s.level === "expert");
  const skillsByCategory = user.skills.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, typeof user.skills>);

  return (
    <div className="space-y-6 pb-8">
      {/* ── PROFILE HEADER ─────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
            {user.name?.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100">{user.name}</h2>
                <p className="text-sm text-accent-soft mt-0.5">{user.headline}</p>
                <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">{user.summary}</p>
              </div>
              <ScoreRing score={total} size={80} />
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              {user.location && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5" /> {user.location}
                </span>
              )}
              {user.linkedinUrl && (
                <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {user.githubUrl && (
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {user.targetSalaryMin && user.targetSalaryMax && (
                <span className="flex items-center gap-1.5 text-xs text-signal-green font-medium">
                  <DollarSign className="w-3.5 h-3.5" />
                  Target: ${ Math.round(user.targetSalaryMin / 1000)}K – ${Math.round(user.targetSalaryMax / 1000)}K
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-5 gap-3 mt-6 pt-5 border-t border-ink-600">
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key} className="text-center">
              <div className="text-lg font-bold text-slate-100">{val}</div>
              <div className="progress-bar mt-1.5">
                <div
                  className={cn("progress-fill", val >= 80 ? "bg-signal-green" : val >= 50 ? "bg-signal-amber" : "bg-signal-red")}
                  style={{ width: `${val}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 capitalize">{key}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Experience + Education */}
        <div className="lg:col-span-2 space-y-5">

          {/* Experience */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-accent-soft" />
              <span className="section-title">Experience</span>
            </div>
            <div className="space-y-5">
              {user.experiences.map((exp) => (
                <div key={exp.id} className="relative pl-5 border-l-2 border-ink-600">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-accent" />
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{exp.title}</div>
                      <div className="text-sm text-accent-soft font-medium">{exp.company}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(exp.startDate)} – {exp.isCurrent ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}
                        </span>
                        {exp.companyType && (
                          <span className="badge-slate capitalize text-[10px]">{exp.companyType}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{exp.description}</p>
                  )}
                  {exp.achievements.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {exp.achievements.map((a) => (
                        <div key={a.id} className="flex items-start gap-2 text-xs">
                          <Star className="w-3 h-3 text-signal-amber shrink-0 mt-0.5" />
                          <span className="text-slate-300">
                            <span className="font-medium text-signal-amber">{a.metric}</span>
                            {" — "}{a.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-4 h-4 text-accent-soft" />
              <span className="section-title">Education</span>
            </div>
            <div className="space-y-3">
              {user.educations.map((edu) => (
                <div key={edu.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-700/50">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4.5 h-4.5 text-accent-soft" size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{edu.institution}</div>
                    <div className="text-xs text-slate-400">{edu.degree}{edu.field ? `, ${edu.field}` : ""}</div>
                    {edu.startYear && (
                      <div className="text-xs text-slate-500">{edu.startYear} – {edu.endYear ?? "Present"}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Skills + Gaps */}
        <div className="space-y-5">
          {/* Skill Gaps */}
          {gapSkills.length > 0 && (
            <div className="card p-5 border-signal-amber/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-signal-amber" />
                <span className="section-title text-sm">Skill Gaps</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Close these to unlock more opportunities</p>
              <div className="space-y-2">
                {gapSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-2.5 rounded-lg bg-signal-amber/5 border border-signal-amber/15">
                    <span className="text-xs text-slate-300">{skill.name}</span>
                    <span className="badge bg-signal-amber/10 text-signal-amber border-signal-amber/20 text-[10px]">Gap</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expert Skills */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-signal-green" />
              <span className="section-title text-sm">Expert Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {expertSkills.map((skill) => (
                <span key={skill.id} className="badge-green text-[10px]">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* All Skills by Category */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent-soft" />
              <span className="section-title text-sm">All Skills</span>
            </div>
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category}>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 capitalize">{category}</div>
                  <div className="space-y-2">
                    {skills.map((skill) => {
                      const lvl = levelMap[skill.level] ?? levelMap.intermediate;
                      return (
                        <div key={skill.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-300">{skill.name}</span>
                              {skill.inDemand && (
                                <span className="badge bg-accent/10 text-accent-glow border-accent/20 text-[9px]">🔥 hot</span>
                              )}
                              {skill.isGap && (
                                <span className="badge bg-signal-amber/10 text-signal-amber border-signal-amber/20 text-[9px]">gap</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500">{lvl.label}</span>
                          </div>
                          <div className="progress-bar">
                            <div className={cn("progress-fill h-1", lvl.color, lvl.width)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Roles */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-signal-green" />
              <span className="section-title text-sm">Target Roles</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(JSON.parse(user.targetRoles ?? "[]") as string[]).map((role) => (
                <span key={role} className="badge-accent">{role}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(JSON.parse(user.targetIndustries ?? "[]") as string[]).map((ind) => (
                <span key={ind} className="badge-slate">{ind}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
