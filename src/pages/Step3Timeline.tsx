import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import TimelineMilestone from "@/components/TimelineMilestone";
import SegmentedTimeline from "@/components/SegmentedTimeline";
import PromptLibrary from "@/components/PromptLibrary";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, getMilestoneStatus, formatDate } from "@/lib/calculations";
import content from "@/data/content.json";

const Step3Timeline = () => {
  const navigate = useNavigate();

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [hiringWeeks] = usePersistedState<number>("hiringWeeks", 6);

  const [govProcessingDays, setGovProcessingDays] = usePersistedState<number>("govProcessingDays", 90);
  const [bufferDays, setBufferDays] = usePersistedState<number>("bufferDays", 10);
  const [targetWorkReadyDate, setTargetWorkReadyDate] = usePersistedState<string | null>("targetWorkReadyDate", null);

  const isApproved = optStatus === "approved";
  const chosenStartDateStr = isApproved ? eadDate : targetWorkReadyDate;
  const chosenStartDateObj = chosenStartDateStr ? new Date(chosenStartDateStr) : undefined;
  const targetDateObj = targetWorkReadyDate ? new Date(targetWorkReadyDate) : undefined;
  const gradDateObj = gradDate ? new Date(gradDate) : undefined;

  const hasData = gradDateObj && chosenStartDateObj;
  const chain = hasData
    ? calculateLRMChainV2({
        programEndDate: gradDateObj,
        chosenStartDate: chosenStartDateObj,
        govProcessingDays,
        bufferDays,
        hiringWeeks,
      })
    : null;

  const milestones = chain
    ? [
        { label: "LRM Date (Start Outreach)", date: chain.lrmDate },
        { label: "Hiring Completion Deadline", date: chain.hiringCompletionDeadline },
        { label: "Chosen Start Date", date: chain.chosenStartDate },
        { label: "Last Day to Start Working", date: chain.lastDayToWork },
      ]
    : [];

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 3: Timeline</h1>

      <GlassCard>
        <h2 className="text-sm font-semibold text-foreground mb-4">Timeline Parameters</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Gov Processing Days</label>
            <Input type="number" min={1} max={365} value={govProcessingDays} onChange={(e) => setGovProcessingDays(Math.max(1, parseInt(e.target.value) || 90))} className="w-28" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Buffer Days</label>
            <Input type="number" min={0} max={60} value={bufferDays} onChange={(e) => setBufferDays(Math.max(0, parseInt(e.target.value) || 10))} className="w-28" />
          </div>
        </div>
      </GlassCard>

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
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !targetDateObj && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDateObj ? format(targetDateObj, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={targetDateObj} onSelect={(d) => setTargetWorkReadyDate(d ? d.toISOString() : null)} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </>
        )}
      </GlassCard>

      {/* Regulatory Anchors */}
      {chain && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-3">Regulatory Anchors</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Day to Start Working</span>
              <span className="font-medium text-foreground">{formatDate(chain.lastDayToWork)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Earliest Date to Apply for OPT</span>
              <span className="font-medium text-foreground">{formatDate(chain.earliestDateToApply)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Date to Apply for OPT</span>
              <span className="font-medium text-foreground">{formatDate(chain.lastDateToApply)}</span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Segmented Timeline Bar */}
      {chain && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-3">Timeline Breakdown</h2>
          <SegmentedTimeline prepDays={14} hiringDays={hiringWeeks * 7} authDays={govProcessingDays + bufferDays} />
        </GlassCard>
      )}

      {!hasData ? (
        <GlassCard>
          <p className="text-sm text-muted-foreground">
            {isApproved
              ? "Please set your Program End Date and EAD Start Date in Step 1 to generate your timeline."
              : "Please set your Program End Date in Step 1 and a Target Work-Ready Date above to generate your timeline."}
          </p>
        </GlassCard>
      ) : (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-4">Your LRM Chain</h2>
          {milestones.map((m, i) => (
            <TimelineMilestone key={m.label} label={m.label} date={m.date} status={getMilestoneStatus(m.date)} isLast={i === milestones.length - 1} />
          ))}
        </GlassCard>
      )}

      {/* Prompt Library */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">AI Prompt Library</h2>
        <PromptLibrary />
      </div>

      <GlassCard>
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

export default Step3Timeline;
