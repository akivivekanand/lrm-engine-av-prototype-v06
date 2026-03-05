

# Strategic Career Timeline Mapping

A mobile-first, glassmorphism-styled React app guiding international students through OPT career planning with a multi-step flow and dynamic timeline calculations.

## Design System
- **Style**: Glassmorphism — white/translucent cards with `backdrop-blur`, subtle borders, soft shadows
- **Font**: Inter (Google Fonts)
- **Colors**: Slate-900 text, Indigo-600 primary, Emerald-500 on-track, Amber-500 compression, Rose-500 crisis
- **No emojis** anywhere in the UI

## Data Layer
- Create `src/data/content.json` and `src/data/tasks.json` verbatim from user-provided content
- All UI text, disclaimers, templates, AI prompts, and tasks imported from these JSON files — nothing hard-coded in components

## Route Structure (`react-router-dom`)
`/cover` → `/step-1-authorization` → `/step-2-strategy` → `/step-3-timeline` → `/dashboard`

- Persistent **progress bar** at the top of steps 1–4 showing: Authorization → Strategy → Timeline → Plan
- On app load, restore last visited route from `localStorage`

## Page Breakdown

### 1. Cover Page (`/cover`)
- App title, Suffolk ISSO contact info (from JSON), legal disclaimer
- Single CTA button to begin → navigates to Step 1

### 2. Step 1 — Authorization (`/step-1-authorization`)
- Inputs: Graduation date (datepicker), OPT status (not applied / waiting / approved / RFE / denied), processing type (standard / premium), EAD start date (if approved)
- Display contextual status message from JSON based on selection
- Filing deadline auto-calculated: Graduation + 60 days
- Save all inputs to localStorage on change

### 3. Step 2 — Strategy (`/step-2-strategy`)
- Industry selector (finance / tech / consulting / healthcare / general) — shows hiring cycle weeks + note from JSON
- Buffer weeks slider (1–4 weeks, default 2)
- Checklist of foundation + preparation tasks from `tasks.json` with checkbox persistence
- Templates section: expandable cards from JSON with copy-to-clipboard

### 4. Step 3 — Timeline (`/step-3-timeline`)
- **LRM Chain Calculation** (all local timezone, date-only):
  - Filing Deadline = Graduation + 60 days
  - Authorization Wall = EAD Start Date − (processing days + buffer days)
  - Hiring Cycle Peak = Authorization Wall − (industry weeks × 7)
  - LRM Date = Hiring Cycle Peak − 7 days
- Visual vertical timeline showing each milestone with color-coded status (emerald/amber/rose based on proximity to today)
- Human Layer + Compliance tasks from JSON as actionable checklist
- AI Prompts section: cards with copy-to-clipboard for each prompt

### 5. Dashboard (`/dashboard`)
- Summary card showing all key dates from the LRM chain
- **Unemployment Gauge**: circular progress (days used out of 90)
  - Input for days used, visual ring
  - Emerald when ≥ 20 days remaining, Amber ≤ 20, Rose ≤ 10
  - Required text from JSON: "Prioritize qualifying OPT employment..."
- Task completion progress across all categories
- Quick links to templates and AI prompts
- ISSO contact card from JSON

## Persistence
- All user inputs, checkbox states, and current route saved to `localStorage`
- Custom hook `usePersistedState` for consistent save/restore
- On mount, `App.tsx` reads saved route and redirects via `useNavigate`

## Key Components
- `ProgressBar` — shared step indicator across all step pages
- `GlassCard` — reusable glassmorphism container
- `UnemploymentGauge` — circular SVG progress with color thresholds
- `TimelineMilestone` — vertical timeline node with date + status color
- `TemplateCard` — expandable card with copy button
- `TaskChecklist` — checkbox list with localStorage persistence
- `DateCalculator` utility — all LRM chain math, local timezone only

