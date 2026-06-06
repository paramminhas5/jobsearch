import type { RawJob, ScrapedBatch } from "./types";
import { scrapeAllGreenhouse } from "./greenhouse";
import { scrapeAllLever } from "./lever";
import { scrapeHNHiring } from "./hackernews";
import { scrapeRemoteOK } from "./remoteok";
import { scrapeAllVCPortfolios } from "./vcportfolios";
import { isTargetLocation } from "./classify";

export const SOURCES = [
  { id: "greenhouse",   label: "Greenhouse",       fn: scrapeAllGreenhouse },
  { id: "lever",        label: "Lever",             fn: scrapeAllLever },
  { id: "hn",           label: "HN Who's Hiring",  fn: scrapeHNHiring },
  { id: "remoteok",     label: "RemoteOK",          fn: scrapeRemoteOK },
  { id: "vc-portfolio", label: "VC Portfolios",     fn: scrapeAllVCPortfolios },
];

export async function runAllScrapers(): Promise<{
  jobs: RawJob[];
  batches: ScrapedBatch[];
  total: number;
  bySource: Record<string, number>;
}> {
  const batchResults = await Promise.allSettled(
    SOURCES.map(async (source) => {
      const start = Date.now();
      try {
        const jobs = await source.fn();
        return {
          source: source.id,
          jobs,
          scrapedAt: new Date(),
        } as ScrapedBatch;
      } catch (err) {
        return {
          source: source.id,
          jobs: [],
          scrapedAt: new Date(),
          error: err instanceof Error ? err.message : String(err),
        } as ScrapedBatch;
      }
    })
  );

  const batches = batchResults.map((r) =>
    r.status === "fulfilled" ? r.value : { source: "unknown", jobs: [], scrapedAt: new Date(), error: String(r.reason) }
  );

  // Deduplicate by externalId
  const seen = new Set<string>();
  const allJobs: RawJob[] = [];

  for (const batch of batches) {
    for (const job of batch.jobs) {
      if (!seen.has(job.externalId)) {
        seen.add(job.externalId);
        allJobs.push(job);
      }
    }
  }

  // Filter: only target locations, only exec-level titles
  const filtered = allJobs.filter((j) =>
    isTargetLocation(j.location, j.isRemote)
  );

  const bySource: Record<string, number> = {};
  for (const batch of batches) {
    bySource[batch.source] = batch.jobs.length;
  }

  return {
    jobs: filtered,
    batches,
    total: filtered.length,
    bySource,
  };
}

/** Run a single source by id */
export async function runSingleScraper(sourceId: string): Promise<RawJob[]> {
  const source = SOURCES.find((s) => s.id === sourceId);
  if (!source) throw new Error(`Unknown source: ${sourceId}`);
  return source.fn();
}
