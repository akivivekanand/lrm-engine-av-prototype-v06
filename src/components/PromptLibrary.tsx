import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import GlassCard from "./GlassCard";
import content from "@/data/content.json";

const PURPOSE_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  "ba-gap": { label: "Technical", variant: "default" },
  "transferable-skills": { label: "Career", variant: "secondary" },
  "star-story": { label: "Interview", variant: "outline" },
  "networking-icebreaker": { label: "Networking", variant: "secondary" },
  "salary-research": { label: "Research", variant: "outline" },
  "ats-keyword": { label: "Technical", variant: "default" },
  "visa-exp": { label: "Compliance", variant: "destructive" },
  "case-interview": { label: "Interview", variant: "outline" },
  "cold-outreach": { label: "Networking", variant: "secondary" },
  "github-readme": { label: "Technical", variant: "default" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-3"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy to clipboard"}
    </button>
  );
}

const PromptLibrary = () => {
  const { promptGuide, genAiPromptExamples } = content;

  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-2">Prompt Writing Guide</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{promptGuide}</p>
      </GlassCard>

      <Accordion type="single" collapsible className="space-y-2">
        {genAiPromptExamples.map((example) => {
          const purpose = PURPOSE_MAP[example.id] || { label: "General", variant: "outline" as const };
          return (
            <AccordionItem key={example.id} value={example.id} className="border-none">
              <GlassCard className="p-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-sm font-medium text-foreground">{example.title}</span>
                    <Badge variant={purpose.variant} className="text-[10px] shrink-0">
                      {purpose.label}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-xs text-muted-foreground leading-relaxed">{example.prompt}</p>
                      <CopyButton text={example.prompt} />
                    </motion.div>
                  </AnimatePresence>
                </AccordionContent>
              </GlassCard>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default PromptLibrary;
