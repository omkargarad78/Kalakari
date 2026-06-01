import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "L'Aura Crochet | Premium Handmade Luxury Craft",
  description: "Discover L'Aura, a family-run boutique offering premium, authentic, and hand-stitched crochet wear, luxury bags, floral bouquets, and bespoke amigurumi.",
  keywords: "crochet bags, luxury crochet, handmade sweater, artisan crafts, custom crochet order, premium amigurumi",
  authors: [{ name: "Artisan Family" }],
  openGraph: {
    title: "L'Aura Crochet | Premium Handmade Luxury Craft",
    description: "Discover L'Aura, offering premium, authentic, and hand-stitched crochet wear and bespoke designs.",
    url: "https://lauracrochet.com",
    siteName: "L'Aura Crochet",
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

