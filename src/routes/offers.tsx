import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Offer = Database["public"]["Tables"]["special_offers"]["Row"];
type Listing = Database["public"]["Tables"]["listings"]["Row"];

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Special Offers — Numismatica" },
      { name: "description", content: "Limited-time featured pieces and exclusive deals from our curated collection." },
      { property: "og:title", content: "Special Offers — Numismatica" },
      { property: "og:description", content: "Limited-time featured pieces from our curated collection." },
    ],
  }),
  component: Offers,
});

function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [featured, setFeatured] = useState<Listing[]>([]);

  useEffect(() => {
    supabase
      .from("special_offers")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => setOffers(data ?? []));
    supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setFeatured(data ?? []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full gradient-gold text-ink text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Curator's selection
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">Special Offers</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Hand-picked rarities and limited-time finds from our most trusted collectors.
          </p>
          <div className="gold-divider w-24 mx-auto mt-6" />
        </div>

        {offers.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {offers.map((o) => (
              <div key={o.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover-lift shadow-card">
                {o.image_url && (
                  <div className="aspect-[16/10] bg-parchment overflow-hidden">
                    <img src={o.image_url} alt={o.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold mb-2">{o.title}</h3>
                  {o.description && <p className="text-sm text-muted-foreground">{o.description}</p>}
                  {o.link_url && (
                    <a href={o.link_url} target="_blank" rel="noreferrer" className="inline-block mt-4 text-gold-deep font-medium hover:underline">
                      Learn more →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="font-display text-2xl font-bold mb-6">Featured pieces</h2>
        {featured.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No featured pieces available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
