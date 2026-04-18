import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Category } from "@/lib/categories";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/sell")({
  head: () => ({
    meta: [
      { title: "List an Item — Numismatica" },
      { name: "description", content: "List your coin, note or collectible for sale to verified collectors." },
    ],
  }),
  component: Sell,
});

function Sell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "coins" as Category,
    year: "",
    country: "",
    condition: "",
    price: "",
    currency: "USD",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of files.slice(0, 8)) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("listing-images").upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: form.title,
        description: form.description || null,
        category: form.category,
        year: form.year ? parseInt(form.year) : null,
        country: form.country || null,
        condition: form.condition || null,
        price: form.price ? parseFloat(form.price) : null,
        currency: form.currency,
        images: imageUrls,
      });
      if (error) throw error;
      toast.success("Listing created!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-full gradient-gold items-center justify-center mb-4 shadow-gold">
              <Plus className="w-5 h-5 text-ink" />
            </div>
            <h1 className="font-display text-4xl font-bold">List your piece</h1>
            <p className="text-muted-foreground mt-2">Share your collection with passionate buyers worldwide.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-5">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={form.title} maxLength={200} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div>
              <Label htmlFor="cat">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="1925" />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} maxLength={80} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="India" />
              </div>
              <div>
                <Label htmlFor="cond">Condition</Label>
                <Input id="cond" value={form.condition} maxLength={40} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="UNC, VF..." />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Leave blank for 'Inquire'" />
              </div>
              <div>
                <Label htmlFor="cur">Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["USD","EUR","GBP","INR","AED","CAD","AUD"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" rows={4} value={form.description} maxLength={4000} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="History, provenance, distinguishing features..." />
            </div>

            <div>
              <Label>Photos (up to 8)</Label>
              <label className="mt-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition">
                <Upload className="w-4 h-4" />
                <span className="text-sm">{files.length > 0 ? `${files.length} selected` : "Upload images"}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 8))} />
              </label>
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-ink text-cream hover:bg-ink/90" size="lg">
              {submitting ? "Publishing..." : "Publish listing"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Tip: Add your WhatsApp number in your profile so buyers can reach you instantly.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
