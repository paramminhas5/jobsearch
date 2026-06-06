import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tier       = searchParams.get("tier");
    const firmType   = searchParams.get("firmType");
    const status     = searchParams.get("status");
    const search     = searchParams.get("search");

    const recruiters = await db.recruiter.findMany({
      where: {
        isActive: true,
        ...(tier ? { tier } : {}),
        ...(firmType ? { firmType } : {}),
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { firm: { contains: search } },
                { rolesFocus: { contains: search } },
                { industriesFocus: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        outreaches: {
          where: { userId: DEMO_USER_ID },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [
        { tier: "asc" },  // s < a < b < c alphabetically
        { firm: "asc" },
      ],
    });

    return NextResponse.json(recruiters);
  } catch (error) {
    console.error("Recruiters GET error:", error);
    return NextResponse.json({ error: "Failed to load recruiters" }, { status: 500 });
  }
}

// PATCH — update relationship status / notes / next follow-up
export async function PATCH(req: Request) {
  try {
    const body = await req.json() as {
      id: string;
      status?: string;
      notes?: string;
      nextFollowUp?: string;
      lastContactedAt?: string;
      rating?: number;
    };

    const updated = await db.recruiter.update({
      where: { id: body.id },
      data: {
        ...(body.status         ? { status: body.status }                            : {}),
        ...(body.notes          ? { notes: body.notes }                              : {}),
        ...(body.nextFollowUp   ? { nextFollowUp: new Date(body.nextFollowUp) }      : {}),
        ...(body.lastContactedAt? { lastContactedAt: new Date(body.lastContactedAt) }: {}),
        ...(body.rating !== undefined ? { rating: body.rating }                      : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Recruiter PATCH error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// POST — log an outreach
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      recruiterId: string;
      channel: string;
      message: string;
    };

    const [outreach] = await Promise.all([
      db.recruiterOutreach.create({
        data: {
          recruiterId: body.recruiterId,
          userId: DEMO_USER_ID,
          channel: body.channel,
          message: body.message,
          sentAt: new Date(),
        },
      }),
      // Update recruiter status → outreach-sent + timestamp
      db.recruiter.update({
        where: { id: body.recruiterId },
        data: {
          status: "outreach-sent",
          lastContactedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json(outreach);
  } catch (error) {
    console.error("Recruiter POST error:", error);
    return NextResponse.json({ error: "Failed to log outreach" }, { status: 500 });
  }
}
