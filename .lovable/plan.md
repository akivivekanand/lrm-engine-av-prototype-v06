

# Reconciliation Plan: Full Architecture Sync

This is a single-pass migration touching 15 files. Every change ensures the data schema, logic layer, and UI components are fully aligned to the Master Prompt spec.

---

## Phase 1: Data Layer (2 files rewritten)

### `src/data/content.json` (full rewrite)
Replace entirely with the Master Prompt JSON:
- **Remove**: `universityContact`, `statusMessages`, `processingEstimates`, `industrySnapshots`, old `aiPrompts`
- **Add**: `careerCenter` (host), `isso` (compliance only), `promptGuide`, `genAiPromptExamples` (10 items), expanded `templates` (5 with subject fields), `aiPrompts` (3 new: sg, ro, lc)
- **Keep**: `disclaimers` (updated to `uscis` + `legal` only, remove `employment`)

### `src/data/tasks.json` (full rewrite)
Replace 4 functional buckets with 3 frequency-based string arrays: `dailyOptions` (30 strings), `weeklyOptions` (25 strings), `monthlyOptions` (20 strings). Verbatim from user-provided spec.

---

## Phase 2: Logic Layer (2 files)

### `src/lib/calculations.ts` (update)
Add three new regulatory anchor functions to existing file:
- `calcLastDayToWork(chosenStartDate)` = `addDays(chosenStartDate, 90)`
- `calcApplicationAnchor(programEndDate)` = `subtractDays(programEndDate, 81)` (60 + 21)
- `calcFilingWindow(programEndDate)` = `{ earliest: subtractDays(programEndDate, 90), latest: addDays(programEndDate, 60) }`

Add these to `LRMChainResult` and compute them in `calculateLRMChainV2`. Keep all existing functions intact.

### `src/lib/smart-suggestions.ts` (rewrite)
Remove `content.json` import and `industrySnapshots` dependency. Implement offline heuristic keyword matching from free-text input:

```text
suggestIndustry(text: string) -> { industryKey, weeks, note }
  finance/banking -> 14w
  tech/engineering/software -> 5w
  consulting -> 9w
  healthcare/medical -> 7w
  marketing/advertising -> 8w
  otherwise -> 6w
```

Keep `getDefaultProcessingDays` and `suggestBufferDays` as-is (no JSON dependency).

---

## Phase 3: New Modules (2 files created)

### `src/lib/taskEngine.ts` (create)
Deterministic task generator seeded by date. Imports from `tasks.json`.
- `generateDailyTasks(startDate, 10)`: returns 10 days of tasks (3 per day, picked by day-based index offset)
- `generateWeeklyTasks(startDate, 8)`: returns 8 weeks of tasks (3 per week)
- `generateMonthlyTasks(startDate, 3)`: returns 3 months of tasks (5 per month)
- Return type: `Array<{ period: string, tasks: string[] }>`

### `src/components/PromptLibrary.tsx` (create)
Accordion list rendering `genAiPromptExamples` from content.json:
- Purpose badge mapped from prompt id (e.g., `ba-gap` -> "Technical", `star-story` -> "Interview", `networking-icebreaker` -> "Networking", `visa-exp` -> "Compliance", etc.)
- Uses Radix Accordion: trigger shows title + Badge, content shows full prompt + "Copy to Clipboard" button
- Renders `promptGuide` as an intro GlassCard above the accordion
- Uses framer-motion for open/close transitions

---

## Phase 4: New Components (3 files created)

### `src/components/ContactCard.tsx` (create)
Reusable GlassCard: name, location, phone, email, optional web link, optional disclaimer text. Accepts a `contact` object prop matching the `isso`/`careerCenter` shape.

### `src/components/TaskEngine.tsx` (create)
Tabbed component (Daily / Weekly / Monthly) using Radix Tabs:
- Calls `taskEngine.ts` generators with today as start date
- Renders task strings with checkboxes, persisted via `taskEngine-{frequency}-{periodIndex}` localStorage keys
- Uses framer-motion `AnimatePresence` for tab content transitions

