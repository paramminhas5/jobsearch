import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const [posts, connections, metrics] = await Promise.all([
      db.brandPost.findMany({
        where: { userId: DEMO_USER_ID },
        orderBy: { createdAt: "desc" },
      }),
      db.connection.findMany({
        where: { userId: DEMO_USER_ID },
        orderBy: { relationship: "asc" },
      }),
      db.brandMetric.findMany({
        where: { userId: DEMO_USER_ID },
        orderBy: { date: "desc" },
        take: 30,
      }),
    ]);

    return NextResponse.json({ posts, connections, metrics });
  } catch (error) {
    console.error("Brand API error:", error);
    return NextResponse.json({ error: "Failed to load brand data" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status, finalContent, scheduledFor } = await req.json();
    const updated = await db.brandPost.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(finalContent !== undefined ? { finalContent } : {}),
        ...(scheduledFor ? { scheduledFor: new Date(scheduledFor) } : {}),
        ...(status === "published" ? { publishedAt: new Date() } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Brand post update error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const post = await db.brandPost.create({
      data: { userId: DEMO_USER_ID, ...body },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error("Brand post create error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
