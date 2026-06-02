"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import api from "@/lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/newsletter", { email });
      setSubscribed(true);
      setEmail("");
    } catch {
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-brand-cream/40 border-t border-brand-cream pt-14 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold tracking-widest text-brand-charcoal">Kalakari</h3>
          <p className="text-xs text-brand-charcoal/65 leading-relaxed max-w-xs">
            A family-run crochet studio creating handcrafted pieces with premium organic cotton and kid-mohair yarns — made with love, one stitch at a time.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-brand-charcoal/80">Shop</h4>
            <ul className="space-y-2 text-xs text-brand-charcoal/60">
              <li><Link href="/shop" className="hover:text-brand-sage transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=hair-accessories" className="hover:text-brand-sage transition-colors">Hair Accessories</Link></li>
              <li><Link href="/shop?category=home-decor" className="hover:text-brand-sage transition-colors">Home Decor</Link></li>
              <li><Link href="/shop?category=coasters-trinkets" className="hover:text-brand-sage transition-colors">Coasters & Trinkets</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-brand-charcoal/80">Studio</h4>
            <ul className="space-y-2 text-xs text-brand-charcoal/60">
              <li><Link href="/about" className="hover:text-brand-sage transition-colors">Our Story</Link></li>
              <li><Link href="/custom-order" className="hover:text-brand-sage transition-colors">Custom Orders</Link></li>
              <li><Link href="/contact" className="hover:text-brand-sage transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-semibold text-brand-charcoal/80">Stay in Touch</h4>
          <p className="text-xs text-brand-charcoal/60 leading-relaxed">
            Get new drops, custom order openings, and studio updates in your inbox.
          </p>
          {subscribed ? (
            <div className="bg-brand-sage/10 text-brand-sage text-xs p-3 rounded-xl border border-brand-sage/20 font-medium">
              You&apos;re subscribed! Thank you for joining Kalakari.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 border border-brand-gold/30 rounded-full text-xs focus:outline-none focus:border-brand-sage bg-brand-white text-brand-charcoal"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-sage hover:bg-brand-sage/95 text-brand-white p-2 rounded-full transition-colors flex items-center justify-center w-8 h-8 self-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 border-t border-brand-cream mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-brand-charcoal/40 font-medium tracking-wide uppercase gap-3">
        <span>© {new Date().getFullYear()} Kalakari. All rights reserved.</span>
        <div className="flex items-center gap-1">
          <span>Handcrafted with</span>
          <Heart className="w-3 h-3 text-brand-gold fill-brand-gold" />
          <span>by our family</span>
        </div>
      </div>
    </footer>
  );
}
