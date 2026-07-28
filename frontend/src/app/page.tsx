"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const categories = [
  {
    name: "Hair Accessories",
    slug: "hair-accessories",
    image: "/products/frilled-crochet-scrunchie.png",
    note: "Scrunchies & clips",
  },
  {
    name: "Hair Bun & Style",
    slug: "hair-bun-style-accessories",
    image: "/products/rose-hair-bun-red.png",
    note: "Bun covers & gajra",
  },
  {
    name: "Flower Appliqués",
    slug: "flower-appliques-brooches",
    image: "/products/rose-brooch-red.png",
    note: "Pins & brooches",
  },
  {
    name: "Home Decor",
    slug: "home-decor",
    image: "/products/sunflower-pot-decor.png",
    note: "Soft accents for home",
  },
  {
    name: "Garlands & Hangings",
    slug: "garlands-hangings",
    image: "/products/crochet-toran-maroon-gold.png",
    note: "Torans & malas",
  },
  {
    name: "Coasters & Trinkets",
    slug: "coasters-trinkets",
    image: "/products/mini-flower-coasters-set-3.png",
    note: "Everyday little joys",
  },
];

const craftPillars = [
  {
    title: "Premium organic cotton",
    text: "Soft, breathable yarn chosen for skin comfort and lasting stitch definition.",
  },
  {
    title: "One stitch at a time",
    text: "Every piece is crocheted by hand in our family workshop — never mass-produced.",
  },
  {
    title: "Made to be kept",
    text: "From festive torans to everyday scrunchies, pieces meant for real life and lasting memory.",
  },
];

