import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className }: GlassCardProps) => (
  <div className={cn("glass-card rounded-xl p-6", className)}>
    {children}
  </div>
);

export default GlassCard;
