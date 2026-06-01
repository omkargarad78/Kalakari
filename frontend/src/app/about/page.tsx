"use client";

import React from "react";
import { Sparkles, HeartHandshake, Compass, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 md:px-8 w-full pt-32 pb-20 flex-1 space-y-16">
        
        {/* Banner Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-brand-gold">
            <Sparkles className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
            Family Atelier Philosophy
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-brand-charcoal leading-[1.2]">
            Our Story & Crafting Process
          </h1>
          <p className="text-sm text-brand-charcoal/70 leading-relaxed">
            Discover a slower approach to design. Learn how our family-run studio turns premium cotton and kid-mohair threads into luxury, lifetime crochet wear.
          </p>
        </div>

        {/* Narrative & Photo grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-charcoal">
              Slow Stitching, <br />
              <span className="font-serif italic font-normal text-brand-sage">Authentic Craftsmanship</span>
            </h2>
            <p className="text-xs text-brand-charcoal/70 leading-relaxed">
              L&apos;Aura was born in 2024 as a way to share our mother&apos;s lifetime passion for crochet with the world. What started as warm winter blankets for family turned into a dedicated boutique for premium hand-knitted apparel and structured tote bags.
            </p>
            <p className="text-xs text-brand-charcoal/70 leading-relaxed">
              In an era dominated by fast fashion and synthetic plastics, we choose natural milk cotton and premium wool blends. We don&apos;t run machines. Every loop is made by hand with precise tension nodes, ensuring your pieces last a lifetime.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="/shop" className="bg-brand-sage text-brand-white px-6 py-2.5 rounded-full text-xs font-semibold hover-lift">
                Explore Studio Catalogue
              </Link>
            </div>
          </div>

          <div className="h-[400px] rounded-3xl overflow-hidden shadow-lg border border-brand-cream relative">
            <img
              src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800"
              alt="Artisan mother hand-stitching in home studio"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Core Values grid */}
        <section className="border-t border-brand-cream pt-16 space-y-8">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">Our Core Pillars</h2>
            <p className="text-[10px] text-brand-gold uppercase tracking-widest font-bold">How we run our family business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            <div className="bg-brand-cream/20 p-6 rounded-2xl border border-brand-cream space-y-3">
              <CheckCircle className="w-5 h-5 text-brand-sage" />
              <h3 className="font-serif text-base font-bold text-brand-charcoal">Natural Sourcing</h3>
              <p className="text-brand-charcoal/65 leading-relaxed">
                We select only premium long-staple organic cotton threads and silk-mohair wools. Absolutely zero scratchy polyester.
              </p>
            </div>

            <div className="bg-brand-cream/20 p-6 rounded-2xl border border-brand-cream space-y-3">
              <Compass className="w-5 h-5 text-brand-sage" />
              <h3 className="font-serif text-base font-bold text-brand-charcoal">Zero Waste Studio</h3>
              <p className="text-brand-charcoal/65 leading-relaxed">
                Crochet is a zero-waste art form. Since we hook loops directly from balls, we cut zero fabric scraps. Leftovers are turned into cute amigurumi.
              </p>
            </div>

            <div className="bg-brand-cream/20 p-6 rounded-2xl border border-brand-cream space-y-3">
              <HeartHandshake className="w-5 h-5 text-brand-sage" />
              <h3 className="font-serif text-base font-bold text-brand-charcoal">Family Value</h3>
              <p className="text-brand-charcoal/65 leading-relaxed">
                We run a pure peer-to-peer shop. Direct communication with customers ensures your custom projects fit your specifications.
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
