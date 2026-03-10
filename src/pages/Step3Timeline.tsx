import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Info } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import TimelineMilestone from "@/components/TimelineMilestone";
import SegmentedTimeline from "@/components/SegmentedTimeline";
import { Button } from "@/components/ui/button";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, getMilestoneStatus, formatDate } from "@/lib/calculations";

const Step3Timeline = () => {
  const navigate = useNavigate();
  const [showExplanation, setShowExplanation] = useState(false);

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [hiringWeeks] = usePersistedState<number>("hiringWeeks", 6);
  const [prepWindowDays] = usePersistedState<number>("prepWindowDays", 14);
  const [targetWorkReadyDate] = usePersistedState<string | null>("targetWorkReadyDate", null);
  const [estimatedStartDate] = usePersistedState<string | null>("estimatedStartDate", null);

  const isApproved = optStatus === "approved";
  const chosenStartDateStr = isApproved ? eadDate : (targetWorkReadyDate || estimatedStartDate);
  const gradDateObj = gradDate ? new Date(gradDate) : undefined;
  const chosenStartDateObj = chosenStartDateStr ? new Date(chosenStartDateStr) : undefined;

  const hasData = gradDateObj && chosenStartDateObj;
  const chain = hasData
    ? calculateLRMChainV2({
        programEndDate: gradDateObj,
        chosenStartDate: chosenStartDateObj,
        hiringWeeks,
        prepWindowDays,
      })
    : null;

  const milestones = chain
    ? [
        { label: "Last Responsible Moment (LRM)", date: chain.lrmDate },
        { label: "Chosen Start Date", date: chain.chosenStartDate },
        { label: "Program End Date", date: chain.programEndDate },
        { label: "Last Day to Start Working", date: chain.lastDayToWork },
      ]
    : [];

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 3: Timeline Review</h1>

      <p className="text-xs text-muted-foreground leading-relaxed -mt-2">
        This timeline shows how your preparation window, hiring cycle, and OPT buffer relate to your Last Responsible Moment (LRM).
      </p>

      {/* Displayed Inputs */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-foreground mb-3">Your Inputs</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Program End Date</span>
            <span className="font-medium text-foreground">{gradDateObj ? formatDate(gradDateObj) : "Not set"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Chosen Start Date</span>
            <span className="font-medium text-foreground">{chosenStartDateObj ? formatDate(chosenStartDateObj) : "Not set"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hiring Cycle</span>
            <span className="font-medium text-foreground">{hiringWeeks} weeks</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Preparation Window</span>
            <span className="font-medium text-foreground">{prepWindowDays} days</span>
          </div>
        </div>
      </GlassCard>

      {/* Calculated Dates */}
      {!hasData ? (
        <GlassCard>
          <p className="text-sm text-muted-foreground">
            Please complete Steps 1 and 2 to generate your timeline.
          </p>
        </GlassCard>
      ) : (
        <>
          <GlassCard>
            <h2 className="text-sm font-semibold text-foreground mb-3">Core Timeline Calculations</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Day to Start Working</span>
                <span className="font-medium text-foreground">{formatDate(chain!.lastDayToWork)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Chosen Start Date + 90 days</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Responsible Moment (LRM)</span>
                <span className="font-medium text-foreground">{formatDate(chain!.lrmDate)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Last Day to Start Working minus Hiring Cycle minus Preparation Window</p>
            </div>
          </GlassCard>

          {/* Timeline Visualization */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-foreground">Timeline Markers</h2>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
              >
                <Info className="h-3.5 w-3.5" />
                How this works
              </button>
            </div>
            {showExplanation && (
              <div className="p-3 rounded-lg bg-muted/50 mb-3 space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your Last Responsible Moment (LRM) is the latest date you should begin your job search while still allowing enough time to realistically secure employment before your OPT unemployment deadline.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  It is calculated using your start date, hiring cycle length, and preparation window.
                </p>
              </div>
            )}
            <SegmentedTimeline chain={chain!} />
          </GlassCard>

          {/* Key Dates */}
          <GlassCard>
            <h2 className="text-sm font-semibold text-foreground mb-4">Key Dates</h2>
            {milestones.map((m, i) => (
              <TimelineMilestone key={m.label} label={m.label} date={m.date} status={getMilestoneStatus(m.date)} isLast={i === milestones.length - 1} />
            ))}
          </GlassCard>
        </>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/step-2-strategy")} className="flex-1">
          Back
        </Button>
        <Button onClick={() => navigate("/my-plan")} className="flex-1" disabled={!hasData}>
          Continue to Step 4: Strategy
        </Button>
      </div>
    </StepLayout>
  );
};

export default Step3Timeline;
