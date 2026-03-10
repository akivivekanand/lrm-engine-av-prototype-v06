

## Plan: Step 3 Timeline Visual Refinements

### Changes

**1. SegmentedTimeline component (`src/components/SegmentedTimeline.tsx`)**

- **Uniform marker dots**: All markers get the same size (`w-3 h-3`). Remove the varying sizes (w-3, w-3.5, w-4, w-5) and rings. Each dot keeps its distinct color but is the same circle size.
- **Dynamic track color**: Calculate `daysRemaining = daysBetween(today, lastDayToWork)`. Set the track fill color:
  - Green (`bg-emerald-500`) if > 60 days remaining
  - Amber (`bg-amber-500`) if 15-60 days remaining  
  - Red (`bg-red-500/critical`) if < 15 days remaining
- **Prevent label overflow**: Add `overflow-hidden` to the container. Clamp marker positions so labels at edges don't escape the card. Use `min-w-0` and constrain the outermost labels with directional transforms (left-align first marker label, right-align last marker label).
- **Remove the vertical emphasis line** from Last Day to Start Working marker (simplify to just a colored dot like others).

**2. Key Dates section (`src/pages/Step3Timeline.tsx`, lines 315-334)**

Restyle to match the reference image:
- Each row gets a colored circle on the left (matching the marker's timeline color), followed by the bold label and the date below in a muted accent color.
- Remove the right-aligned status badge pills.
- Layout: flex row with a `w-3 h-3 rounded-full` dot, then a div with label (bold, `text-sm`) and date (`text-xs text-primary` or similar accent).
- Use the same color per marker type: emerald for on-track dates, amber for LRM, sky for today, slate for program end, critical/red for last day.

**3. Heading overflow fix**
- The "Timeline" heading area with "How this works" already uses `flex items-center gap-2`. Add `flex-wrap` or ensure the card has proper padding so nothing overflows.

