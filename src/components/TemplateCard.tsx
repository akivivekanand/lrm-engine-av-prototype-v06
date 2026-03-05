import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import GlassCard from "./GlassCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TemplateCardProps {
  title: string;
  body: string;
}

const TemplateCard = ({ title, body }: TemplateCardProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="p-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{body}</p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy to clipboard"}
            </button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </GlassCard>
  );
};

export default TemplateCard;
