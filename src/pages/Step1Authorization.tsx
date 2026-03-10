import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import ContactCard from "@/components/ContactCard";
import { usePersistedState } from "@/hooks/usePersistedState";
import { addDays, subtractDays, stripTime, formatDate } from "@/lib/calculations";
import content from "@/data/content.json";

const statusOptions = [
  { value: "notApplied", label: "Not Applied" },
  { value: "waiting", label: "Applied" },
  { value: "approved", label: "Approved" },
  { value: "rfe", label: "RFE Received" },
  { value: "denied", label: "Denied" },
];

const processingOptions = [
  { value: "standard", label: "Standard Processing" },
  { value: "premium", label: "Premium Processing" },
];

const PROCESSING_TEXT: Record<string, string> = {
  standard: "Standard processing: estimated 3 to 5 months.",
  premium: "Premium processing: estimated approximately 30 days.",
};

function DatePickerField({
  label,
  helperText,
  value,
  onChange,
  hasError,
  fromDate,
}: {
  label: string;
  helperText?: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  hasError?: boolean;
  fromDate?: Date;
}) {
  return (
    <>
      <label className={cn("text-sm font-medium block mb-2", hasError ? "text-destructive" : "text-foreground")}>{label}</label>
      {helperText && (
        <p className="text-xs text-muted-foreground mb-2">{helperText}</p>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", hasError && "border-destructive")}
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
            disabled={fromDate ? { before: fromDate } : undefined}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}

const Step1Authorization = () => {
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState(false);
  const [gradDate, setGradDate] = usePersistedState<string | null>("gradDate", null);
  const [optStatus, setOptStatus] = usePersistedState<string>("optStatus", "notApplied");
  const [eadDate, setEadDate] = usePersistedState<string | null>("eadDate", null);
  const [chosenStartDate, setChosenStartDate] = usePersistedState<string | null>("targetWorkReadyDate", null);
  const [submissionDate, setSubmissionDate] = usePersistedState<string | null>("submissionDate", null);
  const [processingType, setProcessingType] = usePersistedState<string>("processingType", "standard");
  const [estimatedStartDate, setEstimatedStartDate] = usePersistedState<string | null>("estimatedStartDate", null);

  const gradDateObj = gradDate ? new Date(gradDate) : undefined;
  const eadDateObj = eadDate ? new Date(eadDate) : undefined;
  const chosenStartDateObj = chosenStartDate ? new Date(chosenStartDate) : undefined;
  const submissionDateObj = submissionDate ? new Date(submissionDate) : undefined;
  const estimatedStartDateObj = estimatedStartDate ? new Date(estimatedStartDate) : undefined;

  // Derived dates for "Not Applied"
  const earliestOptDate = gradDateObj ? subtractDays(stripTime(gradDateObj), 90) : null;
  const optFilingDeadline = gradDateObj ? addDays(stripTime(gradDateObj), 60) : null;

  // Special case: waiting + chosen start date has passed
  const today = stripTime(new Date());
  const startDatePassed = optStatus === "waiting" && chosenStartDateObj && stripTime(chosenStartDateObj).getTime() < today.getTime();

  // Auto-suggest estimated start date (~4.5 months after submission)
  const suggestedEstimatedDate = submissionDateObj ? addDays(stripTime(submissionDateObj), 135) : null;

  const isDeniedOrRfe = optStatus === "rfe" || optStatus === "denied";

  const canContinue = (() => {
    if (optStatus === "denied") return false;
    if (!gradDateObj) return false;
    if (optStatus === "notApplied" && !chosenStartDateObj) return false;
    if (optStatus === "waiting") {
      if (startDatePassed && !estimatedStartDateObj) return false;
      if (!startDatePassed && !chosenStartDateObj) return false;
    }
    if (optStatus === "approved" && !eadDateObj) return false;
    if (optStatus === "rfe" && !chosenStartDateObj) return false;
    return true;
  })();

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 1: Authorization</h1>

      {/* OPT Status */}
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
      </GlassCard>

      {/* RFE Warning */}
      {optStatus === "rfe" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Please contact your university DSO urgently if you have not already done so after receiving this status from USCIS.
          </AlertDescription>
        </Alert>
      )}

      {/* Denied: full block with buttons, no continuation */}
      {optStatus === "denied" && (
        <>
          <GlassCard className="border-destructive/50">
            <div className="space-y-4">
              <h2 className="text-base font-bold text-destructive">OPT Application Denied</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your OPT application has been denied. Please contact your university's Designated School Official immediately.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => window.open(`mailto:${content.isso.email}`, '_blank')}
                >
                  Contact ISSO
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open('https://www.suffolk.edu/global/international-students/isso/immigration-resources/employment/opt', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View OPT Resources
                </Button>
              </div>
            </div>
          </GlassCard>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Compliance Info</h2>
            <ContactCard
              contact={content.isso}
              disclaimer="Contact University DSO for official policy guidance."
            />
          </div>
        </>
      )}

      {/* ===== NOT APPLIED ===== */}
      {optStatus === "notApplied" && (
        <>
          <GlassCard>
            <DatePickerField
              label="Program End Date"
              helperText="Found on page 1 of your current I-20."
              value={gradDateObj}
              onChange={(d) => setGradDate(d ? d.toISOString() : null)}
            />
            {gradDateObj && (
              <div className="mt-3 space-y-1.5 p-3 rounded-lg bg-muted/50">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Earliest OPT Application Date</span>
                  <span className="font-medium text-foreground">{formatDate(earliestOptDate!)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">OPT Filing Deadline</span>
                  <span className="font-medium text-foreground">{formatDate(optFilingDeadline!)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                  The earliest OPT application date is especially important for planning because students should begin preparing application materials and job search strategy before this window opens.
                </p>
              </div>
            )}
          </GlassCard>
          <GlassCard>
            <DatePickerField
              label="Chosen Start Date"
              helperText="When you want to start working."
              value={chosenStartDateObj}
              onChange={(d) => setChosenStartDate(d ? d.toISOString() : null)}
              fromDate={gradDateObj}
            />
          </GlassCard>
        </>
      )}

      {/* ===== APPLIED AND WAITING ===== */}
      {optStatus === "waiting" && (
        <>
          <GlassCard>
            <DatePickerField
              label="Program End Date"
              helperText="Found on page 1 of your current I-20."
              value={gradDateObj}
              onChange={(d) => setGradDate(d ? d.toISOString() : null)}
            />
          </GlassCard>
          <GlassCard>
            <DatePickerField
              label="OPT Application Submission Date"
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
            <a
              href="https://egov.uscis.gov/processing-times/i765"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
            >
              <ExternalLink className="h-3 w-3" /> Check USCIS Processing Times
            </a>
            <GlassCard className="mt-3 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{content.disclaimers.uscis}</p>
            </GlassCard>
          </GlassCard>
          <GlassCard>
            <DatePickerField
              label="Chosen Start Date"
              helperText="When you want to start working."
              value={chosenStartDateObj}
              onChange={(d) => setChosenStartDate(d ? d.toISOString() : null)}
              fromDate={gradDateObj}
            />
          </GlassCard>

          {/* Special case: start date passed */}
          {startDatePassed && (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Your OPT start date has passed and your application is still pending. Please contact your DSO and career center immediately.
                </AlertDescription>
              </Alert>
              <GlassCard>
                <DatePickerField
                  label="Estimated Start Date"
                  helperText={`Enter an estimated start date. Students should enter an approximate start date around 4 to 5 months after the OPT application submission date${suggestedEstimatedDate ? ` (suggested: ${formatDate(suggestedEstimatedDate)})` : ""}.`}
                  value={estimatedStartDateObj}
                  onChange={(d) => setEstimatedStartDate(d ? d.toISOString() : null)}
                />
                <p className="text-xs text-muted-foreground mt-2">This estimated date will temporarily serve as the planning anchor for the timeline calculations.</p>
              </GlassCard>
            </>
          )}
        </>
      )}

      {/* ===== APPROVED ===== */}
      {optStatus === "approved" && (
        <>
          <GlassCard>
            <DatePickerField
              label="Program End Date"
              helperText="Found on page 1 of your current I-20."
              value={gradDateObj}
              onChange={(d) => setGradDate(d ? d.toISOString() : null)}
              hasError={validationError && !gradDateObj}
            />
          </GlassCard>
          <GlassCard>
            <DatePickerField
              label="EAD Start Date"
              helperText="The start date on your Employment Authorization Document. This date may occur after the 60-day filing window due to USCIS processing delays. Timeline calculations will use this date."
              value={eadDateObj}
              onChange={(d) => setEadDate(d ? d.toISOString() : null)}
              hasError={validationError && !eadDateObj}
            />
          </GlassCard>
        </>
      )}

      {/* ===== RFE ===== */}
      {optStatus === "rfe" && (
        <>
          <GlassCard>
            <DatePickerField
              label="Program End Date"
              helperText="Found on page 1 of your current I-20."
              value={gradDateObj}
              onChange={(d) => setGradDate(d ? d.toISOString() : null)}
            />
          </GlassCard>
          <GlassCard>
            <DatePickerField
              label="OPT Application Submission Date"
              value={submissionDateObj}
              onChange={(d) => setSubmissionDate(d ? d.toISOString() : null)}
            />
          </GlassCard>
          <GlassCard>
            <DatePickerField
              label="Chosen Start Date"
              helperText="Your intended start date for planning purposes."
              value={chosenStartDateObj}
              onChange={(d) => setChosenStartDate(d ? d.toISOString() : null)}
            />
          </GlassCard>
        </>
      )}

      {/* Compliance Info */}
      {optStatus !== "denied" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Compliance Info</h2>
          <ContactCard
            contact={content.isso}
            disclaimer="Contact University DSO for official policy guidance."
          />
        </div>
      )}

      {validationError && !canContinue && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {optStatus === "denied"
              ? "Please contact ISSO or your DSO."
              : "Please complete all required fields to continue."}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/cover")} className="flex-1">
          Back
        </Button>
        <Button
          onClick={() => {
            if (!canContinue) {
              setValidationError(true);
              return;
            }
            setValidationError(false);
            navigate("/step-2-strategy");
          }}
          className="flex-1"
          disabled={optStatus === "denied"}
        >
          Continue to Step 2
        </Button>
      </div>
    </StepLayout>
  );
};

export default Step1Authorization;
