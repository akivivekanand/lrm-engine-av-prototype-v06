import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import GlassCard from "./GlassCard";

interface ContactInfo {
  name: string;
  location: string;
  phone: string;
  email: string;
  web?: string;
}

interface ContactCardProps {
  contact: ContactInfo;
  disclaimer?: string;
  className?: string;
}

const ContactCard = ({ contact, disclaimer, className }: ContactCardProps) => (
  <GlassCard className={className}>
    <h3 className="text-sm font-semibold text-foreground mb-2">{contact.name}</h3>
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <MapPin className="w-3 h-3 shrink-0" /> {contact.location}
      </p>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Phone className="w-3 h-3 shrink-0" /> {contact.phone}
      </p>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Mail className="w-3 h-3 shrink-0" /> {contact.email}
      </p>
      {contact.web && (
        <a
          href={contact.web}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1.5"
        >
          <ExternalLink className="w-3 h-3 shrink-0" /> Visit Website
        </a>
      )}
    </div>
    {disclaimer && (
      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed">
        {disclaimer}
      </p>
    )}
  </GlassCard>
);

export default ContactCard;