export default function HomePage() {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get("/products?is_featured=true");
        setFeaturedProducts(response.data.slice(0, 4));
      } catch {
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen yarn-grain">
      <Header />

      {/* Hero — one composition: brand, line, sentence, CTAs, full-bleed craft image */}
      <section className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero.png"
            alt="Handcrafted Kalakari crochet piece in soft natural light"
            className="h-full w-full object-cover animate-hero-image"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-ink/75 via-brand-ink/45 to-brand-ink/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/50 via-transparent to-brand-ink/20" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 pt-28 pb-16 md:py-28">
          <div className="max-w-xl text-brand-white space-y-6 md:space-y-8">
            <p className="animate-rise font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.04em] leading-none">
              Kalakari
            </p>

            <h1 className="animate-rise-delay-1 font-serif text-2xl sm:text-3xl md:text-4xl font-medium leading-snug text-brand-white/95">
              Handcrafted crochet, made slowly by our family
            </h1>

            <p className="animate-rise-delay-2 text-sm md:text-base text-brand-white/80 leading-relaxed max-w-md">
              A family-run studio creating pieces with premium organic cotton — one careful stitch at a time.
            </p>

            <div className="animate-rise-delay-3 flex flex-wrap gap-3 pt-1">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-brand-sage text-brand-white px-7 py-3.5 text-sm font-medium tracking-wide hover:bg-brand-sage/90 transition-colors"
              >
                Shop the collection
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/custom-order"
                className="inline-flex items-center gap-2 border border-brand-white/45 text-brand-white px-7 py-3.5 text-sm font-medium tracking-wide hover:bg-brand-white/10 transition-colors"
              >
                Request a custom piece
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="relative py-20 md:py-28 stitch-fade">
        <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-serif text-3xl md:text-5xl text-brand-charcoal tracking-tight">
              What we crochet
            </h2>
            <p className="text-brand-charcoal/70 text-sm md:text-base leading-relaxed">
              From festive hangings to everyday hair pieces — each category is shaped by the same patient handwork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group block space-y-4"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-cream">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-serif text-2xl text-brand-charcoal group-hover:text-brand-sage transition-colors">
                      {cat.name}
                    </h3>
                    <ArrowRight className="w-4 h-4 shrink-0 text-brand-sage opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  <p className="text-xs tracking-wide text-brand-charcoal/55">{cat.note}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 md:py-28 bg-brand-cream/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-3 max-w-xl">
              <h2 className="font-serif text-3xl md:text-5xl text-brand-charcoal tracking-tight">
                Pieces from the studio
              </h2>
              <p className="text-brand-charcoal/70 text-sm md:text-base leading-relaxed">
                A few favorites ready to ship — soft organic cotton, finished with care.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-sage hover:text-brand-charcoal transition-colors self-start"
            >
              View all pieces
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[3/4] bg-brand-cream animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="text-brand-charcoal/60 text-sm">
                New pieces are being finished in the workshop.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-sage hover:text-brand-charcoal transition-colors"
              >
                Browse the shop
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((prod) => {
                const image =
                  prod.images?.[0]?.url || "/products/mini-flower-coasters-set-3.png";
                const isSaved = isWishlisted(prod.id);

                return (
                  <article key={prod.id} className="group space-y-4">
                    <div className="relative aspect-[3/4] overflow-hidden bg-brand-white">
                      <Link href={`/shop/${prod.slug}`} className="block h-full">
                        <img
                          src={image}
                          alt={prod.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(prod)}
                        aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                        className="absolute top-3 right-3 p-2.5 bg-brand-white/90 text-brand-charcoal hover:text-brand-error transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-brand-error text-brand-error" : ""}`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-brand-gold font-medium">
                        {prod.category_name || "Handcrafted"}
                      </p>
                      <Link href={`/shop/${prod.slug}`}>
                        <h3 className="font-serif text-xl text-brand-charcoal leading-snug hover:text-brand-sage transition-colors">
                          {prod.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <span className="text-sm font-medium text-brand-charcoal">
                          ₹{Number(prod.price).toLocaleString("en-IN")}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(prod, null, 1)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-brand-sage hover:text-brand-charcoal transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Family story */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/5] overflow-hidden bg-brand-cream">
                <img
                  src="/products/crochet-gajra-white-maroon.png"
                  alt="Hand-crocheted gajra made with organic cotton"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="hidden md:block absolute -bottom-6 -right-4 lg:-right-8 w-40 lg:w-48 aspect-square overflow-hidden border-[6px] border-brand-white shadow-[0_12px_40px_-20px_rgba(44,36,30,0.35)]">
                <img
                  src="/products/crochet-toran-maroon-gold.png"
                  alt="Maroon and gold crochet toran detail"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6 lg:pl-4">
              <h2 className="font-serif text-3xl md:text-5xl text-brand-charcoal tracking-tight leading-[1.15]">
                Crafted at home,{" "}
                <span className="italic text-brand-sage">passed through our hands</span>
              </h2>
              <p className="text-brand-charcoal/70 text-sm md:text-base leading-relaxed max-w-lg">
                Kalakari began in our family workshop — our mother’s crochet hook, quiet evenings, and pieces made for festivals, gifts, and everyday beauty. We still work that way: small batches, organic cotton, and care you can feel in every stitch.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-sage hover:text-brand-charcoal transition-colors"
              >
                Read our story
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Materials / meaning */}
      <section className="py-20 md:py-24 bg-brand-charcoal text-brand-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
              Why it feels different
            </h2>
            <p className="text-brand-white/65 text-sm md:text-base leading-relaxed">
              Not a factory line — a family studio devoted to soft yarn and honest making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {craftPillars.map((pillar, index) => (
              <div key={pillar.title} className="space-y-3 border-t border-brand-white/15 pt-6">
                <p className="font-serif text-brand-gold text-lg">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="font-serif text-2xl">{pillar.title}</h3>
                <p className="text-sm text-brand-white/65 leading-relaxed">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom order invitation */}
      <section className="py-20 md:py-28 stitch-fade">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center space-y-6">
          <h2 className="font-serif text-3xl md:text-5xl text-brand-charcoal tracking-tight">
            Have a colour, occasion, or sketch in mind?
          </h2>
          <p className="text-brand-charcoal/70 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Share your idea and we’ll crochet a piece just for you — the same organic cotton, the same family hands.
          </p>
          <Link
            href="/custom-order"
            className="inline-flex items-center gap-2 bg-brand-sage text-brand-white px-8 py-3.5 text-sm font-medium tracking-wide hover:bg-brand-sage/90 transition-colors"
          >
            Start a custom request
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
