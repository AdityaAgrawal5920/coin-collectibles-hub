import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Profile {
  display_name: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
}

export function ContactSeller({
  profile,
  itemTitle,
}: {
  profile: Profile | null;
  itemTitle: string;
}) {
  if (!profile) return null;
  const msg = encodeURIComponent(`Hi! I'm interested in "${itemTitle}" on Numismatica.`);
  const wa = profile.whatsapp?.replace(/\D/g, "");

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-display text-lg font-semibold mb-1">Contact seller</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {profile.display_name ?? "Verified collector"}
      </p>
      <div className="space-y-2">
        {wa && (
          <a href={`https://wa.me/${wa}?text=${msg}`} target="_blank" rel="noreferrer">
            <Button className="w-full bg-[oklch(0.7_0.18_150)] hover:bg-[oklch(0.65_0.18_150)] text-white">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </Button>
          </a>
        )}
        {profile.phone && (
          <a href={`tel:${profile.phone}`}>
            <Button variant="outline" className="w-full">
              <Phone className="w-4 h-4 mr-2" /> Call
            </Button>
          </a>
        )}
        {profile.email && (
          <a href={`mailto:${profile.email}?subject=${encodeURIComponent(itemTitle)}`}>
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
