import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import TimelineMilestone from "@/components/TimelineMilestone";
import TaskChecklist from "@/components/TaskChecklist";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, getMilestoneStatus, formatDate } from "@/lib/calculations";
import { getDefaultHiringWeeks } from "@/lib/smart-suggestions";
import content from "@/data/content.json";
import tasks from "@/data/tasks.json";

const Step3Timeline = () => {
  const navigate = useNavigate();

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [industry] = usePersistedState<string>("industry", "general");
  const [hiringWeeks] = usePersistedState<number>("hiringWeeks", getDefaultHiringWeeks("general"));

  const [govProcessingDays, setGovProcessingDays] = usePersistedState<number>("govProcessingDays", 90);
  const [bufferDays, setBufferDays] = usePersistedState<number>("bufferDays", 10);
  const [prepPhaseDays, setPrepPhaseDays] = usePersistedState<number>("prepPhaseDays", 7);
  const [targetWorkReadyDate, setTargetWorkReadyDate] = usePersistedState<string | null>("targetWorkReadyDate", null);

  const isApproved = optStatus === "approved";

  // Chosen start date: locked to EAD if approved, otherwise user-selected
  const chosenStartDateStr = isApproved ? eadDate : targetWorkReadyDate;
  const chosenStartDateObj = chosenStartDateStr ? new Date(chosenStartDateStr) : undefined;
  const targetDateObj = targetWorkReadyDate ? new Date(targetWorkReadyDate) : undefined;

  const gradDateObj = gradDate ? new Date(gradDate) : undefined;

  const hasData = gradDateObj && chosenStartDateObj;
  const chain = hasData
    ? calculateLRMChainV2({
        graduationDate: gradDateObj,
        chosenStartDate: chosenStartDateObj,
        govProcessingDays,
        bufferDays,
        hiringWeeks,
        prepPhaseDays,
      })
    : null;

  const milestones = chain
    ? [
        { label: "LRM Date (Start Outreach)", date: chain.lrmDate },
        { label: "Hiring Cycle Peak", date: chain.hiringCyclePeak },
        { label: "Authorization Wall", date: chain.authorizationWall },
        { label: "Filing Deadline", date: chain.filingDeadline },
        { label: "Chosen Start Date", date: chain.chosenStartDate },
      ]
    : [];

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 3: Timeline</h1>

      {/* Timeline inputs */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-foreground mb-4">Timeline Parameters</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Gov Processing Days</label>
            <Input
              type="number"
              min={1}
              max={365}
              value={govProcessingDays}
              onChange={(e) => setGovProcessingDays(Math.max(1, parseInt(e.target.value) || 90))}
              className="w-28"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Buffer Days</label>
            <Input
              type="number"
              min={0}
              max={60}
              value={bufferDays}
              onChange={(e) => setBufferDays(Math.max(0, parseInt(e.target.value) || 10))}
              className="w-28"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Prep Phase Days</label>
            <Input
              type="number"
              min={1}
              max={60}
              value={prepPhaseDays}
              onChange={(e) => setPrepPhaseDays(Math.max(1, parseInt(e.target.value) || 7))}
              className="w-28"
            />
          </div>
        </div>
      </GlassCard>

      {/* Chosen Start Date */}
      <GlassCard>
        {isApproved ? (
          <>
            <label className="text-sm font-medium text-foreground block mb-2">Chosen Start Date (EAD)</label>
            <p className="text-sm font-medium text-foreground">
              {chosenStartDateObj ? formatDate(chosenStartDateObj) : "Set EAD Start Date in Step 1"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Locked to your EAD Start Date from Step 1.</p>
          </>
        ) : (
          <>
            <label className="text-sm font-medium text-foreground block mb-2">Target Work-Ready Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !targetDateObj && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDateObj ? format(targetDateObj, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetDateObj}
                  onSelect={(d) => setTargetWorkReadyDate(d ? d.toISOString() : null)}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </>
        )}
      </GlassCard>

      {/* LRM Chain Timeline */}
      {!hasData ? (
        <GlassCard className="bg-amber/5 border-amber/20">
          <p className="text-sm text-muted-foreground">
            {isApproved
              ? "Please set your Graduation Date and EAD Start Date in Step 1 to generate your timeline."
              : "Please set your Graduation Date in Step 1 and a Target Work-Ready Date above to generate your timeline."}
          </p>
        </GlassCard>
      ) : (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-4">Your LRM Chain</h2>
          {milestones.map((m, i) => (
            <TimelineMilestone
              key={m.label}
              label={m.label}
              date={m.date}
              status={getMilestoneStatus(m.date)}
              isLast={i === milestones.length - 1}
            />
          ))}
        </GlassCard>
      )}

      <GlassCard>
        <TaskChecklist title="Human Layer Tasks" tasks={tasks.humanLayer} storageKey="tasks-humanLayer" />
      </GlassCard>

      <GlassCard>
        <TaskChecklist title="Compliance Tasks" tasks={tasks.compliance} storageKey="tasks-compliance" />
      </GlassCard>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">AI Prompts</h2>
        {content.aiPrompts.map((p) => (
          <AiPromptCard key={p.id} title={p.title} prompt={p.prompt} />
        ))}
      </div>

      <GlassCard className="bg-amber/5 border-amber/20">
        <p className="text-xs text-muted-foreground leading-relaxed">{content.disclaimers.uscis}</p>
      </GlassCard>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/step-2-strategy")} className="flex-1">
          Back
        </Button>
        <Button onClick={() => navigate("/dashboard")} className="flex-1">
          View Dashboard
        </Button>
      </div>
    </StepLayout>
  );
};

function AiPromptCard({ title, prompt }: { title: string; prompt: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{prompt}</p>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
        </button>
      </div>
    </GlassCard>
  );
}

export default Step3Timeline;
