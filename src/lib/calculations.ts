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
  lastDayToWork: Date;
  applicationAnchor: Date;
  filingWindow: { earliest: Date; latest: Date };
}

/** Chosen Start Date + 90 days */
export function calcLastDayToWork(chosenStartDate: Date): Date {
  return addDays(stripTime(chosenStartDate), 90);
}

/** Program End Date - 60 - 21 = Program End Date - 81 */
export function calcApplicationAnchor(programEndDate: Date): Date {
  return subtractDays(stripTime(programEndDate), 81);
}

/** Filing window: earliest = programEndDate - 90, latest = programEndDate + 60 */
export function calcFilingWindow(programEndDate: Date): { earliest: Date; latest: Date } {
  const d = stripTime(programEndDate);
  return { earliest: subtractDays(d, 90), latest: addDays(d, 60) };
}

/**
 * Updated calculateLRMChain that accepts prepPhaseDays param
 * and computes regulatory anchors.
 */
export function calculateLRMChainV2(params: LRMChainParams): LRMChainResult {
  const grad = stripTime(params.graduationDate);
  const chosen = stripTime(params.chosenStartDate);

  const filingDeadline = calcFilingDeadline(grad);
  const authorizationWall = calcAuthorizationWall(chosen, params.govProcessingDays, params.bufferDays);
  const hiringCyclePeak = calcHiringCyclePeak(authorizationWall, params.hiringWeeks);
  const lrmDate = calcLRMDate(hiringCyclePeak, params.prepPhaseDays);
  const lastDayToWork = calcLastDayToWork(chosen);
  const applicationAnchor = calcApplicationAnchor(grad);
  const filingWindow = calcFilingWindow(grad);

  return {
    graduationDate: grad,
    filingDeadline,
    chosenStartDate: chosen,
    authorizationWall,
    hiringCyclePeak,
    lrmDate,
    lastDayToWork,
    applicationAnchor,
    filingWindow,
  };
}
