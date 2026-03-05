import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import ProgressBar from "@/components/ProgressBar";
import TimelineMilestone from "@/components/TimelineMilestone";
import TaskChecklist from "@/components/TaskChecklist";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChain, getMilestoneStatus } from "@/utils/dateCalculator";
import content from "@/data/content.json";
import tasks from "@/data/tasks.json";

const Step3Timeline = () => {
  const navigate = useNavigate();

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [processingType] = usePersistedState<string>("processingType", "standard");
  const [bufferWeeks] = usePersistedState<number>("bufferWeeks", 2);
  const [industry] = usePersistedState<string>("industry", "general");

  const snapshot = content.industrySnapshots[industry as keyof typeof content.industrySnapshots];
  const processingDays = processingType === "premium" ? 30 : 120;
  const bufferDays = bufferWeeks * 7;

  const hasData = gradDate && eadDate;
  const chain = hasData
    ? calculateLRMChain(new Date(gradDate), new Date(eadDate), processingDays, bufferDays, snapshot.weeks)
    : null;

  const milestones = chain
    ? [
        { label: "LRM Date (Start Outreach)", date: chain.lrmDate },
        { label: "Hiring Cycle Peak", date: chain.hiringCyclePeak },
        { label: "Authorization Wall", date: chain.authorizationWall },
        { label: "Filing Deadline", date: chain.filingDeadline },
        { label: "EAD Start Date", date: chain.eadStartDate },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <ProgressBar />
      <div className="max-w-md mx-auto px-4 pb-8 space-y-5">
        <h1 className="text-xl font-bold text-foreground">Step 3: Timeline</h1>

        {!hasData ? (
          <GlassCard className="bg-amber/5 border-amber/20">
            <p className="text-sm text-muted-foreground">
              Please complete Step 1 (Graduation Date and EAD Start Date) to generate your timeline.
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

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/step-2-strategy")} className="flex-1">
            Back
          </Button>
          <Button onClick={() => navigate("/dashboard")} className="flex-1">
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
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
