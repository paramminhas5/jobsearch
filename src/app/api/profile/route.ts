import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const user = await db.user.findUnique({
      where: { id: DEMO_USER_ID },
      include: {
        experiences: { include: { achievements: true }, orderBy: { startDate: "desc" } },
        educations: { orderBy: { startYear: "desc" } },
        skills: { orderBy: [{ level: "asc" }, { name: "asc" }] },
        achievements: { orderBy: { year: "desc" } },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Compute profile score breakdown
    const breakdown = {
      basics: user.headline && user.summary && user.location ? 100 : 50,
      experience: user.experiences.length >= 2 ? 100 : user.experiences.length * 50,
      skills: Math.min(100, user.skills.length * 7),
      achievements: Math.min(100, user.achievements.length * 20),
      brand: user.linkedinUrl ? 60 : 20,
    };
    const total = Math.round(
      breakdown.basics * 0.2 +
        breakdown.experience * 0.25 +
        breakdown.skills * 0.2 +
        breakdown.achievements * 0.25 +
        breakdown.brand * 0.1
    );

    const suggestions = [];
    if (!user.headline) suggestions.push("Add a compelling headline");
    if (!user.summary) suggestions.push("Write a 2–3 line bio");
    if (user.achievements.length < 5) suggestions.push("Add more quantified achievements");
    if (user.skills.filter((s) => s.isGap).length > 0)
      suggestions.push(`Close ${user.skills.filter((s) => s.isGap).length} skill gaps`);
    if (!user.linkedinUrl) suggestions.push("Connect your LinkedIn profile");

    return NextResponse.json({ user, breakdown, total, suggestions });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const updated = await db.user.update({
      where: { id: DEMO_USER_ID },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
