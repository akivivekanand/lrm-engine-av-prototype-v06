import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import TaskChecklist from "@/components/TaskChecklist";
import TemplateCard from "@/components/TemplateCard";
import { usePersistedState } from "@/hooks/usePersistedState";
import { getDefaultHiringWeeks } from "@/lib/smart-suggestions";
import content from "@/data/content.json";
import tasks from "@/data/tasks.json";

const industries = [
  { value: "finance", label: "Finance" },
  { value: "tech", label: "Tech" },
  { value: "consulting", label: "Consulting" },
  { value: "healthcare", label: "Healthcare" },
  { value: "general", label: "General" },
];

const Step2Strategy = () => {
  const navigate = useNavigate();
  const [industry, setIndustry] = usePersistedState<string>("industry", "general");
  const [hiringWeeks, setHiringWeeks] = usePersistedState<number>("hiringWeeks", getDefaultHiringWeeks("general"));

  const snapshot = content.industrySnapshots[industry as keyof typeof content.industrySnapshots];
  const suggestedWeeks = getDefaultHiringWeeks(industry);

  // When industry changes, reset hiring weeks to suggested default
  useEffect(() => {
    setHiringWeeks(suggestedWeeks);
  }, [industry, suggestedWeeks, setHiringWeeks]);

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 2: Strategy</h1>

      <GlassCard>
        <label className="text-sm font-medium text-foreground block mb-2">Target Industry</label>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {industries.map((i) => (
              <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {snapshot && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-foreground font-medium">
              Suggested Hiring Cycle: ~{suggestedWeeks} weeks
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{snapshot.note}</p>
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <label className="text-sm font-medium text-foreground block mb-2">
          Hiring Weeks: {hiringWeeks}
        </label>
        <Slider
          value={[hiringWeeks]}
          onValueChange={([v]) => setHiringWeeks(v)}
          min={2}
          max={20}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>2 weeks</span><span>20 weeks</span>
        </div>
      </GlassCard>

      <GlassCard>
        <TaskChecklist title="Foundation Tasks" tasks={tasks.foundation} storageKey="tasks-foundation" />
      </GlassCard>

      <GlassCard>
        <TaskChecklist title="Preparation Tasks" tasks={tasks.preparation} storageKey="tasks-preparation" />
      </GlassCard>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Templates</h2>
        {content.templates.map((t) => (
          <TemplateCard key={t.id} title={t.title} body={t.body} />
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/step-1-authorization")} className="flex-1">
          Back
        </Button>
        <Button onClick={() => navigate("/step-3-timeline")} className="flex-1">
          Continue
        </Button>
      </div>
    </StepLayout>
  );
};

export default Step2Strategy;
