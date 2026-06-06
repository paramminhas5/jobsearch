export type ProfileScore = {
  total: number;
  breakdown: {
    basics: number;
    experience: number;
    skills: number;
    achievements: number;
    brand: number;
  };
  suggestions: string[];
};

export type OpportunityWithScore = {
  id: string;
  title: string;
  company: string;
  companyStage?: string | null;
  location?: string | null;
  isRemote: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  aiMatchScore?: number | null;
  aiMatchReason?: string | null;
  sourcePlatform?: string | null;
  roleType?: string | null;
  status: string;
  discoveredAt: Date;
};

export type PipelineStage = {
  id: string;
  label: string;
  color: string;
  count: number;
  applications: ApplicationCard[];
};

export type ApplicationCard = {
  id: string;
  opportunityId: string;
  company: string;
  title: string;
  stage: string;
  aiMatchScore?: number | null;
  nextActionDate?: Date | null;
  nextActionNote?: string | null;
  appliedAt?: Date | null;
  salaryMax?: number | null;
};

export type BrandPostDraft = {
  id: string;
  platform: string;
  contentType: string;
  topic?: string | null;
  draft: string;
  status: string;
  scheduledFor?: Date | null;
  publishedAt?: Date | null;
  createdAt: Date;
};

export type GrowthTaskItem = {
  id: string;
  category: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  dueDate?: Date | null;
  relatedSkill?: string | null;
  estimatedHours?: number | null;
};

export type DashboardStats = {
  profileScore: number;
  newOpportunities: number;
  activeApplications: number;
  pendingGrowthTasks: number;
  brandPostsDue: number;
  topMatch?: OpportunityWithScore | null;
};
