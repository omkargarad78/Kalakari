"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlistProducts, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-32 pb-20 flex-1 space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-brand-cream pb-4">
          <Link href="/dashboard" className="text-xs uppercase tracking-wider font-semibold text-brand-charcoal/60 hover:text-brand-charcoal flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="text-[10px] text-brand-charcoal/40 uppercase tracking-widest font-semibold">
            Account / Wishlist
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-brand-charcoal flex items-center gap-2">
            <Heart className="w-6 h-6 text-brand-error fill-brand-error" />
            Your Collected Designs
          </h1>
          <p className="text-xs text-brand-charcoal/60">
            A list of slow-fashion artisan products you are currently dreaming about.
          </p>
        </div>

        {/* Wishlist Grid */}
        {wishlistProducts.length === 0 ? (
          <div className="bg-brand-cream/15 p-12 rounded-3xl border border-brand-cream text-center space-y-4 max-w-md mx-auto">
            <Heart className="w-12 h-12 text-brand-charcoal/20 mx-auto" />
            <h3 className="font-serif text-lg text-brand-charcoal/80">Your collection is empty</h3>
            <p className="text-xs text-brand-charcoal/65">
              Explore our boutique and add items here to save them for later.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-brand-sage text-brand-white px-6 py-2 rounded-full text-xs font-semibold hover-lift"
            >
              Browse Shop Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistProducts.map((p) => {
              const image = p.images?.[0]?.url || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400";

              return (
                <div key={p.id} className="group relative bg-brand-white rounded-2xl p-4 border border-brand-cream hover-lift">
                  
                  {/* Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-brand-cream mb-4">
                    <img src={image} alt={p.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest block">
                      {p.category_name || "Premium Design"}
                    </span>
                    <h3 className="font-medium text-xs text-brand-charcoal truncate mt-0.5">
                      <Link href={`/shop/${p.slug}`} className="hover:text-brand-sage">{p.name}</Link>
                    </h3>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold text-xs text-brand-charcoal">INR {p.price}</span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleWishlist(p)}
                          className="p-1.5 bg-brand-cream hover:bg-brand-error/15 text-brand-charcoal/60 hover:text-brand-error rounded-full transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => addToCart(p, null, 1)}
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

      </main>

      <Footer />
    </div>
  );
}
