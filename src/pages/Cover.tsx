import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import ContactCard from "@/components/ContactCard";
import content from "@/data/content.json";

const Cover = () => {
  const navigate = useNavigate();
  const { careerCenter, disclaimers } = content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Career Timeline Mapping Engine: Strategic Job Search Navigation
          </h1>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            This tool helps international students backward-map their job search from a desired start date to account for industry-specific hiring lags and OPT regulatory requirements.
          </p>
          <p>
            Unlike a standard job search, an international career search requires planning around government processing times, strict filing windows, and a 90-day unemployment limit.
          </p>
          <p>
            The engine calculates your Last Responsible Moment (LRM), the final date you can begin your search while maintaining a viable safety buffer for your legal status.
          </p>
        </div>

        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-3">What this app provides:</h2>
          <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <li>
              <span className="font-semibold text-foreground">LRM Calculation:</span> A precise date to launch your search based on your specific industry (e.g., Finance, Tech, or Consulting).
            </li>
            <li>
              <span className="font-semibold text-foreground">Regulatory Anchors:</span> Clear visibility of your OPT filing window and your absolute Last Day to Start Working (Start Date + 90 days).
            </li>
            <li>
              <span className="font-semibold text-foreground">Strategic Roadmap:</span> A segmented timeline that visualizes the hiring cycle for your field versus government processing phases.
            </li>
            <li>
              <span className="font-semibold text-foreground">Customized Action Plan:</span> Frequency-based to-do lists (Daily, Weekly, Monthly) and a library of high-leverage AI prompts to optimize your outreach and interview performance.
            </li>
          </ul>
        </GlassCard>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground text-center">Hosted by</p>
          <ContactCard contact={careerCenter} />
        </div>

        <GlassCard>
          <p className="text-xs text-muted-foreground leading-relaxed">{disclaimers.uscis}</p>
        </GlassCard>

        <GlassCard>
          <p className="text-xs text-muted-foreground leading-relaxed">{disclaimers.legal}</p>
        </GlassCard>

        <Button
          onClick={() => navigate("/step-1-authorization")}
          className="w-full h-12 text-sm font-semibold"
          size="lg"
        >
          Begin Planning
        </Button>
      </div>
    </div>
  );
};

export default Cover;
