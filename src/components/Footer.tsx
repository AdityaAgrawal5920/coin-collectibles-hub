import { Link } from "@tanstack/react-router";
import { Coins } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-ink text-cream">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                <Coins className="w-4 h-4 text-ink" />
              </div>
              <span className="font-display text-lg font-bold">Numismatica</span>
            </div>
            <p className="text-sm text-cream/70 leading-relaxed">
              The premier marketplace for coins, currency, stamps, and rare collectibles.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3 text-gold">Marketplace</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><Link to="/browse">Browse all</Link></li>
              <li><Link to="/offers">Special Offers</Link></li>
              <li><Link to="/sell">Sell with us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3 text-gold">Services</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><Link to="/identify">Identification</Link></li>
              <li><Link to="/dashboard">My collection</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3 text-gold">Account</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><Link to="/login">Sign in</Link></li>
              <li><Link to="/signup">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div className="gold-divider my-8 opacity-40" />
        <p className="text-center text-xs text-cream/50">
          © {new Date().getFullYear()} Numismatica. Curated with passion for collectors worldwide.
        </p>
      </div>
    </footer>
  );
}
