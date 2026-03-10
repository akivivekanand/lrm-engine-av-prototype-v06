

# Updated Dashboard Refactor Plan

## Files to Change

### 1. `src/data/content.json` (line 3)
Update career center name to: `"Center for Career Equity, Development and Success"`

### 2. `src/pages/Dashboard.tsx` — Major Refactor

**Remove** these existing sections:
- Your Timeline card (lines 141–206)
- Authorization Window card (lines 208–236)
- Strategy Summary card (lines 238–262)
- Next Actions checklist (lines 265–287)
- Unemployment Clock (lines 289–319)

**Keep/reuse:**
- All persisted state reads (gradDate, eadDate, optStatus, hiringWeeks, prepWindowDays, etc.)
- `calculateLRMChainV2` chain computation
- `generateCareerPlan` call
- `confetti` import
- `ContactCard`, `GlassCard`, `StepLayout` components
- `content` import

**New imports:**
- `SegmentedTimeline` from components
- `Tabs, TabsList, TabsTrigger, TabsContent` for action plan
- `ChevronDown, ChevronUp, Download, Wrench` icons
- `Collapsible, CollapsibleTrigger, CollapsibleContent`

**New state:**
- `strategyGenerated` — persisted boolean via `usePersistedState`
- `showTimelineIntel` — local toggle
- `showStrategicGuidance` — local toggle
- `showActionPlan` — local toggle
- Read `myPlanDailyTasks`, `myPlanWeeklyTasks`, `myPlanMonthlyTasks` from persisted state (same keys as MyPlan.tsx)
- No `showToolkit` state needed (button navigates away)

**Layout order:**

1. **LRM Card** — GlassCard with LRM date, status badge (green "On Track" / yellow "Soon" / red "Past Due"), LRM description text, days remaining count

2. **Step 3 Timeline** — GlassCard with `<SegmentedTimeline>` and Key Dates section (chronological list with colored dots: Program End Date, Today, LRM, Start Date, Last Day to Start Working — replicate Step3Timeline pattern)

3. **Step 4 Timeline** — GlassCard with Prep/Hiring/OPT Buffer swimlane bar (reuse existing band calculation logic) + "Key Time Frames" section listing Prep Window, Hiring Cycle, OPT Buffer with date ranges

4. **Generate My Career Strategy button** — Full-width prominent button. If not yet generated: primary style with Sparkles icon. If already generated: outline "Regenerate" variant. On click: generate plan, set `strategyGenerated(true)`, fire confetti with colors `["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#9B59B6"]`

5. **Career Center Contact** — `<ContactCard contact={content.careerCenter} />` using updated name

6. **Post-click: Timeline Intelligence** — Collapsible GlassCard, only visible when `strategyGenerated`. Shows `plan.timelineIntelligence` paragraphs

7. **Post-click: Strategic Guidance** — Collapsible GlassCard, same pattern. Shows `plan.strategicGuidance` paragraphs

8. **Post-click: My Action Plan** — Toggle button to expand. When expanded: Tabs (Daily/Weekly/Monthly). Reads persisted tasks from `myPlanDailyTasks`, `myPlanWeeklyTasks`, `myPlanMonthlyTasks`. If all empty, generate fallback: slice first 3 entries from `plan.actionPlan.daily/weekly/monthly`. Display as read-only checklist

9. **Post-click: My Toolkit** — Button that calls `navigate("/resource-vault")`. No local state, no content reveal on dashboard

10. **Post-click: Download PDF** — Button that fires confetti (same colorful palette) then calls `window.print()`. Add `@media print` styles to hide nav/buttons and show content cleanly. User saves as PDF from browser dialog

11. **Compliance Info** — ISSO contact + disclaimers at very bottom, below everything including post-click sections

12. **Edit Inputs button** — Keep at bottom

**Confetti colors** for both Generate and Download PDF:
```ts
colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#9B59B6"]
```

**Print styles:** Add a `print:hidden` class to nav, buttons, and non-content elements. Add minimal print CSS in `src/index.css` or inline `@media print` block.

