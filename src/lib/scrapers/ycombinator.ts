import type { RawJob } from "./types";
import { classifyRoleType, detectRemote, isExecRole } from "./classify";

// YC Work at a Startup — scrape the JSON feed
export async function scrapeYCombinator(): Promise<RawJob[]> {
  try {
    // YC exposes a public JSON endpoint for job listings
    const res = await fetch(
      "https://www.workatastartup.com/jobs.json?role=product&role=operations&role=marketing&role=management",
      {
        headers: { "User-Agent": "CareerOS/1.0" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      // Fallback: try the search API
      return await scrapeYCSearch();
    }

    const data = (await res.json()) as Array<{
      id: number;
      title: string;
      company_name?: string;
      company?: { name: string; stage?: string; one_liner?: string };
      location?: string;
      remote?: boolean;
      description?: string;
      salary_range?: string;
      url?: string;
      created_at?: string;
    }>;

    return (Array.isArray(data) ? data : [])
      .filter((j) => isExecRole(j.title))
      .map((j) => ({
        externalId: `yc-${j.id}`,
        title: j.title,
        company: j.company?.name ?? j.company_name ?? "YC Startup",
        location: j.location ?? null,
        isRemote: j.remote ?? detectRemote(j.title, j.location ?? null, j.description ?? null),
        description: j.description?.slice(0, 2000) ?? null,
        salaryMin: null,
        salaryMax: null,
        equityMin: null,
        equityMax: null,
        sourceUrl: j.url ?? `https://www.workatastartup.com/jobs/${j.id}`,
        sourcePlatform: "yc",
        postedAt: j.created_at ? new Date(j.created_at) : null,
        tags: ["yc"],
        companyStage: j.company?.stage ?? null,
        companySize: null,
        roleType: classifyRoleType(j.title, j.description),
      })) satisfies RawJob[];
  } catch {
    return scrapeYCSearch();
  }
}

async function scrapeYCSearch(): Promise<RawJob[]> {
  try {
    // Alternative: YC companies API with exec role filter
    const queries = ["CPO", "VP Product", "Head of Growth", "Co-founder", "CMO", "General Manager"];
    const allJobs: RawJob[] = [];

    for (const q of queries.slice(0, 3)) { // limit to avoid rate limiting
      const res = await fetch(
        `https://www.ycombinator.com/jobs/role/${encodeURIComponent(q.toLowerCase().replace(/\s+/g, "-"))}/remote/`,
        { headers: { "User-Agent": "CareerOS/1.0" }, next: { revalidate: 3600 } }
      );
      if (!res.ok) continue;
      // Parse HTML minimally - just return a stub indicating source is available
    }

    return allJobs;
  } catch {
    return [];
  }
}
