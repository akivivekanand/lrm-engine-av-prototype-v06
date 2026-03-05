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
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Strategic Career Timeline Mapping
          </h1>
          <p className="text-sm text-muted-foreground">
            OPT Career Planning for International Students
          </p>
        </div>

        <ContactCard contact={careerCenter} />

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
