import type { RawJob } from "@/lib/scrapers/types";

/**
 * AI Match Scorer — uses OpenAI gpt-4o-mini to score each job against the user profile.
 * Falls back to a fast heuristic scorer if no API key is set.
 */

export interface UserProfile {
  name: string;
  headline?: string | null;
  summary?: string | null;
  targetRoles: string[];
  targetIndustries: string[];
  targetSalaryMin?: number | null;
  targetSalaryMax?: number | null;
  skills: Array<{ name: string; level: string; category: string }>;
  experiences: Array<{
    company: string;
    title: string;
    description?: string | null;
    isCurrent: boolean;
  }>;
  achievements: Array<{ title: string; metric?: string | null }>;
  openToRemote: boolean;
}

export interface MatchResult {
  score: number;        // 0–100
  reason: string;       // 1–2 sentence explanation
  salaryEst?: number;   // estimated comp if not listed
  strengths: string[];  // top 3 matching factors
  concerns: string[];   // top 1–2 concerns
  applyStrategy: "warm-intro" | "direct-apply" | "build-relationship" | "skip";
}

// ── HEURISTIC SCORER (no API key needed) ─────────────────────────────

const ROLE_TYPE_WEIGHTS: Record<string, number> = {
  "cpo": 100, "co-founder": 95, "vp-product": 90, "vp-growth": 88,
  "ceo": 85, "cmo": 80, "coo": 78, "gm": 75, "vc": 72,
  "consulting": 70, "partner": 68,
};

function heuristicScore(job: RawJob, profile: UserProfile): MatchResult {
  let score = 40; // base
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Role type alignment
  const roleWeight = job.roleType ? ROLE_TYPE_WEIGHTS[job.roleType] ?? 50 : 50;
  const targetRoleLower = profile.targetRoles.map((r) => r.toLowerCase());
  const roleTitleLower = job.title.toLowerCase();

  if (targetRoleLower.some((r) => roleTitleLower.includes(r.split(" ")[0]!.toLowerCase()))) {
    score += 20;
    strengths.push(`Title matches your target role`);
  } else if (roleWeight > 75) {
    score += 10;
  }

  // Skills match
  const descLower = (job.description ?? "").toLowerCase();
  const matchedSkills = profile.skills.filter((s) =>
    descLower.includes(s.name.toLowerCase())
  );
  if (matchedSkills.length >= 4) {
    score += 18;
    strengths.push(`${matchedSkills.length} of your skills mentioned in JD`);
  } else if (matchedSkills.length >= 2) {
    score += 10;
  }

  // Remote preference
  if (profile.openToRemote && job.isRemote) {
    score += 8;
    strengths.push("Remote — matches your preference");
  } else if (!job.isRemote) {
    score -= 5;
    concerns.push("On-site requirement — verify flexibility");
  }

  // Salary
  if (job.salaryMax && profile.targetSalaryMin) {
    if (job.salaryMax >= profile.targetSalaryMin) {
      score += 10;
      strengths.push(`Comp up to $${Math.round(job.salaryMax / 1000)}K meets your target`);
    } else if (job.salaryMax < profile.targetSalaryMin * 0.7) {
      score -= 15;
      concerns.push("Comp may be below target");
    }
  }

  // Experience signal from description
  const seniorityTerms = ["series b", "series c", "growth stage", "scale", "$50m", "$100m", "vc-backed", "funded"];
  const hasSeniority = seniorityTerms.some((t) => descLower.includes(t));
  if (hasSeniority) {
    score += 6;
  }

  // Source quality bonus
  if (["vc-portfolio", "greenhouse"].includes(job.sourcePlatform)) score += 5;
  if (job.sourcePlatform === "hacker-news") score += 3; // startup signal

  score = Math.min(99, Math.max(10, Math.round(score)));

  const reason = score >= 80
    ? `Strong match — role aligns with your ${job.roleType ?? "exec"} background and ${matchedSkills.length > 0 ? `${matchedSkills.length} key skills` : "experience"}. ${job.isRemote ? "Remote-friendly." : ""}`
    : score >= 65
    ? `Good potential — ${matchedSkills.length > 0 ? `${matchedSkills.length} skill overlaps` : "relevant background"}, worth exploring. ${concerns[0] ?? ""}`
    : `Partial match — some relevant experience but ${concerns[0] ?? "role type may differ from target"}.`;

  const applyStrategy: MatchResult["applyStrategy"] =
    score >= 88 ? "warm-intro"
    : score >= 72 ? "direct-apply"
    : score >= 55 ? "build-relationship"
    : "skip";

  return {
    score,
    reason,
    strengths,
    concerns,
    applyStrategy,
    salaryEst: job.salaryMax ?? (score > 75 ? 500000 : 350000),
  };
}

