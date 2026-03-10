import { useNavigate } from "react-router-dom";
import { useState, useMemo, useRef } from "react";
import { Sparkles, ChevronDown, ChevronUp, Download, Wrench, CalendarDays, Clock, AlertTriangle, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import ContactCard from "@/components/ContactCard";
import SegmentedTimeline from "@/components/SegmentedTimeline";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, formatDate, getMilestoneStatus, daysBetween, stripTime, addDays } from "@/lib/calculations";
import { generateCareerPlan, type CareerPlan } from "@/lib/generateCareerPlan";
import { cn } from "@/lib/utils";
import content from "@/data/content.json";
import { useToolkit } from "@/hooks/useToolkit";

const CONFETTI_COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#9B59B6"];

type DateStatus = "Passed" | "Today" | "Upcoming" | "Critical";

function getDateStatus(date: Date): DateStatus {
  const today = stripTime(new Date());
  const diff = daysBetween(today, date);
  if (diff < 0) return "Passed";
  if (diff === 0) return "Today";
  if (diff <= 14) return "Critical";
  return "Upcoming";
}

const statusBadgeVariant: Record<DateStatus, string> = {
  Passed: "bg-muted text-muted-foreground",
  Today: "bg-sky text-white",
  Upcoming: "bg-emerald text-white",
  Critical: "bg-destructive text-destructive-foreground",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [generating, setGenerating] = useState(false);

  // Persisted inputs
  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [hiringWeeks] = usePersistedState<number>("hiringWeeks", 6);
  const [prepWindowDays] = usePersistedState<number>("prepWindowDays", 14);
  const [targetWorkReadyDate] = usePersistedState<string | null>("targetWorkReadyDate", null);
  const [estimatedStartDate] = usePersistedState<string | null>("estimatedStartDate", null);
  const [industryText] = usePersistedState<string>("industryText", "");
  const [careerPlanStartDate] = usePersistedState<string>("careerPlanStartDate", new Date().toISOString().split("T")[0]);

  // Strategy state
  const [strategyGenerated, setStrategyGenerated] = usePersistedState<boolean>("strategyGenerated", false);
  const [showTimelineIntel, setShowTimelineIntel] = useState(true);
  const [showStrategicGuidance, setShowStrategicGuidance] = useState(true);
  const [showActionPlan, setShowActionPlan] = useState(false);

  // Read persisted tasks from Step 4
  const [selectedDailyTasks] = usePersistedState<Record<string, string[]>>("myPlanDailyTasks", {});
  const [selectedWeeklyTasks] = usePersistedState<Record<string, string[]>>("myPlanWeeklyTasks", {});
  const [selectedMonthlyTasks] = usePersistedState<Record<string, string[]>>("myPlanMonthlyTasks", {});

  const isApproved = optStatus === "approved";
  const chosenStartDateStr = isApproved ? eadDate : (targetWorkReadyDate || estimatedStartDate);
  const hasData = gradDate && chosenStartDateStr;

  const chain = hasData
    ? calculateLRMChainV2({
        programEndDate: new Date(gradDate),
        chosenStartDate: new Date(chosenStartDateStr!),
        hiringWeeks,
        prepWindowDays,
      })
    : null;

  const lrmStatus = chain ? getMilestoneStatus(chain.lrmDate) : null;
  const today = stripTime(new Date());
  const daysToLRM = chain ? daysBetween(today, chain.lrmDate) : 0;
  const startLabel = isApproved ? "EAD Start Date" : "Chosen Start Date";

  // Step 4 swimlane calculations
  const startDate = stripTime(new Date(careerPlanStartDate));
  const prepEnd = addDays(startDate, prepWindowDays);
  const hiringEnd = addDays(prepEnd, hiringWeeks * 7);
  const lastDayToWork = chain ? chain.lastDayToWork : hiringEnd;

  const totalBandDays = Math.max(1, daysBetween(startDate, lastDayToWork));
  const prepDays = Math.max(0, daysBetween(startDate, prepEnd));
  const hiringDays = Math.max(0, daysBetween(prepEnd, hiringEnd));
  const bufferDays = Math.max(0, daysBetween(hiringEnd, lastDayToWork));

  const prepPct = (prepDays / totalBandDays) * 100;
  const hiringPct = (hiringDays / totalBandDays) * 100;
  const bufferPct = (bufferDays / totalBandDays) * 100;

  // Status badge
  const statusColor = lrmStatus === "crisis" ? "destructive" : lrmStatus === "compression" ? "secondary" : "outline";
  const statusLabel = lrmStatus === "crisis" ? "Past Due" : lrmStatus === "compression" ? "Soon" : "On Track";
  const statusBadgeClass = lrmStatus === "crisis"
    ? "bg-destructive text-destructive-foreground"
    : lrmStatus === "compression"
      ? "bg-amber text-amber-foreground"
      : "bg-emerald text-emerald-foreground";

  // Key dates for Step 3 timeline section
  const keyDates = chain
    ? [
        { label: "Program End Date", date: chain.programEndDate },
        { label: "Today", date: today },
        { label: "LRM", date: chain.lrmDate },
        { label: startLabel, date: chain.chosenStartDate },
        { label: "Last Day to Start Working", date: chain.lastDayToWork },
      ].sort((a, b) => a.date.getTime() - b.date.getTime())
    : [];

  // Generate plan on first click or regenerate
  const handleGenerate = async () => {
    if (!chain) return;
    setGenerating(true);
    try {
      const result = generateCareerPlan({
        chain,
        industryText,
        hiringWeeks,
        prepWindowDays,
        optStatus,
      });
      setPlan(result);
      setStrategyGenerated(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: CONFETTI_COLORS,
      });
    } catch (err) {
      console.error("Career plan generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Ensure plan exists if strategyGenerated was persisted
  useMemo(() => {
    if (strategyGenerated && !plan && chain) {
      const result = generateCareerPlan({ chain, industryText, hiringWeeks, prepWindowDays, optStatus });
      setPlan(result);
    }
  }, [strategyGenerated, chain]);

  const handleDownloadPDF = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: CONFETTI_COLORS,
    });
    setTimeout(() => window.print(), 400);
  };

  // Gather action plan tasks
  const hasCuratedTasks = Object.keys(selectedDailyTasks).length > 0 || Object.keys(selectedWeeklyTasks).length > 0 || Object.keys(selectedMonthlyTasks).length > 0;

  const actionPlanDaily = useMemo(() => {
    if (hasCuratedTasks && Object.keys(selectedDailyTasks).length > 0) {
      return Object.entries(selectedDailyTasks).slice(0, 3).map(([key, tasks]) => ({ key, tasks }));
    }
    if (plan) {
      return plan.actionPlan.daily.slice(0, 3).map((d) => ({ key: d.date, tasks: d.tasks }));
    }
    return [];
  }, [selectedDailyTasks, plan, hasCuratedTasks]);

  const actionPlanWeekly = useMemo(() => {
    if (hasCuratedTasks && Object.keys(selectedWeeklyTasks).length > 0) {
      return Object.entries(selectedWeeklyTasks).slice(0, 3).map(([key, tasks]) => ({ key, tasks }));
    }
    if (plan) {
      return plan.actionPlan.weekly.slice(0, 3).map((w) => ({ key: w.period, tasks: w.tasks }));
    }
    return [];
  }, [selectedWeeklyTasks, plan, hasCuratedTasks]);

  const actionPlanMonthly = useMemo(() => {
    if (hasCuratedTasks && Object.keys(selectedMonthlyTasks).length > 0) {
      return Object.entries(selectedMonthlyTasks).slice(0, 3).map(([key, tasks]) => ({ key, tasks }));
    }
    if (plan) {
      return plan.actionPlan.monthly.slice(0, 3).map((m) => ({ key: m.period, tasks: m.tasks }));
    }
    return [];
  }, [selectedMonthlyTasks, plan, hasCuratedTasks]);

  // Dot color helper for key dates
  const dotColor = (label: string) => {
    if (label === "Today") return "bg-sky";
    if (label === "Program End Date") return "bg-slate";
    if (label === "LRM") return "bg-amber";
    if (label === "Last Day to Start Working") return "bg-critical";
    return "bg-primary";
  };

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground print:text-2xl">Dashboard</h1>

      {/* ── 1. LRM Card ── */}
      {chain && (
        <GlassCard className="print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Last Responsible Moment</h2>
            <Badge className={cn("ml-auto text-[10px] border-0", statusBadgeClass)}>
              {statusLabel}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{formatDate(chain.lrmDate)}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {daysToLRM > 0
              ? `${daysToLRM} days from today`
              : daysToLRM === 0
                ? "Today is your LRM"
                : `${Math.abs(daysToLRM)} days past`}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your Last Responsible Moment is the latest date you should begin your job search while still allowing enough time to realistically secure employment before your OPT unemployment deadline. It is calculated as: Last Day to Start Working − Hiring Cycle − Preparation Window.
          </p>
          {lrmStatus === "crisis" && (
            <div className="flex items-start gap-2 mt-3 p-2 rounded bg-destructive/10">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
              <p className="text-[10px] text-destructive font-medium">Your LRM has passed. Shift to an accelerated job search cadence immediately.</p>
            </div>
          )}
        </GlassCard>
      )}

      {/* ── 2. Step 3 Timeline + Key Dates ── */}
      {chain && (
        <>
          <GlassCard className="print:break-inside-avoid">
            <h2 className="text-sm font-semibold text-foreground mb-1">Timeline Intelligence</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              This timeline shows how your preparation window, hiring cycle, and OPT timing affect your Last Responsible Moment (LRM).
            </p>
            <SegmentedTimeline chain={chain} startLabel={startLabel} />
          </GlassCard>

          <GlassCard className="print:break-inside-avoid">
            <h2 className="text-sm font-semibold text-foreground mb-4">Key Dates</h2>
            <div className="space-y-3">
              {keyDates.map((m) => {
                const isPast = m.date.getTime() < today.getTime() && m.label !== "Today";
                const status = getDateStatus(m.date);
                return (
                  <div key={m.label} className={cn("flex items-center justify-between", isPast && "opacity-40")}>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full shrink-0", dotColor(m.label))} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.label}</p>
                        <p className="text-xs text-primary/70">{formatDate(m.date)}</p>
                      </div>
                    </div>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusBadgeVariant[status])}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </>
      )}

      {/* ── 3. Step 4 Timeline + Key Time Frames ── */}
      {chain && (
        <>
          <GlassCard className="print:break-inside-avoid">
            <h2 className="text-sm font-semibold text-foreground mb-4">Career Strategy Timeline</h2>
            {/* Swimlane bar */}
            <div className="space-y-2">
              <div className="flex rounded-lg overflow-hidden h-8">
                {prepPct > 0 && (
                  <div
                    className="bg-emerald flex items-center justify-center text-[9px] font-semibold text-emerald-foreground"
                    style={{ width: `${Math.max(prepPct, 8)}%` }}
                  >
                    Prep
                  </div>
                )}
                {hiringPct > 0 && (
                  <div
                    className="bg-amber flex items-center justify-center text-[9px] font-semibold text-amber-foreground"
                    style={{ width: `${Math.max(hiringPct, 8)}%` }}
                  >
                    Hiring
                  </div>
                )}
                {bufferPct > 0 && (
                  <div
                    className="bg-primary flex items-center justify-center text-[9px] font-semibold text-primary-foreground"
                    style={{ width: `${Math.max(bufferPct, 8)}%` }}
                  >
                    OPT Buffer
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>{formatDate(startDate)}</span>
                {prepDays > 0 && <span>{formatDate(prepEnd)}</span>}
                <span>{formatDate(hiringEnd)}</span>
                <span>{formatDate(lastDayToWork)}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="print:break-inside-avoid">
            <h2 className="text-sm font-semibold text-foreground mb-4">Key Time Frames</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0 bg-emerald" />
                <div>
                  <p className="text-sm font-medium text-foreground">Prep Window</p>
                  <p className="text-xs text-muted-foreground">{formatDate(startDate)} — {formatDate(prepEnd)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0 bg-amber" />
                <div>
                  <p className="text-sm font-medium text-foreground">Hiring Cycle</p>
                  <p className="text-xs text-muted-foreground">{formatDate(prepEnd)} — {formatDate(hiringEnd)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0 bg-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">OPT Buffer</p>
                  <p className="text-xs text-muted-foreground">{formatDate(hiringEnd)} — {formatDate(lastDayToWork)}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </>
      )}

      {/* ── 4. Generate My Career Strategy ── */}
      {chain && (
        <Button
          onClick={handleGenerate}
          disabled={generating}
          variant={strategyGenerated ? "outline" : "default"}
          className={cn("w-full print:hidden", !strategyGenerated && "h-14 text-base font-semibold")}
          size={strategyGenerated ? "default" : "lg"}
        >
          <Sparkles className={cn("mr-2", strategyGenerated ? "h-4 w-4" : "h-5 w-5")} />
          {generating
            ? (strategyGenerated ? "Regenerating..." : "Generating...")
            : (strategyGenerated ? "Regenerate Career Strategy" : "Generate My Career Strategy")}
        </Button>
      )}

      {/* ── 5. Career Center Contact ── */}
      <div className="space-y-3 print:break-inside-avoid">
        <ContactCard contact={content.careerCenter} />
      </div>

      {/* ── 6. Post-click: Timeline Intelligence ── */}
      {strategyGenerated && plan && (
        <Collapsible open={showTimelineIntel} onOpenChange={setShowTimelineIntel}>
          <GlassCard className="print:break-inside-avoid">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h2 className="text-sm font-semibold text-foreground">Timeline Intelligence</h2>
              {showTimelineIntel ? <ChevronUp className="h-4 w-4 text-muted-foreground print:hidden" /> : <ChevronDown className="h-4 w-4 text-muted-foreground print:hidden" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              {plan.timelineIntelligence.map((p, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </CollapsibleContent>
          </GlassCard>
        </Collapsible>
      )}

      {/* ── 7. Post-click: Strategic Guidance ── */}
      {strategyGenerated && plan && (
        <Collapsible open={showStrategicGuidance} onOpenChange={setShowStrategicGuidance}>
          <GlassCard className="print:break-inside-avoid">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h2 className="text-sm font-semibold text-foreground">Strategic Guidance</h2>
              {showStrategicGuidance ? <ChevronUp className="h-4 w-4 text-muted-foreground print:hidden" /> : <ChevronDown className="h-4 w-4 text-muted-foreground print:hidden" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              {plan.strategicGuidance.map((p, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </CollapsibleContent>
          </GlassCard>
        </Collapsible>
      )}

      {/* ── 8. Post-click: My Action Plan ── */}
      {strategyGenerated && plan && (
        <>
          <Button
            variant={showActionPlan ? "secondary" : "outline"}
            className="w-full print:hidden"
            onClick={() => setShowActionPlan(!showActionPlan)}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            My Action Plan
            {showActionPlan ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
          </Button>

          {showActionPlan && (
            <GlassCard className="print:break-inside-avoid">
              <Tabs defaultValue="daily">
                <TabsList className="w-full print:hidden">
                  <TabsTrigger value="daily" className="flex-1 text-xs">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="flex-1 text-xs">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="flex-1 text-xs">Monthly</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="mt-3 space-y-3">
                  {actionPlanDaily.map((day) => (
                    <div key={day.key} className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-foreground">{day.key}</h4>
                      {day.tasks.map((task, ti) => (
                        <div key={ti} className="flex items-start gap-2">
                          <Checkbox className="mt-0.5" disabled />
                          <span className="text-xs text-muted-foreground leading-relaxed">{task}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  {actionPlanDaily.length === 0 && (
                    <p className="text-xs text-muted-foreground">No daily tasks available. Complete Step 4 to curate your action plan.</p>
                  )}
                </TabsContent>

                <TabsContent value="weekly" className="mt-3 space-y-3">
                  {actionPlanWeekly.map((week) => (
                    <div key={week.key} className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-foreground">{week.key}</h4>
                      {week.tasks.map((task, ti) => (
                        <div key={ti} className="flex items-start gap-2">
                          <Checkbox className="mt-0.5" disabled />
                          <span className="text-xs text-muted-foreground leading-relaxed">{task}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  {actionPlanWeekly.length === 0 && (
                    <p className="text-xs text-muted-foreground">No weekly tasks available. Complete Step 4 to curate your action plan.</p>
                  )}
                </TabsContent>

                <TabsContent value="monthly" className="mt-3 space-y-3">
                  {actionPlanMonthly.map((month) => (
                    <div key={month.key} className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-foreground">{month.key}</h4>
                      {month.tasks.map((task, ti) => (
                        <div key={ti} className="flex items-start gap-2">
                          <Checkbox className="mt-0.5" disabled />
                          <span className="text-xs text-muted-foreground leading-relaxed">{task}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  {actionPlanMonthly.length === 0 && (
                    <p className="text-xs text-muted-foreground">No monthly tasks available. Complete Step 4 to curate your action plan.</p>
                  )}
                </TabsContent>
              </Tabs>
            </GlassCard>
          )}
        </>
      )}

      {/* ── 9. Post-click: My Toolkit ── */}
      {strategyGenerated && (
        <Button
          variant="outline"
          className="w-full print:hidden"
          onClick={() => navigate("/resource-vault")}
        >
          <Wrench className="h-4 w-4 mr-2" />
          My Toolkit
        </Button>
      )}

      {/* ── 10. Post-click: Download PDF ── */}
      {strategyGenerated && (
        <Button
          variant="outline"
          className="w-full print:hidden"
          onClick={handleDownloadPDF}
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      )}

      {/* ── 11. Compliance Info ── */}
      <div className="space-y-3 print:break-inside-avoid">
        <h2 className="text-sm font-semibold text-foreground">Compliance Info</h2>
        <ContactCard
          contact={content.isso}
          disclaimer="Contact University DSO for official policy guidance."
        />
      </div>

      <GlassCard className="print:break-inside-avoid">
        <p className="text-xs text-muted-foreground leading-relaxed">{content.disclaimers.legal}</p>
      </GlassCard>

      {/* ── 12. Edit Inputs ── */}
      <Button variant="outline" onClick={() => navigate("/step-1-authorization")} className="w-full print:hidden">
        Edit Inputs
      </Button>
    </StepLayout>
  );
};

export default Dashboard;
