export const DEMO_USER_ID = "demo-user-001";

export const PIPELINE_STAGES = [
  { id: "discovered", label: "Discovered", color: "#64748b" },
  { id: "applied", label: "Applied", color: "#818cf8" },
  { id: "screen", label: "Screen", color: "#38bdf8" },
  { id: "interview_1", label: "Interview I", color: "#a78bfa" },
  { id: "interview_2", label: "Interview II", color: "#c084fc" },
  { id: "final", label: "Final Round", color: "#e879f9" },
  { id: "offer", label: "Offer", color: "#34d399" },
  { id: "closed_won", label: "Accepted 🎉", color: "#10b981" },
  { id: "closed_lost", label: "Closed", color: "#475569" },
];

export const ROLE_TYPES = [
  { value: "cpo", label: "Chief Product Officer" },
  { value: "vp-product", label: "VP Product" },
  { value: "vp-growth", label: "VP Growth" },
  { value: "cmo", label: "Chief Marketing Officer" },
  { value: "coo", label: "Chief Operating Officer" },
  { value: "ceo", label: "CEO" },
  { value: "gm", label: "General Manager" },
  { value: "co-founder", label: "Co-Founder" },
  { value: "consulting", label: "Consulting / Advisory" },
  { value: "vc", label: "VC / Investor" },
  { value: "partner", label: "Partner" },
];

export const SKILL_CATEGORIES = [
  { value: "product", label: "Product" },
  { value: "growth", label: "Growth" },
  { value: "technical", label: "Technical" },
  { value: "leadership", label: "Leadership" },
  { value: "domain", label: "Domain Expertise" },
  { value: "tool", label: "Tools & Platforms" },
];

export const COMPANY_STAGES = [
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "growth", label: "Growth / Series C+" },
  { value: "public", label: "Public" },
  { value: "pe", label: "Private Equity" },
];

export const SOURCE_PLATFORMS = [
  { value: "wellfound", label: "Wellfound / AngelList" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "hacker-news", label: "Hacker News" },
  { value: "exec-search", label: "Exec Search Firm" },
  { value: "vc-portfolio", label: "VC Portfolio" },
  { value: "direct", label: "Direct Outreach" },
  { value: "referral", label: "Referral" },
];

export const CONTENT_TYPES = [
  { value: "thought-leadership", label: "Thought Leadership" },
  { value: "win", label: "Career Win / Story" },
  { value: "insight", label: "Market Insight" },
  { value: "story", label: "Founder Story" },
  { value: "thread", label: "Thread / Listicle" },
];

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/profile", label: "Profile", icon: "User" },
  { href: "/opportunities", label: "Opportunities", icon: "Telescope" },
  { href: "/pipeline", label: "Pipeline", icon: "Kanban" },
  { href: "/brand", label: "Brand Engine", icon: "Megaphone" },
  { href: "/growth", label: "Growth Loop", icon: "TrendingUp" },
  { href: "/settings", label: "Settings", icon: "Settings" },
];
