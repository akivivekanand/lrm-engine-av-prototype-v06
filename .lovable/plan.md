

## Plan: Replace Horizontal Timeline with Vertical List in Step 3

### Problem
The horizontal `SegmentedTimeline` bar has persistent label collision issues at mobile widths with 6 markers. A vertical list is inherently collision-free.

### Changes in `src/pages/Step3Timeline.tsx`

**1. Remove SegmentedTimeline import** (line 8) — delete the import since it will no longer be used on this page.

**2. Replace the Timeline Visualization GlassCard** (lines 294-320) — remove the `<SegmentedTimeline>` component and replace the card's content with the vertical dot-and-date list using the same `keyDates` array already computed on this page. Same dot colors, same opacity-40 for past dates, same layout pattern as the Key Dates card below.

**3. Remove the duplicate Key Dates card** (lines 322-350) — since the new vertical list in the Timeline Intelligence card now shows the exact same information, the separate Key Dates card is redundant. Remove it.

### What stays unchanged
- All calculation logic, persisted state, imports for calculations
- The "How this works" toggle and explanation text inside the Timeline Intelligence card
- The `SegmentedTimeline` component file itself (still used by Dashboard)
- Dashboard.tsx, MyPlan.tsx, and all other files

