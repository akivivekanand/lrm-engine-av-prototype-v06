import { formatDate, type MilestoneStatus } from "@/utils/dateCalculator";

interface TimelineMilestoneProps {
  label: string;
  date: Date;
  status: MilestoneStatus;
  isLast?: boolean;
}

const statusColors: Record<MilestoneStatus, string> = {
  "on-track": "bg-emerald border-emerald",
  compression: "bg-amber border-amber",
  crisis: "bg-rose border-rose",
};

const statusTextColors: Record<MilestoneStatus, string> = {
  "on-track": "text-emerald",
  compression: "text-amber",
  crisis: "text-rose",
};

const TimelineMilestone = ({ label, date, status, isLast }: TimelineMilestoneProps) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-4 h-4 rounded-full ${statusColors[status]} border-2 shrink-0`} />
      {!isLast && <div className="w-0.5 flex-1 bg-border min-h-[48px]" />}
    </div>
    <div className="pb-8">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className={`text-sm font-medium ${statusTextColors[status]}`}>{formatDate(date)}</p>
    </div>
  </div>
);

export default TimelineMilestone;
