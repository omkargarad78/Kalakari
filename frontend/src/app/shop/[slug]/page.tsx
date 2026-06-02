// Server component wrapper — required for `output: "export"` with dynamic routes.
export async function generateStaticParams() {
  const slugs = [
    "small-hair-elastics-set-3",
    "frilled-scrunchie-maroon",
    "frilled-scrunchie-orange",
    "rose-hair-bun-red",
    "rose-hair-bun-pink-white",
    "crochet-gajra-white",
    "rose-applique-white",
    "sunflower-pin-decor",
    "rose-brooch-red",
    "ruffled-doily-white-maroon",
    "round-crochet-mat-brown-border",
    "ruffled-doily-white-orange",
    "crochet-bead-garland-brown",
    "crochet-toran-maroon-gold",
    "crochet-flower-garland",
    "mini-flower-coasters-set-4",
    "mini-flower-coasters-mixed",
    "mini-flower-coasters-set-3",
    "mini-rose-coasters-set-2",
  ];
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

import ProductDetailClient from "./_ProductDetailClient";

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
