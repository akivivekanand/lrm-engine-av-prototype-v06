

## Plan: Career Strategy Launch Date Feature

### Summary
Add an optional "Career Strategy Launch Date" picker to Step 2 that appears when the student has more than 90 days until their LRM. This date becomes an earlier personal target, with prep and hiring phases calculating backwards from it. It propagates as a new marker to Steps 3, 4, and the Dashboard.

### Prerequisites
Step 2 currently does **not** calculate or display the LRM — it only collects hiring weeks and prep window. To show the eligibility gate, Step 2 needs to read `gradDate` and the chosen start date from localStorage to compute the LRM chain.

### File Changes

**1. `src/pages/Step2Strategy.tsx`**
- Import `calculateLRMChainV2`, `daysBetween`, `stripTime`, `formatDate`, `addDays` from calculations, plus `Calendar`, `Popover`, `CalendarIcon`, `format` from date-fns
- Read `gradDate`, `eadDate`, `optStatus`, `targetWorkReadyDate`, `estimatedStartDate` via `usePersistedState` (read-only)
- Compute `chain` using `calculateLRMChainV2` (same pattern as Step 3)
- Compute `daysToLRM = daysBetween(today, chain.lrmDate)` — if >90, render the new section
- Add `usePersistedState<string | null>("careerStrategyLaunchDate", null)` for the date
- New `GlassCard` section after the Preparation Window card:
  - Label: "Career Strategy Launch Date"
  - Helper text as specified
  - Shadcn date picker (Popover + Calendar with `pointer-events-auto`)
  - Validation: date must be ≥ today+14 days AND < lrmDate. Show inline error if invalid
  - A "Clear" button to reset to null
- No changes to existing hiring weeks / prep window logic

**2. `src/components/SegmentedTimeline.tsx`**
- Accept optional prop `careerStrategyLaunchDate?: Date`
- If provided, add it to `rawMarkers` array with label "Career Strategy Launch Date"
- Add marker style: `bg-emerald` round dot
- Add label color: `text-emerald`

**3. `src/pages/Step3Timeline.tsx`**
- Read `careerStrategyLaunchDate` from localStorage via `usePersistedState`
- Pass it to `<SegmentedTimeline>` as new prop
- Add it to `keyDates` array with `bg-emerald` dot color if set

**4. `src/pages/Dashboard.tsx`**
- Read `careerStrategyLaunchDate` via `usePersistedState`
- **Key Dates card**: Add "Career Strategy Launch Date" entry with `bg-emerald` dot if set
- **SegmentedTimeline**: Pass `careerStrategyLaunchDate` prop
- **Career Strategy Timeline swimlane**: If set, add a small emerald marker/label on the bar, with note "Your personal launch target. Prep and hiring cycle calculate from this date." Keep LRM marker labeled "Last Responsible Moment (outer boundary)"
- **Swimlane calculations**: When `careerStrategyLaunchDate` is set, use it as anchor instead of `startDate` for `prepEnd` and `hiringEnd` recalculation (subtract prepWindowDays and hiringWeeks*7 backwards from it)

**5. `src/pages/MyPlan.tsx`**
- Read `careerStrategyLaunchDate` via `usePersistedState`
- If set, use it as the deadline anchor for the swimlane end boundary instead of `lastDayToWork`
- `careerPlanStartDate` picker remains unchanged
- The swimlane bar's end marker shifts to `careerStrategyLaunchDate` when set, with LRM still referenced in legend

### Validation Logic (Step 2)
```
const minLaunchDate = addDays(today, 14);
const isValid = launchDate >= minLaunchDate && launchDate < chain.lrmDate;
```

### What stays unchanged
- All existing LRM calculation logic in `calculations.ts`
- All behavior when `careerStrategyLaunchDate` is null — identical to current

