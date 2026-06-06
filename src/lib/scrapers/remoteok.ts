import type { RawJob } from "./types";
import { classifyRoleType, detectCompanyStage } from "./classify";

const EXEC_TAGS = ["exec", "senior", "lead", "cto", "ceo", "cpo", "vp", "head", "director", "principal", "chief", "founder", "manager", "officer"];

export async function scrapeRemoteOK(): Promise<RawJob[]> {
  try {
    const res = await fetch("https://remoteok.com/json", {
      headers: {
        "User-Agent": "CareerOS/1.0 (+https://careeros.io)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as Array<{
      slug?: string;
      id?: string | number;
      position?: string;
      company?: string;
      location?: string;
      description?: string;
      tags?: string[];
      url?: string;
      apply_url?: string;
      date?: string;
      epoch?: number;
      salary_min?: number;
      salary_max?: number;
    }>;

    // Skip the first element (it's the legal/meta object)
    return data
      .slice(1)
      .filter((j) => {
        if (!j.position || !j.company) return false;
        const titleLower = j.position.toLowerCase();
        const tagsLower = (j.tags ?? []).map((t) => t.toLowerCase());
        return (
          EXEC_TAGS.some((t) => titleLower.includes(t)) ||
          EXEC_TAGS.some((t) => tagsLower.includes(t))
        );
      })
      .map((j) => ({
        externalId: `remoteok-${j.slug ?? j.id}`,
        title: j.position!,
        company: j.company!,
        location: j.location ?? "Remote",
        isRemote: true,
        description: j.description?.replace(/<[^>]*>/g, " ").slice(0, 2000) ?? null,
        salaryMin: j.salary_min ?? null,
        salaryMax: j.salary_max ?? null,
        equityMin: null,
        equityMax: null,
        sourceUrl: j.url ?? j.apply_url ?? `https://remoteok.com/${j.slug}`,
        sourcePlatform: "remoteok",
        postedAt: j.date ? new Date(j.date) : j.epoch ? new Date(j.epoch * 1000) : null,
        tags: j.tags ?? [],
        companyStage: detectCompanyStage(j.description ?? null, j.tags ?? []),
        companySize: null,
        roleType: classifyRoleType(j.position!, j.description),
      })) satisfies RawJob[];
  } catch {
    return [];
  }
}
