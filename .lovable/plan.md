

# Revised Implementation Plan — Incremental Refactor

## Constraints (locked)

- `content.json` keeps all existing keys verbatim: `universityContact`, `disclaimers`, `statusMessages`, `processingEstimates`, `industrySnapshots`, `templates`, `aiPrompts`
- `tasks.json` keeps four buckets with `{id, task}` objects — no changes
- `src/utils/dateCalculator.ts` stays in place (not deleted)
- No JSON key renames, no value changes
- All status/processing text rendered from JSON, never hardcoded

## New Files (additive only)

### `src/lib/calculations.ts`
Thin wrapper that re-exports and extends `src/utils/dateCalculator.ts`:
- `calcFilingDeadline(gradDate)` — grad + 60
- `calcAuthorizationWall(chosenStart, govDays, bufferDays)` — chosenStart - (gov + buffer)
- `calcHiringCyclePeak(authWall, hiringWeeks)` — authWall - (weeks * 7)
- `calcLRMDate(peak, prepDays)` — peak - prepDays
- Updated `calculateLRMChain` signature accepting `prepPhaseDays` param (replaces hardcoded 7)
- Re-exports existing `stripTime`, `addDays`, `formatDate`, `getMilestoneStatus`

### `src/lib/smart-suggestions.ts`
- `getDefaultHiringWeeks(industry)` — reads `content.industrySnapshots[key].weeks`
- `getDefaultProcessingDays(type)` — 30 premium, 120 standard
- `suggestBufferDays(optStatus)` — 14 default, 21 for RFE

### `src/components/StepLayout.tsx`
Wraps step pages: gradient background, `<ProgressBar />`, `max-w-md` container, children slot. Each page drops its boilerplate div + ProgressBar import in favor of `<StepLayout>`.

## Page Changes

### Step 1 — `Step1Authorization.tsx` (rewrite)
Conditional UI per OPT status, all text from `content.statusMessages` and `content.processingEstimates`:
- **Not Applied**: Graduation Date → show Filing Deadline (grad + 60)
- **Waiting**: Graduation Date + Submission Date + Processing Type (standard/premium) + `processingEstimates[type]` text
- **Approved**: Graduation Date + EAD Start Date (required)
- **RFE**: Graduation Date + RFE Response Date + `statusMessages.rfe` text
- **Denied**: `statusMessages.denied` + universityContact card, Continue disabled

New persisted keys: `submissionDate`, `rfeResponseDate`. Remove `processingType` from this page's own persistence (only used under "waiting" for display). Continue gate varies by status.

### Step 2 — `Step2Strategy.tsx` (modify)
- Remove buffer weeks slider (moves to Step 3)
- Add hiring weeks slider: default from `industrySnapshots[industry].weeks`, user adjustable (2–20 range)
- New persisted key: `hiringWeeks`
- Keep industry selector, task checklists, templates unchanged

### Step 3 — `Step3Timeline.tsx` (rewrite)
New inputs (all persisted):
- `govProcessingDays`: number input (default 90)
- `bufferDays`: number input (default 10)
- `prepPhaseDays`: number input (default 7)
- **Chosen Start Date**: if `optStatus === "approved"` → locked to EAD date (read-only); otherwise → `targetWorkReadyDate` date picker

Compute LRM chain via `src/lib/calculations.ts`. Display vertical timeline + human layer/compliance tasks + AI prompts (all from JSON).

### Dashboard — `Dashboard.tsx` (update)
- Read new persisted keys: `govProcessingDays`, `bufferDays`, `prepPhaseDays`, `hiringWeeks`, `targetWorkReadyDate`
- Compute LRM chain with updated params
- Unemployment gauge only shown when `optStatus === "approved"`
- Add Resource Vault section: render `templates` + `aiPrompts` from JSON inline (with copy buttons)
- Keep universityContact card, disclaimers, task progress from JSON

### Cover — `Cover.tsx` (minor)
- Wrap in `StepLayout` (without progress bar flag) — or keep as-is since cover has unique centered layout. No functional changes needed.

## Files Summary

| File | Action |
|------|--------|
| `src/data/content.json` | No change |
| `src/data/tasks.json` | No change |
| `src/utils/dateCalculator.ts` | No change (kept) |
| `src/lib/calculations.ts` | Create — extends dateCalculator with prepPhaseDays support |
| `src/lib/smart-suggestions.ts` | Create — default value helpers |
| `src/components/StepLayout.tsx` | Create — shared layout wrapper |
| `src/pages/Step1Authorization.tsx` | Rewrite — conditional status UI |
| `src/pages/Step2Strategy.tsx` | Modify — swap buffer slider for hiring weeks slider |
| `src/pages/Step3Timeline.tsx` | Rewrite — LRM inputs + chosen start date logic |
| `src/pages/Dashboard.tsx` | Update — new keys, resource vault, conditional gauge |
| `src/pages/Cover.tsx` | No change |
| `src/App.tsx` | No change |

