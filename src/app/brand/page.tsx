import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";
import { cn, truncate } from "@/lib/utils";
import {
  Megaphone, Linkedin, Twitter, FileText,
  Clock, CheckCircle2, Calendar, Users,
  Edit3, Send, Eye, Plus, Sparkles, TrendingUp,
} from "lucide-react";

async function getBrandData() {
  const [posts, connections] = await Promise.all([
    db.brandPost.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: "desc" },
    }),
    db.connection.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { relationship: "asc" },
    }),
  ]);
  return { posts, connections };
}

const platformIcons: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="w-3.5 h-3.5" />,
  twitter: <Twitter className="w-3.5 h-3.5" />,
  substack: <FileText className="w-3.5 h-3.5" />,
  medium: <FileText className="w-3.5 h-3.5" />,
};

const contentTypeColors: Record<string, string> = {
  "thought-leadership": "bg-accent/10 text-accent-soft border-accent/20",
  win: "bg-signal-green/10 text-signal-green border-signal-green/20",
  insight: "bg-signal-amber/10 text-signal-amber border-signal-amber/20",
  story: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  thread: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  draft: { label: "Draft", icon: <Edit3 className="w-3 h-3" />, color: "text-slate-400 bg-ink-700 border-ink-600" },
  scheduled: { label: "Scheduled", icon: <Calendar className="w-3 h-3" />, color: "text-signal-amber bg-signal-amber/10 border-signal-amber/20" },
  published: { label: "Published", icon: <CheckCircle2 className="w-3 h-3" />, color: "text-signal-green bg-signal-green/10 border-signal-green/20" },
};

const relationshipColors: Record<string, string> = {
  strong: "bg-signal-green/10 text-signal-green border-signal-green/20",
  warm: "bg-signal-amber/10 text-signal-amber border-signal-amber/20",
  cold: "bg-slate-700/50 text-slate-400 border-slate-600/30",
  target: "bg-accent/10 text-accent-soft border-accent/20",
};

