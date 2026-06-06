import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";
import { generateApplyPackage } from "@/lib/ai/apply";
import type { UserProfile } from "@/lib/ai/scorer";

async function getUserProfile(): Promise<UserProfile> {
  const user = await db.user.findUnique({
    where: { id: DEMO_USER_ID },
    include: {
      skills: { orderBy: [{ level: "asc" }] },
      experiences: { orderBy: { startDate: "desc" }, take: 5 },
      achievements: { orderBy: { year: "desc" }, take: 8 },
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

/** POST /api/apply — generate application package for an opportunity */
export async function POST(req: Request) {
  try {
    const { opportunityId } = (await req.json()) as { opportunityId: string };

    const [opportunity, profile, settings] = await Promise.all([
      db.opportunity.findUnique({ where: { id: opportunityId } }),
      getUserProfile(),
      db.settings.findUnique({ where: { userId: DEMO_USER_ID } }),
    ]);

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const apiKey = settings?.openaiApiKey ?? process.env.OPENAI_API_KEY ?? null;

    const pkg = await generateApplyPackage(
      {
        title: opportunity.title,
        company: opportunity.company,
        description: opportunity.description,
        sourceUrl: opportunity.sourceUrl ?? "",
        roleType: opportunity.roleType,
        companyStage: opportunity.companyStage,
      },
      profile,
      apiKey
    );

    // Save cover letter to application record if one exists
    const existingApp = await db.application.findUnique({
      where: { opportunityId },
    });

    if (existingApp) {
      await db.application.update({
        where: { opportunityId },
        data: { coverLetter: pkg.coverLetter },
      });
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error("Apply package error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

/** PATCH /api/apply — mark opportunity as applied + create pipeline entry */
export async function PATCH(req: Request) {
  try {
    const { opportunityId, coverLetter, notes } = (await req.json()) as {
      opportunityId: string;
      coverLetter?: string;
      notes?: string;
    };

    // Update opportunity status
    await db.opportunity.update({
      where: { id: opportunityId },
      data: { status: "applied" },
    });

    // Upsert application
    const app = await db.application.upsert({
      where: { opportunityId },
      update: {
        stage: "applied",
        appliedAt: new Date(),
        ...(coverLetter ? { coverLetter } : {}),
        ...(notes ? { notes } : {}),
      },
      create: {
        userId: DEMO_USER_ID,
        opportunityId,
        stage: "applied",
        appliedAt: new Date(),
        coverLetter,
        notes,
      },
    });

    // Log event
    await db.applicationEvent.create({
      data: {
        applicationId: app.id,
        type: "stage_change",
        fromStage: "discovered",
        toStage: "applied",
      },
    });

    return NextResponse.json({ success: true, applicationId: app.id });
  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Apply failed" },
      { status: 500 }
    );
  }
}
