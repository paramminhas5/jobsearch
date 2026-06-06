import type { RawJob } from "./types";
import { classifyRoleType, detectRemote, detectCompanyStage } from "./classify";

export const LEVER_COMPANIES = [
  "netflix", "airbnb", "lyft", "pinterest", "reddit",
  "canva", "atlassian", "shopify", "twilio", "sendgrid",
  "plaid", "chime", "robinhood", "coinbase", "kraken",
  "duolingo", "headspace", "calm", "strava", "peloton",
  "discord", "slack", "zoom", "asana", "monday",
  "hubspot", "salesforce", "workday", "servicenow",
  "databricks", "snowflake", "confluent", "hashicorp",
  "grafana", "datadog", "pagerduty", "fastly",
  "benchling", "ginkgo", "tempus", "recursion",
];

const EXEC_TITLE_KEYWORDS = [
  "chief", "vp", "vice president", "head of", "director", "partner",
  "co-founder", "president", "principal", "general manager", "fractional",
  "cpo", "ceo", "cmo", "coo", "cgo",
];

function isExecTitle(title: string): boolean {
  const t = title.toLowerCase();
  return EXEC_TITLE_KEYWORDS.some((k) => t.includes(k));
}

export async function scrapeLever(company: string): Promise<RawJob[]> {
  try {
    const url = `https://api.lever.co/v0/postings/${company}?mode=json&limit=250`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CareerOS/1.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as Array<{
      id: string;
      text: string;
      categories: { location?: string; team?: string; commitment?: string };
      description: string;
      descriptionPlain: string;
      hostedUrl: string;
      createdAt: number;
      company?: string;
    }>;

    return (Array.isArray(data) ? data : [])
      .filter((j) => isExecTitle(j.text))
      .map((j) => {
        const loc = j.categories?.location ?? null;
        const isRemote = detectRemote(j.text, loc, j.descriptionPlain ?? null);
        const plain = (j.descriptionPlain ?? j.description ?? "")
          .replace(/<[^>]*>/g, " ")
          .slice(0, 2000);

        return {
          externalId: `lever-${company}-${j.id}`,
          title: j.text,
          company: j.company ?? company,
          location: loc,
          isRemote,
          description: plain,
          salaryMin: null,
          salaryMax: null,
          equityMin: null,
          equityMax: null,
          sourceUrl: j.hostedUrl,
          sourcePlatform: "lever",
          postedAt: j.createdAt ? new Date(j.createdAt) : null,
          tags: [j.categories?.team ?? "", j.categories?.commitment ?? ""].filter(Boolean),
          companyStage: detectCompanyStage(plain, []),
          companySize: null,
          roleType: classifyRoleType(j.text, plain),
        } satisfies RawJob;
      });
  } catch {
    return [];
  }
}

export async function scrapeAllLever(): Promise<RawJob[]> {
  const results = await Promise.allSettled(
    LEVER_COMPANIES.map((c) => scrapeLever(c))
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
