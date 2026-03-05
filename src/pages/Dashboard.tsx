import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import TemplateCard from "@/components/TemplateCard";
import SegmentedTimeline from "@/components/SegmentedTimeline";
import UnemploymentGauge from "@/components/UnemploymentGauge";
import TaskEngineComponent from "@/components/TaskEngineComponent";
import PromptLibrary from "@/components/PromptLibrary";
import ContactCard from "@/components/ContactCard";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, formatDate, getMilestoneStatus } from "@/lib/calculations";
import content from "@/data/content.json";

const Dashboard = () => {
  const navigate = useNavigate();

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [hiringWeeks] = usePersistedState<number>("hiringWeeks", 6);
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

  const lrmStatus = chain ? getMilestoneStatus(chain.lrmDate) : null;
  const statusColor = lrmStatus === "crisis" ? "destructive" : lrmStatus === "compression" ? "secondary" : "outline";

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
        </GlassCard>
      )}

      {/* Key Dates */}
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
              { label: "Last Day to Start Working", date: chain.lastDayToWork },
              { label: "Application Anchor", date: chain.applicationAnchor },
              { label: "Filing Window (Earliest)", date: chain.filingWindow.earliest },
              { label: "Filing Window (Latest)", date: chain.filingWindow.latest },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Segmented Timeline */}
      {chain && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-3">Timeline Breakdown</h2>
          <SegmentedTimeline prepDays={prepPhaseDays} hiringDays={hiringWeeks * 7} authDays={govProcessingDays + bufferDays} />
        </GlassCard>
      )}

      {/* Unemployment Gauge */}
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

      {/* Career Center */}
      <ContactCard contact={content.careerCenter} />

      {/* Disclaimers */}
      <GlassCard>
        <p className="text-xs text-muted-foreground leading-relaxed">{content.disclaimers.legal}</p>
      </GlassCard>

      <Button variant="outline" onClick={() => navigate("/step-1-authorization")} className="w-full">
        Edit Inputs
      </Button>
    </StepLayout>
  );
};

export default Dashboard;
