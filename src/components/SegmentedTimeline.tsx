import { formatDate, daysBetween, stripTime } from "@/lib/calculations";
import type { LRMChainResult } from "@/lib/calculations";

interface TimelineMarker {
  label: string;
  date: Date;
  isPast: boolean;
}

interface SegmentedTimelineProps {
  chain: LRMChainResult;
  startLabel?: string;
}

const markerColor: Record<string, string> = {
  Today: "bg-sky",
  "Program End Date": "bg-slate",
  LRM: "bg-amber",
  "EAD Start Date": "bg-primary",
  "Chosen Start Date": "bg-primary",
  "Last Day to Start Working": "bg-critical",
};

const SegmentedTimeline = ({ chain, startLabel = "Chosen Start Date" }: SegmentedTimelineProps) => {
  const today = stripTime(new Date());

  const rawMarkers: { label: string; date: Date }[] = [
    { label: "Program End Date", date: chain.programEndDate },
    { label: "Today", date: today },
    { label: "LRM", date: chain.lrmDate },
    { label: startLabel, date: chain.chosenStartDate },
    { label: "Last Day to Start Working", date: chain.lastDayToWork },
  ];

  // Deduplicate by date
  const seen = new Map<number, boolean>();
  const deduped = rawMarkers.filter((m) => {
    const key = m.date.getTime();
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });

  const markers: TimelineMarker[] = deduped
    .map((m) => ({ ...m, isPast: m.date.getTime() < today.getTime() && m.label !== "Today" }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const earliest = markers[0].date;
  const latest = markers[markers.length - 1].date;
  const totalDays = daysBetween(earliest, latest);
  if (totalDays <= 0) return null;

  const pct = (d: Date) => Math.min(100, Math.max(0, (daysBetween(earliest, d) / totalDays) * 100));

  // Dynamic track color based on days remaining
  const daysRemaining = daysBetween(today, chain.lastDayToWork);
  const trackColorClass =
    daysRemaining < 15
      ? "bg-critical/60"
      : daysRemaining <= 60
        ? "bg-amber/60"
        : "bg-emerald/60";

  return (
    <div className="space-y-1 overflow-hidden">
      <div className="relative pt-14 pb-14 px-4">
        {/* Track */}
        <div className="relative h-2 rounded-full bg-muted">
          {/* Filled portion up to today */}
          <div
            className={`absolute top-0 left-0 h-full rounded-full ${trackColorClass}`}
            style={{ width: `${pct(today)}%` }}
          />
        </div>

        {/* Markers */}
        {markers.map((m, i) => {
          const left = pct(m.date);
          const isAbove = i % 2 === 0;
          const color = markerColor[m.label] || "bg-muted-foreground";
          const isFirst = i === 0;
          const isLast = i === markers.length - 1;

          // Label alignment to prevent overflow
          const labelAlign = isFirst
            ? "left-0 text-left"
            : isLast
              ? "right-0 text-right"
              : "left-1/2 -translate-x-1/2 text-center";

          return (
            <div
              key={m.label}
              className={`absolute ${m.isPast ? "opacity-40" : ""}`}
              style={{ left: `${left}%`, transform: "translateX(-50%)" }}
            >
              {/* Dot — uniform size */}
              <div
                className={`w-3 h-3 rounded-full ${color} absolute`}
                style={{ top: "0px", transform: "translate(-50%, -50%)", left: "50%" }}
              />

              {/* Label */}
              <div
                className={`absolute whitespace-nowrap ${isAbove ? "bottom-full mb-3" : "top-full mt-3"} ${labelAlign}`}
              >
                <p className="text-[10px] leading-tight font-medium text-foreground">{m.label}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{formatDate(m.date)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SegmentedTimeline;
