import { Link } from "@tanstack/react-router";
import { categoryLabel } from "@/lib/categories";
import type { Database } from "@/integrations/supabase/types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.images?.[0];
  return (
    <Link
      to="/listing/$id"
      params={{ id: listing.id }}
      className="group block hover-lift bg-card rounded-xl overflow-hidden border border-border shadow-card"
    >
      <div className="aspect-square bg-parchment relative overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">
            🪙
          </div>
        )}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-xs font-medium border border-border">
          {categoryLabel(listing.category)}
        </div>
        {listing.featured && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full gradient-gold text-xs font-semibold text-ink">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold leading-tight line-clamp-1">
          {listing.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {listing.year && <span>{listing.year}</span>}
          {listing.country && <><span>•</span><span>{listing.country}</span></>}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <span className="font-display text-xl font-bold text-gradient-gold">
            {listing.price ? `${listing.currency} ${Number(listing.price).toLocaleString()}` : "Inquire"}
          </span>
          {listing.condition && (
            <span className="text-xs text-muted-foreground">{listing.condition}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
