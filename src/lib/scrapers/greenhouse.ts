import type { RawJob } from "./types";
import { classifyRoleType, detectRemote, detectCompanyStage } from "./classify";

// Top exec-hiring companies on Greenhouse — curated for CPO/VP/C-level roles
export const GREENHOUSE_COMPANIES = [
  "stripe", "notion", "figma", "linear", "vercel", "clerk", "resend",
  "supabase", "planetscale", "openai", "anthropic", "mistral",
  "airtable", "retool", "rippling", "brex", "ramp", "mercury",
  "scale", "cohere", "weights-biases", "huggingface",
  "lattice", "deel", "remote", "gusto", "personio",
  "mixpanel", "amplitude", "segment", "heap",
  "intercom", "zendesk", "front", "linear",
  "loom", "pitch", "miro", "coda", "roam",
  "substack", "beehiiv", "ghost",
  "sequoia", "a16z", "greylock",
];

const EXEC_TITLE_KEYWORDS = [
  "chief", "vp", "vice president", "head of", "director", "partner",
  "co-founder", "president", "principal", "general manager", "fractional",
  "cpo", "ceo", "cmo", "coo", "cgo", "lead",
];

function isExecTitle(title: string): boolean {
  const t = title.toLowerCase();
  return EXEC_TITLE_KEYWORDS.some((k) => t.includes(k));
}

export async function scrapeGreenhouse(company: string): Promise<RawJob[]> {
  try {
    const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CareerOS/1.0 (+https://careeros.io)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      jobs: Array<{
        id: number;
        title: string;
        location: { name: string };
        absolute_url: string;
        content?: string;
        updated_at: string;
        first_published: string;
        company_name?: string;
      }>;
    };

    return (data.jobs ?? [])
      .filter((j) => isExecTitle(j.title))
      .map((j) => {
        const isRemote = detectRemote(j.title, j.location?.name ?? null, j.content ?? null);
        return {
          externalId: `greenhouse-${company}-${j.id}`,
          title: j.title,
          company: j.company_name ?? company,
          location: j.location?.name ?? null,
          isRemote,
          description: j.content?.replace(/<[^>]*>/g, " ").slice(0, 2000) ?? null,
          salaryMin: null,
          salaryMax: null,
          equityMin: null,
          equityMax: null,
          sourceUrl: j.absolute_url,
          sourcePlatform: "greenhouse",
          postedAt: j.first_published ? new Date(j.first_published) : null,
          tags: [],
          companyStage: detectCompanyStage(j.content ?? null, []),
          companySize: null,
          roleType: classifyRoleType(j.title, j.content),
        } satisfies RawJob;
      });
  } catch {
    return [];
  }
}

export async function scrapeAllGreenhouse(): Promise<RawJob[]> {
  const results = await Promise.allSettled(
    GREENHOUSE_COMPANIES.map((c) => scrapeGreenhouse(c))
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
