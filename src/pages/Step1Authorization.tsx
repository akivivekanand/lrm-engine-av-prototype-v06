import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import ContactCard from "@/components/ContactCard";
import { usePersistedState } from "@/hooks/usePersistedState";
import { calcLastDateToApply, formatDate } from "@/lib/calculations";
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

const STATUS_TEXT: Record<string, string> = {
  notApplied: "You have not applied for OPT yet. Your last date to apply is typically within 60 days after your program end date. Confirm the exact date on your I-20 and with your DSO.",
  waiting: "Your OPT application is pending. Use this planner to sequence outreach and preparation while you wait.",
  approved: "Your OPT is approved. Your EAD Start Date anchors your job search timeline and unemployment tracking.",
  rfe: "You received a Request for Evidence (RFE). This increases timeline uncertainty. Confirm next steps with your DSO.",
  denied: "Your OPT application was denied. Contact your DSO immediately.",
};

const PROCESSING_TEXT: Record<string, string> = {
  standard: "Standard processing is often estimated at 3 to 5 months (planning estimate).",
  premium: "Premium processing is designed for an estimated 30-day window (planning estimate).",
};

function DatePickerField({
  label,
  helperText,
  value,
  onChange,
}: {
  label: string;
  helperText?: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
}) {
  return (
    <>
      <label className="text-sm font-medium text-foreground block mb-2">{label}</label>
      {helperText && (
        <p className="text-xs text-muted-foreground mb-2">{helperText}</p>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}

const Step1Authorization = () => {
  const navigate = useNavigate();
  const [gradDate, setGradDate] = usePersistedState<string | null>("gradDate", null);
  const [optStatus, setOptStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [eadDate, setEadDate] = usePersistedState<string | null>("eadDate", null);
  const [submissionDate, setSubmissionDate] = usePersistedState<string | null>("submissionDate", null);
  const [processingType, setProcessingType] = usePersistedState<string>("processingType", "standard");
  const [rfeResponseDate, setRfeResponseDate] = usePersistedState<string | null>("rfeResponseDate", null);

  const gradDateObj = gradDate ? new Date(gradDate) : undefined;
  const eadDateObj = eadDate ? new Date(eadDate) : undefined;
  const submissionDateObj = submissionDate ? new Date(submissionDate) : undefined;
  const rfeResponseDateObj = rfeResponseDate ? new Date(rfeResponseDate) : undefined;

  const lastDateToApply = gradDateObj ? calcLastDateToApply(gradDateObj) : null;

  const canContinue = (() => {
    if (!gradDateObj) return false;
    if (optStatus === "denied") return false;
    if (optStatus === "approved" && !eadDateObj) return false;
    if (optStatus === "rfe" && !rfeResponseDateObj) return false;
    return true;
  })();

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 1: Authorization</h1>

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
        {STATUS_TEXT[optStatus] && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{STATUS_TEXT[optStatus]}</p>
        )}
      </GlassCard>

      {optStatus === "denied" && (
        <ContactCard
          contact={content.isso}
          disclaimer="Contact University DSO for official policy guidance."
        />
      )}

      {optStatus !== "denied" && (
        <GlassCard>
          <DatePickerField
            label="Program End Date"
            helperText="Your Program End Date can be found on page 1 of your current I-20."
            value={gradDateObj}
            onChange={(d) => setGradDate(d ? d.toISOString() : null)}
          />
          {lastDateToApply && (
            <p className="text-xs text-muted-foreground mt-2">
              Last Date to Apply for OPT: <span className="font-medium text-foreground">{formatDate(lastDateToApply)}</span>
            </p>
          )}
        </GlassCard>
      )}

      {optStatus === "waiting" && (
        <>
          <GlassCard>
            <DatePickerField
              label="Submission Date"
              value={submissionDateObj}
              onChange={(d) => setSubmissionDate(d ? d.toISOString() : null)}
            />
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
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{PROCESSING_TEXT[processingType]}</p>
          </GlassCard>
        </>
      )}

      {optStatus === "approved" && (
        <GlassCard>
          <DatePickerField
            label="EAD Start Date"
            value={eadDateObj}
            onChange={(d) => setEadDate(d ? d.toISOString() : null)}
          />
        </GlassCard>
      )}

      {optStatus === "rfe" && (
        <GlassCard>
          <DatePickerField
            label="RFE Response Date"
            value={rfeResponseDateObj}
            onChange={(d) => setRfeResponseDate(d ? d.toISOString() : null)}
          />
        </GlassCard>
      )}

      {/* Compliance Info */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Compliance Info</h2>
        <ContactCard
          contact={content.isso}
          disclaimer="Contact University DSO for official policy guidance."
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/cover")} className="flex-1">
          Back
        </Button>
        <Button onClick={() => navigate("/step-2-strategy")} className="flex-1" disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </StepLayout>
  );
};

export default Step1Authorization;
