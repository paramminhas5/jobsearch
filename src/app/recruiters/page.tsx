export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { RecruiterBoard } from "@/components/recruiters/RecruiterBoard";

async function getRecruiters() {
  const recruiters = await db.recruiter.findMany({
    where: { isActive: true },
    include: {
      outreaches: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: [{ tier: "asc" }, { firm: "asc" }],
  });

  return recruiters.map(r => ({
    id: r.id,
    name: r.name,
    title: r.title,
    firm: r.firm,
    firmType: r.firmType,
    tier: r.tier,
    rolesFocus: r.rolesFocus,
    stagesFocus: r.stagesFocus,
    industriesFocus: r.industriesFocus,
    geoFocus: r.geoFocus,
    email: r.email,
    linkedinUrl: r.linkedinUrl,
    twitterUrl: r.twitterUrl,
    website: r.website,
    firmWebsite: r.firmWebsite,
    approachMethod: r.approachMethod,
    approachScript: r.approachScript,
    insiderNote: r.insiderNote,
    placedRoles: r.placedRoles,
    status: r.status,
    lastContactedAt: r.lastContactedAt?.toISOString() ?? null,
    nextFollowUp: r.nextFollowUp?.toISOString() ?? null,
    notes: r.notes,
    rating: r.rating,
    outreaches: r.outreaches.map(o => ({
      id: o.id,
      channel: o.channel,
      sentAt: o.sentAt?.toISOString() ?? null,
      repliedAt: o.repliedAt?.toISOString() ?? null,
      outcome: o.outcome,
    })),
  }));
}

export default async function RecruitersPage() {
  const recruiters = await getRecruiters();
  return <RecruiterBoard initialRecruiters={recruiters} />;
}
