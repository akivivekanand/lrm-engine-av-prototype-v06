import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Sparkles, Check, Pencil, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import { usePersistedState } from "@/hooks/usePersistedState";
import { suggestIndustry, type IndustrySuggestion } from "@/lib/smart-suggestions";

type Mode = "ai" | "suggested" | "custom";

const Step2Strategy = () => {
  const navigate = useNavigate();
  const [industryText, setIndustryText] = usePersistedState<string>("industryText", "");
  const [hiringWeeks, setHiringWeeks] = usePersistedState<number>("hiringWeeks", 6);
  const [prepWindowDays, setPrepWindowDays] = usePersistedState<number>("prepWindowDays", 14);
  const [hiringMode, setHiringMode] = usePersistedState<Mode>("hiringWeeksMode", "ai");
  const [prepMode, setPrepMode] = usePersistedState<Mode>("prepWindowMode", "ai");

  const [suggestion, setSuggestion] = useState<IndustrySuggestion | null>(null);
  const [assessed, setAssessed] = useState(false);

  const handleAssess = () => {
    if (!industryText.trim()) return;
    const result = suggestIndustry(industryText);
    setSuggestion(result);
    setAssessed(true);
    setHiringWeeks(result.weeks);
    setPrepWindowDays(result.prepWindowDays);
    setHiringMode("suggested");
    setPrepMode("suggested");
  };

  const handleAcceptHiring = () => {
    if (suggestion) {
      setHiringWeeks(suggestion.weeks);
      setHiringMode("suggested");
    }
  };

  const handleAcceptPrep = () => {
    if (suggestion) {
      setPrepWindowDays(suggestion.prepWindowDays);
      setPrepMode("suggested");
    }
  };

  const modeLabel = (mode: Mode) =>
    mode === "ai" ? "Assessment" : mode === "suggested" ? "Accepted" : "Custom";

  const ModeToggle = ({
    mode,
    onSelect,
    hasAssessment,
  }: {
    mode: Mode;
    onSelect: (m: Mode) => void;
    hasAssessment: boolean;
  }) => (
    <div className="flex gap-1.5 mb-3">
      {(["ai", "suggested", "custom"] as Mode[]).map((m) => (
        <button
          key={m}
          onClick={() => onSelect(m)}
          disabled={!hasAssessment && m !== "custom"}
          className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
            mode === m
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
          } ${!hasAssessment && m !== "custom" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {m === "ai" && <Sparkles className="inline h-3 w-3 mr-1" />}
          {m === "suggested" && <Check className="inline h-3 w-3 mr-1" />}
          {m === "custom" && <Pencil className="inline h-3 w-3 mr-1" />}
          {modeLabel(m)}
        </button>
      ))}
    </div>
  );

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 2: Market Reality</h1>

      <p className="text-xs text-muted-foreground leading-relaxed -mt-2">
        These estimates are suggestions based on common hiring cycles. Students may adjust preparation days or hiring cycle length if their industry follows a different timeline.
      </p>

      {/* Target Industry */}
      <GlassCard>
        <label className="text-sm font-medium text-foreground block mb-2">Target Industry or Role</label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. finance, tech, consulting..."
            value={industryText}
            onChange={(e) => setIndustryText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAssess()}
          />
          <Button onClick={handleAssess} size="sm" className="shrink-0">
            <Sparkles className="h-4 w-4 mr-1" />
            Get Assessment
          </Button>
        </div>
        <a
          href="https://careers.suffolk.edu/labor-market-insights/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2 font-medium transition-colors"
        >
          View Suffolk Labor Market Insights <ExternalLink className="h-3 w-3" />
        </a>
      </GlassCard>

      {/* AI Assessment Result */}
      {assessed && suggestion && (
        <GlassCard className="border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Market Assessment</h2>
            <Badge variant="outline" className="text-[10px]">{suggestion.industryKey}</Badge>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Suggested Hiring Cycle</span>
              <span className="font-medium text-foreground">~{suggestion.weeks} weeks</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Suggested Preparation Window</span>
              <span className="font-medium text-foreground">{suggestion.prepWindowDays} days</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{suggestion.note}</p>
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Sources</p>
            {suggestion.sources.map((s) => (
              <p key={s} className="text-[10px] text-muted-foreground">- {s}</p>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => { handleAcceptHiring(); handleAcceptPrep(); }}>
              <Check className="h-3.5 w-3.5 mr-1" /> Accept Both
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setHiringMode("custom"); setPrepMode("custom"); }}>
              <Pencil className="h-3.5 w-3.5 mr-1" /> Enter Custom
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Hiring Cycle Weeks */}
      <GlassCard>
        <label className="text-sm font-medium text-foreground block mb-1">Hiring Cycle Weeks</label>
        <ModeToggle mode={hiringMode} onSelect={setHiringMode} hasAssessment={assessed} />

        {hiringMode === "ai" && !assessed && (
          <p className="text-xs text-muted-foreground">Run an assessment above to get a suggested value.</p>
        )}
        {hiringMode === "ai" && assessed && suggestion && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-foreground">{suggestion.weeks} weeks</p>
            <p className="text-[10px] text-muted-foreground mt-1">Suggested based on {suggestion.industryKey} market data</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={handleAcceptHiring}>
              Accept This Value
            </Button>
          </div>
        )}
        {hiringMode === "suggested" && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-foreground">{hiringWeeks} weeks</p>
            <p className="text-[10px] text-muted-foreground mt-1">Accepted from AI suggestion</p>
          </div>
        )}
        {hiringMode === "custom" && (
          <>
            <p className="text-xs text-muted-foreground mb-2">Hiring Cycle: {hiringWeeks} weeks</p>
            <Slider
              value={[hiringWeeks]}
              onValueChange={([v]) => setHiringWeeks(v)}
              min={2}
              max={26}
              step={1}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>2 weeks</span><span>26 weeks</span>
            </div>
          </>
        )}
      </GlassCard>

      {/* Preparation Window */}
      <GlassCard>
        <label className="text-sm font-medium text-foreground block mb-1">Preparation Window</label>
        <ModeToggle mode={prepMode} onSelect={setPrepMode} hasAssessment={assessed} />

        {prepMode === "ai" && !assessed && (
          <p className="text-xs text-muted-foreground">Run an AI Assessment above to get a suggested value.</p>
        )}
        {prepMode === "ai" && assessed && suggestion && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-foreground">{suggestion.prepWindowDays} days</p>
            <p className="text-[10px] text-muted-foreground mt-1">AI-suggested based on {suggestion.industryKey} market data</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={handleAcceptPrep}>
              Accept This Value
            </Button>
          </div>
        )}
        {prepMode === "suggested" && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-foreground">{prepWindowDays} days</p>
            <p className="text-[10px] text-muted-foreground mt-1">Accepted from AI suggestion</p>
          </div>
        )}
        {prepMode === "custom" && (
          <>
            <p className="text-xs text-muted-foreground mb-2">Preparation Window: {prepWindowDays} days</p>
            <Slider
              value={[prepWindowDays]}
              onValueChange={([v]) => setPrepWindowDays(Math.max(7, v))}
              min={7}
              max={42}
              step={1}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>7 days</span><span>42 days</span>
            </div>
          </>
        )}
        <div className="flex items-start gap-1.5 mt-3 p-2 rounded bg-muted/50">
          <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground">Baseline recommendation: at least 7 days of preparation time.</p>
        </div>
      </GlassCard>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/step-1-authorization")} className="flex-1">
          Back
        </Button>
        <Button onClick={() => navigate("/step-3-timeline")} className="flex-1">
          Continue to Step 3
        </Button>
      </div>
    </StepLayout>
  );
};

export default Step2Strategy;
