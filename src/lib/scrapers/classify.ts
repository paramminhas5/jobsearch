/**
 * Classify a job title/description into a roleType and detect remote/location.
 * Zero external dependencies — pure string logic.
 */

const EXEC_ROLE_PATTERNS: Array<{ pattern: RegExp; roleType: string }> = [
  { pattern: /\bco[\s-]?founder\b/i,                          roleType: "co-founder" },
  { pattern: /\bchief\s+product\s+officer|CPO\b/i,            roleType: "cpo" },
  { pattern: /\bchief\s+executive|CEO\b/i,                    roleType: "ceo" },
  { pattern: /\bchief\s+marketing|CMO\b/i,                    roleType: "cmo" },
  { pattern: /\bchief\s+operating|COO\b/i,                    roleType: "coo" },
  { pattern: /\bchief\s+growth|CGO\b/i,                       roleType: "vp-growth" },
  { pattern: /\bvp\s+(of\s+)?product\b/i,                     roleType: "vp-product" },
  { pattern: /\bvp\s+(of\s+)?growth\b/i,                      roleType: "vp-growth" },
  { pattern: /\bvp\s+(of\s+)?marketing\b/i,                   roleType: "cmo" },
  { pattern: /\bgeneral\s+manager|GM\b/i,                     roleType: "gm" },
  { pattern: /\bhead\s+of\s+product\b/i,                      roleType: "vp-product" },
  { pattern: /\bhead\s+of\s+growth\b/i,                       roleType: "vp-growth" },
  { pattern: /\bhead\s+of\s+marketing\b/i,                    roleType: "cmo" },
  { pattern: /\bpartner\b|\bprincip(al|le)\b/i,               roleType: "vc" },
  { pattern: /\bventure|investor\b/i,                         roleType: "vc" },
  { pattern: /\bconsult(ant|ing|ancy)\b|\bfractional\b/i,     roleType: "consulting" },
  { pattern: /\bpresident\b/i,                                roleType: "ceo" },
  { pattern: /\bdirector\s+(of\s+)?product\b/i,               roleType: "vp-product" },
  { pattern: /\bdirector\s+(of\s+)?growth\b/i,                roleType: "vp-growth" },
  { pattern: /\bproduct\s+lead\b|\bproduct\s+director\b/i,    roleType: "vp-product" },
];

const TARGET_LOCATIONS = [
  "san francisco", "sf", "bay area", "remote", "new york", "nyc",
  "london", "bangkok", "bombay", "mumbai", "paris", "berlin",
  "hong kong", "dubai", "sydney", "worldwide", "global", "anywhere",
];

const EXEC_KEYWORDS = [
  "chief", "vp ", "vice president", "head of", "director", "partner",
  "co-founder", "cofounder", "president", "principal", "general manager",
  "fractional", "cpo", "ceo", "cmo", "coo", "cgo",
];

export function classifyRoleType(title: string, description?: string | null): string | null {
  const text = `${title} ${description ?? ""}`;
  for (const { pattern, roleType } of EXEC_ROLE_PATTERNS) {
    if (pattern.test(text)) return roleType;
  }
  return null;
}

export function isExecRole(title: string, description?: string | null): boolean {
  const text = title.toLowerCase();
  return EXEC_KEYWORDS.some((kw) => text.includes(kw));
}

export function isTargetLocation(location: string | null, isRemote: boolean): boolean {
  if (isRemote) return true;
  if (!location) return false;
  const loc = location.toLowerCase();
  return TARGET_LOCATIONS.some((t) => loc.includes(t));
}

export function detectRemote(title: string, location: string | null, description: string | null): boolean {
  const text = `${title} ${location ?? ""} ${description ?? ""}`.toLowerCase();
  return /\bremote\b|\banywhere\b|\bworldwide\b|\bglobal\b/.test(text);
}

export function parseSalary(text: string): { min: number | null; max: number | null } {
  // Match patterns like $250K, $250,000, 250k-400k, $250k–$500k
  const matches = text.match(/\$?([\d,]+)\s*[kK]?/g);
  if (!matches || matches.length < 1) return { min: null, max: null };

  const parse = (s: string): number => {
    const n = parseFloat(s.replace(/[$,]/g, ""));
    return s.toLowerCase().includes("k") || n < 2000 ? n * 1000 : n;
  };

  const values = matches.map(parse).filter((n) => n >= 50000 && n <= 5000000);
  if (values.length === 0) return { min: null, max: null };
  if (values.length === 1) return { min: values[0], max: values[0] };
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function detectCompanyStage(description: string | null, tags: string[]): string | null {
  const text = `${description ?? ""} ${tags.join(" ")}`.toLowerCase();
  if (/\bseed\b/.test(text)) return "seed";
  if (/series[\s-]?a\b/.test(text)) return "series-a";
  if (/series[\s-]?b\b/.test(text)) return "series-b";
  if (/series[\s-]?[cd]\b|growth\s+stage|late\s+stage/.test(text)) return "growth";
  if (/\bpublic\b|\bnyse\b|\bnasdaq\b|\bipod\b/.test(text)) return "public";
  return null;
}
