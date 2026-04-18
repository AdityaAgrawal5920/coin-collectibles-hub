import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Upload } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/identify")({
  head: () => ({
    meta: [
      { title: "Identify Your Coin or Collectible — Numismatica" },
      { name: "description", content: "Submit photos and details of your coin, note or collectible for expert identification and valuation." },
      { property: "og:title", content: "Identify Your Coin — Numismatica" },
      { property: "og:description", content: "Get expert help identifying your collectibles." },
    ],
  }),
  component: Identify,
});

function Identify() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    contact_name: "",
    contact_email: user?.email ?? "",
    contact_whatsapp: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please add a title");
      return;
    }
    if (!user && (!form.contact_name || (!form.contact_email && !form.contact_whatsapp))) {
      toast.error("Please provide your name and email or WhatsApp");
      return;
    }
    setSubmitting(true);

    try {
      const imageUrls: string[] = [];
      const folder = user?.id ?? "anon";
      for (const file of files.slice(0, 8)) {
        const path = `${folder}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("listing-images").upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }

      const { error } = await supabase.from("identification_requests").insert({
        title: form.title,
        description: form.description || null,
        images: imageUrls,
        contact_name: form.contact_name || null,
        contact_email: form.contact_email || null,
        contact_whatsapp: form.contact_whatsapp || null,
        user_id: user?.id ?? null,
      });
      if (error) throw error;

      toast.success("Request submitted! We'll get back to you soon.");
      setForm({ title: "", description: "", contact_name: "", contact_email: user?.email ?? "", contact_whatsapp: "" });
      setFiles([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex w-12 h-12 rounded-full gradient-gold items-center justify-center mb-4 shadow-gold">
              <Search className="w-5 h-5 text-ink" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Identify your piece</h1>
            <p className="text-muted-foreground mt-3">
              Send us photos and details of your coin, note, or collectible. Our experts will help identify and value it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-5">
            <div>
              <Label htmlFor="title">What is it? *</Label>
              <Input
                id="title"
                value={form.title}
                maxLength={200}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Old silver coin found in attic"
                required
              />
            </div>
            <div>
              <Label htmlFor="desc">Details</Label>
              <Textarea
                id="desc"
                value={form.description}
                maxLength={4000}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Inscriptions, size, weight, where you found it..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="files">Photos (up to 8)</Label>
              <label className="mt-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition">
                <Upload className="w-4 h-4" />
                <span className="text-sm">{files.length > 0 ? `${files.length} file(s) selected` : "Click to upload images"}</span>
                <input
                  id="files"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 8))}
                />
              </label>
            </div>

            {!user && (
              <>
                <div className="gold-divider" />
                <p className="text-sm text-muted-foreground">How can we reach you?</p>
                <div>
                  <Label htmlFor="cname">Your name *</Label>
                  <Input id="cname" value={form.contact_name} maxLength={120} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cemail">Email</Label>
                    <Input id="cemail" type="email" value={form.contact_email} maxLength={255} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="cwa">WhatsApp</Label>
                    <Input id="cwa" value={form.contact_whatsapp} maxLength={40} onChange={(e) => setForm({ ...form, contact_whatsapp: e.target.value })} placeholder="+1 555 123 4567" />
                  </div>
                </div>
              </>
            )}

            <Button type="submit" disabled={submitting} className="w-full bg-ink text-cream hover:bg-ink/90" size="lg">
              {submitting ? "Submitting..." : "Submit for identification"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
