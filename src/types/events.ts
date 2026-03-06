export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date
  hostOffice: "Career Center" | "International Student Office";
  location: string; // physical address or meeting URL
}
