"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Heart, ShoppingCart, Eye, Star, HeartHandshake } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { motion } from "framer-motion";

export default function HomePage() {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get("/products?is_featured=true");
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error("Failed to load featured products:", error);
        // Fallback mockup products
        setFeaturedProducts([
          {
            id: "1",
            name: "Sage Green Crochet Tote Bag",
            slug: "sage-green-crochet-tote",
            price: 2499.0,
            images: [{ url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600" }],
            category_name: "Luxury Bags"
          },
          {
            id: "2",
            name: "Oversized Sunset Mohair Cardigan",
            slug: "oversized-sunset-mohair-cardigan",
            price: 5999.0,
            images: [{ url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600" }],
            category_name: "Apparel & Cardigans"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: "Luxury Bags", slug: "luxury-bags", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400" },
    { name: "Cozy Cardigans", slug: "apparel-cardigans", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=400" },
    { name: "Everlasting Flowers", slug: "floral-bouquets", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=400" },
    { name: "Cute Amigurumi", slug: "cute-amigurumi", image: "https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=400" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Generated lifestyle image background */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero.png')" }}>
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 w-full z-10">
          <div className="max-w-2xl bg-brand-white/85 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-brand-gold/15 shadow-xl space-y-6">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-brand-sage">
              <Sparkles className="w-4 h-4 text-brand-gold fill-brand-gold" />
              100% Handcrafted Slowly
            </div>
            
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-brand-charcoal leading-[1.1]">
              Heirloom Crafts <br />
              <span className="font-serif italic font-normal text-brand-gold">Woven With Love</span>
            </h1>
            
            <p className="text-sm text-brand-charcoal/80 leading-relaxed max-w-md">
              Discover a combination of Apple-inspired clean aesthetics and traditional family craftsmanship. Every piece is hand-stitched with organic premium fibers.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/shop"
                className="bg-brand-sage hover:bg-brand-sage/95 text-brand-white px-8 py-3 rounded-full text-xs uppercase tracking-wider font-semibold hover-lift flex items-center gap-2"
              >
                Shop Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/custom-order"
                className="bg-brand-cream border border-brand-gold/30 hover:border-brand-sage text-brand-charcoal px-8 py-3 rounded-full text-xs uppercase tracking-wider font-semibold hover-lift"
              >
                Bespoke Design
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-8 w-full space-y-12">
        <div className="text-center max-w-lg mx-auto space-y-3">
          <h2 className="font-serif text-3xl font-bold text-brand-charcoal">Explore Our Catalogs</h2>
          <p className="text-xs uppercase tracking-widest text-brand-gold font-bold">Curated luxury handmade categories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-72 rounded-2xl overflow-hidden hover-lift block border border-brand-cream"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-brand-charcoal/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] text-brand-gold uppercase tracking-widest font-bold block mb-1">Catalog 0{idx+1}</span>
                <h3 className="font-serif text-lg font-bold text-brand-white">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 bg-brand-cream/20 border-y border-brand-cream/60">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full space-y-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold text-brand-charcoal">Artisan Favorites</h2>
              <p className="text-xs uppercase tracking-widest text-brand-sage font-bold">Best sellers & limited seasonal drops</p>
            </div>
            <Link href="/shop" className="text-xs uppercase tracking-widest font-bold text-brand-sage hover:text-brand-sage/80 flex items-center gap-1.5 transition-colors self-start">
              Explore Complete Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 bg-brand-cream/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((prod) => {
                const image = prod.images?.[0]?.url || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600";
                const isSaved = isWishlisted(prod.id);

                return (
                  <div key={prod.id} className="group relative bg-brand-white rounded-2xl p-4 border border-brand-cream hover-lift">
                    {/* Image */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-brand-cream mb-4">
                      <img
                        src={image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(prod)}
                        className="absolute top-3 right-3 p-2 bg-brand-white/80 hover:bg-brand-white rounded-full text-brand-charcoal hover:text-brand-error transition-all shadow-sm z-10"
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-brand-error text-brand-error" : ""}`} />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-brand-gold tracking-wider">
                        {prod.category_name || "Premium Design"}
                      </span>
                      <h3 className="font-medium text-sm text-brand-charcoal line-clamp-1">
                        {prod.name}
                      </h3>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-semibold text-sm text-brand-charcoal">
                          INR {prod.price}
                        </span>
                        
                        <div className="flex gap-2">
                          <Link
                            href={`/shop/${prod.slug}`}
                            className="p-1.5 bg-brand-cream hover:bg-brand-sage/10 text-brand-sage rounded-full transition-colors"
                            title="Quick View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => addToCart(prod, null, 1)}
                            className="p-1.5 bg-brand-sage hover:bg-brand-sage/90 text-brand-white rounded-full transition-colors"
                            title="Add to Basket"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Storytelling Banner */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-brand-cream/30 p-8 md:p-16 rounded-3xl border border-brand-gold/15">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-brand-gold bg-brand-white px-3 py-1 rounded-full border border-brand-gold/20">
              <HeartHandshake className="w-3.5 h-3.5 text-brand-gold" />
              The Artisan Story
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-brand-charcoal leading-[1.2]">
              Made By Our Mother, <br />
              <span className="font-serif italic font-normal text-brand-sage">Designed for Luxury</span>
            </h2>
            <p className="text-sm text-brand-charcoal/70 leading-relaxed">
              Every single product available on L&apos;Aura is handcrafted by our mother and family in our home workshop. We reject mass production in favor of quality, durability, and absolute beauty. By purchasing, you support authentic artisan skills.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="/about" className="text-xs uppercase tracking-widest font-bold text-brand-sage hover:text-brand-sage/80 flex items-center gap-1.5 transition-colors">
                Read Our Full Philosophy
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg border border-brand-cream">
            <img
              src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800"
              alt="Artisan workspace detailing"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-brand-cream/10 border-t border-brand-cream/40">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl font-bold text-brand-charcoal">Atelier Feedback</h2>
            <p className="text-xs uppercase tracking-widest text-brand-gold font-bold">Trusted by collectors worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Eleanor Vance", quote: "The Sage Green Tote is absolutely stunning. The stitches are perfectly uniform, and the material feels heavy and premium. Truly boutique quality." },
              { name: "Robert Downey", quote: "Bought the Mohair cardigan for my wife. She was completely blown away by the sunset transitions and the soft Silk texture. Best gift ever!" },
              { name: "Aria Montgomery", quote: "I submitted a custom request with a sketch. L'Aura's mother created it exactly as I wanted it. The quotation and shipping details were seamless." }
            ].map((rev, idx) => (
              <div key={idx} className="bg-brand-white p-8 rounded-2xl border border-brand-cream shadow-sm space-y-4">
                <div className="flex text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-brand-charcoal/80 italic leading-relaxed">
                  &ldquo;{rev.quote}&rdquo;
                </p>
                <div className="font-serif text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60">
                  — {rev.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
