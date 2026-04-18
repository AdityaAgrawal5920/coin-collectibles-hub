import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Search, ShieldCheck, MessageCircle, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import hero from "@/assets/hero-collection.jpg";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Numismatica — Rare Coins, Notes & Collectibles Marketplace" },
      {
        name: "description",
        content:
          "A curated marketplace for collectors. Buy, sell, and identify rare coins, currency notes, stamps and antiques.",
      },
      { property: "og:title", content: "Numismatica — Collectibles Marketplace" },
      { property: "og:description", content: "Curated coins, notes, stamps & antiques from collectors worldwide." },
    ],
  }),
  component: Index,
});

function Index() {
  const [featured, setFeatured] = useState<Listing[]>([]);

  useEffect(() => {
    supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => setFeatured(data ?? []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-parchment border border-border text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Trusted by collectors worldwide
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              Where rare <span className="text-gradient-gold">treasures</span> find their keeper.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Discover authentic coins, currency notes, stamps and antiques from
              private collections. Identify your finds. Sell to passionate collectors.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/browse">
                <Button size="lg" className="bg-ink text-cream hover:bg-ink/90 shadow-luxe">
                  Browse Collection <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/identify">
                <Button size="lg" variant="outline" className="border-gold/40 hover:bg-gold/10">
                  Identify an item
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 gradient-gold opacity-20 blur-3xl rounded-full" />
            <img
              src={hero}
              alt="Curated collection of antique gold coins, vintage currency notes and stamps on velvet"
              width={1600}
              height={1024}
              className="relative rounded-2xl shadow-luxe w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Browse by category</h2>
          <div className="gold-divider w-24 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              to="/browse"
              search={{ category: c.value, q: "" }}
              className="group bg-card hover-lift border border-border rounded-xl p-6 text-center"
            >
              <div className="text-4xl mb-2">{c.icon}</div>
              <div className="font-display font-semibold">{c.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Featured pieces</h2>
            <p className="text-muted-foreground mt-2">Hand-picked rarities from our collection</p>
          </div>
          <Link to="/browse" className="text-sm font-medium text-gold-deep hover:underline hidden sm:block">
            View all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">
              No items listed yet. Be the first to{" "}
              <Link to="/sell" className="text-gold-deep font-medium hover:underline">
                share your collection
              </Link>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>

      {/* Services */}
      <section className="bg-ink text-cream py-16 md:py-20 mt-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: "Curated Search", desc: "Filter by category, era, country and condition to find exactly what you collect." },
            { icon: ShieldCheck, title: "Trusted Sellers", desc: "Every collector has a profile with verified contact details." },
            { icon: MessageCircle, title: "Direct Contact", desc: "Reach sellers instantly via WhatsApp, phone or email." },
          ].map((s) => (
            <div key={s.title} className="text-center md:text-left">
              <div className="inline-flex w-12 h-12 rounded-full gradient-gold items-center justify-center mb-4 shadow-gold">
                <s.icon className="w-5 h-5 text-ink" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-gold">{s.title}</h3>
              <p className="text-cream/75 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
