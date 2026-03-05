import content from "@/data/content.json";

type IndustryKey = keyof typeof content.industrySnapshots;

/** Returns default hiring weeks for an industry from content.json */
export function getDefaultHiringWeeks(industry: string): number {
  const key = industry as IndustryKey;
  return content.industrySnapshots[key]?.weeks ?? content.industrySnapshots.general.weeks;
}

/** Returns default processing days: 30 for premium, 120 for standard */
export function getDefaultProcessingDays(processingType: string): number {
  return processingType === "premium" ? 30 : 120;
}

/** Returns suggested buffer days: 21 for RFE, 14 otherwise */
export function suggestBufferDays(optStatus: string): number {
  return optStatus === "rfe" ? 21 : 14;
}
