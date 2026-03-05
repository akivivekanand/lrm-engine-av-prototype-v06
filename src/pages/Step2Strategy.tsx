import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import GlassCard from "@/components/GlassCard";
import ProgressBar from "@/components/ProgressBar";
import TaskChecklist from "@/components/TaskChecklist";
import TemplateCard from "@/components/TemplateCard";
import { usePersistedState } from "@/hooks/usePersistedState";
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
  const [bufferWeeks, setBufferWeeks] = usePersistedState<number>("bufferWeeks", 2);

  const snapshot = content.industrySnapshots[industry as keyof typeof content.industrySnapshots];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <ProgressBar />
      <div className="max-w-md mx-auto px-4 pb-8 space-y-5">
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
                Hiring Cycle: ~{snapshot.weeks} weeks
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">{snapshot.note}</p>
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <label className="text-sm font-medium text-foreground block mb-2">
            Buffer Weeks: {bufferWeeks}
          </label>
          <Slider
            value={[bufferWeeks]}
            onValueChange={([v]) => setBufferWeeks(v)}
            min={1}
            max={4}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1 week</span><span>4 weeks</span>
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
      </div>
    </div>
  );
};

export default Step2Strategy;
