import type { RawJob } from "./types";
import { classifyRoleType, detectRemote, isExecRole } from "./classify";

// HN "Who is hiring?" thread IDs — keep this updated monthly
// Format: YYYY-MM -> threadId
const HN_HIRING_THREADS: Record<string, number> = {
  "2026-06": 47601859, // June 2026 (April thread id from search - update monthly)
  "2026-05": 47045428,
  "2026-04": 47601859,
  "2026-01": 46466074,
};

function getCurrentThreadId(): number {
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  // Return most recent available thread
  const keys = Object.keys(HN_HIRING_THREADS).sort().reverse();
  for (const k of keys) {
    if (k <= key) return HN_HIRING_THREADS[k]!;
  }
  return HN_HIRING_THREADS["2026-06"]!;
}

interface HNItem {
  id: number;
  text?: string;
  by?: string;
  time?: number;
  kids?: number[];
}

export async function scrapeHNHiring(): Promise<RawJob[]> {
  try {
    const threadId = getCurrentThreadId();
    const threadRes = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${threadId}.json`,
      { next: { revalidate: 7200 } }
    );
    if (!threadRes.ok) return [];

    const thread = (await threadRes.json()) as HNItem;
    const commentIds = (thread.kids ?? []).slice(0, 200); // top 200 comments

    // Fetch comments in batches of 20
    const batches: number[][] = [];
    for (let i = 0; i < commentIds.length; i += 20) {
      batches.push(commentIds.slice(i, i + 20));
    }

    const allComments: HNItem[] = [];
    for (const batch of batches) {
      const results = await Promise.allSettled(
        batch.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            next: { revalidate: 7200 },
          }).then((r) => r.json() as Promise<HNItem>)
        )
      );
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value?.text) {
          allComments.push(r.value);
        }
      });
    }

    return allComments
      .filter((c) => {
        if (!c.text) return false;
        const text = c.text.toLowerCase();
        return isExecRole(text) || /\bcpo\b|\bvp\b|\bco-founder\b|\bcmo\b|\bcoo\b|\bhead of\b|\bdirector\b/.test(text);
      })
      .map((c) => {
        const raw = c.text!.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;/g, "'");

        // Extract company name — usually first | segment or first line
        const firstLine = raw.split(/\n|\|/)[0]?.trim() ?? "";
        const companyMatch = firstLine.match(/^([^|–\-–]+)/);
        const company = companyMatch?.[1]?.trim().slice(0, 60) ?? "Company via HN";

        // Extract location
        const locMatch = raw.match(/\b(remote|sf|san francisco|new york|nyc|london|berlin|paris|hong kong|dubai|sydney|singapore|mumbai|bombay|bangkok)\b/i);
        const location = locMatch?.[0] ?? null;
        const isRemote = detectRemote("", location, raw);

        // Extract title
        const titleMatch = raw.match(/\b(CPO|VP\s+\w+|Head\s+of\s+\w+|Director\s+of\s+\w+|Co-?[Ff]ounder|Chief\s+\w+\s+Officer|CMO|COO|CEO|General\s+Manager)\b/);
        const title = titleMatch?.[0] ?? "Executive Role";

        return {
          externalId: `hn-${c.id}`,
          title,
          company,
          location,
          isRemote,
          description: raw.slice(0, 2000),
          salaryMin: null,
          salaryMax: null,
          equityMin: null,
          equityMax: null,
          sourceUrl: `https://news.ycombinator.com/item?id=${c.id}`,
          sourcePlatform: "hacker-news",
          postedAt: c.time ? new Date(c.time * 1000) : null,
          tags: ["hn", "startup"],
          companyStage: null,
          companySize: null,
          roleType: classifyRoleType(title, raw),
        } satisfies RawJob;
      });
  } catch {
    return [];
  }
}
