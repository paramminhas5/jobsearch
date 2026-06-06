import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const [tasks, insights, skills] = await Promise.all([
      db.growthTask.findMany({
        where: { userId: DEMO_USER_ID },
        orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
      }),
      db.marketInsight.findMany({
        where: { isActive: true },
        orderBy: { date: "desc" },
      }),
      db.skill.findMany({
        where: { userId: DEMO_USER_ID },
        orderBy: [{ isGap: "desc" }, { inDemand: "desc" }],
      }),
    ]);

    const byCategory = tasks.reduce(
      (acc, task) => {
        if (!acc[task.category]) acc[task.category] = [];
        acc[task.category].push(task);
        return acc;
      },
      {} as Record<string, typeof tasks>
    );

    const gapSkills = skills.filter((s) => s.isGap);
    const inDemandSkills = skills.filter((s) => s.inDemand);

    return NextResponse.json({
      tasks,
      byCategory,
      insights,
      gapSkills,
      inDemandSkills,
      completionRate: tasks.length
        ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100)
        : 0,
    });
  } catch (error) {
    console.error("Growth API error:", error);
    return NextResponse.json({ error: "Failed to load growth data" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const updated = await db.growthTask.update({
      where: { id },
      data: {
        status,
        ...(status === "done" ? { completedAt: new Date() } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Growth task update error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
