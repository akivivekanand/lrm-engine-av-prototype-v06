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
  careerStrategyLaunchDate?: Date;
}

const getMarkerStyle = (label: string) => {
  if (label === "Today") {
    return { className: "w-3 h-3 rounded-full bg-sky", ring: false };
  }
  if (label === "Program End Date") {
    return { className: "w-3 h-3 rounded-full bg-muted-foreground/30", ring: false };
  }
  if (label === "LRM") {
    return { className: "w-3 h-3 rounded-full bg-amber", ring: false };
  }
  if (label === "Chosen Start Date") {
    return { className: "w-3 h-3 rounded-sm border-2 border-primary bg-transparent", ring: false };
  }
  if (label === "EAD Start Date") {
    return { className: "w-3 h-3 rounded-full bg-primary", ring: false };
  }
  if (label === "Last Day to Start Working") {
    return { className: "w-3 h-3 rounded-full bg-critical", ring: false };
  }
  if (label === "Career Strategy Launch Date") {
    return { className: "w-3 h-3 rounded-full bg-emerald", ring: false };
  }
  return { className: "w-3 h-3 rounded-full bg-muted-foreground", ring: false };
};

const labelColor: Record<string, string> = {
  Today: "text-sky",
  "Program End Date": "text-muted-foreground",
  LRM: "text-amber",
  "EAD Start Date": "text-primary",
  "Chosen Start Date": "text-primary",
  "Last Day to Start Working": "text-critical",
  "Career Strategy Launch Date": "text-emerald",
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

  // Segment boundaries for subtle tonal variation on the unfilled portion
  const todayPct = pct(today);
  const lrmPct = pct(chain.lrmDate);
  const startPct = pct(chain.chosenStartDate);

  return (
    <div className="space-y-1 overflow-hidden">
      <div className="relative pt-14 pb-14 px-4">
        {/* Track with segmented tonal variation */}
        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
          {/* Filled portion up to today */}
          <div
            className={`absolute top-0 left-0 h-full ${trackColorClass}`}
            style={{ width: `${todayPct}%` }}
          />
          {/* Segment: today → LRM (slightly tinted) */}
          {lrmPct > todayPct && (
            <div
              className="absolute top-0 h-full bg-amber/10"
              style={{ left: `${todayPct}%`, width: `${lrmPct - todayPct}%` }}
            />
          )}
          {/* Segment: start date → end (subtle critical tint) */}
          {startPct < 100 && (
            <div
              className="absolute top-0 h-full bg-critical/8"
              style={{ left: `${startPct}%`, width: `${100 - startPct}%` }}
            />
          )}
        </div>

        {/* Markers */}
        {markers.map((m, i) => {
          const left = pct(m.date);
          const isAbove = i % 2 === 0;
          const style = getMarkerStyle(m.label);
          const color = labelColor[m.label] || "text-muted-foreground";
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
              {/* Dot */}
              <div
                className={`${style.className} absolute`}
                style={{ top: "0px", transform: "translate(-50%, -50%)", left: "50%" }}
              />

              {/* Label */}
              <div
                className={`absolute whitespace-nowrap ${isAbove ? "bottom-full mb-3" : "top-full mt-3"} ${labelAlign}`}
              >
                <p className={`text-[10px] leading-tight font-medium ${color}`}>{m.label}</p>
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