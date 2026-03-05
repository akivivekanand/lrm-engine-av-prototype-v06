import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import TemplateCard from "@/components/TemplateCard";
import UnemploymentGauge from "@/components/UnemploymentGauge";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, formatDate } from "@/lib/calculations";
import { getDefaultHiringWeeks } from "@/lib/smart-suggestions";
import content from "@/data/content.json";
import tasks from "@/data/tasks.json";

const Dashboard = () => {
  const navigate = useNavigate();

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [industry] = usePersistedState<string>("industry", "general");
  const [hiringWeeks] = usePersistedState<number>("hiringWeeks", getDefaultHiringWeeks("general"));
  const [govProcessingDays] = usePersistedState<number>("govProcessingDays", 90);
  const [bufferDays] = usePersistedState<number>("bufferDays", 10);
  const [prepPhaseDays] = usePersistedState<number>("prepPhaseDays", 7);
  const [targetWorkReadyDate] = usePersistedState<string | null>("targetWorkReadyDate", null);
  const [daysUsed, setDaysUsed] = usePersistedState<number>("daysUsed", 0);

  const isApproved = optStatus === "approved";
  const chosenStartDateStr = isApproved ? eadDate : targetWorkReadyDate;

  const hasData = gradDate && chosenStartDateStr;
  const chain = hasData
    ? calculateLRMChainV2({
        graduationDate: new Date(gradDate),
        chosenStartDate: new Date(chosenStartDateStr),
        govProcessingDays,
        bufferDays,
        hiringWeeks,
        prepPhaseDays,
      })
    : null;

  // Count completed tasks
  const allTaskKeys = ["tasks-foundation", "tasks-preparation", "tasks-humanLayer", "tasks-compliance"];
  const allTasks = [...tasks.foundation, ...tasks.preparation, ...tasks.humanLayer, ...tasks.compliance];
  let completedCount = 0;
  allTaskKeys.forEach((key) => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "{}");
      completedCount += Object.values(data).filter(Boolean).length;
    } catch { /* */ }
  });

  const { universityContact, disclaimers } = content;

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Your Plan</h1>

      {chain && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-3">Key Dates</h2>
          <div className="space-y-2">
            {[
              { label: "LRM Date", date: chain.lrmDate },
              { label: "Hiring Cycle Peak", date: chain.hiringCyclePeak },
              { label: "Authorization Wall", date: chain.authorizationWall },
              { label: "Filing Deadline", date: chain.filingDeadline },
              { label: "Chosen Start Date", date: chain.chosenStartDate },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Unemployment gauge — only for approved status */}
      {isApproved && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-4">Unemployment Tracker</h2>
          <UnemploymentGauge daysUsed={daysUsed} />
          <div className="mt-4">
            <label className="text-xs text-muted-foreground block mb-1">Days Used</label>
            <Input
              type="number"
              min={0}
              max={90}
              value={daysUsed}
              onChange={(e) => setDaysUsed(Math.min(90, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-24"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{disclaimers.employment}</p>
        </GlassCard>
      )}

      <GlassCard>
        <h2 className="text-sm font-semibold text-foreground mb-2">Task Progress</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(completedCount / allTasks.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {completedCount}/{allTasks.length}
          </span>
        </div>
      </GlassCard>

      {/* Resource Vault — Templates */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Templates</h2>
        {content.templates.map((t) => (
          <TemplateCard key={t.id} title={t.title} body={t.body} />
        ))}
      </div>

      {/* Resource Vault — AI Prompts */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">AI Prompts</h2>
        {content.aiPrompts.map((p) => (
          <DashboardAiPromptCard key={p.id} title={p.title} prompt={p.prompt} />
        ))}
      </div>

      <GlassCard>
        <h2 className="text-sm font-semibold text-foreground mb-2">{universityContact.name}</h2>
        <p className="text-xs text-muted-foreground">{universityContact.office}</p>
        <p className="text-xs text-muted-foreground mt-1">{universityContact.address}</p>
        <p className="text-xs text-muted-foreground mt-1">{universityContact.phone}</p>
        <a
          href={universityContact.web}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline mt-1 block"
        >
          Visit ISSO Website
        </a>
      </GlassCard>

      <GlassCard className="bg-amber/5 border-amber/20">
        <p className="text-xs text-muted-foreground leading-relaxed">{disclaimers.legal}</p>
      </GlassCard>

      <Button variant="outline" onClick={() => navigate("/step-1-authorization")} className="w-full">
        Edit Inputs
      </Button>
    </StepLayout>
  );
};

function DashboardAiPromptCard({ title, prompt }: { title: string; prompt: string }) {
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

export default Dashboard;
