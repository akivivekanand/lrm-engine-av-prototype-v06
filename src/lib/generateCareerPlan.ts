import { LRMChainResult, formatDate, daysBetween, stripTime, getMilestoneStatus } from "@/lib/calculations";
import { generateDailyTasks, generateWeeklyTasks, generateMonthlyTasks, type TaskPeriod } from "@/lib/taskEngine";
import content from "@/data/content.json";

export interface CareerPlan {
  timelineIntelligence: string[];
  strategicGuidance: string[];
  actionPlan: {
    daily: TaskPeriod[];
    weekly: TaskPeriod[];
    monthly: TaskPeriod[];
  };
  resourceVault: {
    templates: typeof content.templates;
    prompts: typeof content.genAiPromptExamples;
  };
}

interface PlanInput {
  chain: LRMChainResult;
  industryText: string;
  hiringWeeks: number;
  prepWindowDays: number;
  optStatus: string;
}

export function generateCareerPlan(input: PlanInput): CareerPlan {
  const { chain, industryText, hiringWeeks, prepWindowDays, optStatus } = input;
  const today = stripTime(new Date());
  const status = getMilestoneStatus(chain.lrmDate);
  const daysToLRM = daysBetween(today, chain.lrmDate);
  const daysToLastDay = daysBetween(today, chain.lastDayToWork);
  const industry = industryText || "your target industry";

  // Timeline Intelligence
  const timelineIntelligence: string[] = [
    `Your Last Responsible Moment (LRM) is ${formatDate(chain.lrmDate)}, which is ${daysToLRM > 0 ? `${daysToLRM} days from today` : `${Math.abs(daysToLRM)} days past`}.`,
    `The LRM is calculated by taking your Last Day to Start Working (${formatDate(chain.lastDayToWork)}) and subtracting your ${hiringWeeks}-week hiring cycle and ${prepWindowDays}-day preparation window.`,
    `For ${industry}, the typical hiring cycle runs approximately ${hiringWeeks} weeks from initial application to offer acceptance.`,
    `Your Program End Date is ${formatDate(chain.programEndDate)}. Under OPT regulations, you must begin employment within 90 days of this date. Your absolute deadline is ${formatDate(chain.lastDayToWork)}.`,
    daysToLRM > 30
      ? `You have a comfortable buffer. Use this time strategically to build relationships and refine your application materials before the hiring cycle intensifies.`
      : daysToLRM > 0
        ? `Your timeline is compressed. Prioritize active applications and direct outreach over passive job board browsing.`
        : `Your LRM has passed. Shift to an emergency cadence: apply daily, leverage every contact, and consider broadening your target roles and industries.`,
  ];

  // Strategic Guidance
  const strategicGuidance: string[] = [];

  if (status === "on-track") {
    strategicGuidance.push(
      `You are currently on track. Focus on building a strong pipeline of opportunities in ${industry} while maintaining consistent daily activity.`,
      `Allocate your preparation window to targeted skill-building, portfolio refinement, and mock interviews before entering active application mode.`,
      `Aim for 3 to 5 quality applications per week rather than high-volume submissions. Tailor each resume and cover letter to the specific role.`,
    );
  } else if (status === "compression") {
    strategicGuidance.push(
      `Your timeline is compressed. Your LRM is approaching within 14 days. Shift from preparation mode to active execution immediately.`,
      `Prioritize warm introductions and referrals over cold applications. Reach out to alumni, former colleagues, and career center contacts this week.`,
      `Consider parallel-tracking: apply to your ideal roles while simultaneously exploring adjacent positions that could serve as a strategic bridge.`,
    );
  } else {
    strategicGuidance.push(
      `Your LRM has passed. This requires an emergency-level response. Dedicate 3 to 4 hours daily to active job search activities.`,
      `Expand your target beyond ${industry} to include adjacent industries where your skills transfer. Every day counts toward your 90 day unemployment limit.`,
      `Contact your career center immediately for expedited support. Schedule informational interviews with any available contacts this week.`,
    );
  }

  if (optStatus === "waiting") {
    strategicGuidance.push(
      `While your OPT application is pending, use this time to maximize preparation. When approved, you'll need to move quickly into active applications.`,
    );
  } else if (optStatus === "approved") {
    strategicGuidance.push(
      `Your OPT is approved. Track your unemployment days carefully — you have a maximum of 90 cumulative days of unemployment allowed.`,
    );
  }

  // Action Plan
  const startDate = chain.lrmDate.getTime() > today.getTime() ? today : chain.lrmDate;
  const actionPlan = {
    daily: generateDailyTasks(startDate, 10),
    weekly: generateWeeklyTasks(startDate, Math.min(hiringWeeks, 12)),
    monthly: generateMonthlyTasks(startDate, 3),
  };

  // Resource Vault
  const resourceVault = {
    templates: content.templates,
    prompts: content.genAiPromptExamples,
  };

  return {
    timelineIntelligence,
    strategicGuidance,
    actionPlan,
    resourceVault,
  };
}
