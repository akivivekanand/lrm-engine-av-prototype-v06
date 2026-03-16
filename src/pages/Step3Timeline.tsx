import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Info, CalendarIcon, AlertTriangle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, getMilestoneStatus, formatDate, stripTime, addDays, daysBetween } from "@/lib/calculations";

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

const Step3Timeline = () => {
  const navigate = useNavigate();
  const [showExplanation, setShowExplanation] = useState(false);

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [hiringWeeks, setHiringWeeks] = usePersistedState<number>("hiringWeeks", 6);
  const [prepWindowDays, setPrepWindowDays] = usePersistedState<number>("prepWindowDays", 14);
  const [targetWorkReadyDate, setTargetWorkReadyDate] = usePersistedState<string | null>("targetWorkReadyDate", null);
  const [estimatedStartDate] = usePersistedState<string | null>("estimatedStartDate", null);
  const [careerStrategyLaunchDate] = usePersistedState<string | null>("careerStrategyLaunchDate", null);

  const isApproved = optStatus === "approved";
  const isNotApplied = optStatus === "notApplied";
  const gradDateObj = gradDate ? new Date(gradDate) : undefined;

  // Determine chosen start date based on status
  let chosenStartDateStr: string | null = null;
  if (isApproved) {
    chosenStartDateStr = eadDate;
  } else if (isNotApplied) {
    // Default to program end + 30 days if not set
    if (targetWorkReadyDate) {
      chosenStartDateStr = targetWorkReadyDate;
    } else if (gradDateObj) {
      const defaultDate = addDays(stripTime(gradDateObj), 30);
      chosenStartDateStr = defaultDate.toISOString();
      setTargetWorkReadyDate(defaultDate.toISOString());
    }
  } else {
    chosenStartDateStr = targetWorkReadyDate || estimatedStartDate;
  }

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

  const today = stripTime(new Date());
  const lrmPassed = chain ? chain.lrmDate.getTime() < today.getTime() : false;

  // Validation for Not Applied
  const minChosenDate = gradDateObj ? stripTime(gradDateObj) : undefined;
  const maxChosenDate = gradDateObj ? addDays(stripTime(gradDateObj), 60) : undefined;
  const chosenStartOutOfRange =
    isNotApplied &&
    gradDateObj &&
    chosenStartDateObj &&
    (stripTime(chosenStartDateObj).getTime() < stripTime(gradDateObj).getTime() ||
      stripTime(chosenStartDateObj).getTime() > addDays(stripTime(gradDateObj), 60).getTime());

  const handleChosenStartChange = (d: Date | undefined) => {
    setTargetWorkReadyDate(d ? d.toISOString() : null);
  };

  // Dynamic start label
  const startLabel = isApproved ? "EAD Start Date" : "Chosen Start Date";

  // Chronological key dates
  const csldObj = careerStrategyLaunchDate ? new Date(careerStrategyLaunchDate) : null;

  const keyDates = chain
    ? [
        { label: "Program End Date", date: chain.programEndDate },
        { label: "Today", date: today },
        { label: "LRM", date: chain.lrmDate },
        { label: startLabel, date: chain.chosenStartDate },
        { label: "Last Day to Start Working", date: chain.lastDayToWork },
        ...(csldObj ? [{ label: "Career Strategy Launch Date", date: csldObj }] : []),
      ].sort((a, b) => a.date.getTime() - b.date.getTime())
    : [];

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 3: Timeline Intelligence</h1>

      <p className="text-xs text-muted-foreground leading-relaxed -mt-2">
        This timeline shows how your preparation window, hiring cycle, and OPT buffer relate to your Last Responsible Moment (LRM).
      </p>

      {/* LRM Passed Warning */}
      {lrmPassed && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">Your Last Responsible Moment Has Passed</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground mt-1 space-y-2">
            <p>
              Based on your current timeline inputs, the recommended date to begin preparing your job search has already passed. This does not mean it is too late, but you may need to accelerate your job search strategy.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>Begin networking immediately.</li>
              <li>Prioritize active hiring opportunities.</li>
              <li>Focus on employers with shorter hiring cycles.</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Interactive Controls — Not Applied only */}
      {isNotApplied && hasData && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-3">Adjust Your Timeline</h2>
          <div className="space-y-4">
            {/* Chosen Start Date */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-medium text-foreground">Chosen Start Date</label>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors">
                      <Info className="h-3 w-3" /> Learn More
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>OPT Start Date Window</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>OPT start dates must fall between your program end date and the end of the 60 day grace period after program completion.</p>
                      <p>Students may apply for OPT earlier, but their employment start date must remain within this allowed window.</p>
                      <a
                        href="https://www.suffolk.edu/global/international-students/isso/immigration-resources/employment/opt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Learn More About OPT Timeline
                      </a>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("w-full justify-start text-left font-normal h-9 text-sm gap-1.5", chosenStartOutOfRange && "border-destructive text-destructive")}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {chosenStartDateObj ? format(chosenStartDateObj, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={chosenStartDateObj}
                    onSelect={handleChosenStartChange}
                    disabled={(date) => {
                      const d = stripTime(date);
                      return d.getTime() < minChosenDate!.getTime() || d.getTime() > maxChosenDate!.getTime();
                    }}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {chosenStartOutOfRange && (
                <p className="text-[10px] text-destructive mt-1">
                  Chosen start dates for OPT must fall within the 60 day grace period following your program end date.
                </p>
              )}
            </div>

            {/* Hiring Cycle Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-foreground">Hiring Cycle</label>
                <span className="text-xs font-medium text-muted-foreground">{hiringWeeks} weeks</span>
              </div>
              <Slider
                value={[hiringWeeks]}
                onValueChange={([v]) => setHiringWeeks(v)}
                min={2}
                max={16}
                step={1}
              />
            </div>

            {/* Prep Window Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-foreground">Preparation Window</label>
                <span className="text-xs font-medium text-muted-foreground">{prepWindowDays} days</span>
              </div>
              <Slider
                value={[prepWindowDays]}
                onValueChange={([v]) => setPrepWindowDays(v)}
                min={0}
                max={60}
                step={1}
              />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Read-only Inputs for non-interactive statuses */}
      {!isNotApplied && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-3">Your Inputs</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Program End Date</span>
              <span className="font-medium text-foreground">{gradDateObj ? formatDate(gradDateObj) : "Not set"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{startLabel}</span>
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
      )}

      {/* Timeline & Key Dates */}
      {!hasData ? (
        <GlassCard>
          <p className="text-sm text-muted-foreground">
            Please complete Steps 1 and 2 to generate your timeline.
          </p>
        </GlassCard>
      ) : (
        <>
          {/* Core Calculations */}
          <GlassCard>
            <h2 className="text-sm font-semibold text-foreground mb-3">Core Timeline Calculations</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Day to Start Working</span>
                <span className="font-medium text-foreground">{formatDate(chain!.lastDayToWork)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{startLabel} + 90 days</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Responsible Moment (LRM)</span>
                <span className="font-medium text-foreground">{formatDate(chain!.lrmDate)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Last Day to Start Working − Hiring Cycle − Preparation Window</p>
            </div>
          </GlassCard>

          {/* Timeline Visualization */}
          <GlassCard>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-sm font-semibold text-foreground">Timeline Intelligence</h2>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
              >
                <Info className="h-3.5 w-3.5" />
                How this works
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              This timeline shows how your preparation window, hiring cycle, and OPT timing affect your Last Responsible Moment (LRM).
            </p>
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
            <SegmentedTimeline chain={chain!} startLabel={startLabel} careerStrategyLaunchDate={csldObj || undefined} />
          </GlassCard>

          {/* Key Dates — chronological */}
          <GlassCard>
            <h2 className="text-sm font-semibold text-foreground mb-4">Key Dates</h2>
            <div className="space-y-3">
              {keyDates.map((m) => {
                const dotColor = m.label === "Today"
                  ? "bg-sky"
                  : m.label === "Program End Date"
                    ? "bg-slate"
                    : m.label === "LRM"
                      ? "bg-amber"
                      : m.label === "Last Day to Start Working"
                        ? "bg-critical"
                        : m.label === "Career Strategy Launch Date"
                          ? "bg-emerald"
                          : "bg-primary";
                const isPast = m.date.getTime() < today.getTime() && m.label !== "Today";
                return (
                  <div key={m.label} className={cn("flex items-center gap-3", isPast && "opacity-40")}>
                    <div className={cn("w-3 h-3 rounded-full shrink-0", dotColor)} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className="text-xs text-primary/70">{formatDate(m.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
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
