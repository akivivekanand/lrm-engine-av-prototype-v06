import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Info, Sparkles, CalendarDays, Clock, Shield, Briefcase, BookOpen, CheckSquare, AlertTriangle } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import ContactCard from "@/components/ContactCard";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calculateLRMChainV2, formatDate, getMilestoneStatus, daysBetween, stripTime, addDays } from "@/lib/calculations";
import { generateCareerPlan, type CareerPlan } from "@/lib/generateCareerPlan";
import content from "@/data/content.json";

const Dashboard = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [generating, setGenerating] = useState(false);

  const [gradDate] = usePersistedState<string | null>("gradDate", null);
  const [eadDate] = usePersistedState<string | null>("eadDate", null);
  const [optStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [hiringWeeks] = usePersistedState<number>("hiringWeeks", 6);
  const [prepWindowDays] = usePersistedState<number>("prepWindowDays", 14);
  const [targetWorkReadyDate] = usePersistedState<string | null>("targetWorkReadyDate", null);
  const [estimatedStartDate] = usePersistedState<string | null>("estimatedStartDate", null);
  const [industryText] = usePersistedState<string>("industryText", "");
  const [careerPlanStartDate] = usePersistedState<string>("careerPlanStartDate", new Date().toISOString().split("T")[0]);
  const [selectedResources] = usePersistedState<string[]>("selectedResources", []);
  const [completedActions, setCompletedActions] = usePersistedState<string[]>("dashboardCompletedActions", []);

  const isApproved = optStatus === "approved";
  const chosenStartDateStr = isApproved ? eadDate : (targetWorkReadyDate || estimatedStartDate);

  const hasData = gradDate && chosenStartDateStr;
  const chain = hasData
    ? calculateLRMChainV2({
        programEndDate: new Date(gradDate),
        chosenStartDate: new Date(chosenStartDateStr!),
        hiringWeeks,
        prepWindowDays,
      })
    : null;

  const lrmStatus = chain ? getMilestoneStatus(chain.lrmDate) : null;
  const today = stripTime(new Date());

  // Hiring bands from Step 4 data
  const startDate = stripTime(new Date(careerPlanStartDate));
  const prepEnd = addDays(startDate, prepWindowDays);
  const hiringEnd = addDays(prepEnd, hiringWeeks * 7);
  const lastDayToWork = chain ? chain.lastDayToWork : hiringEnd;

  const totalBandDays = Math.max(1, daysBetween(startDate, lastDayToWork));
  const prepDays = Math.max(0, daysBetween(startDate, prepEnd));
  const hiringDays = Math.max(0, daysBetween(prepEnd, hiringEnd));
  const bufferDays = Math.max(0, daysBetween(hiringEnd, lastDayToWork));

  const prepPct = (prepDays / totalBandDays) * 100;
  const hiringPct = (hiringDays / totalBandDays) * 100;
  const bufferPct = (bufferDays / totalBandDays) * 100;

  // Unemployment clock
  const chosenStartDate = chosenStartDateStr ? stripTime(new Date(chosenStartDateStr)) : null;
  const showUnemploymentClock = isApproved && chosenStartDate && today.getTime() >= chosenStartDate.getTime();
  const unemploymentDays = showUnemploymentClock ? Math.min(90, daysBetween(chosenStartDate!, today)) : 0;

  // Next actions generation
  const daysToLRM = chain ? daysBetween(today, chain.lrmDate) : 0;
  const nextActions = useMemo(() => {
    const actions: { id: string; text: string }[] = [];
    if (!chain) return actions;

    if (optStatus === "notApplied") {
      actions.push({ id: "na-1", text: "File your OPT application immediately — the earliest you can apply is 90 days before your program end date." });
    }
    if (optStatus === "waiting") {
      actions.push({ id: "na-2", text: "Check your OPT application status on the USCIS Case Status page." });
    }
    if (daysToLRM > 14) {
      actions.push({ id: "na-3", text: `Update your resume and LinkedIn profile for ${industryText || "your target industry"}.` });
      actions.push({ id: "na-4", text: "Schedule an appointment with the Suffolk Career Center for a resume review." });
      actions.push({ id: "na-5", text: `Identify 10 target companies in ${industryText || "your target industry"} and research their hiring processes.` });
      actions.push({ id: "na-6", text: "Connect with 3 Suffolk alumni on LinkedIn with personalized connection requests." });
      actions.push({ id: "na-7", text: "Set up job alerts on Handshake, LinkedIn, and Indeed for your target roles." });
    } else if (daysToLRM > 0) {
      actions.push({ id: "na-8", text: "Begin submitting applications immediately — your LRM is approaching." });
      actions.push({ id: "na-9", text: `Apply to 3-5 positions in ${industryText || "your target industry"} this week.` });
      actions.push({ id: "na-10", text: "Reach out to any warm contacts for referrals at target companies." });
      actions.push({ id: "na-11", text: "Attend the next Career Center drop-in session for last-minute strategy advice." });
      actions.push({ id: "na-12", text: "Prepare for interviews by practicing STAR method answers for common behavioral questions." });
    } else {
      actions.push({ id: "na-13", text: "Your LRM has passed — dedicate 3-4 hours daily to active job search." });
      actions.push({ id: "na-14", text: "Apply to positions daily and expand your target to include adjacent roles." });
      actions.push({ id: "na-15", text: "Contact the Career Center for expedited support and priority advising." });
      actions.push({ id: "na-16", text: "Leverage every available contact — alumni, professors, and professional networks." });
      actions.push({ id: "na-17", text: "Consider contract or part-time positions that could convert to full-time and stop your unemployment clock." });
    }
    return actions.slice(0, 7);
  }, [chain, optStatus, daysToLRM, industryText]);

  const toggleAction = (id: string) => {
    setCompletedActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Resource labels
  const allResourceCards = useMemo(() => {
    // Inline mapping of resource IDs to titles/categories
    const resourceMap: Record<string, { title: string; category: string }> = {};
    const resourceDefs = [
      { id: "tpl-info-interview", title: "Informational Interview Request", category: "Template" },
      { id: "tpl-recruiter", title: "Recruiter Outreach", category: "Template" },
      { id: "tpl-follow-up", title: "Networking Follow-Up", category: "Template" },
      { id: "ai-resume", title: "Resume Optimization", category: "AI Prompt" },
      { id: "ai-cover", title: "Cover Letter Generator", category: "AI Prompt" },
      { id: "ai-interview", title: "Interview Preparation", category: "AI Prompt" },
      { id: "ai-company", title: "Company Research Brief", category: "AI Prompt" },
      { id: "ai-linkedin", title: "LinkedIn Profile Optimizer", category: "AI Prompt" },
      { id: "ai-salary", title: "Salary Negotiation Script", category: "AI Prompt" },
      { id: "ai-networking", title: "Networking Outreach Messages", category: "AI Prompt" },
      { id: "ai-info-interview", title: "Informational Interview Prep", category: "AI Prompt" },
      { id: "ai-strategy", title: "Job Search Strategy Plan", category: "AI Prompt" },
      { id: "ai-opt-convo", title: "OPT Employer Conversation", category: "AI Prompt" },
      { id: "ai-skills-gap", title: "Skills Gap Analysis", category: "AI Prompt" },
      { id: "ai-offer-eval", title: "Offer Evaluation Framework", category: "AI Prompt" },
      { id: "int-star", title: "STAR Story Generator", category: "Interview" },
      { id: "int-case", title: "Case Interview Framework", category: "Interview" },
      { id: "int-technical", title: "Technical Interview Prep", category: "Interview" },
      { id: "int-questions", title: "Smart Questions to Ask", category: "Interview" },
      { id: "net-elevator", title: "Problem-Solver Elevator Pitch", category: "Networking" },
      { id: "net-referral", title: "Referral Request Template", category: "Networking" },
      { id: "net-thank-you", title: "Post-Interview Thank You", category: "Networking" },
      { id: "net-cold", title: "Cold Outreach to Hiring Manager", category: "Networking" },
      { id: "net-icebreaker", title: "Networking Icebreaker Questions", category: "Networking" },
      { id: "suf-careers", title: "Suffolk Career Center", category: "Suffolk" },
      { id: "suf-isso", title: "ISSO", category: "Suffolk" },
      { id: "suf-labor", title: "Labor Market Insights", category: "Suffolk" },
      { id: "suf-handshake", title: "Handshake", category: "Suffolk" },
      { id: "suf-dropin", title: "Career Center Drop-In Hours", category: "Suffolk" },
    ];
    resourceDefs.forEach((r) => { resourceMap[r.id] = { title: r.title, category: r.category }; });
    return resourceMap;
  }, []);

  const handleGenerate = async () => {
    if (!chain) return;
    setGenerating(true);
    try {
      const result = generateCareerPlan({
        chain,
        industryText,
        hiringWeeks,
        prepWindowDays,
        optStatus,
      });
      setPlan(result);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["hsl(262,83%,58%)", "hsl(210,40%,98%)", "hsl(262,83%,78%)"],
      });
    } catch (err) {
      console.error("Career plan generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const statusColor = lrmStatus === "crisis" ? "destructive" : lrmStatus === "compression" ? "secondary" : "outline";
  const statusLabel = lrmStatus === "crisis" ? "Past Due" : lrmStatus === "compression" ? "Soon" : "On Track";

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Dashboard</h1>

      {/* (a) Your Timeline — Hiring Bands + Key Dates */}
      {chain && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Your Timeline</h2>
            <Badge variant={statusColor} className="ml-auto">{statusLabel}</Badge>
          </div>

          {/* Hiring Bands */}
          <div className="space-y-2 mb-5">
            <p className="text-xs font-medium text-muted-foreground">Career Strategy Bands</p>
            <div className="flex rounded-lg overflow-hidden h-8">
              {prepPct > 0 && (
                <div
                  className="bg-emerald-500 flex items-center justify-center text-[9px] font-semibold text-white"
                  style={{ width: `${Math.max(prepPct, 8)}%` }}
                >
                  Prep
                </div>
              )}
              {hiringPct > 0 && (
                <div
                  className="bg-amber-500 flex items-center justify-center text-[9px] font-semibold text-white"
                  style={{ width: `${Math.max(hiringPct, 8)}%` }}
                >
                  Hiring
                </div>
              )}
              {bufferPct > 0 && (
                <div
                  className="bg-purple-500 flex items-center justify-center text-[9px] font-semibold text-white"
                  style={{ width: `${Math.max(bufferPct, 8)}%` }}
                >
                  OPT Buffer
                </div>
              )}
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>{formatDate(startDate)}</span>
              <span>{formatDate(prepEnd)}</span>
              <span>{formatDate(hiringEnd)}</span>
              <span>{formatDate(lastDayToWork)}</span>
            </div>
          </div>

          {/* Key Dates Timeline */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Key Dates</p>
            {[
              { label: "LRM", date: chain.lrmDate, color: "bg-rose-500" },
              { label: "Chosen Start Date", date: chain.chosenStartDate, color: "bg-amber-500" },
              { label: "Program End Date", date: chain.programEndDate, color: "bg-emerald-500" },
              { label: "Last Day to Start Working", date: chain.lastDayToWork, color: "bg-indigo-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color} inline-block`} />
                  <span className="text-muted-foreground text-xs">{item.label}</span>
                </div>
                <span className="font-medium text-foreground text-xs">{formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* (b) Your Authorization Window */}
      {chain && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Your Authorization Window</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground text-xs">OPT Status</span>
              <Badge variant="outline" className="text-[10px]">
                {optStatus === "approved" ? "Approved" : optStatus === "waiting" ? "Pending" : "Not Applied"}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground text-xs">Chosen Start Date</span>
              <span className="font-medium text-foreground text-xs">{formatDate(chain.chosenStartDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground text-xs">Last Day to Start Working</span>
              <span className="font-medium text-foreground text-xs">{formatDate(chain.lastDayToWork)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground text-xs">Program End Date</span>
              <span className="font-medium text-foreground text-xs">{formatDate(chain.programEndDate)}</span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* (c) Your Strategy Summary */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Your Strategy Summary</h2>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground text-xs">Target Industry</span>
            <span className="font-medium text-foreground text-xs">{industryText || "Not set"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground text-xs">Hiring Cycle</span>
            <span className="font-medium text-foreground text-xs">{hiringWeeks} weeks</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground text-xs">Preparation Window</span>
            <span className="font-medium text-foreground text-xs">{prepWindowDays} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground text-xs">Career Plan Start Date</span>
            <span className="font-medium text-foreground text-xs">{formatDate(new Date(careerPlanStartDate))}</span>
          </div>
        </div>
      </GlassCard>

      {/* (d) Your Resources */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Your Resources</h2>
          <Badge variant="outline" className="ml-auto text-[10px]">{selectedResources.length} selected</Badge>
        </div>
        {selectedResources.length === 0 ? (
          <p className="text-xs text-muted-foreground">No resources selected yet. Visit Step 5 to add resources to your toolkit.</p>
        ) : (
          <div className="space-y-1.5">
            {selectedResources.map((id) => {
              const res = allResourceCards[id];
              if (!res) return null;
              return (
                <div key={id} className="flex items-center gap-2 text-xs">
                  <span className="text-foreground">{res.title}</span>
                  <Badge variant="outline" className="text-[9px]">{res.category}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* (e) Next Actions */}
      {chain && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Next Actions</h2>
          </div>
          <div className="space-y-2">
            {nextActions.map((action) => (
              <label key={action.id} className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  className="mt-0.5"
                  checked={completedActions.includes(action.id)}
                  onCheckedChange={() => toggleAction(action.id)}
                />
                <span className={`text-xs leading-relaxed ${completedActions.includes(action.id) ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {action.text}
                </span>
              </label>
            ))}
          </div>
        </GlassCard>
      )}

      {/* (f) Unemployment Clock */}
      {showUnemploymentClock && (
        <GlassCard className={unemploymentDays >= 75 ? "border-2 border-destructive/30" : ""}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Unemployment Clock</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{unemploymentDays}</p>
              <p className="text-xs text-muted-foreground">days elapsed since OPT start</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground">{90 - unemploymentDays}</p>
              <p className="text-xs text-muted-foreground">days remaining</p>
            </div>
          </div>
          <div className="mt-3 h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${unemploymentDays >= 75 ? "bg-destructive" : unemploymentDays >= 60 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${(unemploymentDays / 90) * 100}%` }}
            />
          </div>
          {unemploymentDays >= 75 && (
            <div className="flex items-start gap-2 mt-3 p-2 rounded bg-destructive/10">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
              <p className="text-[10px] text-destructive font-medium">You are approaching the 90-day unemployment limit. Secure employment immediately.</p>
            </div>
          )}
        </GlassCard>
      )}

      {/* Generate Button */}
      {chain && !plan && (
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full h-14 text-base font-semibold"
          size="lg"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          {generating ? "Generating..." : "Generate My Career Strategy"}
        </Button>
      )}

      {chain && plan && (
        <Button
          onClick={handleGenerate}
          disabled={generating}
          variant="outline"
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {generating ? "Regenerating..." : "Regenerate Career Strategy"}
        </Button>
      )}

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

      <Button variant="outline" onClick={() => navigate("/step-1-authorization")} className="w-full">
        Edit Inputs
      </Button>
    </StepLayout>
  );
};

export default Dashboard;
