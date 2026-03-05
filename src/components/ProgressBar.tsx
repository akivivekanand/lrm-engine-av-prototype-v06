import { useLocation } from "react-router-dom";

const steps = [
  { label: "Authorization", path: "/step-1-authorization" },
  { label: "Strategy", path: "/step-2-strategy" },
  { label: "Timeline", path: "/step-3-timeline" },
  { label: "Plan", path: "/dashboard" },
];

const ProgressBar = () => {
  const location = useLocation();
  const currentIndex = steps.findIndex((s) => s.path === location.pathname);

  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {steps.map((step, i) => {
          const isActive = i === currentIndex;
          const isComplete = i < currentIndex;
          return (
            <div key={step.path} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-[-12px] ${
                    isComplete ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
