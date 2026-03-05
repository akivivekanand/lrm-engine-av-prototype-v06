/**
 * Calculations module -- extends src/utils/dateCalculator.ts
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

/** Program End Date + 60 days */
export function calcLastDateToApply(programEndDate: Date): Date {
  return addDays(stripTime(programEndDate), 60);
}

/** Program End Date - 90 days */
export function calcEarliestDateToApply(programEndDate: Date): Date {
  return subtractDays(stripTime(programEndDate), 90);
}

/** Chosen Start Date - (govProcessingDays + bufferDays) */
export function calcHiringCompletionDeadline(
  chosenStartDate: Date,
  govProcessingDays: number,
  bufferDays: number
): Date {
  return subtractDays(stripTime(chosenStartDate), govProcessingDays + bufferDays);
}

/** Chosen Start Date + 90 days */
export function calcLastDayToWork(chosenStartDate: Date): Date {
  return addDays(stripTime(chosenStartDate), 90);
}

/**
 * LRM = Last Day to Start Working - (hiringWeeks * 7) - 14
 * Expands to: (Chosen Start Date + 90) - (hiringWeeks * 7) - 14
 */
export function calcLRM(chosenStartDate: Date, hiringWeeks: number): Date {
  const lastDay = calcLastDayToWork(chosenStartDate);
  return subtractDays(lastDay, hiringWeeks * 7 + 14);
}

export interface LRMChainParams {
  programEndDate: Date;
  chosenStartDate: Date;
  govProcessingDays: number;
  bufferDays: number;
  hiringWeeks: number;
}

export interface LRMChainResult {
  programEndDate: Date;
  lastDateToApply: Date;
  earliestDateToApply: Date;
  chosenStartDate: Date;
  hiringCompletionDeadline: Date;
  lastDayToWork: Date;
  lrmDate: Date;
}

export function calculateLRMChainV2(params: LRMChainParams): LRMChainResult {
  const programEnd = stripTime(params.programEndDate);
  const chosen = stripTime(params.chosenStartDate);

  return {
    programEndDate: programEnd,
    lastDateToApply: calcLastDateToApply(programEnd),
    earliestDateToApply: calcEarliestDateToApply(programEnd),
    chosenStartDate: chosen,
    hiringCompletionDeadline: calcHiringCompletionDeadline(chosen, params.govProcessingDays, params.bufferDays),
    lastDayToWork: calcLastDayToWork(chosen),
    lrmDate: calcLRM(chosen, params.hiringWeeks),
  };
}
