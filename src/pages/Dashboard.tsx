import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Info, Sparkles, ChevronDown, ChevronUp, CalendarDays, BookOpen, Clipboard } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import TemplateCard from "@/components/TemplateCard";
import SegmentedTimeline from "@/components/SegmentedTimeline";
import UnemploymentGauge from "@/components/UnemploymentGauge";
import PromptLibrary from "@/components/PromptLibrary";
import ContactCard from "@/components/ContactCard";
import EventCard from "@/components/EventCard";
import TaskChecklist from "@/components/TaskChecklist";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, formatDate, getMilestoneStatus, daysBetween, stripTime } from "@/lib/calculations";
import { generateCareerPlan, type CareerPlan } from "@/lib/generateCareerPlan";
import content from "@/data/content.json";
import type { CalendarEvent } from "@/types/events";

const Dashboard = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [generating, setGenerating] = useState(false);

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [hiringWeeks] = usePersistedState<number>("hiringWeeks", 6);
  const [prepWindowDays] = usePersistedState<number>("prepWindowDays", 14);
  const [targetWorkReadyDate] = usePersistedState<string | null>("targetWorkReadyDate", null);
  const [estimatedStartDate] = usePersistedState<string | null>("estimatedStartDate", null);
  const [industryText] = usePersistedState<string>("industryText", "");

  const isApproved = optStatus === "approved";
  const chosenStartDateStr = isApproved ? eadDate : (targetWorkReadyDate || estimatedStartDate);

  const hasData = gradDate && chosenStartDateStr;
  const chain = hasData
    ? calculateLRMChainV2({
        programEndDate: new Date(gradDate),
        chosenStartDate: new Date(chosenStartDateStr),
        hiringWeeks,
        prepWindowDays,
      })
    : null;

  const lrmStatus = chain ? getMilestoneStatus(chain.lrmDate) : null;
  const statusColor = lrmStatus === "crisis" ? "destructive" : lrmStatus === "compression" ? "secondary" : "outline";
  const statusLabel = lrmStatus === "crisis" ? "Past Due" : lrmStatus === "compression" ? "Soon" : "On Track";

  // Timeline color indicator
  const timelineColorClass = lrmStatus === "crisis"
    ? "border-destructive/30"
    : lrmStatus === "compression"
      ? "border-amber-500/30"
      : "border-emerald-500/30";

  const autoCalcDaysUsed = (() => {
    if (!isApproved || !chosenStartDateStr) return 0;
    const start = stripTime(new Date(chosenStartDateStr));
    const today = stripTime(new Date());
    const diff = daysBetween(start, today);
    return Math.max(0, Math.min(90, diff));
  })();

  const handleGenerate = async () => {
    if (!chain) return;
    setGenerating(true);

    try {
      const result = await generateCareerPlan({
        chain,
        industryText,
        hiringWeeks,
        prepWindowDays,
        optStatus,
      });
      setPlan(result);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["hsl(262,83%,58%)", "hsl(210,40%,98%)", "hsl(262,83%,78%)"],
      });
    } catch (err) {
      console.error("Career plan generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Upcoming events
  const getUpcomingEvents = (): CalendarEvent[] => {
    try {
      const stored = localStorage.getItem("semesterEvents");
      if (!stored) return [];
      const all: CalendarEvent[] = JSON.parse(stored);
      const today = new Date().toISOString().split("T")[0];
      return all.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    } catch {
      return [];
    }
  };

  // Collapsible section state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    timeline: true,
    guidance: true,
    action: true,
    resources: false,
    events: true,
  });
  const toggle = (key: string) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const upcomingEvents = getUpcomingEvents();

  return (
    <StepLayout>
      {/* Hero: LRM Date */}
      {chain && (
        <GlassCard className={`border-2 ${timelineColorClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Last Responsible Moment</p>
              <p className="text-lg font-bold text-foreground">{formatDate(chain.lrmDate)}</p>
            </div>
            <Badge variant={statusColor}>{statusLabel}</Badge>
          </div>
          <div className="flex items-start gap-1.5 mt-3 p-2 rounded bg-muted/50">
            <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              LRM = Last Day to Start Working minus Hiring Cycle minus Preparation Window. This is the latest date you should begin your job search.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Key Dates */}
      {chain && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-3">Key Dates</h2>
          <div className="space-y-2">
            {[
              { label: "LRM", date: chain.lrmDate },
              { label: "Chosen Start Date", date: chain.chosenStartDate },
              { label: "Program End Date", date: chain.programEndDate },
              { label: "Last Day to Start Working", date: chain.lastDayToWork },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Timeline Visualization */}
      {chain && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-3">Timeline</h2>
          <SegmentedTimeline chain={chain} />
          <div className="flex gap-3 mt-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> On Track
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Compressed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-destructive inline-block" /> Conflict
            </span>
          </div>
        </GlassCard>
      )}

      {/* Unemployment Gauge */}
      {isApproved && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-4">Unemployment Tracker</h2>
          <UnemploymentGauge daysUsed={autoCalcDaysUsed} />
        </GlassCard>
      )}

      {/* Generate Button */}
      {chain && !plan && (
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full h-14 text-base font-semibold"
          size="lg"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          {generating ? "Generating..." : "Generate My Strategic Career Timeline Map"}
        </Button>
      )}

      {/* Regenerate */}
      {chain && plan && (
        <Button
          onClick={handleGenerate}
          disabled={generating}
          variant="outline"
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {generating ? "Regenerating..." : "Regenerate Plan"}
        </Button>
      )}

      {/* ===== GENERATED PLAN ===== */}
      {plan && (
        <div className="space-y-4 animate-fade-in">

          {/* Section 1: Timeline Intelligence */}
          <Collapsible open={openSections.timeline} onOpenChange={() => toggle("timeline")}>
            <GlassCard>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Timeline Intelligence</h2>
                </div>
                {openSections.timeline ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 space-y-2">
                  {plan.timelineIntelligence.map((text, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                  ))}
                </div>
              </CollapsibleContent>
            </GlassCard>
          </Collapsible>

          {/* Section 2: Strategic Guidance */}
          <Collapsible open={openSections.guidance} onOpenChange={() => toggle("guidance")}>
            <GlassCard>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Strategic Guidance</h2>
                </div>
                {openSections.guidance ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 space-y-2">
                  {plan.strategicGuidance.map((text, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                  ))}
                </div>
              </CollapsibleContent>
            </GlassCard>
          </Collapsible>

          {/* Section 3: Customized Action Plan */}
          <Collapsible open={openSections.action} onOpenChange={() => toggle("action")}>
            <GlassCard>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Customized Action Plan</h2>
                </div>
                {openSections.action ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Tabs defaultValue="daily" className="mt-3">
                  <TabsList className="w-full">
                    <TabsTrigger value="daily" className="flex-1 text-xs">Daily</TabsTrigger>
                    <TabsTrigger value="weekly" className="flex-1 text-xs">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly" className="flex-1 text-xs">Monthly</TabsTrigger>
                  </TabsList>
                  <TabsContent value="daily" className="mt-3 space-y-3">
                    {plan.actionPlan.daily.map((p) => (
                      <TaskChecklist
                        key={p.period}
                        title={p.period}
                        storageKey={`plan-daily-${p.period}`}
                        tasks={p.tasks.map((t, i) => ({ id: `${p.period}-${i}`, task: t }))}
                      />
                    ))}
                  </TabsContent>
                  <TabsContent value="weekly" className="mt-3 space-y-3">
                    {plan.actionPlan.weekly.map((p) => (
                      <TaskChecklist
                        key={p.period}
                        title={p.period}
                        storageKey={`plan-weekly-${p.period}`}
                        tasks={p.tasks.map((t, i) => ({ id: `${p.period}-${i}`, task: t }))}
                      />
                    ))}
                  </TabsContent>
                  <TabsContent value="monthly" className="mt-3 space-y-3">
                    {plan.actionPlan.monthly.map((p) => (
                      <TaskChecklist
                        key={p.period}
                        title={p.period}
                        storageKey={`plan-monthly-${p.period}`}
                        tasks={p.tasks.map((t, i) => ({ id: `${p.period}-${i}`, task: t }))}
                      />
                    ))}
                  </TabsContent>
                </Tabs>
              </CollapsibleContent>
            </GlassCard>
          </Collapsible>

          {/* Section 4: Resource Vault */}
          <Collapsible open={openSections.resources} onOpenChange={() => toggle("resources")}>
            <GlassCard>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Resource Vault</h2>
                </div>
                {openSections.resources ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-foreground">Templates</h3>
                    {plan.resourceVault.templates.map((t) => (
                      <TemplateCard key={t.id} title={t.title} body={t.body} subject={t.subject} />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-foreground">AI Prompts</h3>
                    <PromptLibrary />
                  </div>
                </div>
              </CollapsibleContent>
            </GlassCard>
          </Collapsible>

          {/* Upcoming Events (after plan generation) */}
          {upcomingEvents.length > 0 && (
            <Collapsible open={openSections.events} onOpenChange={() => toggle("events")}>
              <GlassCard>
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Upcoming Events</h2>
                  </div>
                  {openSections.events ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 space-y-3">
                    {upcomingEvents.map((ev) => (
                      <EventCard key={ev.id} event={ev} />
                    ))}
                  </div>
                </CollapsibleContent>
              </GlassCard>
            </Collapsible>
          )}
        </div>
      )}

      {/* Compliance Info */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Compliance Info</h2>
        <ContactCard
          contact={content.isso}
          disclaimer="Contact University DSO for official policy guidance."
        />
      </div>

      {/* Disclaimers */}
      <GlassCard>
        <p className="text-xs text-muted-foreground leading-relaxed">{content.disclaimers.legal}</p>
      </GlassCard>

      <Button variant="outline" onClick={() => navigate("/step-1-authorization")} className="w-full">
        Edit Inputs
      </Button>
    </StepLayout>
  );
};

export default Dashboard;
