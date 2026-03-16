

## Plan: Timeline Label Collision Fixes

### `src/components/SegmentedTimeline.tsx`

**1. Fixed label side assignments** (replace `i % 2` alternation at line 129):

Map of forced positions:
- Above: "Career Strategy Launch Date", "Today", "LRM"
- Below: "Last Day to Start Working", "Chosen Start Date", "EAD Start Date", "Program End Date"
- Default fallback: alternate by index

**2. Long label truncation** (lines 158-159):

If `m.label.length > 18`, split at the space nearest the midpoint and render as two stacked `<p>` tags at `text-[9px]` instead of one line.

**3. Crowding detection + cascading offset** (new logic before the JSX return):

After sorting markers and computing `pct()` for each, iterate through adjacent pairs. If two adjacent markers are both on the same side (both above or both below) and within 12 percentage points:
- The second marker gets an additional `mt-4` (if below) or `mb-4` (if above) offset
- The second marker's font size reduces to `text-[8px]` instead of `text-[10px]`

This is computed as a pre-pass producing a `Map<string, { extraOffset: string; smallFont: boolean }>` that the render loop consults.

**No changes** to dot styles, track rendering, colors, props, or how the component is called.

