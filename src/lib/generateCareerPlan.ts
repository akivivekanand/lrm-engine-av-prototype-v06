import { LRMChainResult, formatDate, daysBetween, stripTime } from "@/lib/calculations";
import { generateDailyTasks, generateWeeklyTasks, generateMonthlyTasks, type TaskPeriod } from "@/lib/taskEngine";
import content from "@/data/content.json";

export interface ActionTask {
  id: string;
  task: string;
  category: string;
  priority?: "high" | "medium" | "low";
}

export interface CareerPlan {
  timelineIntelligence: string[];
  strategicGuidance: string[];
  marketIntelligence?: {
    summary: string;
    sources: string[];
    adjustedHiringCycleWeeks: number;
  };
  actionPlan: {
    daily: TaskPeriod[];
    weekly: TaskPeriod[];
    monthly: TaskPeriod[];
    allImmediate: ActionTask[];
    allShortTerm: ActionTask[];
    allLongTerm: ActionTask[];
  };
  resourceVault: {
    templates: typeof content.templates;
    prompts: typeof content.genAiPromptExamples;
    aiTemplates?: { name: string; subject: string; body: string }[];
    aiPrompts?: { label: string; prompt: string }[];
  };
}

export interface PlanInput {
  chain: LRMChainResult;
  industryText: string;
  hiringWeeks: number;
  prepWindowDays: number;
  optStatus: string;
  enabledModules?: string[];
  personalGoals?: string;
}

export async function generateCareerPlan(input: PlanInput): Promise<CareerPlan> {
  const { chain, industryText, hiringWeeks, prepWindowDays, optStatus, enabledModules = [], personalGoals = "" } = input;
  const today = stripTime(new Date());
  const daysToLRM = daysBetween(today, chain.lrmDate);

  const payload = {
    optStatus,
    programEndDate: formatDate(chain.programEndDate),
    chosenStartDate: formatDate(chain.chosenStartDate),
    industry: industryText || "General",
    hiringCycleWeeks: hiringWeeks,
    prepWindowDays,
    lrmDate: formatDate(chain.lrmDate),
    lastDayToStartWorking: formatDate(chain.lastDayToWork),
    daysToLRM,
    enabledModules,
    personalGoals,
  };

  const response = await fetch(
    "https://gxgsxoeftaqcpbjmsacn.supabase.co/functions/v1/generate-career-plan",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4Z3N4b2VmdGFxY3Biam1zYWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjkxMzAsImV4cCI6MjA4ODY0NTEzMH0.BhM-uy2_-cE9eNyJ03sw6J5pKaGlLtcuNf0W0FCy4kQ`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!data.success) throw new Error(data.error || "Generation failed");

  const p = data.plan;
  const startDate = chain.lrmDate.getTime() > today.getTime() ? today : chain.lrmDate;

  return {
    timelineIntelligence: p.timelineIntelligence,
    strategicGuidance: p.strategicGuidance,
    marketIntelligence: p.marketIntelligence,
    actionPlan: {
      daily: p.actionPlan.daily,
      weekly: p.actionPlan.weekly,
      monthly: p.actionPlan.monthly,
      allImmediate: p.actionPlan.allImmediate,
      allShortTerm: p.actionPlan.allShortTerm,
      allLongTerm: p.actionPlan.allLongTerm,
    },
    resourceVault: {
      templates: content.templates,
      prompts: content.genAiPromptExamples,
      aiTemplates: p.resourceVault.aiTemplates,
      aiPrompts: p.resourceVault.aiPrompts,
    },
  };
}