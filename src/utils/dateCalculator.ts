/**
 * All date math uses local timezone, date-only (no time component).
 */

function localDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

function stripTime(date: Date): Date {
  return localDate(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(a: Date, b: Date): number {
  const aStripped = stripTime(a);
  const bStripped = stripTime(b);
  return Math.round((bStripped.getTime() - aStripped.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface LRMChain {
  graduationDate: Date;
  filingDeadline: Date;
  eadStartDate: Date;
  authorizationWall: Date;
  hiringCyclePeak: Date;
  lrmDate: Date;
}

export function calculateLRMChain(
  graduationDate: Date,
  eadStartDate: Date,
  processingDays: number,
  bufferDays: number,
  hiringWeeks: number
): LRMChain {
  const grad = stripTime(graduationDate);
  const ead = stripTime(eadStartDate);
  const filingDeadline = addDays(grad, 60);
  const authorizationWall = subtractDays(ead, processingDays + bufferDays);
  const hiringCyclePeak = subtractDays(authorizationWall, hiringWeeks * 7);
  const lrmDate = subtractDays(hiringCyclePeak, 7);

  return {
    graduationDate: grad,
    filingDeadline,
    eadStartDate: ead,
    authorizationWall,
    hiringCyclePeak,
    lrmDate,
  };
}

export type MilestoneStatus = "on-track" | "compression" | "crisis";

export function getMilestoneStatus(milestoneDate: Date): MilestoneStatus {
  const today = stripTime(new Date());
  const diff = daysBetween(today, milestoneDate);
  if (diff <= 0) return "crisis";
  if (diff <= 14) return "compression";
  return "on-track";
}

export { addDays, subtractDays, stripTime, daysBetween, formatDate };
