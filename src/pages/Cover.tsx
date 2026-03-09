import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import ContactCard from "@/components/ContactCard";
import content from "@/data/content.json";

const Cover = () => {
  const navigate = useNavigate();
  const { careerCenter, isso, disclaimers } = content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Strategic Career Timeline Mapping Engine
          </h1>
          <p className="text-sm font-medium text-muted-foreground">For International Students</p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            This tool helps international students backward map their job search from a desired start date while accounting for industry hiring timelines and OPT regulatory constraints.
          </p>
          <p>
            Unlike a standard job search, international career planning requires careful timing around government processing periods, strict filing windows, and the 90 day unemployment limit after program completion.
          </p>
          <p>
            The engine calculates your Last Responsible Moment (LRM). This is the final date you can begin preparing and launching your job search while maintaining a realistic hiring timeline and a safety buffer for your legal status.
          </p>
        </div>

        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-3">What This Tool Provides</h2>
          <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <li>
              <span className="font-semibold text-foreground">LRM Calculation:</span> A calculated date indicating when you should begin preparing your job search based on hiring cycles in your target industry.
            </li>
            <li>
              <span className="font-semibold text-foreground">Regulatory Anchors:</span> Visibility into your OPT timeline including your filing window and the absolute Last Day to Start Working, calculated as Chosen Start Date plus 90 days (unemployment days).
            </li>
            <li>
              <span className="font-semibold text-foreground">Strategic Timeline Map:</span> A visual timeline comparing industry hiring cycles with regulatory timing constraints so you can understand when preparation, networking, and interviews should begin.
            </li>
            <li>
              <span className="font-semibold text-foreground">Customized Action Plan:</span> A structured action plan including Daily, Weekly, and Monthly priorities along with a library of AI prompts and outreach templates to strengthen networking, resume optimization, and interview preparation.
            </li>
          </ul>
        </GlassCard>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground text-center">Hosted By</p>
          <ContactCard contact={careerCenter} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground text-center">Compliance Information</p>
          <ContactCard contact={isso} />
        </div>

        <GlassCard>
          <h3 className="text-xs font-semibold text-foreground mb-2">Regulatory Notice</h3>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{disclaimers.uscis}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{disclaimers.legal.replace("your DSO", "their Designated School Official")}</p>
          </div>
        </GlassCard>

        <Button
          onClick={() => navigate("/step-1-authorization")}
          className="w-full h-12 text-sm font-semibold"
          size="lg"
        >
          Let's Get Started
        </Button>
      </div>
    </div>
  );
};

export default Cover;
