

# Fix Calculation Logic, Terminology, and Conditional UI

## Changes across 5 files

### 1. Terminology Renames (global)

| Old Term | New Term | Files Affected |
|----------|----------|----------------|
| Graduation Date | Program End Date | Step1, Step3, Dashboard, calculations |
| Filing Deadline | Last Date to Apply for OPT | Step1, Step3, Dashboard |
| Application Anchor | Earliest Date to Apply for OPT | Step3, Dashboard |
| Authorization Wall | Hiring Completion Deadline | Step3, Dashboard |
| Key Dates | Timing Constraints | Dashboard |

### 2. LRM Calculation Fix (`src/lib/calculations.ts`)

Current LRM formula chains through authorizationWall and hiringCyclePeak with prepPhaseDays. The spec requires a simpler formula:

**New LRM**: `Last Day to Start Working - (Hiring Weeks * 7) - 14 days`

Which expands to: `(Chosen Start Date + 90) - (Hiring Weeks * 7) - 14`

This replaces the current chain that goes through govProcessingDays/bufferDays/prepPhaseDays. The `calculateLRMChainV2` function will be updated accordingly. The `Earliest Date to Apply for OPT` also changes from `Program End Date - 81` to `Program End Date - 90`.

### 3. Step 1 Updates (`src/pages/Step1Authorization.tsx`)

- Rename "Graduation Date" label to "Program End Date"
- Add helper text: "Your Program End Date can be found on page 1 of your current I-20."
- Rename "Filing Deadline" display text to "Last Date to Apply for OPT"

### 4. Dashboard Updates (`src/pages/Dashboard.tsx`)

- Rename "Key Dates" to "Timing Constraints"
- Rename all date labels per terminology table
- Add LRM info text explaining the calculation logic (tooltip or small text beneath the LRM hero)
- **Conditional rendering**: If `optStatus !== "notApplied"`, hide "Earliest Date to Apply for OPT" and "Last Date to Apply for OPT" from the list
- **Unemployment Gauge**: Auto-calculate `daysUsed` as `daysBetween(chosenStartDate, today)` clamped 0-90. Remove manual input field and `daysUsed` persisted state
- Remove Career Center ContactCard (line 146) since it's already on Cover. Keep ISSO as compliance footer only on Step 1 and Dashboard

### 5. Step 3 Updates (`src/pages/Step3Timeline.tsx`)

- Rename milestone labels: "Authorization Wall" to "Hiring Completion Deadline", "Filing Deadline" to "Last Date to Apply for OPT", "Application Anchor" to "Earliest Date to Apply for OPT"

### 6. Cover Page (`src/pages/Cover.tsx`)

- Update title to "Career Timeline Mapping Engine: Strategic Job Search Navigation"
- Remove ISSO ContactCard from legal disclaimer card (lines 61-63). Only Suffolk Career Center contact remains on Cover

### 7. Calculation Details (`src/lib/calculations.ts`)

- `calcApplicationAnchor` (renamed to Earliest Date to Apply): change from `programEndDate - 81` to `programEndDate - 90`
- New simplified LRM: `calcLastDayToWork(chosenStartDate) - (hiringWeeks * 7) - 14`
- The `LRMChainResult` interface fields rename: `filingDeadline` to `lastDateToApply`, `applicationAnchor` to `earliestDateToApply`, `authorizationWall` to `hiringCompletionDeadline`
- Remove `filingWindow` from the result (replaced by `earliestDateToApply` and `lastDateToApply`)

