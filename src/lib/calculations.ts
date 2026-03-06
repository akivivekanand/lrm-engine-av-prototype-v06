/**
 * Calculations module
 * Only four dates: Program End Date, Chosen Start Date, Last Day to Start Working, LRM.
 */

import {
  stripTime,
  addDays,
  subtractDays,
  daysBetween,
  formatDate,
  getMilestoneStatus,
  type MilestoneStatus,
} from "@/utils/dateCalculator";

export { stripTime, addDays, subtractDays, daysBetween, formatDate, getMilestoneStatus };
export type { MilestoneStatus };

/** Last Day to Start Working = Program End Date + 90 days */
export function calcLastDayToWork(programEndDate: Date): Date {
  return addDays(stripTime(programEndDate), 90);
}

/** LRM = Last Day to Start Working - (hiringWeeks * 7) - prepWindowDays */
export function calcLRM(programEndDate: Date, hiringWeeks: number, prepWindowDays: number): Date {
  const lastDay = calcLastDayToWork(programEndDate);
  return subtractDays(lastDay, hiringWeeks * 7 + prepWindowDays);
}

export interface LRMChainParams {
  programEndDate: Date;
  chosenStartDate: Date;
  hiringWeeks: number;
  prepWindowDays: number;
}

export interface LRMChainResult {
  programEndDate: Date;
  chosenStartDate: Date;
  lastDayToWork: Date;
  lrmDate: Date;
}

export function calculateLRMChainV2(params: LRMChainParams): LRMChainResult {
  const programEnd = stripTime(params.programEndDate);
  const chosen = stripTime(params.chosenStartDate);

  return {
    programEndDate: programEnd,
    chosenStartDate: chosen,
    lastDayToWork: calcLastDayToWork(programEnd),
    lrmDate: calcLRM(programEnd, params.hiringWeeks, params.prepWindowDays),
  };
}
