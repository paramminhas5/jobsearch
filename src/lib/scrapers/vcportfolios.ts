import type { RawJob } from "./types";
import { classifyRoleType, detectRemote, isExecRole } from "./classify";

/**
 * VC Portfolio Job Boards
 * These use Getro (the platform powering most VC job boards).
 * Getro exposes a public JSON API: https://{board}.getro.com/jobs.json
 */

const VC_BOARDS = [
  { name: "a16z",       url: "https://jobs.a16z.com/jobs.json",        label: "a16z Portfolio" },
  { name: "accel",      url: "https://jobs.accel.com/jobs.json",       label: "Accel Portfolio" },
  { name: "sequoia",    url: "https://jobs.sequoiacap.com/jobs.json",   label: "Sequoia Portfolio" },
  { name: "lightspeed", url: "https://jobs.lsvp.com/jobs.json",        label: "Lightspeed Portfolio" },
  { name: "ycombinator",url: "https://jobs.ycombinator.com/jobs.json", label: "YC Portfolio" },
];

interface GetroJob {
  id: number | string;
  title: string;
  organization?: { name?: string; stage?: string };
  locations?: Array<{ name: string }>;
  remote?: boolean;
  description?: string;
  url?: string;
  created_at?: string;
  tags?: Array<{ name: string }>;
  salary?: string;
}

export async function scrapeVCPortfolio(
  board: { name: string; url: string; label: string }
): Promise<RawJob[]> {
  try {
    // Try Getro API format
    const res = await fetch(board.url, {
      headers: {
        "User-Agent": "CareerOS/1.0 (+https://careeros.io)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const data = (await res.json()) as { jobs?: GetroJob[] } | GetroJob[];
    const jobs: GetroJob[] = Array.isArray(data) ? data : data.jobs ?? [];

    return jobs
      .filter((j) => isExecRole(j.title))
      .map((j) => {
        const location = j.locations?.[0]?.name ?? null;
        const isRemote = j.remote ?? detectRemote(j.title, location, j.description ?? null);
        const tags = j.tags?.map((t) => t.name) ?? [];

        return {
          externalId: `vc-${board.name}-${j.id}`,
          title: j.title,
          company: j.organization?.name ?? "Portfolio Company",
          location,
          isRemote,
          description: j.description?.replace(/<[^>]*>/g, " ").slice(0, 2000) ?? null,
          salaryMin: null,
          salaryMax: null,
          equityMin: null,
          equityMax: null,
          sourceUrl: j.url ?? `https://${board.name}.com`,
          sourcePlatform: "vc-portfolio",
          postedAt: j.created_at ? new Date(j.created_at) : null,
          tags: [...tags, board.name],
          companyStage: j.organization?.stage ?? null,
          companySize: null,
          roleType: classifyRoleType(j.title, j.description),
        } satisfies RawJob;
      });
  } catch {
    return [];
  }
}

export async function scrapeAllVCPortfolios(): Promise<RawJob[]> {
  const results = await Promise.allSettled(VC_BOARDS.map((b) => scrapeVCPortfolio(b)));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
