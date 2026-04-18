import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabel } from "@/lib/categories";
import type { Database } from "@/integrations/supabase/types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — Numismatica" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: p }, { data: l }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setProfile(p);
    setListings(l ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name,
      bio: profile.bio,
      location: profile.location,
      whatsapp: profile.whatsapp,
      phone: profile.phone,
      email: profile.email,
    }).eq("user_id", user.id);
    setSavingProfile(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      refresh();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your collection and contact details.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr,1.4fr] gap-8">
          {/* Profile */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-card h-fit">
            <h2 className="font-display text-xl font-bold mb-4">Profile & contact</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <Label htmlFor="dn">Display name</Label>
                <Input id="dn" value={profile?.display_name ?? ""} onChange={(e) => setProfile(p => p && { ...p, display_name: e.target.value })} maxLength={80} />
              </div>
              <div>
                <Label htmlFor="loc">Location</Label>
                <Input id="loc" value={profile?.location ?? ""} onChange={(e) => setProfile(p => p && { ...p, location: e.target.value })} maxLength={120} />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={3} value={profile?.bio ?? ""} onChange={(e) => setProfile(p => p && { ...p, bio: e.target.value })} maxLength={500} />
              </div>
              <div className="gold-divider" />
              <p className="text-xs text-muted-foreground">How buyers will contact you</p>
              <div>
                <Label htmlFor="wa">WhatsApp number</Label>
                <Input id="wa" value={profile?.whatsapp ?? ""} onChange={(e) => setProfile(p => p && { ...p, whatsapp: e.target.value })} placeholder="+1 555 123 4567" maxLength={40} />
              </div>
              <div>
                <Label htmlFor="ph">Phone</Label>
                <Input id="ph" value={profile?.phone ?? ""} onChange={(e) => setProfile(p => p && { ...p, phone: e.target.value })} maxLength={40} />
              </div>
              <div>
                <Label htmlFor="em">Public email</Label>
                <Input id="em" type="email" value={profile?.email ?? ""} onChange={(e) => setProfile(p => p && { ...p, email: e.target.value })} maxLength={255} />
              </div>
              <Button type="submit" disabled={savingProfile} className="w-full bg-ink text-cream hover:bg-ink/90">
                {savingProfile ? "Saving..." : "Save profile"}
              </Button>
            </form>
          </section>

          {/* Listings */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">My listings ({listings.length})</h2>
              <Link to="/sell">
                <Button size="sm" className="bg-ink text-cream hover:bg-ink/90">
                  <Plus className="w-4 h-4 mr-1" /> New
                </Button>
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't listed anything yet.</p>
                <Link to="/sell">
                  <Button className="bg-ink text-cream hover:bg-ink/90">Create your first listing</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((l) => (
                  <div key={l.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center shadow-card">
                    <div className="w-20 h-20 rounded-lg bg-parchment overflow-hidden flex-shrink-0">
                      {l.images[0] ? (
                        <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">🪙</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to="/listing/$id" params={{ id: l.id }} className="font-display font-semibold hover:text-gold-deep block truncate">
                        {l.title}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {categoryLabel(l.category)} · {l.status}
                      </div>
                      <div className="text-sm font-semibold text-gold-deep mt-1">
                        {l.price ? `${l.currency} ${Number(l.price).toLocaleString()}` : "Inquire"}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteListing(l.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

void Pencil;
