import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/GlassCard";
import ProgressBar from "@/components/ProgressBar";
import { usePersistedState } from "@/hooks/usePersistedState";
import { addDays, formatDate } from "@/utils/dateCalculator";
import content from "@/data/content.json";

const statusOptions = [
  { value: "notApplied", label: "Not Applied" },
  { value: "waiting", label: "Waiting / Pending" },
  { value: "approved", label: "Approved" },
  { value: "rfe", label: "RFE Received" },
  { value: "denied", label: "Denied" },
];

const processingOptions = [
  { value: "standard", label: "Standard Processing" },
  { value: "premium", label: "Premium Processing" },
];

const Step1Authorization = () => {
  const navigate = useNavigate();
  const [gradDate, setGradDate] = usePersistedState<string | null>("gradDate", null);
  const [optStatus, setOptStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [processingType, setProcessingType] = usePersistedState<string>("processingType", "standard");
  const [eadDate, setEadDate] = usePersistedState<string | null>("eadDate", null);

  const gradDateObj = gradDate ? new Date(gradDate) : undefined;
  const eadDateObj = eadDate ? new Date(eadDate) : undefined;
  const filingDeadline = gradDateObj ? addDays(gradDateObj, 60) : null;

  const statusMessage = content.statusMessages[optStatus as keyof typeof content.statusMessages];
  const processingNote = content.processingEstimates[processingType as keyof typeof content.processingEstimates];

  const canContinue = gradDateObj && (optStatus !== "approved" || eadDateObj);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <ProgressBar />
      <div className="max-w-md mx-auto px-4 pb-8 space-y-5">
        <h1 className="text-xl font-bold text-foreground">Step 1: Authorization</h1>

        <GlassCard>
          <label className="text-sm font-medium text-foreground block mb-2">Graduation Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !gradDateObj && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {gradDateObj ? format(gradDateObj, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={gradDateObj}
                onSelect={(d) => setGradDate(d ? d.toISOString() : null)}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {filingDeadline && (
            <p className="text-xs text-muted-foreground mt-2">
              Filing Deadline: <span className="font-medium text-foreground">{formatDate(filingDeadline)}</span>
            </p>
          )}
        </GlassCard>

        <GlassCard>
          <label className="text-sm font-medium text-foreground block mb-2">OPT Status</label>
          <Select value={optStatus} onValueChange={setOptStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statusMessage && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{statusMessage}</p>
          )}
        </GlassCard>

        <GlassCard>
          <label className="text-sm font-medium text-foreground block mb-2">Processing Type</label>
          <Select value={processingType} onValueChange={setProcessingType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {processingOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{processingNote}</p>
        </GlassCard>

        {optStatus === "approved" && (
          <GlassCard>
            <label className="text-sm font-medium text-foreground block mb-2">EAD Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !eadDateObj && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eadDateObj ? format(eadDateObj, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={eadDateObj}
                  onSelect={(d) => setEadDate(d ? d.toISOString() : null)}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </GlassCard>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/cover")} className="flex-1">
            Back
          </Button>
          <Button onClick={() => navigate("/step-2-strategy")} className="flex-1" disabled={!canContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step1Authorization;
