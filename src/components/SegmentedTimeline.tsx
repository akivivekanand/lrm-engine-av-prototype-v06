import { formatDate, daysBetween, stripTime } from "@/lib/calculations";
import type { LRMChainResult } from "@/lib/calculations";

interface TimelineMarker {
  label: string;
  date: Date;
  isPast: boolean;
}

interface SegmentedTimelineProps {
  chain: LRMChainResult;
  startLabel?: string; // "EAD Start Date" or "Chosen Start Date"
}

const SegmentedTimeline = ({ chain, startLabel = "Chosen Start Date" }: SegmentedTimelineProps) => {
  const today = stripTime(new Date());

  const rawMarkers: { label: string; date: Date }[] = [
    { label: "Program End Date", date: chain.programEndDate },
    { label: "Today", date: today },
    { label: "LRM", date: chain.lrmDate },
    { label: startLabel, date: chain.chosenStartDate },
    { label: "Last Day to Start Working", date: chain.lastDayToWork },
  ];

  // Deduplicate by date — keep the first label if two share a date
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

  // Style config per marker type
  const getMarkerStyle = (label: string, isPast: boolean) => {
    if (label === "Today") {
      return {
        dot: "w-3 h-3 rounded-full bg-sky border-2 border-sky",
        line: "",
        text: "text-sky font-medium",
        opacity: "",
      };
    }
    if (label === "Program End Date") {
      return {
        dot: `w-3.5 h-3.5 rounded-full bg-slate border-2 border-slate`,
        line: "",
        text: `text-slate font-medium`,
        opacity: isPast ? "opacity-40" : "",
      };
    }
    if (label === "LRM") {
      return {
        dot: `w-4 h-4 rounded-full bg-amber border-2 border-amber ring-2 ring-amber/30`,
        line: "",
        text: `text-amber font-semibold`,
        opacity: isPast ? "opacity-40" : "",
      };
    }
    if (label === "Last Day to Start Working") {
      return {
        dot: "w-5 h-5 rounded-full bg-critical border-2 border-critical ring-2 ring-critical/30",
        line: "absolute top-0 h-full w-0.5 bg-critical",
        text: "text-critical font-bold",
        opacity: "",
      };
    }
    // Start date markers
    const isConfirmed = label === "EAD Start Date";
    return {
      dot: isConfirmed
        ? "w-3.5 h-3.5 rounded-full bg-primary border-2 border-primary"
        : "w-3.5 h-3.5 rounded-full bg-transparent border-2 border-primary",
      line: "",
      text: "text-primary font-medium",
      opacity: isPast ? "opacity-40" : "",
    };
  };

  return (
    <div className="space-y-1">
      {/* Timeline bar with markers */}
      <div className="relative pt-16 pb-14">
        {/* Track */}
        <div className="relative h-2 rounded-full bg-muted">
          {/* Filled portion up to today */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-sky/20"
            style={{ width: `${pct(today)}%` }}
          />
        </div>

        {/* Markers */}
        {markers.map((m, i) => {
          const style = getMarkerStyle(m.label, m.isPast);
          const left = pct(m.date);
          // Alternate labels above/below to avoid overlap
          const isAbove = i % 2 === 0;

          return (
            <div
              key={m.label}
              className={`absolute ${style.opacity}`}
              style={{ left: `${left}%`, transform: "translateX(-50%)" }}
            >
              {/* Vertical connector line */}
              {style.line && (
                <div
                  className={style.line}
                  style={{ left: "50%", transform: "translateX(-50%)", top: "-8px", height: "calc(100% + 16px)", position: "absolute" }}
                />
              )}

              {/* Dot centered on track */}
              <div
                className={`${style.dot} absolute`}
                style={{ top: "0px", transform: "translate(-50%, -50%)", left: "50%", marginTop: "0" }}
              />

              {/* Label */}
              <div
                className={`absolute whitespace-nowrap text-center ${isAbove ? "bottom-full mb-3" : "top-full mt-3"}`}
                style={{ left: "50%", transform: "translateX(-50%)" }}
              >
                <p className={`text-[10px] leading-tight ${style.text}`}>{m.label}</p>
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
