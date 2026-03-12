import { LRMChainResult, formatDate, daysBetween, stripTime, getMilestoneStatus } from "@/lib/calculations";
import content from "@/data/content.json";

export interface TaskItem {
  id: string;
  task: string;
  category: string;
  priority: "high" | "medium" | "low";
}

export interface DayPlan {
  date: string;
  label: string;
  tasks: string[];
}

export interface WeekPlan {
  period: string;
  tasks: string[];
}

export interface MonthPlan {
  period: string;
  tasks: string[];
}

export interface CareerPlan {
  timelineIntelligence: string[];
  strategicGuidance: string[];
  actionPlan: {
    daily: DayPlan[];
    weekly: WeekPlan[];
    monthly: MonthPlan[];
  };
  resourceVault: {
    templates: typeof content.templates;
    prompts: typeof content.genAiPromptExamples;
  };
}

export interface PlanInput {
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
  const industry = industryText || "your target industry";

  // Timeline Intelligence
  const timelineIntelligence: string[] = [
    `Your Last Responsible Moment (LRM) is ${formatDate(chain.lrmDate)}, which is ${daysToLRM > 0 ? `${daysToLRM} days from today` : `${Math.abs(daysToLRM)} days past`}. The LRM is the latest date you can begin your job search while still having a realistic chance of securing employment within your OPT window.`,
    `Your hiring cycle for ${industry} is estimated at ${hiringWeeks} weeks, with a ${prepWindowDays}-day preparation window built in before active applications begin. This means your preparation phase should start no later than your LRM date.`,
    `Your Program End Date is ${formatDate(chain.programEndDate)}. Under OPT regulations, the latest you can start OPT is 60 days after your Program End Date (the grace period). Once your OPT begins, you have 90 days of permitted unemployment to secure and report employment to ISSO. Your absolute deadline to begin working is ${formatDate(chain.lastDayToWork)}.`,
    daysToLRM > 30
      ? `You have a comfortable buffer before your LRM. Use this time strategically to build relationships, refine your materials, and research target employers in ${industry}.`
      : daysToLRM > 0
        ? `Your timeline is compressed. You have ${daysToLRM} days before your LRM. Prioritize active applications and direct outreach immediately.`
        : `Your LRM has passed. Shift to an accelerated cadence — apply daily, leverage every contact, and consider broadening your target roles in ${industry}.`,
  ];

  // Strategic Guidance
  const strategicGuidance: string[] = [];
  if (status === "on-track") {
    strategicGuidance.push(
      `You are currently on track for ${industry}. Focus on building a strong pipeline of 15–20 target companies while maintaining consistent daily outreach activity.`,
      `Use your preparation window to complete resume refinement, gather strong recommendation contacts, and schedule informational interviews with professionals currently working in ${industry}.`,
      `Aim for 3–5 quality applications per week rather than high-volume submissions. Each application to a ${industry} role should be tailored with a specific cover letter and customized resume bullets.`
    );
  } else if (status === "compression") {
    strategicGuidance.push(
      `Your timeline is compressed and your LRM is approaching. Shift from preparation mode to active execution immediately in ${industry}.`,
      `Prioritize warm introductions and referrals over cold applications. Reach out to Suffolk alumni working in ${industry} through LinkedIn and the Career Center's alumni network this week.`,
      `Apply to your ideal ${industry} roles while simultaneously exploring adjacent positions that could serve as a strategic bridge to your target role.`
    );
  } else {
    strategicGuidance.push(
      `Your LRM has passed and you are in an urgent timeline. Dedicate 3–4 hours daily to active job search activities in ${industry}.`,
      `Expand your target beyond your first-choice ${industry} roles to include adjacent industries where your skills transfer directly. Every day counts toward your 90-day unemployment limit.`,
      `Contact the Career Center immediately for expedited support and schedule informational interviews with any available contacts this week.`
    );
  }

  if (optStatus === "notApplied") {
    strategicGuidance.push(`Your OPT application has not yet been filed. File immediately — the earliest you can apply is 90 days before your program end date. Begin your job search in parallel so you are ready to accept an offer the moment your EAD arrives.`);
  } else if (optStatus === "waiting") {
    strategicGuidance.push(`While your OPT application is pending, use this time to maximize preparation. When your EAD is approved, you will need to move quickly. Standard processing is 3–5 months; premium processing is approximately 30 days.`);
  } else if (optStatus === "approved") {
    strategicGuidance.push(`Your OPT is approved. Track your unemployment days carefully — you have a maximum of 90 cumulative days of unemployment allowed under OPT regulations.`);
  }

