import { useState } from "react";
import { Upload, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { parseCalendarPdf } from "@/lib/parseCalendarPdf";
import type { CalendarEvent } from "@/types/events";
import { toast } from "@/hooks/use-toast";

type HostOffice = CalendarEvent["hostOffice"];

const AdminEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const stored = localStorage.getItem("semesterEvents");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [parsing, setParsing] = useState(false);

  const handleUpload = async (file: File, hostOffice: HostOffice) => {
    setParsing(true);
    try {
      const extracted = await parseCalendarPdf(file, hostOffice);
      if (extracted.length === 0) {
        toast({ title: "No events found", description: "Try adding events manually.", variant: "destructive" });
      } else {
        toast({ title: `${extracted.length} event(s) extracted`, description: "Review and edit before saving." });
      }
      setEvents((prev) => [...prev, ...extracted]);
    } catch {
      toast({ title: "PDF parsing failed", description: "Please add events manually.", variant: "destructive" });
    } finally {
      setParsing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, hostOffice: HostOffice) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file, hostOffice);
    e.target.value = "";
  };

  const updateEvent = (id: string, field: keyof CalendarEvent, value: string) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const addBlank = (hostOffice: HostOffice) => {
    setEvents((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", date: "", hostOffice, location: "" },
    ]);
  };

  const save = () => {
    localStorage.setItem("semesterEvents", JSON.stringify(events));
    toast({ title: "Events saved", description: `${events.length} event(s) saved.` });
  };

  return (
    <StepLayout>
      <h1 className="text-lg font-bold text-foreground">Admin: Semester Events</h1>

      {/* Upload Zones */}
      {(["Career Center", "International Student Office"] as HostOffice[]).map((office) => (
        <GlassCard key={office} className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-foreground">{office} Calendar</Label>
            <Badge variant={office === "Career Center" ? "default" : "secondary"} className="text-[10px]">
              {office === "Career Center" ? "CC" : "ISSO"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Label
              htmlFor={`upload-${office}`}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors text-sm text-muted-foreground"
            >
              <Upload className="h-4 w-4" />
              {parsing ? "Parsing…" : "Upload PDF"}
            </Label>
            <input
              id={`upload-${office}`}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => onFileChange(e, office)}
              disabled={parsing}
            />
            <Button variant="outline" size="sm" onClick={() => addBlank(office)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </GlassCard>
      ))}

      {/* Events Table */}
      {events.length > 0 && (
        <GlassCard className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Office</TableHead>
                <TableHead className="text-xs">Location</TableHead>
                <TableHead className="text-xs w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell className="p-1">
                    <Input
                      value={ev.title}
                      onChange={(e) => updateEvent(ev.id, "title", e.target.value)}
                      className="h-8 text-xs"
                      placeholder="Event title"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      type="date"
                      value={ev.date}
                      onChange={(e) => updateEvent(ev.id, "date", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Badge variant={ev.hostOffice === "Career Center" ? "default" : "secondary"} className="text-[10px]">
                      {ev.hostOffice === "Career Center" ? "CC" : "ISSO"}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      value={ev.location}
                      onChange={(e) => updateEvent(ev.id, "location", e.target.value)}
                      className="h-8 text-xs"
                      placeholder="Room / URL"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Button variant="ghost" size="icon" onClick={() => deleteEvent(ev.id)} className="h-7 w-7">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </GlassCard>
      )}

      <Button onClick={save} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Events ({events.length})
      </Button>
    </StepLayout>
  );
};

export default AdminEvents;
