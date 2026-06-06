/**
 * POST /api/setup
 * One-time database setup — run after first Vercel deploy.
 * 1. Runs prisma db push to create all tables
 * 2. Seeds demo user, opportunities, recruiters, market insights
 * Protected by SETUP_SECRET env var.
 */

import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  // Guard — require secret header so this can't be triggered publicly
  const auth = req.headers.get("x-setup-secret");
  const secret = process.env.SETUP_SECRET ?? "career-os-setup-2024";
  if (auth !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ── STEP 1: Push schema (creates all tables) ─────────────
    let schemaStatus = "skipped";
    try {
      execSync("npx prisma db push --skip-generate --accept-data-loss", {
        env: { ...process.env },
        timeout: 30000,
        stdio: "pipe",
      });
      schemaStatus = "pushed";
    } catch (e) {
      // Tables may already exist — continue to seeding
      schemaStatus = `warning: ${e instanceof Error ? e.message.slice(0, 100) : String(e)}`;
    }

    // ── STEP 2: Check if already seeded ─────────────────────
    const existing = await db.user.findUnique({ where: { id: "demo-user-001" } });
    if (existing) {
      return NextResponse.json({ message: "Already seeded", skipped: true, schemaStatus });
    }

    // ── USER ─────────────────────────────────────────────
    await db.user.create({
      data: {
        id: "demo-user-001",
        name: "Your Name",
        email: "you@careeros.io",
        headline: "CPO & Co-founder | Growth × Product | VC-backed startups",
        summary: "I build products that scale and teams that execute. Looking for CPO, co-founder, and VC-adjacent roles at the intersection of AI, fintech, and consumer.",
        location: "San Francisco, CA",
        linkedinUrl: "https://linkedin.com/in/yourprofile",
        targetRoles: JSON.stringify(["CPO", "Co-Founder", "VP Product", "VC Partner", "GM"]),
        targetIndustries: JSON.stringify(["AI", "Fintech", "Consumer", "B2B SaaS"]),
        targetSalaryMin: 350000,
        targetSalaryMax: 750000,
        openToRemote: true,
        profileScore: 74,
      },
    });

    // ── EXPERIENCES ─────────────────────────────────────
    const exp1 = await db.experience.create({
      data: {
        userId: "demo-user-001",
        company: "Your Current Company",
        title: "Chief Product Officer",
        startDate: new Date("2021-03-01"),
        isCurrent: true,
        companySize: "51–200",
        companyType: "scaleup",
        description: "Led product across AI assistant, marketplace, and enterprise lines. Grew ARR from $4M to $22M. Managed 40-person product + design org.",
      },
    });

    const exp2 = await db.experience.create({
      data: {
        userId: "demo-user-001",
        company: "Previous Startup",
        title: "VP Product",
        startDate: new Date("2018-06-01"),
        endDate: new Date("2021-02-28"),
        companySize: "11–50",
        companyType: "startup",
        description: "0→1 product build for B2B payments infrastructure. Led acquisition at $210M valuation.",
      },
    });

    // ── ACHIEVEMENTS ─────────────────────────────────────
    await db.achievement.createMany({
      data: [
        {
          userId: "demo-user-001",
          experienceId: exp1.id,
          title: "Grew ARR from $4M → $22M in 30 months",
          description: "Redefined product strategy around AI automation.",
          metric: "$22M ARR (+450%)",
          impact: "company",
          category: "revenue",
          year: 2023,
        },
        {
          userId: "demo-user-001",
          experienceId: exp2.id,
          title: "Led company acquisition at $210M valuation",
          description: "Drove product differentiation that made the company a compelling acquisition target.",
          metric: "$210M acquisition",
          impact: "company",
          category: "fundraising",
          year: 2021,
        },
      ],
    });

    // ── SKILLS ─────────────────────────────────────────
    await db.skill.createMany({
      data: [
        { userId: "demo-user-001", name: "Product Strategy", category: "product", level: "expert", yearsExp: 10 },
        { userId: "demo-user-001", name: "Product-Led Growth", category: "growth", level: "expert", yearsExp: 6, inDemand: true },
        { userId: "demo-user-001", name: "AI/ML Product", category: "domain", level: "advanced", yearsExp: 4, inDemand: true },
        { userId: "demo-user-001", name: "Team Building (40+)", category: "leadership", level: "expert", yearsExp: 8 },
        { userId: "demo-user-001", name: "Fundraising & VC Relations", category: "leadership", level: "advanced", yearsExp: 5 },
        { userId: "demo-user-001", name: "B2B SaaS", category: "domain", level: "expert", yearsExp: 8 },
        { userId: "demo-user-001", name: "Fintech / Payments", category: "domain", level: "advanced", yearsExp: 5 },
        { userId: "demo-user-001", name: "Developer Tooling / PLG", category: "product", level: "learning", yearsExp: 1, isGap: true },
        { userId: "demo-user-001", name: "Enterprise Sales Enablement", category: "growth", level: "intermediate", yearsExp: 3, isGap: true },
      ],
    });

    // ── OPPORTUNITIES ─────────────────────────────────────
    await db.opportunity.createMany({
      data: [
        {
          userId: "demo-user-001",
          title: "Chief Product Officer",
          company: "Meridian AI",
          companyStage: "series-b",
          location: "San Francisco, CA",
          isRemote: true,
          salaryMin: 400000,
          salaryMax: 550000,
          equityMin: 0.3,
          equityMax: 0.8,
          sourcePlatform: "wellfound",
          roleType: "cpo",
          aiMatchScore: 94,
          aiMatchReason: "Near-perfect fit: Series B AI company, CPO + AI product background, comp aligned. You've scaled 0→1 which is their primary need.",
          status: "new",
        },
        {
          userId: "demo-user-001",
          title: "Co-Founder & CPO",
          company: "Stealth Fintech (a16z-backed)",
          companyStage: "seed",
          location: "New York, NY",
          isRemote: true,
          salaryMin: 150000,
          salaryMax: 300000,
          equityMin: 3.0,
          equityMax: 8.0,
          sourcePlatform: "vc-portfolio",
          roleType: "co-founder",
          aiMatchScore: 91,
          aiMatchReason: "Fintech + exit experience is exactly what this a16z-backed team needs. Co-founder equity upside is significant.",
          status: "saved",
        },
        {
          userId: "demo-user-001",
          title: "VP Product — Growth",
          company: "Compound Finance",
          companyStage: "growth",
          location: "Remote",
          isRemote: true,
          salaryMin: 380000,
          salaryMax: 480000,
          sourcePlatform: "linkedin",
          roleType: "vp-product",
          aiMatchScore: 87,
          aiMatchReason: "Strong PLG alignment, fintech domain relevant. Comp is excellent. Growth org at scale.",
          status: "applied",
        },
        {
          userId: "demo-user-001",
          title: "Fractional CPO",
          company: "Multiple Clients (via Exec Firm)",
          companyStage: "seed",
          location: "Remote",
          isRemote: true,
          salaryMin: 200000,
          salaryMax: 400000,
          sourcePlatform: "exec-search",
          roleType: "consulting",
          aiMatchScore: 88,
          aiMatchReason: "Fractional CPO work builds VC relationships + portfolio company optionality. High match with your skill set.",
          status: "new",
        },
      ],
    });

    // ── GROWTH TASKS ─────────────────────────────────────
    await db.growthTask.createMany({
      data: [
        {
          userId: "demo-user-001",
          category: "network",
          title: "Get warm intro to Meridian AI CEO via your VC network",
          description: "94% match role. Check your LinkedIn 2nd-degree connections.",
          priority: "high",
          status: "todo",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          estimatedHours: 0.25,
          relatedRole: "CPO",
        },
        {
          userId: "demo-user-001",
          category: "content",
          title: "Publish LinkedIn thought leadership post",
          description: "AI-drafted post ready in Brand Engine. Review and schedule.",
          priority: "high",
          status: "todo",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          estimatedHours: 0.5,
          relatedRole: "CPO",
        },
        {
          userId: "demo-user-001",
          category: "skill",
          title: "Complete enterprise sales enablement course",
          description: "Gap skill for GM/COO roles. Recommended: Winning by Design on Reforge.",
          priority: "medium",
          status: "in_progress",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          estimatedHours: 8,
          relatedSkill: "Enterprise Sales Enablement",
          resourceUrl: "https://reforge.com",
        },
        {
          userId: "demo-user-001",
          category: "network",
          title: "Contact 3 S-Tier recruiters this week",
          description: "Start with a16z talent (Shannon Schiltz) and True Search (Jonathan Chadwick). Scripts ready in Recruiters tab.",
          priority: "high",
          status: "todo",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          estimatedHours: 1,
          relatedRole: "CPO",
        },
      ],
    });

    // ── MARKET INSIGHTS ─────────────────────────────────────
    await db.marketInsight.createMany({
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
          body: "Job postings requiring both PLG AND AI product experience grew 340% in 12 months. Candidates with both command $80K+ premium.",
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
          title: "AI infrastructure is the hottest CPO market in 2024",
          body: "Companies building AI tooling, agents, and workflows are the fastest-growing source of senior CPO demand. 2x more openings than consumer.",
          isActive: true,
        },
      ],
    });

    // ── SETTINGS ─────────────────────────────────────────
    await db.settings.create({
      data: {
        userId: "demo-user-001",
        emailNotifications: true,
        autoGenerateContent: true,
      },
    });

    // ── BRAND POSTS ─────────────────────────────────────
    await db.brandPost.create({
      data: {
        userId: "demo-user-001",
        platform: "linkedin",
        contentType: "thought-leadership",
        topic: "Why most AI product roadmaps fail — and what separates the 1%",
        draft: `Most AI product roadmaps I see share the same fatal flaw: they're feature lists disguised as strategy.\n\nHere's what separates AI products that compound from those that stall at v1:\n\n1. They start with the workflow, not the model\nDon't ask "what can our AI do?" Ask "what decision is slow/painful for the user?"\n\n2. They define the feedback loop on day one\nAI products live or die by data quality. The teams winning have a closed loop: action → signal → model improvement.\n\n3. They treat trust as a product metric\n"AI hallucinated and we lost the enterprise deal" is a product failure, not a model failure.\n\n4. They separate exploration from exploitation\nYour AI feature has two jobs: delight new users and get better for existing ones.\n\nWhat's the biggest mistake you see in AI product strategy?`,
        status: "draft",
      },
    });

    // ── RECRUITERS ─────────────────────────────────────
    await db.recruiter.createMany({
      data: [
        {
          name: "Shannon Schiltz",
          title: "Head of Talent",
          firm: "Andreessen Horowitz (a16z)",
          firmType: "vc-talent",
          tier: "s",
          rolesFocus: JSON.stringify(["CPO", "Co-Founder", "VP Product", "CEO"]),
          stagesFocus: JSON.stringify(["seed", "series-a", "series-b", "growth"]),
          industriesFocus: JSON.stringify(["AI", "Fintech", "Consumer", "B2B SaaS"]),
          geoFocus: JSON.stringify(["SF", "NYC", "Remote", "Global"]),
          linkedinUrl: "https://www.linkedin.com/in/shannonschiltz/",
          firmWebsite: "https://jobs.a16z.com",
          approachMethod: "linkedin-dm",
          approachScript: `Hi Shannon,\n\nI'm a CPO/operator with a track record scaling AI and fintech products from 0→1 through Series B+. I've been following a16z's portfolio closely and would love to be on your radar for CPO, co-founder, or GM roles at portfolio companies.\n\nKey highlights: [Your top metric]. Happy to send a brief if helpful.\n\n[Your name]`,
          insiderNote: "a16z talent places execs directly at portfolio companies. Lead with operator credentials and specific portfolio company knowledge. Keep it under 5 lines.",
          placedRoles: JSON.stringify(["CPO roles at a16z portfolio", "Co-founder matches"]),
          status: "not-contacted",
          isActive: true,
        },
        {
          name: "Jonathan Chadwick",
          title: "Managing Director",
          firm: "True Search",
          firmType: "exec-search",
          tier: "s",
          rolesFocus: JSON.stringify(["CPO", "CEO", "CTO", "Co-Founder", "VP Product"]),
          stagesFocus: JSON.stringify(["series-a", "series-b", "growth", "public"]),
          industriesFocus: JSON.stringify(["AI", "SaaS", "Fintech", "Consumer"]),
          geoFocus: JSON.stringify(["SF", "NYC", "Remote", "Global"]),
          linkedinUrl: "https://www.linkedin.com/in/jonathanechadwick/",
          firmWebsite: "https://www.truesearch.com",
          approachMethod: "email",
          approachScript: `Subject: CPO / Senior Product Leader — [Your Name]\n\nHi Jonathan,\n\nI'm a CPO-level product leader actively exploring my next role. Background: [2-line summary with key metric]. Targeting CPO, co-founder, and GM roles at Series A–C AI and fintech companies.\n\nTrue Search places exactly the roles I'm targeting — would love to connect.\n\n[Your name]`,
          insiderNote: "True Search is the top startup exec search firm. They work retained for top VCs. Send a crisp one-pager with metrics. They place CPOs at unicorns regularly.",
          placedRoles: JSON.stringify(["CPO at unicorns", "CEO at Series B+"]),
          status: "not-contacted",
          isActive: true,
        },
        {
          name: "Mike Elek",
          title: "Partner",
          firm: "Riviera Partners",
          firmType: "exec-search",
          tier: "s",
          rolesFocus: JSON.stringify(["CPO", "VP Product", "VP Engineering", "CTO"]),
          stagesFocus: JSON.stringify(["series-a", "series-b", "growth"]),
          industriesFocus: JSON.stringify(["AI", "SaaS", "Consumer", "B2B"]),
          geoFocus: JSON.stringify(["SF", "Remote", "NYC"]),
          linkedinUrl: "https://www.linkedin.com/in/mikeelek/",
          firmWebsite: "https://rivierapartners.com",
          approachMethod: "linkedin-dm",
          approachScript: `Hi Mike,\n\nI'm a senior product leader (CPO/VP Product background) actively looking for my next role. Specialties: AI products, PLG, 0→1 and scaling through Series B. [Key metric].\n\nRiviera places exactly the roles I'm targeting — would love to be in your network. [Your name]`,
          insiderNote: "Riviera Partners specialises in product and engineering leadership at VC-backed startups. Very respected in SF. They appreciate operators with both technical and business chops.",
          placedRoles: JSON.stringify(["VP Product at top startups", "CPO at Series B"]),
          status: "not-contacted",
          isActive: true,
        },
        {
          name: "Shruti Bhatt",
          title: "Partner, Talent",
          firm: "Lightspeed Venture Partners",
          firmType: "vc-talent",
          tier: "s",
          rolesFocus: JSON.stringify(["CPO", "VP Product", "VP Growth", "GM", "Co-Founder"]),
          stagesFocus: JSON.stringify(["seed", "series-a", "series-b", "growth"]),
          industriesFocus: JSON.stringify(["Enterprise SaaS", "AI", "Consumer", "Fintech"]),
          geoFocus: JSON.stringify(["SF", "NYC", "Remote", "India", "Global"]),
          linkedinUrl: "https://www.linkedin.com/in/shrutibhatt/",
          firmWebsite: "https://lsvp.com",
          approachMethod: "linkedin-dm",
          approachScript: `Hi Shruti,\n\nI'm an operator and product leader with [X years] scaling AI and SaaS products — [key metric]. Actively exploring CPO, co-founder, and GM roles and would love to be on Lightspeed's radar.\n\n[Your name]`,
          insiderNote: "Lightspeed has strong India + US portfolio. Good for operators with international exposure. Shruti is approachable and responds to genuine messages.",
          placedRoles: JSON.stringify(["CPO/GM at Lightspeed portfolio", "Founding team"]),
          status: "not-contacted",
          isActive: true,
        },
        {
          name: "Jennifer Rettig",
          title: "Managing Director",
          firm: "Daversa Partners",
          firmType: "exec-search",
          tier: "s",
          rolesFocus: JSON.stringify(["CPO", "CEO", "CMO", "CRO", "VP Product", "Co-Founder"]),
          stagesFocus: JSON.stringify(["series-b", "growth", "pre-ipo", "public"]),
          industriesFocus: JSON.stringify(["SaaS", "Fintech", "AI", "Consumer"]),
          geoFocus: JSON.stringify(["NYC", "SF", "Remote", "Global"]),
          linkedinUrl: "https://www.linkedin.com/in/jenniferrettig/",
          firmWebsite: "https://daversa.com",
          approachMethod: "email",
          approachScript: `Subject: Executive Product Leader — [Your Name]\n\nHi Jennifer,\n\nI'm actively exploring senior executive opportunities. CPO-level leader with [key metric].\n\nDaversa places the roles I'm targeting — would love to connect.\n\n[Your name]`,
          insiderNote: "Daversa is strong on C-suite placements for growth-stage to pre-IPO. Good for PE and late-stage VC.",
          placedRoles: JSON.stringify(["C-suite at growth/pre-IPO", "CPO placements"]),
          status: "not-contacted",
          isActive: true,
        },
        {
          name: "Talitha Dowd",
          title: "Head of Talent",
          firm: "Accel Partners",
          firmType: "vc-talent",
          tier: "s",
          rolesFocus: JSON.stringify(["CPO", "VP Product", "Co-Founder", "VP Growth"]),
          stagesFocus: JSON.stringify(["seed", "series-a", "series-b"]),
          industriesFocus: JSON.stringify(["SaaS", "Security", "AI", "Marketplace", "Consumer"]),
          geoFocus: JSON.stringify(["SF", "NYC", "London", "Remote", "Europe"]),
          linkedinUrl: "https://www.linkedin.com/in/talithadowd/",
          firmWebsite: "https://jobs.accel.com",
          approachMethod: "linkedin-dm",
          approachScript: `Hi Talitha,\n\nI'm an operator looking for CPO/co-founder opportunities at Series A-B companies. My background: [headline]. I've been following Accel's portfolio and would love to be on your radar.\n\n[Your name]`,
          insiderNote: "Accel covers US and European portfolio. Good for London/Berlin opportunities. They appreciate operators with international experience.",
          placedRoles: JSON.stringify(["CPO/VP Product at Accel portfolio", "European expansion roles"]),
          status: "not-contacted",
          isActive: true,
        },
        {
          name: "Lenny Rachitsky",
          title: "Author / Angel Investor",
          firm: "Lenny's Newsletter",
          firmType: "independent",
          tier: "a",
          rolesFocus: JSON.stringify(["CPO", "VP Product", "Head of Product", "Co-Founder"]),
          stagesFocus: JSON.stringify(["seed", "series-a", "series-b", "growth"]),
          industriesFocus: JSON.stringify(["Consumer", "SaaS", "AI", "Marketplace"]),
          geoFocus: JSON.stringify(["Remote", "SF", "NYC", "Global"]),
          linkedinUrl: "https://www.linkedin.com/in/lennyrachitsky/",
          twitterUrl: "https://twitter.com/lennysan",
          website: "https://www.lennysnewsletter.com",
          approachMethod: "warm-intro",
          approachScript: `DM on Twitter/LinkedIn:\n\n"Hi Lenny, longtime reader — your [specific post] shaped how I think about [topic]. I'm a CPO-level leader with [key credential] exploring my next role. Any chance you'd be open to a quick chat?\n\n[Your name]"`,
          insiderNote: "Lenny has 800K+ subscribers and an enormous product leader network. Engage with his content first — reply to his posts with genuine insight before reaching out.",
          placedRoles: JSON.stringify(["Informal referrals to top product roles"]),
          status: "not-contacted",
          isActive: true,
        },
        {
          name: "Kerri Sherrick",
          title: "Talent Partner",
          firm: "Bessemer Venture Partners",
          firmType: "vc-talent",
          tier: "s",
          rolesFocus: JSON.stringify(["CPO", "VP Product", "GM", "CMO"]),
          stagesFocus: JSON.stringify(["series-a", "series-b", "growth"]),
          industriesFocus: JSON.stringify(["Cloud", "SaaS", "Security", "Healthcare"]),
          geoFocus: JSON.stringify(["SF", "NYC", "Boston", "Remote"]),
          linkedinUrl: "https://www.linkedin.com/in/kerrisherrick/",
          firmWebsite: "https://www.bvp.com",
          approachMethod: "linkedin-dm",
          approachScript: `Hi Kerri,\n\nI'm a product and growth leader with [X years] experience scaling B2B SaaS — most recently [role/metric]. Targeting CPO and VP Product opportunities at Series B+ companies and would love to be considered for BVP portfolio companies.\n\n[Your name]`,
          insiderNote: "BVP focuses on cloud and SaaS. They love operators with strong metrics and board-level communication skills. Reference their Atlas benchmarks to show you understand the space.",
          placedRoles: JSON.stringify(["C-suite at BVP portfolio", "VP roles at cloud companies"]),
          status: "not-contacted",
          isActive: true,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      schemaStatus,
      message: "✅ Career OS database seeded successfully",
      seeded: {
        user: 1,
        experiences: 2,
        achievements: 2,
        skills: 9,
        opportunities: 4,
        growthTasks: 4,
        marketInsights: 4,
        brandPosts: 1,
        recruiters: 8,
        settings: 1,
      },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Setup failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await db.user.findUnique({ where: { id: "demo-user-001" } });
    const counts = await Promise.all([
      db.opportunity.count({ where: { userId: "demo-user-001" } }),
      db.recruiter.count(),
      db.growthTask.count({ where: { userId: "demo-user-001" } }),
    ]);
    return NextResponse.json({
      seeded: !!user,
      user: user?.name ?? null,
      opportunities: counts[0],
      recruiters: counts[1],
      growthTasks: counts[2],
    });
  } catch (error) {
    return NextResponse.json({ seeded: false, error: String(error) });
  }
}
