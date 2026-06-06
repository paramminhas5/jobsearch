import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID, PIPELINE_STAGES } from "@/lib/constants";

export async function GET() {
  try {
    const applications = await db.application.findMany({
      where: { userId: DEMO_USER_ID },
      include: { opportunity: true, events: { orderBy: { occurredAt: "desc" } } },
      orderBy: { updatedAt: "desc" },
    });

    const pipeline = PIPELINE_STAGES.map((stage) => ({
      ...stage,
      count: applications.filter((a) => a.stage === stage.id).length,
      applications: applications
        .filter((a) => a.stage === stage.id)
        .map((a) => ({
          id: a.id,
          opportunityId: a.opportunityId,
          company: a.opportunity.company,
          title: a.opportunity.title,
          stage: a.stage,
          aiMatchScore: a.opportunity.aiMatchScore,
          nextActionDate: a.nextActionDate,
          nextActionNote: a.nextActionNote,
          appliedAt: a.appliedAt,
          salaryMax: a.opportunity.salaryMax,
        })),
    }));

    return NextResponse.json(pipeline);
  } catch (error) {
    console.error("Pipeline API error:", error);
    return NextResponse.json({ error: "Failed to load pipeline" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, stage, notes, nextActionDate, nextActionNote } = await req.json();

    const existing = await db.application.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.application.update({
      where: { id },
      data: {
        ...(stage ? { stage } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(nextActionDate ? { nextActionDate: new Date(nextActionDate) } : {}),
        ...(nextActionNote !== undefined ? { nextActionNote } : {}),
      },
    });

    // Log event
    if (stage && stage !== existing.stage) {
      await db.applicationEvent.create({
        data: {
          applicationId: id,
          type: "stage_change",
          fromStage: existing.stage,
          toStage: stage,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Pipeline update error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
