import ProgressBar from "@/components/ProgressBar";

interface StepLayoutProps {
  children: React.ReactNode;
  showProgress?: boolean;
}

const StepLayout = ({ children, showProgress = true }: StepLayoutProps) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
    {showProgress && <ProgressBar />}
    <div className="max-w-md mx-auto px-4 pb-8 space-y-5">
      {children}
    </div>
  </div>
);

export default StepLayout;