export default async function BrandPage() {
  const { posts, connections } = await getBrandData();

  const drafts = posts.filter((p) => p.status === "draft");
  const scheduled = posts.filter((p) => p.status === "scheduled");
  const published = posts.filter((p) => p.status === "published");
  const strongConnections = connections.filter((c) => c.relationship === "strong" || c.relationship === "warm");

  return (
    <div className="space-y-6 pb-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-amber">{drafts.length}</div>
          <div className="text-xs text-slate-500">Drafts Ready</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-accent-soft">{scheduled.length}</div>
          <div className="text-xs text-slate-500">Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-signal-green">{published.length}</div>
          <div className="text-xs text-slate-500">Published</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-violet-400">{connections.length}</div>
          <div className="text-xs text-slate-500">Network</div>
        </div>
      </div>

      {/* Presence Score */}
      <div className="card p-5 border-violet-500/20">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          <span className="section-title">Brand Presence</span>
          <span className="badge bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs ml-auto">
            Building momentum
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Content Cadence", score: 40, note: "Post 2x/week" },
            { label: "Thought Leadership", score: 65, note: "3 posts drafted" },
            { label: "Network Strength", score: 72, note: "4 warm contacts" },
            { label: "Public Profile", score: 55, note: "LinkedIn needs update" },
          ].map((metric) => (
            <div key={metric.label} className="text-center p-3 rounded-xl bg-ink-700/50 border border-ink-600/30">
              <div className={cn(
                "text-2xl font-bold",
                metric.score >= 70 ? "text-signal-green" : metric.score >= 50 ? "text-signal-amber" : "text-signal-red"
              )}>
                {metric.score}
              </div>
              <div className="progress-bar mt-2 mb-1">
                <div
                  className={cn("progress-fill", metric.score >= 70 ? "bg-signal-green" : metric.score >= 50 ? "bg-signal-amber" : "bg-signal-red")}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              <div className="text-[10px] font-semibold text-slate-300">{metric.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{metric.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Content Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-violet-400" />
              Content Queue
            </h3>
            <button className="btn-primary text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Generate New Post
            </button>
          </div>

          {posts.map((post) => {
            const status = statusConfig[post.status] ?? statusConfig.draft;
            const typeColor = contentTypeColors[post.contentType] ?? "badge-slate";

            return (
              <div key={post.id} className="card p-5 hover:border-accent/20 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-400">
                      {platformIcons[post.platform] ?? <FileText className="w-3.5 h-3.5" />}
                      <span className="text-xs capitalize font-medium text-slate-300">{post.platform}</span>
                    </span>
                    <span className={cn("badge text-[10px]", typeColor)}>
                      {post.contentType.replace("-", " ")}
                    </span>
                    <span className={cn("badge text-[10px] flex items-center gap-1", status.color)}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {post.status === "scheduled" && post.scheduledFor && (
                      <span className="text-xs text-signal-amber flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.scheduledFor).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    <button className="btn-ghost text-xs p-1.5">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn-ghost text-xs p-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {post.topic && (
                  <div className="text-sm font-semibold text-slate-200 mb-2">{post.topic}</div>
                )}

                <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-line line-clamp-4 bg-ink-700/50 rounded-xl p-3 border border-ink-600/30">
                  {post.draft.slice(0, 400)}{post.draft.length > 400 ? "…" : ""}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {post.status === "draft" && (
                    <>
                      <button className="btn-primary text-xs px-3 py-1.5">
                        <Send className="w-3 h-3" /> Publish Now
                      </button>
                      <button className="btn-secondary text-xs px-3 py-1.5">
                        <Calendar className="w-3 h-3" /> Schedule
                      </button>
                      <button className="btn-secondary text-xs px-3 py-1.5">
                        <Sparkles className="w-3 h-3" /> Refine with AI
                      </button>
                    </>
                  )}
                  {post.status === "scheduled" && (
                    <>
                      <button className="btn-primary text-xs px-3 py-1.5">
                        <Send className="w-3 h-3" /> Publish Now
                      </button>
                      <button className="btn-secondary text-xs px-3 py-1.5">
                        <Edit3 className="w-3 h-3" /> Reschedule
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add new */}
          <button className="w-full card p-4 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 hover:border-accent/20 transition-all border-dashed">
            <Plus className="w-4 h-4" />
            Add new content idea
          </button>
        </div>

        {/* Right: Network */}
        <div className="space-y-5">
          {/* Network */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-soft" />
                <span className="section-title text-sm">Key Network</span>
              </div>
              <button className="btn-ghost text-xs">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {connections.map((conn) => (
                <div key={conn.id} className="p-3 rounded-xl bg-ink-700/50 border border-ink-600/30 hover:border-accent/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-100">{conn.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{conn.title}</div>
                      {conn.company && (
                        <div className="text-[11px] text-slate-500">{conn.company}</div>
                      )}
                    </div>
                    <span className={cn("badge text-[10px] shrink-0", relationshipColors[conn.relationship ?? "cold"])}>
                      {conn.relationship}
                    </span>
                  </div>
                  {conn.notes && (
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{conn.notes}</p>
                  )}
                  {conn.canIntroTo && (
                    <div className="mt-2">
                      <span className="text-[10px] text-signal-green">
                        Can intro to: {(JSON.parse(conn.canIntroTo) as string[]).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content Ideas */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-accent-soft" />
              <span className="section-title text-sm">AI Content Ideas</span>
            </div>
            <div className="space-y-2">
              {[
                "The 3 metrics every CPO should track (but most don't)",
                "What I wish I knew before my first $100M product",
                "How I picked our Series B lead — insider view",
                "Co-founder compatibility: the question VCs don't ask",
              ].map((idea, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-ink-700/50 border border-ink-600/30 cursor-pointer hover:border-accent/20 transition-colors group">
                  <Sparkles className="w-3 h-3 text-accent/50 group-hover:text-accent-soft shrink-0 transition-colors" />
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{idea}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
