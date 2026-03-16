

## Plan: Step 1 Label Rename + Career Strategy Launch Date Forward-Calculation Rewrite

### Change 1: Step 1 Label Rename (notApplied only)

**`src/pages/Step1Authorization.tsx`** — Lines 236-237:
- Label: `"Chosen Start Date"` → `"Estimated OPT Start Date"`
- Helper: `"When you want to start working."` → `"Approximately when you expect your OPT to begin. This is used for planning purposes only."`

No other OPT statuses affected.

---

### Change 2: Forward-Calculation Rewrite

The current implementation incorrectly uses backward math from CSLD. The correct model is:

```text
CSLD (start)
  + prepWindowDays        = prepEnd
  + hiringWeeks * 7       = hiringEnd
chain.lastDayToWork       = optBufferEnd (unchanged)
```

#### `src/pages/Step2Strategy.tsx`

- **Helper text** (line 275): Change from "calculate backwards from this date" → "Your prep window and hiring cycle will run forward from this date. Your LRM and OPT dates remain your outer compliance boundary."
- **Remove upper bound restriction** on calendar: Currently disables dates >= lrmDate. Change to only disable dates < minLaunchDate (14 days from today). No upper bound.
- **Update validation**: Remove `launchDateInvalid` check for >= lrmDate. Only check < minLaunchDate.
- **Update error text**: `"Please choose a date at least two weeks from today."`
- **Add forward-calculation summary** below the date picker when a valid date is set:
  ```
  Your prep window begins [CSLD]. Hiring cycle runs through [CSLD + prepWindowDays + hiringWeeks*7].
  Your compliance deadline remains [chain.lrmDate].
  ```

#### `src/pages/Dashboard.tsx`

Lines 141-168 — Replace backward calculation with forward:

```typescript
// When CSLD is set, forward-calculate
const swimlaneStart = csldObj || startDate;
const prepEnd = csldObj
  ? addDays(csldObj, prepWindowDays)
  : addDays(startDate, prepWindowDays);
const hiringEnd = addDays(prepEnd, hiringWeeks * 7);
const optBufferEnd = chain ? chain.lastDayToWork : hiringEnd;
```

Update percentage calculations to use `swimlaneStart → optBufferEnd` as total span. Three bands: Prep (swimlaneStart→prepEnd), Hiring (prepEnd→hiringEnd), OPT Buffer (hiringEnd→optBufferEnd).

Update date labels beneath swimlane bar (lines 405-415):
- Show: swimlaneStart / prepEnd / hiringEnd / optBufferEnd
- Keep CSLD note and LRM outer boundary note.

Update Key Time Frames card (lines 419-443):
- When CSLD set: Prep = swimlaneStart→prepEnd, Hiring = prepEnd→hiringEnd, OPT Buffer = hiringEnd→optBufferEnd
- When not set: unchanged (startDate-based).

#### `src/pages/MyPlan.tsx`

Lines 95-120 — Replace backward calculation with forward:

```typescript
const swimlaneStart = csldObj || startDate;
const prepEnd = csldObj
  ? addDays(csldObj, prepWindowDays)
  : addDays(startDate, prepWindowDays);
const hiringEnd = addDays(prepEnd, hiringWeeks * 7);
const optBufferEnd = chain ? chain.lastDayToWork : hiringEnd;
```

Update percentage calculations similarly. Update date labels. Add "Last Responsible Moment (outer boundary): [lrmDate]" below swimlane when CSLD is set.

#### `src/components/SegmentedTimeline.tsx` and `src/pages/Step3Timeline.tsx`

No changes needed — these already work correctly (just displaying the CSLD as a marker).

### What stays unchanged
- `calculations.ts` — no edits
- LRM calculation chain — no edits
- All behavior when `careerStrategyLaunchDate` is null — identical to current
- `careerPlanStartDate` picker in My Plan
- All OPT status flows in Step 1 other than the label rename

