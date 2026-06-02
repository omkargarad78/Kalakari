"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, ShoppingBag, Truck, HeartHandshake, RefreshCw, Star, Plus, Minus, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";

export default function ProductDetailClient() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Interactive Zoom Lens States
  const [showZoom, setShowZoom] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 0, y: 0, bgX: "0%", bgY: "0%" });
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        if (res.data.variants && res.data.variants.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
        
        // Fetch related products
        const relRes = await api.get(`/products?category=${res.data.category_slug || ""}`);
        setRelatedProducts(relRes.data.filter((p: any) => p.slug !== slug).slice(0, 4));
      } catch (error) {
        console.error("Failed to load product details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  // Handle zoom mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Percentage coords
    const px = (x / width) * 100;
    const py = (y / height) * 100;
    
    setZoomCoords({
      x,
      y,
      bgX: `${px}%`,
      bgY: `${py}%`
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-white">
        <Header />
        <div className="flex-1 flex items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-brand-sage border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-40 space-y-4">
          <h2 className="font-serif text-2xl text-brand-charcoal">Handmade item not found</h2>
          <Link href="/shop" className="text-xs uppercase tracking-wider bg-brand-sage text-brand-white px-6 py-2.5 rounded-full font-semibold">
            Back to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isSaved = isWishlisted(product.id);
  const currentPrice = selectedVariant?.price_override != null ? Number(selectedVariant.price_override) : Number(product.price);
  const mainImage = product.images?.[0]?.url || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-32 pb-20 flex-1 space-y-16">
        
        {/* Breadcrumbs & Back */}
        <div className="flex items-center justify-between border-b border-brand-cream pb-4">
          <button onClick={() => router.back()} className="text-xs uppercase tracking-wider font-semibold text-brand-charcoal/60 hover:text-brand-charcoal flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to catalogue
          </button>
          <div className="text-[10px] text-brand-charcoal/40 uppercase tracking-widest font-semibold">
            Shop / {product.category_name || "Artisan Craft"} / {product.name}
          </div>
        </div>

        {/* Product Workspace Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Zoom Image Gallery */}
          <div className="space-y-4">
            <div
              className="relative aspect-square bg-[#f8f5f0] rounded-2xl overflow-hidden border border-brand-cream/80 cursor-zoom-in"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                ref={imageRef}
                src={mainImage}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              
              {/* Magnifier glass lens overlay */}
              {showZoom && (
                <div
                  className="hidden md:block absolute pointer-events-none w-48 h-48 rounded-full border-2 border-brand-gold bg-brand-white shadow-lg overflow-hidden"
                  style={{
                    left: zoomCoords.x - 96,
                    top: zoomCoords.y - 96,
                    backgroundImage: `url(${mainImage})`,
                    backgroundPosition: `${zoomCoords.bgX} ${zoomCoords.bgY}`,
                    backgroundSize: "300% 300%",
                    backgroundRepeat: "no-repeat"
                  }}
                />
              )}
            </div>
            <p className="text-[10px] text-brand-charcoal/40 text-center italic">
              Hover over image to inspect detailed crochet stitches & fabric loops.
            </p>
          </div>

          {/* Product Meta details */}
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest bg-brand-cream px-3 py-1 rounded-full border border-brand-gold/15 w-fit block">
                {product.category_name || "Premium Crochet"}
              </span>
              
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-charcoal tracking-tight leading-[1.2]">
                {product.name}
              </h1>

              <div className="flex items-center gap-1.5 text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <span className="text-xs text-brand-charcoal/60 font-semibold ml-2">
                  5.0 (12 artisan reviews)
                </span>
              </div>

              <p className="text-2xl font-bold text-brand-charcoal tracking-tight">
                INR {currentPrice}
              </p>

              <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                {product.description}
              </p>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-brand-charcoal/50 block">Select Variant Option</span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`text-xs px-4 py-2 rounded-full border transition-all ${
                          selectedVariant?.id === v.id
                            ? "bg-brand-sage border-brand-sage text-brand-white font-semibold"
                            : "bg-brand-cream/35 border-brand-gold/15 text-brand-charcoal hover:border-brand-sage/40"
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Configurations */}
            <div className="space-y-4 pt-4 border-t border-brand-cream">
              <div className="flex items-center gap-6">
                {/* Quantity adjustments */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-brand-charcoal/50 block">Qty</span>
                  <div className="flex items-center border border-brand-gold/30 rounded-full overflow-hidden bg-brand-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-brand-cream text-brand-charcoal/60 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-xs font-semibold text-brand-charcoal w-10 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-brand-cream text-brand-charcoal/60 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-brand-charcoal/50 block">Stitching Inventory</span>
                  <p className="text-xs font-semibold text-brand-sage">
                    {selectedVariant ? `${selectedVariant.stock} items ready in stock` : `${product.stock} items ready in stock`}
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => addToCart(product, selectedVariant, quantity)}
                  className="flex-1 bg-brand-sage hover:bg-brand-sage/95 text-brand-white py-4 rounded-full text-xs uppercase tracking-wider font-bold hover-lift text-center"
                >
                  Add to Basket
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`px-6 border rounded-full transition-colors flex items-center justify-center ${
                    isSaved
                      ? "border-brand-error/35 bg-brand-error/5 text-brand-error hover:bg-brand-error/10"
                      : "border-brand-gold/30 text-brand-charcoal/60 hover:text-brand-charcoal hover:border-brand-sage"
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? "fill-brand-error" : ""}`} />
                </button>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-brand-cream pt-4 text-[10px] text-brand-charcoal/60 uppercase tracking-widest font-semibold">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-sage" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-brand-sage" />
                <span>100% Cotton</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-brand-sage" />
                <span>Slow Fashion</span>
              </div>
            </div>

          </div>
        </div>

        {/* Specifications tabs */}
        <div className="border-t border-brand-cream pt-12 space-y-6">
          <div className="flex border-b border-brand-cream gap-8">
            {[
              { id: "details", label: "Spec Details" },
              { id: "materials", label: "Yarn & Materials" },
              { id: "handmade", label: "Handmade Efforts" },
              { id: "shipping", label: "Delivery & Returns" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs uppercase tracking-widest font-bold transition-all relative ${
                  activeTab === tab.id ? "text-brand-charcoal" : "text-brand-charcoal/40 hover:text-brand-charcoal"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-sage rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="text-xs text-brand-charcoal/80 leading-relaxed max-w-3xl space-y-4">
            {activeTab === "details" && <p>{product.description}</p>}
            {activeTab === "materials" && (
              <p>{product.materials || "Crafted using 100% natural milk cotton yarns, which are hypoallergenic, extremely soft on the skin, and hold structure beautifully."}</p>
            )}
            {activeTab === "handmade" && (
              <p>{product.handmade_details || "Meticulously double-stitched over 12-18 hours. Uses custom single-loop tension nodes to prevent sagging and ensure a lifetime of beautiful texture."}</p>
            )}
            {activeTab === "shipping" && (
              <p>{product.shipping_info || "We pack our crochet wear in breathable linen dustbags inside recycled craft boxes. Ships via tracked standard delivery (2-4 business days). Express shipping available."}</p>
            )}
          </div>
        </div>

        {/* Studio FAQ section */}
        <section className="border-t border-brand-cream pt-16 space-y-8">
          <h2 className="font-serif text-2xl font-bold text-brand-charcoal">Atelier Care Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div className="space-y-2">
              <h3 className="font-semibold text-brand-charcoal">How do I wash my crochet cardigan?</h3>
              <p className="text-brand-charcoal/70 leading-relaxed">
                We highly recommend hand-washing in cool water using a mild organic wool detergent. Lay flat on a clean dry towel to dry. Never wring, spin, or tumble dry.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-brand-charcoal">Do the bags stretch out over time?</h3>
              <p className="text-brand-charcoal/70 leading-relaxed">
                Our bags use a dense double-strand stitch and reinforced handles to minimize stretching. For heavy daily use, placing items in a small organizer pouch keeps the form pristine.
              </p>
            </div>
          </div>
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-brand-cream pt-16 space-y-8">
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">Artisan Pairings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => {
                const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400";
                return (
                  <div key={p.id} className="group relative bg-brand-white rounded-2xl p-4 border border-brand-cream hover-lift">
                    <div className="aspect-square bg-brand-cream rounded-xl overflow-hidden mb-3">
                      <img src={img} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-brand-gold uppercase tracking-wider font-bold">{p.category_name || "Crochet Drop"}</span>
                    <h3 className="font-medium text-xs text-brand-charcoal truncate mt-0.5">
                      <Link href={`/shop/${p.slug}`} className="hover:text-brand-sage">{p.name}</Link>
                    </h3>
                    <p className="text-xs font-semibold text-brand-charcoal mt-1">INR {p.price}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}
