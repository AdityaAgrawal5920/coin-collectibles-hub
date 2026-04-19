import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-gradient-gold">404</h1>
        <h2 className="mt-4 font-display text-2xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for has been archived or moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink/90 transition-colors"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Numismatica — Rare Coins, Notes & Collectibles Marketplace" },
      {
        name: "description",
        content:
          "Discover, identify, buy and sell rare coins, currency notes, stamps and antique collectibles from trusted collectors worldwide.",
      },
      { name: "author", content: "Numismatica" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Numismatica — Rare Coins, Notes & Collectibles Marketplace" },
      { name: "twitter:title", content: "Numismatica — Rare Coins, Notes & Collectibles Marketplace" },
      { name: "description", content: "A marketplace for buying, selling, and identifying coins and collectibles." },
      { property: "og:description", content: "A marketplace for buying, selling, and identifying coins and collectibles." },
      { name: "twitter:description", content: "A marketplace for buying, selling, and identifying coins and collectibles." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/alzpiQ2K5RgnKS1hHV8789j2PEx1/social-images/social-1776588718594-note.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/alzpiQ2K5RgnKS1hHV8789j2PEx1/social-images/social-1776588718594-note.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}
