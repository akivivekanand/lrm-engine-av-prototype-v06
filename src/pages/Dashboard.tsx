import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import ProgressBar from "@/components/ProgressBar";
import UnemploymentGauge from "@/components/UnemploymentGauge";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChain, formatDate } from "@/utils/dateCalculator";
import content from "@/data/content.json";
import tasks from "@/data/tasks.json";

const Dashboard = () => {
  const navigate = useNavigate();

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [processingType] = usePersistedState<string>("processingType", "standard");
  const [bufferWeeks] = usePersistedState<number>("bufferWeeks", 2);
  const [industry] = usePersistedState<string>("industry", "general");
  const [daysUsed, setDaysUsed] = usePersistedState<number>("daysUsed", 0);

  const snapshot = content.industrySnapshots[industry as keyof typeof content.industrySnapshots];
  const processingDays = processingType === "premium" ? 30 : 120;

  const hasData = gradDate && eadDate;
  const chain = hasData
    ? calculateLRMChain(new Date(gradDate), new Date(eadDate), processingDays, bufferWeeks * 7, snapshot.weeks)
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <ProgressBar />
      <div className="max-w-md mx-auto px-4 pb-8 space-y-5">
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
                { label: "EAD Start Date", date: chain.eadStartDate },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{formatDate(item.date)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

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

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate("/step-2-strategy")} className="text-xs h-10">
            Templates
          </Button>
          <Button variant="outline" onClick={() => navigate("/step-3-timeline")} className="text-xs h-10">
            AI Prompts
          </Button>
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

        <Button variant="outline" onClick={() => navigate("/step-1-authorization")} className="w-full">
          Edit Inputs
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