  // Daily plan — 7 days from today, 5 tasks each day
  const dailyTaskSets = [
    ["Review and update your LinkedIn headline and summary to reflect your target role in " + industry, "Identify 10 target companies in " + industry + " and add them to a tracking spreadsheet", "Connect with 3 Suffolk alumni working in " + industry + " on LinkedIn with a personalized note", "Research the hiring process and timeline for your top 3 target companies", "Review your resume against a current " + industry + " job posting and note gaps"],
    ["Draft or refine your professional summary statement for " + industry + " roles", "Apply to 1 position that closely matches your target role in " + industry, "Schedule an informational interview with one contact in " + industry, "Research one target company's culture, recent news, and open roles", "Update your application tracking spreadsheet with status and next steps"],
    ["Follow up on any pending applications or outreach messages from earlier this week", "Draft a tailored cover letter for your top target company in " + industry, "Practice answering 3 common " + industry + " interview questions out loud", "Reach out to one professor or academic contact for a recommendation or referral", "Review LinkedIn job alerts and identify 5 new positions to apply to this week"],
    ["Attend a Career Center drop-in or schedule an advising appointment", "Apply to 2 additional positions in " + industry, "Send a follow-up message to any informational interview contacts from last week", "Research salary benchmarks for your target role in " + industry + " using Glassdoor or LinkedIn Salary", "Review and refine your elevator pitch for " + industry + " networking conversations"],
    ["Conduct one informational interview if scheduled, or reach out to schedule one", "Apply to 1–2 positions and customize each application for the specific role", "Update your LinkedIn activity — comment on posts from " + industry + " professionals you follow", "Review your OPT timeline and confirm all regulatory dates with your DSO if needed", "Identify one professional association or community in " + industry + " to join or engage with"],
    ["Reflect on your week — review your application tracker and note what is working", "Apply to any remaining positions from your target list this week", "Send thank you or check-in messages to any contacts you met with this week", "Research one new networking event, career fair, or employer information session to attend", "Prepare one new interview answer using the STAR method for a " + industry + " behavioral question"],
    ["Review the upcoming week and set 3 specific goals for your job search", "Identify any gaps in your materials and schedule time to address them next week", "Connect with one new professional in " + industry + " on LinkedIn", "Check the Career Center event calendar for upcoming workshops or employer events", "Rest and recharge — sustainable job searching requires consistent energy over weeks, not sprints"],
  ];

  const daily: DayPlan[] = dailyTaskSets.map((tasks, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      date: date.toISOString().split("T")[0],
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatDate(date),
      tasks,
    };
  });

  // Weekly plan
  const weekly: WeekPlan[] = [
    { period: "Week 1–2: Foundation", tasks: ["Complete resume tailored to " + industry + " with specific keywords from job postings", "Set up LinkedIn job alerts for your target roles and locations", "Identify 20 target companies and research their hiring timelines", "Schedule 2 informational interviews with professionals in " + industry, "Connect with Suffolk Career Center advisor for industry-specific guidance"] },
    { period: "Week 3–4: Outreach", tasks: ["Submit 5–8 targeted applications to " + industry + " roles", "Conduct 2 informational interviews and send follow-up thank you notes", "Attend one networking event, career fair, or employer information session", "Draft and refine your cover letter template for " + industry, "Research interview formats commonly used by your target employers"] },
    { period: "Week 5–8: Active Applications", tasks: ["Maintain 3–5 new applications per week to " + industry + " roles", "Follow up on applications submitted 2+ weeks ago with a brief professional note", "Practice case interviews or technical assessments relevant to " + industry + " if applicable", "Expand your network by engaging with " + industry + " content on LinkedIn", "Schedule a mock interview with the Career Center"] },
    { period: "Week 9–" + hiringWeeks + ": Hiring Cycle", tasks: ["Prioritize interview preparation for any active conversations", "Research compensation benchmarks for offers you may receive in " + industry, "Maintain applications while managing active interview processes", "Follow up on any pending offers or decisions within appropriate timelines", "Confirm OPT employment reporting requirements with your DSO once an offer is received"] },
  ];

  // Monthly plan
  const monthly: MonthPlan[] = [
    { period: "Month 1: Build & Launch", tasks: ["Complete all application materials tailored to " + industry, "Launch active applications with 15+ submissions by end of month", "Establish weekly networking routine with 3+ new contacts per week", "Attend at least 2 career events or employer information sessions", "Check in with Career Center advisor to review strategy and materials"] },
    { period: "Month 2: Momentum", tasks: ["Maintain application volume and track response rates by company type", "Conduct 6+ informational interviews with professionals in " + industry, "Begin interview preparation intensively if conversations are active", "Reassess target company list and expand if needed based on response patterns", "Review OPT unemployment day count and confirm regulatory compliance"] },
    { period: "Month 3: Conversion", tasks: ["Focus energy on active interview processes and offers", "Negotiate offers with full understanding of " + industry + " compensation benchmarks", "Confirm employment start date aligns with OPT authorization window", "Report employment to DSO within required timeframe once offer is accepted", "Reflect on job search learnings to support future career transitions"] },
  ];

  return {
    timelineIntelligence,
    strategicGuidance,
    actionPlan: { daily, weekly, monthly },
    resourceVault: {
      templates: content.templates,
      prompts: content.genAiPromptExamples,
    },
  };
}
