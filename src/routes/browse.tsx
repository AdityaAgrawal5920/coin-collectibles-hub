import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type Category } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

const searchSchema = z.object({
  category: fallback(z.enum(["coins","notes","stamps","antiques","medals","artifacts","books","other"]).optional(), undefined),
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/browse")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Browse Collection — Numismatica" },
      { name: "description", content: "Browse rare coins, currency notes, stamps and collectibles. Filter by category, search by name." },
      { property: "og:title", content: "Browse Collection — Numismatica" },
      { property: "og:description", content: "Discover hand-picked rarities from collectors worldwide." },
    ],
  }),
  component: Browse,
});

function Browse() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (category) query = query.eq("category", category);
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,country.ilike.%${q}%`);
    query.then(({ data }) => {
      setItems(data ?? []);
      setLoading(false);
    });
  }, [category, q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: (prev) => ({ ...prev, q: search }) });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Browse the collection</h1>
          <div className="gold-divider w-24 mx-auto mt-4" />
        </div>

        <form onSubmit={submit} className="max-w-2xl mx-auto mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, country, year..."
              className="pl-10"
            />
          </div>
          <Button type="submit" className="bg-ink text-cream hover:bg-ink/90">Search</Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 justify-center mb-10">
          <Link
            to="/browse"
            search={{ q: q ?? "", category: undefined }}
            className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
              !category ? "bg-ink text-cream border-ink" : "border-border hover:border-gold"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              to="/browse"
              search={{ q: q ?? "", category: c.value }}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                category === c.value ? "bg-ink text-cream border-ink" : "border-border hover:border-gold"
              }`}
            >
              {c.icon} {c.label}
            </Link>
          ))}
        </div>

        {(category || q) && (
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setSearch("");
                navigate({ search: { q: "", category: undefined } });
              }}
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-parchment animate-pulse rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-16 text-center">
            <p className="font-display text-xl mb-2">No items match your search</p>
            <p className="text-sm text-muted-foreground">Try a different category or clear your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Suppress unused warning
void Category;
