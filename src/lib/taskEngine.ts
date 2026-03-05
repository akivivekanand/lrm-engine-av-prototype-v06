import tasks from "@/data/tasks.json";
import { addDays } from "@/utils/dateCalculator";
import { format } from "date-fns";

export interface TaskPeriod {
  period: string;
  tasks: string[];
}

function pickTasks(pool: string[], count: number, seed: number): string[] {
  const result: string[] = [];
  const len = pool.length;
  for (let i = 0; i < count; i++) {
    result.push(pool[(seed + i) % len]);
  }
  return result;
}

function dateSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function generateDailyTasks(startDate: Date, days = 10): TaskPeriod[] {
  const result: TaskPeriod[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(startDate, i);
    const seed = dateSeed(day);
    result.push({
      period: format(day, "EEE, MMM d"),
      tasks: pickTasks(tasks.dailyOptions, 3, seed),
    });
  }
  return result;
}

export function generateWeeklyTasks(startDate: Date, weeks = 8): TaskPeriod[] {
  const result: TaskPeriod[] = [];
  for (let i = 0; i < weeks; i++) {
    const weekStart = addDays(startDate, i * 7);
    const seed = dateSeed(weekStart) + 1000;
    result.push({
      period: `Week ${i + 1} (${format(weekStart, "MMM d")})`,
      tasks: pickTasks(tasks.weeklyOptions, 3, seed),
    });
  }
  return result;
}

export function generateMonthlyTasks(startDate: Date, months = 3): TaskPeriod[] {
  const result: TaskPeriod[] = [];
  for (let i = 0; i < months; i++) {
    const monthStart = addDays(startDate, i * 30);
    const seed = dateSeed(monthStart) + 2000;
    result.push({
      period: `Month ${i + 1} (${format(monthStart, "MMM d")})`,
      tasks: pickTasks(tasks.monthlyOptions, 5, seed),
    });
  }
  return result;
}
