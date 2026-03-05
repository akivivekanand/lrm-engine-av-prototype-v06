interface SegmentedTimelineProps {
  prepDays: number;
  hiringDays: number;
  authDays: number;
}

const SegmentedTimeline = ({ prepDays, hiringDays, authDays }: SegmentedTimelineProps) => {
  const total = prepDays + hiringDays + authDays;
  if (total <= 0) return null;

  const pct = (d: number) => Math.max(5, (d / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex h-4 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${pct(prepDays)}%` }}
          title={`Prep: ${prepDays} days`}
        />
        <div
          className="bg-amber-500 transition-all"
          style={{ width: `${pct(hiringDays)}%` }}
          title={`Hiring: ${hiringDays} days`}
        />
        <div
          className="bg-indigo-500 transition-all"
          style={{ width: `${pct(authDays)}%` }}
          title={`Authorization: ${authDays} days`}
        />
      </div>
      <div className="flex text-[10px] text-muted-foreground justify-between">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Prep ({prepDays}d)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Hiring ({hiringDays}d)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Auth ({authDays}d)
        </span>
      </div>
    </div>
  );
};

export default SegmentedTimeline;
