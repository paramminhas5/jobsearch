import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Career OS demo data...");

  // Clean slate
  await prisma.growthTask.deleteMany();
  await prisma.brandPost.deleteMany();
  await prisma.applicationEvent.deleteMany();
  await prisma.applicationContact.deleteMany();
  await prisma.application.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

  // ── USER ──────────────────────────────────────────────
  const user = await prisma.user.create({
    data: {
      id: "demo-user-001",
      name: "Alex Rivera",
      email: "alex@careerOS.io",
      headline: "CPO & Co-founder | Growth × Product | VC-backed startups",
      summary:
        "I build products that scale and teams that execute. Former CPO at two VC-backed startups (one exit, one Series C). Now seeking CPO, co-founder, or GP roles at the intersection of consumer, AI, and fintech.",
      location: "San Francisco, CA",
      linkedinUrl: "https://linkedin.com/in/alexrivera",
      githubUrl: "https://github.com/alexrivera",
      targetRoles: JSON.stringify(["CPO", "Co-Founder", "VP Product", "VC Partner", "GM"]),
      targetIndustries: JSON.stringify(["AI", "Fintech", "Consumer", "B2B SaaS"]),
      targetSalaryMin: 350000,
      targetSalaryMax: 750000,
      openToRemote: true,
      profileScore: 74,
    },
  });

  // ── EXPERIENCE ──────────────────────────────────────────────
  const exp1 = await prisma.experience.create({
    data: {
      userId: user.id,
      company: "Luminary AI",
      title: "Chief Product Officer",
      startDate: new Date("2021-03-01"),
      isCurrent: true,
      companySize: "51–200",
      companyType: "scaleup",
      description:
        "Led product across AI assistant, marketplace, and enterprise lines. Grew ARR from $4M to $22M. Managed 40-person product + design org.",
    },
  });

  const exp2 = await prisma.experience.create({
    data: {
      userId: user.id,
      company: "Finstack (acq. by Stripe)",
      title: "VP Product",
      startDate: new Date("2018-06-01"),
      endDate: new Date("2021-02-28"),
      companySize: "11–50",
      companyType: "startup",
      description:
        "0→1 product build for B2B payments infrastructure. Led acquisition by Stripe at $210M valuation. Built and managed 12-person product team.",
    },
  });

  const exp3 = await prisma.experience.create({
    data: {
      userId: user.id,
      company: "Google",
      title: "Senior Product Manager",
      startDate: new Date("2015-08-01"),
      endDate: new Date("2018-05-31"),
      companySize: "1000+",
      companyType: "enterprise",
      description:
        "PM for Google Pay merchant onboarding. Launched in 12 new markets, 4M+ merchants. Cross-functional team of 30 engineers.",
    },
  });

  // ── EDUCATION ──────────────────────────────────────────────
  await prisma.education.create({
    data: {
      userId: user.id,
      institution: "Stanford University",
      degree: "MBA",
      field: "Strategy & Entrepreneurship",
      startYear: 2013,
      endYear: 2015,
    },
  });

  await prisma.education.create({
    data: {
      userId: user.id,
      institution: "UC Berkeley",
      degree: "B.S.",
      field: "Computer Science",
      startYear: 2009,
      endYear: 2013,
    },
  });

  // ── SKILLS ──────────────────────────────────────────────
  const skills = [
    { name: "Product Strategy", category: "product", level: "expert", yearsExp: 10 },
    { name: "0→1 Product Building", category: "product", level: "expert", yearsExp: 8 },
    { name: "Product-Led Growth", category: "growth", level: "expert", yearsExp: 6, inDemand: true },
    { name: "Growth Strategy", category: "growth", level: "advanced", yearsExp: 7, inDemand: true },
    { name: "Fundraising & VC Relations", category: "leadership", level: "advanced", yearsExp: 5 },
    { name: "Team Building (40+)", category: "leadership", level: "expert", yearsExp: 8 },
    { name: "M&A / Exit Strategy", category: "domain", level: "advanced", yearsExp: 3 },
    { name: "AI/ML Product", category: "domain", level: "advanced", yearsExp: 4, inDemand: true },
    { name: "Fintech / Payments", category: "domain", level: "advanced", yearsExp: 5 },
    { name: "B2B SaaS", category: "domain", level: "expert", yearsExp: 8 },
    { name: "Data & Analytics", category: "technical", level: "intermediate", yearsExp: 7 },
    { name: "SQL", category: "technical", level: "intermediate", yearsExp: 6 },
    { name: "Executive Communication", category: "leadership", level: "expert", yearsExp: 9 },
    { name: "Board Presentation", category: "leadership", level: "advanced", yearsExp: 4 },
    { name: "Enterprise Sales Enablement", category: "growth", level: "intermediate", yearsExp: 3, isGap: true },
    { name: "Developer Tooling / PLG", category: "product", level: "learning", yearsExp: 1, isGap: true },
  ];

  for (const skill of skills) {
    await prisma.skill.create({ data: { userId: user.id, ...skill } });
  }

  // ── ACHIEVEMENTS ──────────────────────────────────────────────
  await prisma.achievement.createMany({
    data: [
      {
        userId: user.id,
        experienceId: exp1.id,
        title: "Grew ARR from $4M → $22M in 30 months",
        description: "Redefined product strategy around AI automation, unlocking enterprise segment.",
        metric: "$22M ARR (+450%)",
        impact: "company",
        category: "revenue",
        year: 2023,
        isPublic: true,
      },
      {
        userId: user.id,
        experienceId: exp1.id,
        title: "Built & scaled 40-person Product + Design org",
        description: "Hired and developed directors, PMs, and designers across 3 product lines.",
        metric: "40-person org, 3 product lines",
        impact: "team",
        category: "leadership",
        year: 2023,
        isPublic: true,
      },
      {
        userId: user.id,
        experienceId: exp2.id,
        title: "Led acquisition by Stripe at $210M valuation",
        description: "Drove product differentiation that made Finstack a compelling acquisition target.",
        metric: "$210M acquisition (Stripe)",
        impact: "company",
        category: "fundraising",
        year: 2021,
        isPublic: true,
      },
      {
        userId: user.id,
        experienceId: exp2.id,
        title: "0→1 B2B payments product from idea to $8M ARR",
        description: "Conceived, built, and scaled core payments infra with 12-person team.",
        metric: "$8M ARR in 24 months",
        impact: "company",
        category: "revenue",
        year: 2020,
        isPublic: true,
      },
      {
        userId: user.id,
        experienceId: exp3.id,
        title: "Launched Google Pay in 12 markets — 4M+ merchants",
        description: "Led cross-functional launch across APAC and LATAM.",
        metric: "4M merchants, 12 markets",
        impact: "product",
        category: "growth",
        year: 2017,
        isPublic: true,
      },
    ],
  });

  // ── OPPORTUNITIES ──────────────────────────────────────────────
  const opps = [
    {
      title: "Chief Product Officer",
      company: "Meridian AI",
      companyStage: "series-b",
      companySize: "51–200",
      location: "San Francisco, CA",
      isRemote: true,
      salaryMin: 400000,
      salaryMax: 550000,
      equityMin: 0.3,
      equityMax: 0.8,
      sourcePlatform: "wellfound",
      roleType: "cpo",
      aiMatchScore: 94,
      aiMatchReason: "Near-perfect fit: Series B AI company, you have CPO + AI product background, comp aligned, they need someone who's scaled 0→1 which is your strongest suit.",
      description: "Meridian AI is building the next generation of autonomous enterprise workflows. We're looking for a CPO to own the entire product vision and roadmap.",
      status: "new",
    },
    {
      title: "Co-Founder & CPO",
      company: "Stealth Fintech (a16z-backed)",
      companyStage: "seed",
      companySize: "1–10",
      location: "New York, NY",
      isRemote: true,
      salaryMin: 150000,
      salaryMax: 300000,
      equityMin: 3.0,
      equityMax: 8.0,
      sourcePlatform: "vc-portfolio",
      roleType: "co-founder",
      aiMatchScore: 91,
      aiMatchReason: "Your fintech + exit experience is exactly what this a16z-backed team needs. Co-founder role = equity upside. High conviction match.",
      description: "a16z-backed fintech company building embedded finance for SMBs. CEO has deep distribution, looking for product-first co-founder.",
      status: "saved",
    },
    {
      title: "VP Product — Growth",
      company: "Compound Finance",
      companyStage: "growth",
      companySize: "201–1000",
      location: "Remote",
      isRemote: true,
      salaryMin: 380000,
      salaryMax: 480000,
      sourcePlatform: "linkedin",
      roleType: "vp-product",
      aiMatchScore: 87,
      aiMatchReason: "Strong PLG alignment, crypto/DeFi is adjacent to your fintech domain. Comp is excellent. Growth org at scale is a slight stretch but positive.",
      description: "Lead product growth strategy for Compound's consumer and institutional products.",
      status: "applied",
    },
    {
      title: "General Manager, AI Products",
      company: "Salesforce",
      companyStage: "public",
      companySize: "1000+",
      location: "San Francisco, CA",
      isRemote: false,
      salaryMin: 450000,
      salaryMax: 700000,
      sourcePlatform: "exec-search",
      roleType: "gm",
      aiMatchScore: 82,
      aiMatchReason: "Big co experience at Google helps. AI product background is key differentiator. Enterprise B2B matches. On-site may be a constraint — verify.",
      description: "Own AI products P&L across Salesforce Einstein suite. Reports to EVP.",
      status: "applied",
    },
    {
      title: "Principal — VC Firm (Early Stage)",
      company: "Sequoia Capital",
      companyStage: "vc",
      companySize: "51–200",
      location: "Menlo Park, CA",
      isRemote: false,
      salaryMin: 300000,
      salaryMax: 500000,
      sourcePlatform: "exec-search",
      roleType: "vc",
      aiMatchScore: 79,
      aiMatchReason: "Exit experience + operator background is VC gold. Missing: prior investing experience. Strong warm-intro path recommended — don't cold apply.",
      description: "Sequoia is looking for an operator with strong product instincts to join as Principal, sourcing + supporting portfolio companies.",
      status: "new",
    },
    {
      title: "Chief Operating Officer",
      company: "Arc Browser (The Browser Company)",
      companyStage: "series-b",
      companySize: "51–200",
      location: "New York, NY",
      isRemote: true,
      salaryMin: 350000,
      salaryMax: 500000,
      sourcePlatform: "hacker-news",
      roleType: "coo",
      aiMatchScore: 76,
      aiMatchReason: "Strong consumer product background, but COO is ops-heavy — ensure you can speak to ops depth. Brand-name company for your portfolio.",
      description: "Join as COO to scale operations, people, and GTM as Arc grows post-Series B.",
      status: "new",
    },
    {
      title: "Consulting — Fractional CPO",
      company: "Multiple Clients (via Exec Firm)",
      companyStage: "seed",
      companySize: "1–10",
      location: "Remote",
      isRemote: true,
      salaryMin: 200000,
      salaryMax: 400000,
      sourcePlatform: "exec-search",
      roleType: "consulting",
      aiMatchScore: 88,
      aiMatchReason: "Fractional CPO work is ideal for building VC relationships + portfolio companies + optionality. High match with your skill set.",
      status: "new",
    },
  ];

  const createdOpps = [];
  for (const opp of opps) {
    const created = await prisma.opportunity.create({
      data: { userId: user.id, ...opp },
    });
    createdOpps.push(created);
  }

  // ── APPLICATIONS ──────────────────────────────────────────────
  // App for VP Product
  const app1 = await prisma.application.create({
    data: {
      userId: user.id,
      opportunityId: createdOpps[2].id,
      stage: "interview_1",
      appliedAt: new Date("2024-01-15"),
      nextActionDate: new Date("2024-02-01"),
      nextActionNote: "Prepare case study: PLG strategy for crypto consumer product",
      notes: "Strong recruiter screen. HM liked fintech background. Culture deck sent.",
    },
  });

  await prisma.applicationEvent.createMany({
    data: [
      { applicationId: app1.id, type: "stage_change", fromStage: "discovered", toStage: "applied", occurredAt: new Date("2024-01-15") },
      { applicationId: app1.id, type: "stage_change", fromStage: "applied", toStage: "screen", occurredAt: new Date("2024-01-22") },
      { applicationId: app1.id, type: "stage_change", fromStage: "screen", toStage: "interview_1", occurredAt: new Date("2024-01-28") },
    ],
  });

  await prisma.applicationContact.create({
    data: {
      applicationId: app1.id,
      name: "Sarah Kim",
      title: "Head of Talent",
      email: "sarah@compound.finance",
      role: "recruiter",
    },
  });

  // App for Salesforce GM
  const app2 = await prisma.application.create({
    data: {
      userId: user.id,
      opportunityId: createdOpps[3].id,
      stage: "screen",
      appliedAt: new Date("2024-01-20"),
      nextActionDate: new Date("2024-02-05"),
      nextActionNote: "Follow up with David Chen — 2 weeks since last contact",
    },
  });

  await prisma.applicationEvent.createMany({
    data: [
      { applicationId: app2.id, type: "stage_change", fromStage: "discovered", toStage: "applied", occurredAt: new Date("2024-01-20") },
      { applicationId: app2.id, type: "stage_change", fromStage: "applied", toStage: "screen", occurredAt: new Date("2024-01-30") },
    ],
  });

  // ── BRAND POSTS ──────────────────────────────────────────────
  await prisma.brandPost.createMany({
    data: [
      {
        userId: user.id,
        platform: "linkedin",
        contentType: "thought-leadership",
        topic: "Why most AI product roadmaps fail — and what separates the 1%",
        draft: `Most AI product roadmaps I see share the same fatal flaw: they're feature lists disguised as strategy.

Here's what separates AI products that compound from those that stall at v1:

𝟭. They start with the workflow, not the model
Don't ask "what can our AI do?" Ask "what decision or action is slow/painful for the user?" The best AI features are invisible — they make the workflow faster, not flashier.

𝟮. They define the feedback loop on day one
AI products live or die by data quality. The teams winning at AI have a closed loop: action → signal → model improvement. Most teams bolt this on at v2. Too late.

𝟯. They treat trust as a product metric
"AI hallucinated and we lost the enterprise deal" is a product failure, not a model failure. Ship a confidence UI. Show your work. Let users correct the AI.

𝟰. They separate exploration from exploitation
Your AI feature has two jobs: delight new users (exploration) and get better for existing users (exploitation). Running both on the same roadmap creates chaos.

I learned this the hard way at Luminary AI. We burned 6 months optimizing the model when the real problem was the feedback loop was broken.

What's the biggest mistake you see in AI product strategy?`,
        status: "draft",
        sourceAchievement: "Grew ARR from $4M → $22M",
      },
      {
        userId: user.id,
        platform: "linkedin",
        contentType: "win",
        topic: "$210M acquisition story — what we got right",
        draft: `In 2021, Finstack was acquired by Stripe for $210M.

Three years of work. A team of 12. And a product we almost killed twice.

Here's what actually drove the outcome — none of it was what I expected:

We stopped trying to win on features.
At year 1, we were adding payment methods, compliance layers, analytics. Classic "keep up" roadmapping. At year 2 we made a painful cut: we deleted 40% of the product and went deep on one job: make B2B payment reconciliation invisible.

We made our infra the moat, not the UI.
Stripe didn't buy our UI. They bought our reconciliation engine and our 200+ bank integrations. We'd invested 18 months making the unglamorous parts world-class.

We built the acquisition case before we knew it was happening.
Every board deck included a "strategic value" slide showing how our infra could power adjacent products. We were building the narrative while building the product.

The lesson: the best exit is one you prepared for without knowing it was coming.`,
        status: "scheduled",
        scheduledFor: new Date("2024-02-05T09:00:00"),
      },
      {
        userId: user.id,
        platform: "linkedin",
        contentType: "insight",
        topic: "The $500K+ CPO market in 2024 — what I'm seeing",
        draft: `I've been tracking the executive product market closely for the past 6 months.

Here's what I'm seeing in the $400K–$750K CPO/VP Product market:

📊 The data:
• AI-native companies are paying 20–35% above market for CPOs with "0→1 at scale" experience
• Series B is the new sweet spot — post-PMF, pre-scale complexity is where operators add the most value
• Remote is back: 70% of CPO roles I've seen are now remote-first or fully remote
• Equity is being compressed at growth-stage, but seed/Series A co-founder equity (3–8%) is generous

🎯 What they're actually hiring for:
Not "roadmap management." They want:
1. Someone who's been in the seat at a comparable scale
2. Evidence of building and retaining strong product teams
3. A POV on AI in their specific domain

🚩 The red flags I'm seeing:
• Companies paying $500K+ but no board seat or direct CEO access = don't do it
• "Growth-stage" companies with no clear path to profitability
• CPO roles reporting to a CTO (unless it's genuinely a technical product)

Happy to share more data points if helpful. What's your read on the market?`,
        status: "draft",
      },
    ],
  });

  // ── CONNECTIONS ──────────────────────────────────────────────
  await prisma.connection.createMany({
    data: [
      {
        userId: user.id,
        name: "Marcus Chen",
        title: "Partner",
        company: "a16z",
        linkedinUrl: "https://linkedin.com/in/marcuschen",
        relationship: "warm",
        canIntroTo: JSON.stringify(["Meridian AI", "any a16z portfolio"]),
        lastContactedAt: new Date("2024-01-10"),
        notes: "Met at SaaStr 2023. Strong relationship. Can intro to portfolio CPO roles.",
      },
      {
        userId: user.id,
        name: "Priya Nair",
        title: "CPO",
        company: "Stripe",
        linkedinUrl: "https://linkedin.com/in/priyanair",
        relationship: "strong",
        canIntroTo: JSON.stringify(["Stripe", "ex-Stripe network"]),
        lastContactedAt: new Date("2024-01-18"),
        notes: "Former Stripe colleague from acquisition. Top champion.",
      },
      {
        userId: user.id,
        name: "James O'Brien",
        title: "Managing Director",
        company: "Sequoia Capital",
        relationship: "cold",
        canIntroTo: JSON.stringify(["Sequoia portfolio"]),
        notes: "Met once at YC demo day. Warm up before VC role approach.",
      },
      {
        userId: user.id,
        name: "Lisa Park",
        title: "CEO",
        company: "Meridian AI",
        linkedinUrl: "https://linkedin.com/in/lisapark",
        relationship: "target",
        canIntroTo: JSON.stringify(["Meridian AI CPO role"]),
        notes: "Marcus Chen can intro. Reach out after warm intro confirmed.",
      },
    ],
  });

  // ── GROWTH TASKS ──────────────────────────────────────────────
  await prisma.growthTask.createMany({
    data: [
      {
        userId: user.id,
        category: "content",
        title: "Publish LinkedIn post on AI product strategy",
        description: "Draft is ready. Review and schedule for Tuesday 9am.",
        priority: "high",
        status: "todo",
        dueDate: new Date("2024-02-06"),
        estimatedHours: 0.5,
        relatedRole: "CPO",
      },
      {
        userId: user.id,
        category: "network",
        title: "Ask Marcus Chen for intro to Meridian AI CEO",
        description: "94% match role. Marcus knows Lisa Park. Draft intro request.",
        priority: "high",
        status: "todo",
        dueDate: new Date("2024-02-03"),
        estimatedHours: 0.25,
        relatedRole: "CPO",
      },
      {
        userId: user.id,
        category: "skill",
        title: "Complete enterprise sales enablement course",
        description: "Gap skill for GM/COO roles. Recommended: Winning by Design on Reforge.",
        priority: "medium",
        status: "in_progress",
        dueDate: new Date("2024-03-01"),
        estimatedHours: 8,
        relatedSkill: "Enterprise Sales Enablement",
        resourceUrl: "https://reforge.com",
      },
      {
        userId: user.id,
        category: "application",
        title: "Prepare PLG case study for Compound Finance interview",
        description: "Interview I is scheduled. Need a 20-min case on PLG strategy for crypto product.",
        priority: "high",
        status: "todo",
        dueDate: new Date("2024-02-01"),
        estimatedHours: 3,
        relatedRole: "VP Product",
      },
      {
        userId: user.id,
        category: "network",
        title: "Warm up James O'Brien (Sequoia) over 3 touchpoints",
        description: "VC role requires relationship-first approach. Comment on 2 posts, then DM.",
        priority: "medium",
        status: "todo",
        dueDate: new Date("2024-03-15"),
        estimatedHours: 2,
        relatedRole: "VC",
      },
      {
        userId: user.id,
        category: "content",
        title: "Write founder story post about Finstack acquisition",
        description: "Draft ready. High-signal content for VC + co-founder audience.",
        priority: "high",
        status: "todo",
        dueDate: new Date("2024-02-10"),
        estimatedHours: 1,
        relatedRole: "Co-Founder",
      },
      {
        userId: user.id,
        category: "project",
        title: "Build a public AI product teardown (PLG focus)",
        description: "Demonstrates thought leadership + developer PLG gap-fill. Post as GitHub + LinkedIn.",
        priority: "medium",
        status: "todo",
        dueDate: new Date("2024-02-28"),
        estimatedHours: 6,
        relatedSkill: "Developer Tooling / PLG",
      },
    ],
  });

  // ── MARKET INSIGHTS ──────────────────────────────────────────────
  await prisma.marketInsight.createMany({
    data: [
      {
        category: "salary",
        title: "CPO comp at Series B hit $550K median in 2024",
        body: "Base + bonus median for CPO at Series B ($20M–$80M ARR) is now $550K total cash, up 18% YoY. AI-native companies pay 25–35% premium.",
        roleType: "cpo",
        isActive: true,
      },
      {
        category: "skill-demand",
        title: "PLG + AI combo is the #1 demanded CPO skill",
        body: "Job postings for CPO/VP Product requiring both PLG AND AI product experience grew 340% in 12 months. Candidates with both command $80K+ premium.",
        roleType: "cpo",
        isActive: true,
      },
      {
        category: "role-trend",
        title: "Co-founder equity for operator CPOs averaging 4–7%",
        body: "VC-backed seed companies bringing in experienced operator CPOs as co-founders are offering 4–7% equity on average, with $150–250K base.",
        roleType: "co-founder",
        isActive: true,
      },
      {
        category: "industry",
        title: "AI infrastructure companies are the hottest CPO market",
        body: "Companies building AI tooling, agents, and workflows are the fastest-growing source of senior CPO demand in 2024. 2x more openings than consumer.",
        isActive: true,
      },
    ],
  });

  // ── SETTINGS ──────────────────────────────────────────────
  await prisma.settings.create({
    data: {
      userId: user.id,
      emailNotifications: true,
      weeklyDigestEmail: "alex@careerOS.io",
      autoGenerateContent: true,
    },
  });

  console.log("✅ Seed complete! Demo user: demo-user-001");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
