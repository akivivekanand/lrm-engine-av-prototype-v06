import * as pdfjsLib from "pdfjs-dist";
import type { CalendarEvent } from "@/types/events";

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n");
}

const DATE_REGEX = /(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,?\s*\d{4})?)|(?:\d{1,2}\/\d{1,2}\/\d{2,4})/gi;

function parseDate(dateStr: string): string | null {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  } catch {
    // ignore
  }
  return null;
}

function extractLocation(text: string): string {
  const urlMatch = text.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) return urlMatch[0];

  const roomMatch = text.match(/(?:Room|Building|Hall|Center|Suite)\s+[\w\d\-]+/i);
  if (roomMatch) return roomMatch[0];

  const zoomMatch = text.match(/Zoom/i);
  if (zoomMatch) return "Zoom (see details)";

  return "";
}

export async function parseCalendarPdf(
  file: File,
  hostOffice: CalendarEvent["hostOffice"]
): Promise<CalendarEvent[]> {
  const rawText = await extractTextFromPdf(file);
  const events: CalendarEvent[] = [];

  // Split into lines for processing
  const lines = rawText.split(/\n|(?:\s{2,})/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const dateMatches = line.match(DATE_REGEX);
    if (dateMatches) {
      for (const dateStr of dateMatches) {
        const isoDate = parseDate(dateStr);
        if (!isoDate) continue;

        // Title: text before the date, or the next non-empty line
        let title = line.replace(dateStr, "").replace(/[-–—|,]/g, " ").trim();
        if (!title && i + 1 < lines.length) {
          title = lines[i + 1].trim();
        }
        if (!title) title = "Untitled Event";

        // Location from surrounding context
        const context = lines.slice(Math.max(0, i - 1), i + 3).join(" ");
        const location = extractLocation(context);

        events.push({
          id: crypto.randomUUID(),
          title,
          date: isoDate,
          hostOffice,
          location,
        });
      }
    }
  }

  return events;
}
