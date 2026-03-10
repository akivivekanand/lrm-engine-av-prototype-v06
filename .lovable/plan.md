

## Plan: Step 4 Strategy Task Curation Updates

### Changes in `src/pages/MyPlan.tsx`

**1. Add subtitle after heading (line 150)**
Insert `<p className="text-xs text-muted-foreground">Your action strategy helps you translate your preparation window and hiring cycle into manageable daily, weekly, and monthly activities.</p>` after the h1.

**2. Replace × with red − button (lines 291-296, 379-384, 444-449)**
Replace the three `×` button instances with `<Minus className="h-3 w-3" />` wrapped in a button styled `text-destructive hover:text-destructive/80`. Same onClick behavior.

**3. Add dynamic card count state (around line 44)**
Add three `useState` hooks:
```
const [visibleDays, setVisibleDays] = useState(1);
const [visibleWeeks, setVisibleWeeks] = useState(1);
const [visibleMonths, setVisibleMonths] = useState(1);
```

**4. Update card arrays (lines 129-146)**
- `dayCards`: change `length: 7` → `length: visibleDays` (max 12)
- `weekCards`: change `length: 4` → `length: visibleWeeks` (max 12)
- `monthCards`: change `length: 3` → `length: visibleMonths` (max 12)

**5. Default 2 tasks for today (lines 67-71)**
In `getDailyTasks`, when `dayIndex === 0` and no persisted/plan tasks exist, return `tasks.dailyOptions.slice(0, 2)`.

**6. Add "Add Day/Week/Month" buttons**
After each tab's card list (after lines 363, 428, 493), add an outline button with Plus icon:
- `+ Add Day` → `setVisibleDays(prev => Math.min(prev + 1, 12))`, disabled when `visibleDays >= 12`
- `+ Add Week` → `setVisibleWeeks(prev => Math.min(prev + 1, 12))`, disabled when `visibleWeeks >= 12`
- `+ Add Month` → `setVisibleMonths(prev => Math.min(prev + 1, 12))`, disabled when `visibleMonths >= 12`

**7. Day card date display**
Already correct — each day card uses `addDays(startDate, i)` and formats with `format(date, "EEEE, MMMM d, yyyy")`.

