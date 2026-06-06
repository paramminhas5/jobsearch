import type { UserProfile } from "./scorer";

export interface ApplyPackage {
  resumeTailored: string;   // Markdown formatted resume tailored to this role
  coverLetter: string;      // 3-paragraph cover letter
  outreachEmail: string;    // Cold outreach OR warm-intro request
  interviewPrepBrief: string; // Key talking points for this company
  applyChecklist: string[]; // Step-by-step apply instructions
}

/**
 * Generate a complete application package for a role.
 * Uses OpenAI if key provided, otherwise returns structured templates.
 */
export async function generateApplyPackage(
  job: {
    title: string;
    company: string;
    description?: string | null;
    sourceUrl: string;
    roleType?: string | null;
    companyStage?: string | null;
  },
  profile: UserProfile,
  apiKey?: string | null
): Promise<ApplyPackage> {
  if (apiKey) {
    return generateWithAI(job, profile, apiKey);
  }
  return generateTemplate(job, profile);
}

async function generateWithAI(
  job: Parameters<typeof generateApplyPackage>[0],
  profile: UserProfile,
  apiKey: string
): Promise<ApplyPackage> {
  const systemPrompt = `You are a world-class executive career coach. Generate tailored, high-quality application materials for senior/C-level roles. Be specific, quantified, and direct. Never use generic phrases like "passionate about" or "results-driven". Write like a top-tier executive, not a job applicant.`;

  const userPrompt = `Generate a complete application package for:

ROLE: ${job.title} at ${job.company}
STAGE: ${job.companyStage ?? "unknown"}
JD: ${(job.description ?? "").slice(0, 1500)}

CANDIDATE:
${profile.name} | ${profile.headline ?? ""}
Experiences: ${profile.experiences.slice(0, 3).map((e) => `${e.title} @ ${e.company}`).join("; ")}
Key wins: ${profile.achievements.slice(0, 5).map((a) => a.metric ?? a.title).join("; ")}
Skills: ${profile.skills.slice(0, 12).map((s) => s.name).join(", ")}

Return JSON with exactly these keys:
{
  "resumeTailored": "<markdown resume tailored to this role — lead with 5 most relevant achievements, emphasize skills mentioned in JD>",
  "coverLetter": "<3 paragraphs: 1) why this company/role now, 2) your #1 relevant achievement, 3) what you'd do in the first 90 days>",
  "outreachEmail": "<concise cold email to hiring manager OR warm intro request template — 4–6 lines max>",
  "interviewPrepBrief": "<5 bullet points: key talking points, likely questions, company research notes>",
  "applyChecklist": ["<step 1>", "<step 2>", "..."]
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2500,
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  return JSON.parse(data.choices[0]!.message.content) as ApplyPackage;
}

function generateTemplate(
  job: Parameters<typeof generateApplyPackage>[0],
  profile: UserProfile
): ApplyPackage {
  const topAchievements = profile.achievements.slice(0, 5);
  const recentRole = profile.experiences[0];
  const keySkills = profile.skills.slice(0, 6).map((s) => s.name).join(", ");

  return {
    resumeTailored: `# ${profile.name}
${profile.headline ?? ""}

## Tailored for: ${job.title} @ ${job.company}

### Key Achievements (Relevant to This Role)
${topAchievements.map((a) => `- **${a.metric ?? a.title}** — ${a.title}`).join("\n")}

### Experience
${profile.experiences
  .slice(0, 3)
  .map((e) => `**${e.title}** · ${e.company}${e.isCurrent ? " (Current)" : ""}`)
  .join("\n")}

### Skills
${keySkills}

_Add your OpenAI key in Settings to generate a fully AI-tailored resume._`,

    coverLetter: `Dear Hiring Team at ${job.company},

I'm reaching out about the ${job.title} role. ${recentRole ? `As ${recentRole.title} at ${recentRole.company}, I` : "I've"} spent the last several years building and scaling products at the intersection of [your key domain]. The opportunity at ${job.company} stands out because [specific reason — customize this].

${topAchievements[0] ? `My most relevant achievement: ${topAchievements[0].metric ?? topAchievements[0].title}. This directly translates to what you need: a leader who can [key requirement from JD].` : "My background in scaling from 0→1 and then driving growth through product-led and market expansion strategies is directly applicable here."}

In my first 90 days I'd focus on: (1) deeply understanding your users and current product–market fit, (2) auditing the roadmap against strategic goals, and (3) building the team trust needed to execute. I'd love to discuss what success looks like for you.

${profile.name}

_Powered by Career OS. Add OpenAI key in Settings for AI-generated, fully personalized letters._`,

    outreachEmail: `Subject: ${job.title} role — ${profile.name}

Hi [Name],

I came across the ${job.title} opening at ${job.company} and wanted to reach out directly. My background: ${recentRole?.title ?? "executive"} at ${recentRole?.company ?? "VC-backed startups"}, with [key metric]. I think there's a strong fit given [specific reason].

Happy to share more context — 15 min this week?

${profile.name}`,

    interviewPrepBrief: `**Interview Prep: ${job.title} @ ${job.company}**

• **Your #1 story**: ${topAchievements[0]?.title ?? "Your strongest quantified win"} — lead every question here
• **Their likely priorities**: ${job.companyStage === "seed" ? "0→1 velocity, founder-fit" : "scaling GTM, org design, roadmap prioritization"}
• **Questions to ask**: How does product interact with the board? What does success in 12 months look like? What's the one thing that keeps the CEO up at night?
• **Research**: Recent funding round, key hires, product positioning vs competitors, founder background
• **Watch for**: Unclear decision-making authority, missing exec team context, misaligned comp expectations`,

    applyChecklist: [
      `Research ${job.company}: funding history, recent news, CEO background`,
      `Check if you have a warm connection via LinkedIn 2nd-degree or VC network`,
      `Customize the cover letter with a specific insight about the company`,
      `Apply via: ${job.sourceUrl}`,
      `Follow up after 1 week if no response`,
      `Add to pipeline in Career OS under "Applied"`,
    ],
  };
}
