

# Events Integration: Admin Calendar PDF Upload

## Overview

Add an admin events management page where administrators can upload semester calendar PDFs from the Career Center or International Student Office. The system extracts event details and displays them on the student dashboard after timeline generation.

## New Files

### 1. `src/pages/AdminEvents.tsx`
Admin-only page at route `/admin/events` with:
- Two upload zones: "Career Center Calendar" and "International Student Office Calendar"
- File input accepting PDFs only
- On upload: parse PDF using `document--parse_document` approach -- but since there's no backend, we'll use a client-side PDF text extraction library (`pdfjs-dist`) to extract raw text, then parse it with heuristics to find events
- Extracted events displayed in an editable table (title, date, host office, location/link)
- Admin can edit/delete extracted events before saving
- "Save Events" button persists to localStorage under key `semesterEvents`

### 2. `src/lib/parseCalendarPdf.ts`
Client-side PDF parsing utility:
- Uses `pdfjs-dist` to extract text from uploaded PDF
- Regex/heuristic parser to identify event patterns (date patterns, titles, locations)
- Returns array of `CalendarEvent` objects
- Fallback: if extraction fails, admin can manually add events

### 3. `src/components/EventCard.tsx`
Simple card component displaying: event title, date (formatted), host office badge (Career Center / ISSO), location or meeting link (clickable if URL)

### 4. `src/types/events.ts`
```
interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date
  hostOffice: "Career Center" | "International Student Office";
  location: string; // physical address or meeting URL
}
```

## Modified Files

### 5. `src/App.tsx`
Add route: `/admin/events` pointing to `AdminEvents` page.

### 6. `src/pages/Dashboard.tsx`
After the timeline is generated (below existing content), add an "Upcoming Events" section:
- Read `semesterEvents` from localStorage
- Filter to events with date >= today
- Sort chronologically
- Render each with `EventCard`
- Only visible after the plan/timeline data exists (i.e., `chain` is not null)

## Dependencies

Add `pdfjs-dist` for client-side PDF text extraction.

## Admin Access

Since there's no auth backend, the admin page is simply an unlisted route (`/admin/events`). A small "Admin" link can be added to the Cover page footer for access. No student-facing upload UI.

## Event Extraction Heuristics

The parser will look for:
- Date patterns (Month Day, YYYY or MM/DD/YYYY variants)
- Lines adjacent to dates treated as event titles
- Keywords like "Room", "Zoom", "http", "Building" to identify location
- Host office determined by which upload zone was used (Career Center vs ISSO)

If extraction quality is low, the admin sees a warning and can manually edit all fields in the table before saving.

