import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";
import {
  Settings, Key, Bell, Zap, Github, Linkedin,
  Mail, Globe, Shield, ChevronRight, CheckCircle2,
  AlertCircle, ExternalLink,
} from "lucide-react";

async function getSettings() {
  const [user, settings] = await Promise.all([
    db.user.findUnique({ where: { id: DEMO_USER_ID } }),
    db.settings.findUnique({ where: { userId: DEMO_USER_ID } }),
  ]);
  return { user, settings };
}

export default async function SettingsPage() {
  const { user, settings } = await getSettings();

  return (
    <div className="space-y-6 pb-8 max-w-3xl">
      {/* Integrations */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-accent-soft" />
          <h3 className="section-title">Integrations</h3>
        </div>
        <div className="space-y-3">
          {[
            {
              icon: <Key className="w-4 h-4 text-signal-amber" />,
              label: "OpenAI API Key",
              description: "Power AI match scoring, content generation & interview prep",
              connected: !!settings?.openaiApiKey,
              cta: "Connect",
              critical: true,
            },
            {
              icon: <Linkedin className="w-4 h-4 text-blue-400" />,
              label: "LinkedIn",
              description: "Auto-import profile data, track public presence metrics",
              connected: !!settings?.linkedinToken,
              cta: "Connect",
            },
            {
              icon: <Github className="w-4 h-4 text-slate-300" />,
              label: "GitHub",
              description: "Pull repos and contributions into your profile",
              connected: !!settings?.githubToken,
              cta: "Connect",
            },
            {
              icon: <Mail className="w-4 h-4 text-signal-green" />,
              label: "Email (Weekly Digest)",
              description: `Send weekly career digest to ${settings?.weeklyDigestEmail ?? "your email"}`,
              connected: !!settings?.weeklyDigestEmail,
              cta: "Configure",
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-ink-700/50 border border-ink-600/30 hover:border-accent/20 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-ink-600 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-100">{item.label}</span>
                  {item.critical && !item.connected && (
                    <span className="badge bg-signal-amber/10 text-signal-amber border-signal-amber/20 text-[10px]">
                      Required for AI
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
              </div>
              {item.connected ? (
                <span className="flex items-center gap-1.5 text-xs text-signal-green font-medium shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              ) : (
                <button className="btn-secondary text-xs shrink-0">
                  {item.cta} <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Automation */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-accent-soft" />
          <h3 className="section-title">Automation</h3>
        </div>
        <div className="space-y-4">
          {[
            {
              label: "Auto-generate content drafts",
              description: "Automatically draft LinkedIn posts from your new achievements",
              enabled: settings?.autoGenerateContent ?? true,
            },
            {
              label: "Weekly digest email",
              description: `Sent every Monday with top 5 matches and 1 growth action`,
              enabled: settings?.emailNotifications ?? true,
            },
            {
              label: "Auto-apply (with approval)",
              description: "Auto-fill applications for 90%+ match roles — requires your review before submitting",
              enabled: settings?.autoApply ?? false,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-ink-700/50 border border-ink-600/30">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-100">{item.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
              </div>
              {/* Toggle */}
              <div className={`relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 cursor-pointer ${item.enabled ? "bg-accent" : "bg-ink-600"}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-accent-soft" />
          <h3 className="section-title">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "New opportunity matches (≥85%)", enabled: true },
            { label: "Application stage changes", enabled: true },
            { label: "Follow-up reminders", enabled: true },
            { label: "Weekly digest", enabled: true },
            { label: "Market insights", enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-ink-700/30 border border-ink-600/20">
              <span className="text-sm text-slate-300">{item.label}</span>
              <div className={`relative w-9 h-4.5 rounded-full transition-colors cursor-pointer ${item.enabled ? "bg-accent" : "bg-ink-600"}`}
                style={{ width: 36, height: 20 }}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile & Security */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-accent-soft" />
          <h3 className="section-title">Profile & Privacy</h3>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-ink-700/50 border border-ink-600/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-100">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
              <button className="btn-ghost text-xs">Edit</button>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-ink-700/50 border border-ink-600/30">
            <Globe className="w-4 h-4 text-accent-soft shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-100">Public Profile Page</div>
              <div className="text-xs text-slate-500">careerOS.io/alex — make recruiters come to you</div>
            </div>
            <button className="btn-secondary text-xs">
              <ExternalLink className="w-3 h-3" /> Preview
            </button>
          </div>

          <div className="p-4 rounded-xl bg-signal-amber/5 border border-signal-amber/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-signal-amber shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-signal-amber">OpenAI API Key required</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  AI match scoring, content generation, and interview prep require your own OpenAI API key. Your key is stored locally and never sent to our servers.
                </div>
                <button className="btn-primary text-xs mt-2">
                  <Key className="w-3 h-3" /> Add API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
