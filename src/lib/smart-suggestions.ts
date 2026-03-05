interface IndustrySuggestion {
  industryKey: string;
  weeks: number;
  note: string;
}

const INDUSTRY_MAP: Array<{ keywords: string[]; result: IndustrySuggestion }> = [
  {
    keywords: ["finance", "banking", "investment", "accounting", "financial"],
    result: { industryKey: "finance", weeks: 14, note: "Finance cycles are structured and longer. Expect multi-round sequences." },
  },
  {
    keywords: ["tech", "technology", "software", "engineering", "developer", "data", "IT", "computer"],
    result: { industryKey: "tech", weeks: 5, note: "Tech hiring can be sprint-based. Portfolio strength matters early." },
  },
  {
    keywords: ["consulting", "consultant", "advisory", "strategy"],
    result: { industryKey: "consulting", weeks: 9, note: "Consulting often includes multiple interview rounds and case studies." },
  },
  {
    keywords: ["healthcare", "medical", "hospital", "clinical", "health", "pharma"],
    result: { industryKey: "healthcare", weeks: 7, note: "Healthcare timelines vary by credentialing and role type." },
  },
  {
    keywords: ["marketing", "advertising", "media", "communications", "PR", "brand"],
    result: { industryKey: "marketing", weeks: 8, note: "Marketing roles often require portfolio reviews and creative assessments." },
  },
];

const DEFAULT_SUGGESTION: IndustrySuggestion = {
  industryKey: "general",
  weeks: 6,
  note: "General hiring cycles average 6-8 weeks.",
};

/** Heuristic keyword matching from free-text input */
export function suggestIndustry(text: string): IndustrySuggestion {
  const lower = text.toLowerCase();
  for (const entry of INDUSTRY_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return entry.result;
    }
  }
  return DEFAULT_SUGGESTION;
}

/** Returns default hiring weeks for an industry key */
export function getDefaultHiringWeeks(industryKey: string): number {
  const match = INDUSTRY_MAP.find((e) => e.result.industryKey === industryKey);
  return match?.result.weeks ?? DEFAULT_SUGGESTION.weeks;
}

/** Returns default processing days: 30 for premium, 120 for standard */
export function getDefaultProcessingDays(processingType: string): number {
  return processingType === "premium" ? 30 : 120;
}

/** Returns suggested buffer days: 21 for RFE, 14 otherwise */
export function suggestBufferDays(optStatus: string): number {
  return optStatus === "rfe" ? 21 : 14;
}
