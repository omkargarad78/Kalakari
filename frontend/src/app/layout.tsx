import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Kalakari | Family-Run Crochet Studio",
  description:
    "Kalakari is a family-run crochet studio creating handcrafted pieces with premium organic cotton — hair accessories, garlands, home decor, and custom orders made one stitch at a time.",
  keywords:
    "handmade crochet, organic cotton crochet, family crochet studio, hair accessories, toran, gajra, custom crochet, Kalakari",
  authors: [{ name: "Kalakari Family Studio" }],
  openGraph: {
    title: "Kalakari | Family-Run Crochet Studio",
    description:
      "Handcrafted crochet with premium organic cotton — made slowly by our family.",
    url: "https://kalakari.in",
    siteName: "Kalakari",
    locale: "en_IN",
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