### `src/components/SegmentedTimeline.tsx` (create)
Horizontal bar with 3 proportional color-coded segments:
- Prep (emerald): `prepPhaseDays` proportion
- Hiring (amber): `hiringWeeks * 7` proportion
- Authorization (indigo): `govProcessingDays + bufferDays` proportion
- Labels below each segment

---

## Phase 5: Component Updates (1 file)

### `src/components/TemplateCard.tsx` (update)
Add optional `subject` prop. When present, render it as a styled label (small, muted text) above the body text. Copy function copies `subject + "\n\n" + body` when subject exists.

---

## Phase 6: Page Rewrites (5 files)

### `src/pages/Cover.tsx` (rewrite)
- Career Center as sole host via `ContactCard` for `content.careerCenter`
- No ISSO on cover
- Disclaimers: `uscis` + `legal`
- "Begin Planning" CTA unchanged

### `src/pages/Step1Authorization.tsx` (update)
- Replace `content.statusMessages[status]` references with inline conditional text (those keys removed from JSON)
- Replace `content.processingEstimates` with inline text
- Replace `universityContact` with `content.isso` in denied status card
- Add "Compliance Info" section at bottom: "Contact University DSO for official policy guidance." + ISSO contact via `ContactCard`

### `src/pages/Step2Strategy.tsx` (rewrite)
- Replace industry dropdown with free-text Input + "Smart Suggest" button
- `suggestIndustry(text)` returns `{ industryKey, weeks, note }`, displayed in a result card
- "Accept" fills hiring weeks slider
- Remove old `TaskChecklist` imports (bucket format gone)
- Keep templates section, pass `subject` prop to `TemplateCard`

### `src/pages/Step3Timeline.tsx` (rewrite)
- Keep timeline parameter inputs (govProcessingDays, bufferDays, prepPhaseDays)
- Add regulatory anchor displays from calculations.ts: Filing Window, Last Day to Work (Start + 90), Application Anchor
- Add `SegmentedTimeline` bar visualization
- Replace old task checklists + AI prompts with `PromptLibrary` component
- Add USCIS disclaimer from `content.disclaimers.uscis`

### `src/pages/Dashboard.tsx` (rewrite)
- Hero: LRM date with status-color badge (emerald/amber/rose based on `getMilestoneStatus`)
- Key Dates card including new anchors: Last Day to Work, Application Anchor, Filing Window
- `SegmentedTimeline` bar
- Unemployment Gauge (approved status only, existing component)
- `TaskEngine` component (Daily/Weekly/Monthly tabs with framer-motion)
- Resource Vault: templates (with subjects) via `TemplateCard`
- `PromptLibrary` accordion
- Compliance Info section: "Contact University DSO for official policy guidance." + `ContactCard` for `content.isso`
- Career Center contact via `ContactCard` for `content.careerCenter`
- Disclaimers
- "Edit Inputs" button

---

## Phase 7: Dependencies

Install `framer-motion` for fluid tab/accordion transitions in TaskEngine and PromptLibrary.

Note: `jspdf` export deferred to a follow-up to keep this migration focused on data/logic/UI sync.

---

## Files Summary

| File | Action |
|------|--------|
| `src/data/content.json` | Rewrite |
| `src/data/tasks.json` | Rewrite |
| `src/lib/calculations.ts` | Update (add 3 regulatory anchors) |
| `src/lib/smart-suggestions.ts` | Rewrite (heuristic keyword mapping) |
| `src/lib/taskEngine.ts` | Create |
| `src/components/PromptLibrary.tsx` | Create |
| `src/components/ContactCard.tsx` | Create |
| `src/components/TaskEngine.tsx` | Create |
| `src/components/SegmentedTimeline.tsx` | Create |
| `src/components/TemplateCard.tsx` | Update (add subject prop) |
| `src/pages/Cover.tsx` | Rewrite |
| `src/pages/Step1Authorization.tsx` | Update |
| `src/pages/Step2Strategy.tsx` | Rewrite |
| `src/pages/Step3Timeline.tsx` | Rewrite |
| `src/pages/Dashboard.tsx` | Rewrite |

