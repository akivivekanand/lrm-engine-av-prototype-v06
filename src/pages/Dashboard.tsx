import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import TemplateCard from "@/components/TemplateCard";
import SegmentedTimeline from "@/components/SegmentedTimeline";
import UnemploymentGauge from "@/components/UnemploymentGauge";
import TaskEngineComponent from "@/components/TaskEngineComponent";
import PromptLibrary from "@/components/PromptLibrary";
import ContactCard from "@/components/ContactCard";
import EventCard from "@/components/EventCard";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, formatDate, getMilestoneStatus, daysBetween, stripTime } from "@/lib/calculations";
import content from "@/data/content.json";
import type { CalendarEvent } from "@/types/events";

const Dashboard = () => {
  const navigate = useNavigate();

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [hiringWeeks] = usePersistedState<number>("hiringWeeks", 6);
  const [prepWindowDays] = usePersistedState<number>("prepWindowDays", 14);
  const [targetWorkReadyDate] = usePersistedState<string | null>("targetWorkReadyDate", null);
  const [estimatedStartDate] = usePersistedState<string | null>("estimatedStartDate", null);

  const isApproved = optStatus === "approved";
  // For waiting status with passed start date, use estimatedStartDate as fallback
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

  // Auto-calculate unemployment days for approved status
  const autoCalcDaysUsed = (() => {
    if (!isApproved || !chosenStartDateStr) return 0;
    const start = stripTime(new Date(chosenStartDateStr));
    const today = stripTime(new Date());
    const diff = daysBetween(start, today);
    return Math.max(0, Math.min(90, diff));
  })();

  return (
    <StepLayout>
      {/* Hero: LRM Date */}
      {chain && (
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Last Responsible Moment</p>
              <p className="text-lg font-bold text-foreground">{formatDate(chain.lrmDate)}</p>
            </div>
            <Badge variant={statusColor}>
              {lrmStatus === "crisis" ? "Past Due" : lrmStatus === "compression" ? "Soon" : "On Track"}
            </Badge>
          </div>
          <div className="flex items-start gap-1.5 mt-3 p-2 rounded bg-muted/50">
            <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              LRM = Last Day to Start Working − Hiring Cycle − Preparation Window. This is the latest date you should begin your job search.
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
        </GlassCard>
      )}

      {/* Unemployment Gauge */}
      {isApproved && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-4">Unemployment Tracker</h2>
          <UnemploymentGauge daysUsed={autoCalcDaysUsed} />
        </GlassCard>
      )}

      {/* Task Engine */}
      <TaskEngineComponent />

      {/* Resource Vault: Templates */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Templates</h2>
        {content.templates.map((t) => (
          <TemplateCard key={t.id} title={t.title} body={t.body} subject={t.subject} />
        ))}
      </div>

      {/* Prompt Library */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">AI Prompt Library</h2>
        <PromptLibrary />
      </div>

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

      {/* Upcoming Events */}
      {chain && (() => {
        try {
          const stored = localStorage.getItem("semesterEvents");
          if (!stored) return null;
          const all: CalendarEvent[] = JSON.parse(stored);
          const today = new Date().toISOString().split("T")[0];
          const upcoming = all.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
          if (upcoming.length === 0) return null;
          return (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Upcoming Events</h2>
              {upcoming.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          );
        } catch {
          return null;
        }
      })()}

      <Button variant="outline" onClick={() => navigate("/step-1-authorization")} className="w-full">
        Edit Inputs
      </Button>
    </StepLayout>
  );
};

export default Dashboard;