// ── AI SCORER (with OpenAI key) ─────────────────────────────

async function aiScore(job: RawJob, profile: UserProfile, apiKey: string): Promise<MatchResult> {
  const prompt = `You are an executive career advisor scoring job opportunities.

USER PROFILE:
- Name: ${profile.name}
- Headline: ${profile.headline ?? ""}
- Target Roles: ${profile.targetRoles.join(", ")}
- Target Industries: ${profile.targetIndustries.join(", ")}
- Target Salary: $${profile.targetSalaryMin ?? 0}K–$${profile.targetSalaryMax ?? 0}K
- Skills: ${profile.skills.map((s) => `${s.name} (${s.level})`).slice(0, 15).join(", ")}
- Recent Experience: ${profile.experiences.slice(0, 3).map((e) => `${e.title} @ ${e.company}`).join("; ")}
- Key Achievements: ${profile.achievements.slice(0, 3).map((a) => a.metric ?? a.title).join("; ")}

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location ?? "Unknown"} | Remote: ${job.isRemote}
- Source: ${job.sourcePlatform}
- Description: ${(job.description ?? "").slice(0, 1200)}

Score this opportunity 0–100 for this specific person. Return JSON only:
{
  "score": <number 0-100>,
  "reason": "<1-2 sentences why this is/isn't a great fit>",
  "strengths": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "concerns": ["<concern 1>"],
  "applyStrategy": "<warm-intro|direct-apply|build-relationship|skip>",
  "salaryEst": <estimated annual comp as integer>
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  return JSON.parse(data.choices[0]!.message.content) as MatchResult;
}

// ── MAIN EXPORT ─────────────────────────────

export async function scoreJob(
  job: RawJob,
  profile: UserProfile,
  apiKey?: string | null
): Promise<MatchResult> {
  if (apiKey) {
    try {
      return await aiScore(job, profile, apiKey);
    } catch {
      // fallback to heuristic
    }
  }
  return heuristicScore(job, profile);
}

export async function scoreJobsBatch(
  jobs: RawJob[],
  profile: UserProfile,
  apiKey?: string | null,
  onProgress?: (done: number, total: number) => void
): Promise<Array<RawJob & { match: MatchResult }>> {
  const results: Array<RawJob & { match: MatchResult }> = [];

  if (apiKey) {
    // AI scoring: batch in groups of 5 to avoid rate limits
    const BATCH_SIZE = 5;
    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      const scored = await Promise.allSettled(
        batch.map((j) => aiScore(j, profile, apiKey))
      );
      scored.forEach((r, idx) => {
        results.push({
          ...batch[idx]!,
          match: r.status === "fulfilled" ? r.value : heuristicScore(batch[idx]!, profile),
        });
      });
      onProgress?.(Math.min(i + BATCH_SIZE, jobs.length), jobs.length);
    }
  } else {
    // Heuristic scoring is synchronous and instant
    for (const job of jobs) {
      results.push({ ...job, match: heuristicScore(job, profile) });
      onProgress?.(results.length, jobs.length);
    }
  }

  return results.sort((a, b) => b.match.score - a.match.score);
}
