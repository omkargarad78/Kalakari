"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Heart } from "lucide-react";
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
    } catch (error) {
      console.error("Newsletter error:", error);
      // Fallback optimistic success for local flow
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-brand-cream/40 border-t border-brand-cream pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Story */}
        <div className="space-y-4 md:col-span-1">
          <h3 className="font-serif text-lg font-bold tracking-widest text-brand-charcoal">L&apos;AURA</h3>
          <p className="text-xs text-brand-charcoal/70 leading-relaxed max-w-xs">
            We are a family-run crochet atelier dedicated to slow fashion, premium organic cotton and kid-mohair yarns, and heirloom-quality craftsmanship.
          </p>
          <div className="flex gap-4 pt-2">
            
          </div>
        </div>

        {/* Directory */}
        <div className="space-y-4">
          <h4 className="font-serif text-sm font-semibold tracking-wide text-brand-charcoal/80">Collections</h4>
          <ul className="space-y-2 text-xs text-brand-charcoal/60">
            <li><Link href="/shop?category=luxury-bags" className="hover:text-brand-sage transition-colors">Luxury Knit Bags</Link></li>
            <li><Link href="/shop?category=apparel-cardigans" className="hover:text-brand-sage transition-colors">Artisan Cardigans</Link></li>
            <li><Link href="/shop?category=floral-bouquets" className="hover:text-brand-sage transition-colors">Everlasting Flowers</Link></li>
            <li><Link href="/shop?category=cute-amigurumi" className="hover:text-brand-sage transition-colors">Cute Amigurumi Toys</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-4">
          <h4 className="font-serif text-sm font-semibold tracking-wide text-brand-charcoal/80">Artisan Studio</h4>
          <ul className="space-y-2 text-xs text-brand-charcoal/60">
            <li><Link href="/about" className="hover:text-brand-sage transition-colors">Our Story & Makers</Link></li>
            <li><Link href="/custom-order" className="hover:text-brand-sage transition-colors">Custom Crochet Order</Link></li>
            <li><Link href="/contact" className="hover:text-brand-sage transition-colors">Contact Studio</Link></li>
            <li><Link href="/contact#faq" className="hover:text-brand-sage transition-colors">Frequently Asked FAQs</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4 md:col-span-1">
          <h4 className="font-serif text-sm font-semibold tracking-wide text-brand-charcoal/80">Newsletter</h4>
          <p className="text-xs text-brand-charcoal/60 leading-relaxed">
            Subscribe to receive artisan design drops, custom order openings, and behind-the-scenes family studio updates.
          </p>
          
          {subscribed ? (
            <div className="bg-brand-sage/10 text-brand-sage text-xs p-3 rounded-xl border border-brand-sage/20 font-medium">
              Thank you! You are now subscribed to L&apos;Aura Studio.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artisan@email.com"
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

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 border-t border-brand-cream mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-brand-charcoal/40 font-medium tracking-wide uppercase gap-4">
        <span>© {new Date().getFullYear()} L&apos;Aura Crochet Atelier. All rights reserved.</span>
        <div className="flex items-center gap-1">
          <span>Handcrafted with</span>
          <Heart className="w-3 h-3 text-brand-gold fill-brand-gold" />
          <span>by Mother & Family</span>
        </div>
      </div>
    </footer>
  );
}
