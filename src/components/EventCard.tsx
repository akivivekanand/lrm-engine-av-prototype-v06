import { CalendarEvent } from "@/types/events";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, ExternalLink } from "lucide-react";
import GlassCard from "@/components/GlassCard";

interface EventCardProps {
  event: CalendarEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const isUrl = event.location.startsWith("http");
  const formatted = new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <GlassCard className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground leading-tight">{event.title}</h3>
        <Badge variant={event.hostOffice === "Career Center" ? "default" : "secondary"} className="shrink-0 text-[10px]">
          {event.hostOffice === "Career Center" ? "Career Center" : "ISSO"}
        </Badge>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="h-3 w-3" />
        <span>{formatted}</span>
      </div>
      {event.location && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isUrl ? <ExternalLink className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
          {isUrl ? (
            <a href={event.location} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate">
              {event.location}
            </a>
          ) : (
            <span>{event.location}</span>
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default EventCard;
