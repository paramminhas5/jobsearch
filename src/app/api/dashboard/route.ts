import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const [user, opportunities, applications, growthTasks, brandPosts, insights] =
      await Promise.all([
        db.user.findUnique({ where: { id: DEMO_USER_ID } }),
        db.opportunity.findMany({
          where: { userId: DEMO_USER_ID, status: { not: "dismissed" } },
          orderBy: { aiMatchScore: "desc" },
          take: 5,
        }),
        db.application.findMany({
          where: {
            userId: DEMO_USER_ID,
            stage: { notIn: ["closed_won", "closed_lost"] },
          },
          include: { opportunity: true },
          orderBy: { updatedAt: "desc" },
        }),
        db.growthTask.findMany({
          where: { userId: DEMO_USER_ID, status: { in: ["todo", "in_progress"] } },
          orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
          take: 5,
        }),
        db.brandPost.findMany({
          where: { userId: DEMO_USER_ID, status: "draft" },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
        db.marketInsight.findMany({
          where: { isActive: true },
          orderBy: { date: "desc" },
          take: 3,
        }),
      ]);

    const newOpps = opportunities.filter((o) => o.status === "new").length;
    const topMatch = opportunities[0] ?? null;

    return NextResponse.json({
      user,
      stats: {
        profileScore: user?.profileScore ?? 0,
        newOpportunities: newOpps,
        activeApplications: applications.length,
        pendingGrowthTasks: growthTasks.length,
        brandPostsDue: brandPosts.length,
      },
      topOpportunities: opportunities.slice(0, 3),
      topMatch,
      recentApplications: applications.slice(0, 4),
      growthTasks: growthTasks.slice(0, 4),
      insights,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
