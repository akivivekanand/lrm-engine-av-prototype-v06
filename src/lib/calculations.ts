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

/** Last Day to Start Working = Chosen Start Date + 90 days */
export function calcLastDayToWork(chosenStartDate: Date): Date {
  return addDays(stripTime(chosenStartDate), 90);
}

/** LRM = Last Day to Start Working - (hiringWeeks * 7) - prepWindowDays */
export function calcLRM(chosenStartDate: Date, hiringWeeks: number, prepWindowDays: number): Date {
  const lastDay = calcLastDayToWork(chosenStartDate);
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
    lastDayToWork: calcLastDayToWork(chosen),
    lrmDate: calcLRM(chosen, params.hiringWeeks, params.prepWindowDays),
  };
}
