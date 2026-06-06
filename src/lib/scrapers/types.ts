export interface RawJob {
  externalId: string;
  title: string;
  company: string;
  location: string | null;
  isRemote: boolean;
  description: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  equityMin: number | null;
  equityMax: number | null;
  sourceUrl: string;
  sourcePlatform: string;
  postedAt: Date | null;
  tags: string[];
  companyStage: string | null;
  companySize: string | null;
  roleType: string | null;
}

export interface ScrapedBatch {
  source: string;
  jobs: RawJob[];
  scrapedAt: Date;
  error?: string;
}
