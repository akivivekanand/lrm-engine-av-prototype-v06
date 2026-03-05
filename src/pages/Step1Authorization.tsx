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
import { usePersistedState } from "@/hooks/usePersistedState";
import { calcFilingDeadline, formatDate } from "@/lib/calculations";
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

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
}) {
  return (
    <>
      <label className="text-sm font-medium text-foreground block mb-2">{label}</label>
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

  const filingDeadline = gradDateObj ? calcFilingDeadline(gradDateObj) : null;

  const statusMessage = content.statusMessages[optStatus as keyof typeof content.statusMessages];
  const processingNote = content.processingEstimates[processingType as keyof typeof content.processingEstimates];

  const { universityContact } = content;

  // Continue gate logic
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

      {/* OPT Status selector — always shown */}
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

      {/* Denied: show contact card, no other fields */}
      {optStatus === "denied" && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-2">{universityContact.name}</h2>
          <p className="text-xs text-muted-foreground">{universityContact.office}</p>
          <p className="text-xs text-muted-foreground mt-1">{universityContact.address}</p>
          <p className="text-xs text-muted-foreground mt-1">{universityContact.phone}</p>
          <a
            href={universityContact.web}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-1 block"
          >
            Visit ISSO Website
          </a>
        </GlassCard>
      )}

      {/* All non-denied statuses show Graduation Date */}
      {optStatus !== "denied" && (
        <GlassCard>
          <DatePickerField
            label="Graduation Date"
            value={gradDateObj}
            onChange={(d) => setGradDate(d ? d.toISOString() : null)}
          />
          {filingDeadline && (
            <p className="text-xs text-muted-foreground mt-2">
              Filing Deadline: <span className="font-medium text-foreground">{formatDate(filingDeadline)}</span>
            </p>
          )}
        </GlassCard>
      )}

      {/* Waiting: Submission Date + Processing Type */}
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
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{processingNote}</p>
          </GlassCard>
        </>
      )}

      {/* Approved: EAD Start Date */}
      {optStatus === "approved" && (
        <GlassCard>
          <DatePickerField
            label="EAD Start Date"
            value={eadDateObj}
            onChange={(d) => setEadDate(d ? d.toISOString() : null)}
          />
        </GlassCard>
      )}

      {/* RFE: RFE Response Date */}
      {optStatus === "rfe" && (
        <GlassCard>
          <DatePickerField
            label="RFE Response Date"
            value={rfeResponseDateObj}
            onChange={(d) => setRfeResponseDate(d ? d.toISOString() : null)}
          />
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
    </StepLayout>
  );
};

export default Step1Authorization;
