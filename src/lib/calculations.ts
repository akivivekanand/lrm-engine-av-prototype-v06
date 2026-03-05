/**
 * Calculations module — extends src/utils/dateCalculator.ts
 * All date math uses local timezone, date-only (no time component).
 */

import {
  stripTime,
  addDays,
  subtractDays,
  daysBetween,
  formatDate,
  getMilestoneStatus,
  type LRMChain,
  type MilestoneStatus,
} from "@/utils/dateCalculator";

// Re-export everything from dateCalculator
export { stripTime, addDays, subtractDays, daysBetween, formatDate, getMilestoneStatus };
export type { LRMChain, MilestoneStatus };

/** Graduation date + 60 days */
export function calcFilingDeadline(graduationDate: Date): Date {
  return addDays(stripTime(graduationDate), 60);
}

/** chosenStartDate - (govProcessingDays + bufferDays) */
export function calcAuthorizationWall(
  chosenStartDate: Date,
  govProcessingDays: number,
  bufferDays: number
): Date {
  return subtractDays(stripTime(chosenStartDate), govProcessingDays + bufferDays);
}

/** authorizationWall - (hiringWeeks * 7) */
export function calcHiringCyclePeak(authorizationWall: Date, hiringWeeks: number): Date {
  return subtractDays(authorizationWall, hiringWeeks * 7);
}

/** hiringCyclePeak - prepPhaseDays */
export function calcLRMDate(hiringCyclePeak: Date, prepPhaseDays: number): Date {
  return subtractDays(hiringCyclePeak, prepPhaseDays);
}

export interface LRMChainParams {
  graduationDate: Date;
  chosenStartDate: Date;
  govProcessingDays: number;
  bufferDays: number;
  hiringWeeks: number;
  prepPhaseDays: number;
}

export interface LRMChainResult {
  graduationDate: Date;
  filingDeadline: Date;
  chosenStartDate: Date;
  authorizationWall: Date;
  hiringCyclePeak: Date;
  lrmDate: Date;
}

/**
 * Updated calculateLRMChain that accepts prepPhaseDays param
 * instead of hardcoding 7.
 */
export function calculateLRMChainV2(params: LRMChainParams): LRMChainResult {
  const grad = stripTime(params.graduationDate);
  const chosen = stripTime(params.chosenStartDate);

  const filingDeadline = calcFilingDeadline(grad);
  const authorizationWall = calcAuthorizationWall(chosen, params.govProcessingDays, params.bufferDays);
  const hiringCyclePeak = calcHiringCyclePeak(authorizationWall, params.hiringWeeks);
  const lrmDate = calcLRMDate(hiringCyclePeak, params.prepPhaseDays);

  return {
    graduationDate: grad,
    filingDeadline,
    chosenStartDate: chosen,
    authorizationWall,
    hiringCyclePeak,
    lrmDate,
  };
}
