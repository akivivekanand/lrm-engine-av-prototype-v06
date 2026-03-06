interface IndustrySuggestion {
  industryKey: string;
  weeks: number;
  prepWindowDays: number;
  note: string;
  sources: string[];
}

const INDUSTRY_MAP: Array<{ keywords: string[]; result: IndustrySuggestion }> = [
  {
    keywords: ["finance", "banking", "investment", "accounting", "financial"],
    result: {
      industryKey: "finance",
      weeks: 14,
      prepWindowDays: 21,
      note: "Finance cycles are structured and longer. Expect multi-round sequences with behavioral and technical interviews.",
      sources: ["Bureau of Labor Statistics – Occupational Outlook Handbook", "LinkedIn Workforce Report – Financial Services"],
    },
  },
  {
    keywords: ["tech", "technology", "software", "engineering", "developer", "data", "IT", "computer"],
    result: {
      industryKey: "tech",
      weeks: 5,
      prepWindowDays: 14,
      note: "Tech hiring can be sprint-based. Portfolio strength and coding assessments matter early.",
      sources: ["LinkedIn Hiring Insights – Technology Sector", "Glassdoor Interview Duration Data"],
    },
  },
  {
    keywords: ["consulting", "consultant", "advisory", "strategy"],
    result: {
      industryKey: "consulting",
      weeks: 9,
      prepWindowDays: 21,
      note: "Consulting often includes multiple interview rounds and case studies.",
      sources: ["Industry Hiring Reports – Management Consulting", "Bureau of Labor Statistics"],
    },
  },
  {
    keywords: ["healthcare", "medical", "hospital", "clinical", "health", "pharma"],
    result: {
      industryKey: "healthcare",
      weeks: 7,
      prepWindowDays: 14,
      note: "Healthcare timelines vary by credentialing and role type.",
      sources: ["BLS Healthcare Projections", "LinkedIn Workforce Insights – Healthcare"],
    },
  },
  {
    keywords: ["marketing", "advertising", "media", "communications", "PR", "brand"],
    result: {
      industryKey: "marketing",
      weeks: 8,
      prepWindowDays: 14,
      note: "Marketing roles often require portfolio reviews and creative assessments.",
      sources: ["LinkedIn Workforce Insights – Marketing", "Bureau of Labor Statistics"],
    },
  },
  {
    keywords: ["education", "teaching", "teacher", "academic", "professor"],
    result: {
      industryKey: "education",
      weeks: 10,
      prepWindowDays: 14,
      note: "Education hiring follows academic calendars with longer lead times.",
      sources: ["BLS – Education Occupations", "Academic Hiring Reports"],
    },
  },
  {
    keywords: ["retail", "sales", "store", "commerce", "ecommerce"],
    result: {
      industryKey: "retail",
      weeks: 3,
      prepWindowDays: 7,
      note: "Retail hiring is typically fast-paced with shorter interview cycles.",
      sources: ["Bureau of Labor Statistics – Retail Trade", "Industry Hiring Reports"],
    },
  },
];

const DEFAULT_SUGGESTION: IndustrySuggestion = {
  industryKey: "general",
  weeks: 6,
  prepWindowDays: 14,
  note: "General hiring cycles average 6–8 weeks across industries.",
  sources: ["General Labor Market Averages", "Bureau of Labor Statistics"],
};

export type { IndustrySuggestion };

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
