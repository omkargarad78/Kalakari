import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Kalakari | Handcrafted Crochet & Artisan Crafts",
  description: "Kalakari is a family-run crochet studio offering premium handmade bags, cardigans, floral bouquets, and bespoke amigurumi — crafted with love.",
  keywords: "crochet bags, handmade crochet, artisan crafts, custom crochet order, amigurumi, Kalakari",
  authors: [{ name: "Artisan Family" }],
  openGraph: {
    title: "Kalakari | Handcrafted Crochet & Artisan Crafts",
    description: "Kalakari — premium handmade crochet wear, bags, and bespoke designs crafted by our family studio.",
    url: "https://kalakari.in",
    siteName: "Kalakari",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-brand-white text-brand-charcoal min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

