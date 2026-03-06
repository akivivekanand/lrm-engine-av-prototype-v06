import { formatDate, daysBetween, stripTime, type MilestoneStatus, getMilestoneStatus } from "@/lib/calculations";
import type { LRMChainResult } from "@/lib/calculations";

interface SegmentedTimelineProps {
  chain: LRMChainResult;
}

const SegmentedTimeline = ({ chain }: SegmentedTimelineProps) => {
  // Sort the four dates chronologically for display
  const markers: { label: string; date: Date; color: string }[] = [
    { label: "LRM", date: chain.lrmDate, color: "bg-rose-500" },
    { label: "Chosen Start", date: chain.chosenStartDate, color: "bg-amber-500" },
    { label: "Program End", date: chain.programEndDate, color: "bg-emerald-500" },
    { label: "Last Day to Work", date: chain.lastDayToWork, color: "bg-indigo-500" },
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const earliest = markers[0].date;
  const latest = markers[markers.length - 1].date;
  const totalDays = daysBetween(earliest, latest);
  if (totalDays <= 0) return null;

  const pct = (d: Date) => (daysBetween(earliest, d) / totalDays) * 100;

  return (
    <div className="space-y-3">
      {/* Bar with markers */}
      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
        {markers.map((m) => (
          <div
            key={m.label}
            className={`absolute top-0 h-full w-1 ${m.color}`}
            style={{ left: `${pct(m.date)}%` }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        {markers.map((m) => (
          <span key={m.label} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${m.color} inline-block`} />
            {m.label} ({formatDate(m.date)})
          </span>
        ))}
      </div>
    </div>
  );
};

export default SegmentedTimeline;
