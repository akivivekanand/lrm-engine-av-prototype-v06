interface UnemploymentGaugeProps {
  daysUsed: number;
}

const UnemploymentGauge = ({ daysUsed }: UnemploymentGaugeProps) => {
  const total = 90;
  const remaining = Math.max(0, total - daysUsed);
  const pct = Math.min(daysUsed / total, 1);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  let colorClass: string;
  let strokeColor: string;
  if (remaining <= 10) {
    colorClass = "text-rose";
    strokeColor = "hsl(var(--rose))";
  } else if (remaining <= 20) {
    colorClass = "text-amber";
    strokeColor = "hsl(var(--amber))";
  } else {
    colorClass = "text-emerald";
    strokeColor = "hsl(var(--emerald))";
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="10"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colorClass}`}>{remaining}</span>
          <span className="text-xs text-muted-foreground">days left</span>
        </div>
      </div>
      <p className="text-xs text-center text-muted-foreground max-w-[240px]">
        {daysUsed} of {total} days used
      </p>
    </div>
  );
};

export default UnemploymentGauge;
