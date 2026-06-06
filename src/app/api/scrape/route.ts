import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";
import { runAllScrapers, runSingleScraper } from "@/lib/scrapers/aggregator";
import { scoreJobsBatch } from "@/lib/ai/scorer";
import type { UserProfile } from "@/lib/ai/scorer";

export const maxDuration = 60; // Vercel max

async function getUserProfile(): Promise<UserProfile> {
  const user = await db.user.findUnique({
    where: { id: DEMO_USER_ID },
    include: {
      skills: true,
      experiences: { orderBy: { startDate: "desc" } },
      achievements: { orderBy: { year: "desc" } },
      settings: true,
    },
  });

  if (!user) throw new Error("User not found");

  return {
    name: user.name ?? "User",
    headline: user.headline,
    summary: user.summary,
    targetRoles: JSON.parse(user.targetRoles ?? "[]") as string[],
    targetIndustries: JSON.parse(user.targetIndustries ?? "[]") as string[],
    targetSalaryMin: user.targetSalaryMin,
    targetSalaryMax: user.targetSalaryMax,
    openToRemote: user.openToRemote,
    skills: user.skills.map((s) => ({ name: s.name, level: s.level, category: s.category })),
    experiences: user.experiences.map((e) => ({
      company: e.company,
      title: e.title,
      description: e.description,
      isCurrent: e.isCurrent,
    })),
    achievements: user.achievements.map((a) => ({ title: a.title, metric: a.metric })),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as { source?: string };
    const [profile, settingsRecord] = await Promise.all([
      getUserProfile(),
      db.settings.findUnique({ where: { userId: DEMO_USER_ID } }),
    ]);

    const apiKey = settingsRecord?.openaiApiKey ?? process.env.OPENAI_API_KEY ?? null;

    // Run scrapers
    let rawJobs;
    if (body.source) {
      const jobs = await runSingleScraper(body.source);
      rawJobs = { jobs, batches: [], total: jobs.length, bySource: { [body.source]: jobs.length } };
    } else {
      rawJobs = await runAllScrapers();
    }

    if (rawJobs.jobs.length === 0) {
      return NextResponse.json({
        imported: 0,
        skipped: 0,
        sources: rawJobs.bySource,
        message: "No new executive roles found across sources at this time.",
      });
    }

    // Score all jobs
    const scored = await scoreJobsBatch(rawJobs.jobs, profile, apiKey);

    // Filter: only score >= 50 worth storing
    const worthStoring = scored.filter((j) => j.match.score >= 50);

    // Check for existing externalIds to avoid duplicates
    const existingOpps = await db.opportunity.findMany({
      where: { userId: DEMO_USER_ID },
      select: { sourceUrl: true },
    });
    const existingUrls = new Set(existingOpps.map((o) => o.sourceUrl));

    const toInsert = worthStoring.filter((j) => !existingUrls.has(j.sourceUrl));

    // Batch insert
    let imported = 0;
    for (const job of toInsert) {
      try {
        await db.opportunity.create({
          data: {
            userId: DEMO_USER_ID,
            title: job.title,
            company: job.company,
            location: job.location,
            isRemote: job.isRemote,
            description: job.description,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            equityMin: job.equityMin,
            equityMax: job.equityMax,
            sourceUrl: job.sourceUrl,
            sourcePlatform: job.sourcePlatform,
            roleType: job.roleType,
            companyStage: job.companyStage,
            companySize: job.companySize,
            aiMatchScore: job.match.score,
            aiMatchReason: job.match.reason,
            aiSalaryEst: job.match.salaryEst,
            status: "new",
            discoveredAt: job.postedAt ?? new Date(),
          },
        });
        imported++;
      } catch {
        // Skip duplicates silently
      }
    }

    return NextResponse.json({
      imported,
      skipped: toInsert.length - imported,
      total: rawJobs.total,
      sources: rawJobs.bySource,
      topMatch: scored[0]
        ? {
            title: scored[0].title,
            company: scored[0].company,
            score: scored[0].match.score,
            reason: scored[0].match.reason,
          }
        : null,
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return current opportunity stats and last scrape info
  const [total, newCount, highMatch] = await Promise.all([
    db.opportunity.count({ where: { userId: DEMO_USER_ID } }),
    db.opportunity.count({ where: { userId: DEMO_USER_ID, status: "new" } }),
    db.opportunity.findFirst({
      where: { userId: DEMO_USER_ID },
      orderBy: { aiMatchScore: "desc" },
      select: { title: true, company: true, aiMatchScore: true },
    }),
  ]);

  return NextResponse.json({
    total,
    newCount,
    highMatch,
    sources: [
      { id: "greenhouse",   label: "Greenhouse",      description: "700+ top tech companies" },
      { id: "lever",        label: "Lever",           description: "Startups & scaleups" },
      { id: "hn",           label: "HN Who's Hiring", description: "Monthly startup hiring" },
      { id: "remoteok",     label: "RemoteOK",        description: "Remote-first roles" },
      { id: "vc-portfolio", label: "VC Portfolios",   description: "a16z, Accel, Sequoia, YC" },
    ],
  });
}
