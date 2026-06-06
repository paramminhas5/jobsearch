import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status    = searchParams.get("status");
    const roleType  = searchParams.get("roleType");
    const minScore  = parseInt(searchParams.get("minScore") ?? "0");
    const source    = searchParams.get("source");

    const opps = await db.opportunity.findMany({
      where: {
        userId: DEMO_USER_ID,
        ...(status
          ? { status }
          : { status: { not: "dismissed" } }),
        ...(roleType ? { roleType } : {}),
        ...(minScore > 0 ? { aiMatchScore: { gte: minScore } } : {}),
        ...(source ? { sourcePlatform: source } : {}),
      },
      include: { application: { select: { id: true } } },
      orderBy: { aiMatchScore: "desc" },
    });

    return NextResponse.json(
      opps.map((o) => ({
        id: o.id,
        title: o.title,
        company: o.company,
        companyStage: o.companyStage,
        companySize: o.companySize,
        location: o.location,
        isRemote: o.isRemote,
        salaryMin: o.salaryMin,
        salaryMax: o.salaryMax,
        equityMin: o.equityMin,
        equityMax: o.equityMax,
        description: o.description,
        sourceUrl: o.sourceUrl,
        sourcePlatform: o.sourcePlatform,
        roleType: o.roleType,
        aiMatchScore: o.aiMatchScore,
        aiMatchReason: o.aiMatchReason,
        aiSalaryEst: o.aiSalaryEst,
        status: o.status,
        discoveredAt: o.discoveredAt.toISOString(),
        hasApplication: !!o.application,
      }))
    );
  } catch (error) {
    console.error("Opportunities API error:", error);
    return NextResponse.json({ error: "Failed to load opportunities" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json() as { id: string; status: string };
    const { id, status } = body;

    const updated = await db.opportunity.update({
      where: { id },
      data: { status },
    });

    // Auto-create pipeline entry when applied
    if (status === "applied") {
      await db.application.upsert({
        where: { opportunityId: id },
        update: { stage: "applied", appliedAt: new Date() },
        create: {
          userId: DEMO_USER_ID,
          opportunityId: id,
          stage: "applied",
          appliedAt: new Date(),
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Opportunity update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
