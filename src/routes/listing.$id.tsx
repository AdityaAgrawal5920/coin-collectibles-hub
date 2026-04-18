import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactSeller } from "@/components/ContactSeller";
import { categoryLabel } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const Route = createFileRoute("/listing/$id")({
  component: ListingDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl mb-2">Listing not found</h1>
        <Link to="/browse" className="text-gold-deep hover:underline">Back to browse</Link>
      </div>
      <Footer />
    </div>
  ),
});

function ListingDetail() {
  const { id } = Route.useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: l } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (!l) {
        setLoading(false);
        throw notFound();
      }
      setListing(l);
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", l.user_id).maybeSingle();
      setProfile(p);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-10 flex-1">
          <div className="h-96 bg-parchment animate-pulse rounded-xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) return null;
  const cover = listing.images[activeImg] ?? listing.images[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to browse
        </Link>

        <div className="grid lg:grid-cols-[1.2fr,1fr] gap-10">
          <div>
            <div className="aspect-square bg-parchment rounded-2xl overflow-hidden border border-border shadow-card">
              {cover ? (
                <img src={cover} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-30">🪙</div>
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      i === activeImg ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-parchment border border-border text-xs font-medium mb-3">
              {categoryLabel(listing.category)}
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight">{listing.title}</h1>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {listing.year && <span>📅 {listing.year}</span>}
              {listing.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {listing.country}
                </span>
              )}
              {listing.condition && <span>✨ {listing.condition}</span>}
            </div>

            <div className="mt-6 py-6 border-y border-border">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Asking price</div>
              <div className="font-display text-4xl font-bold text-gradient-gold">
                {listing.price ? `${listing.currency} ${Number(listing.price).toLocaleString()}` : "Contact for price"}
              </div>
            </div>

            {listing.description && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold mb-2">Description</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            <div className="mt-6">
              <ContactSeller profile={profile} itemTitle={listing.title} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
