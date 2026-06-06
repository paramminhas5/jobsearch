export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";
import { OpportunityFeed } from "@/components/opportunities/OpportunityFeed";

async function getOpportunities() {
  const opps = await db.opportunity.findMany({
    where: { userId: DEMO_USER_ID, status: { not: "dismissed" } },
    include: { application: { select: { id: true } } },
    orderBy: { aiMatchScore: "desc" },
  });

  return opps.map((o) => ({
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
  }));
}

export default async function OpportunitiesPage() {
  const opps = await getOpportunities();
  return <OpportunityFeed initialOpps={opps} />;
}
