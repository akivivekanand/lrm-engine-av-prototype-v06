import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import TemplateCard from "@/components/TemplateCard";
import { usePersistedState } from "@/hooks/usePersistedState";
import { suggestIndustry } from "@/lib/smart-suggestions";
import content from "@/data/content.json";

const Step2Strategy = () => {
  const navigate = useNavigate();
  const [hiringWeeks, setHiringWeeks] = usePersistedState<number>("hiringWeeks", 6);
  const [industryText, setIndustryText] = useState("");
  const [suggestion, setSuggestion] = useState<{ industryKey: string; weeks: number; note: string } | null>(null);

  const handleSuggest = () => {
    if (!industryText.trim()) return;
    setSuggestion(suggestIndustry(industryText));
  };

  const handleAccept = () => {
    if (suggestion) {
      setHiringWeeks(suggestion.weeks);
    }
  };

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 2: Strategy</h1>

      <GlassCard>
        <label className="text-sm font-medium text-foreground block mb-2">Target Industry or Role</label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. finance, tech, consulting..."
            value={industryText}
            onChange={(e) => setIndustryText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSuggest()}
          />
          <Button onClick={handleSuggest} size="sm" className="shrink-0">
            Smart Suggest
          </Button>
        </div>
        {suggestion && (
          <div className="mt-3 space-y-2 p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-foreground">
              Suggested: {suggestion.industryKey} - ~{suggestion.weeks} weeks
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.note}</p>
            <Button size="sm" variant="outline" onClick={handleAccept}>
              Accept
            </Button>
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

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Templates</h2>
        {content.templates.map((t) => (
          <TemplateCard key={t.id} title={t.title} body={t.body} subject={t.subject} />
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
