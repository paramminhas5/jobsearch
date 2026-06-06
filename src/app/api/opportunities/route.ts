import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const roleType = searchParams.get("roleType");
    const minScore = parseInt(searchParams.get("minScore") ?? "0");

    const opps = await db.opportunity.findMany({
      where: {
        userId: DEMO_USER_ID,
        ...(status ? { status } : { status: { not: "dismissed" } }),
        ...(roleType ? { roleType } : {}),
        ...(minScore > 0 ? { aiMatchScore: { gte: minScore } } : {}),
      },
      include: { application: true },
      orderBy: { aiMatchScore: "desc" },
    });

    return NextResponse.json(opps);
  } catch (error) {
    console.error("Opportunities API error:", error);
    return NextResponse.json({ error: "Failed to load opportunities" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const updated = await db.opportunity.update({
      where: { id },
      data: { status },
    });

    // Auto-create application when status → applied
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
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 });
  }
}
