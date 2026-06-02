"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Heart, Eye, ShoppingCart, X, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";

export default function ShopPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // States for search and filter inputs
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("default");
  
  // Quick View Modal States
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [qvQuantity, setQvQuantity] = useState(1);

  // Load products based on filter states
  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (searchInput.trim()) params.set("search", searchInput.trim());
      if (selectedCategory) params.set("category", selectedCategory);
      if (sortBy && sortBy !== "default") params.set("sort_by", sortBy);
      const q = params.toString() ? `/products/?${params.toString()}` : "/products/";
      const res = await api.get(q);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to load products:", error);
      setApiError(
        "Could not load products from the API. Start the backend: cd backend && uvicorn app.main:app --reload --port 8000"
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load Categories on startup
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/products/categories");
        setCategories(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCats();
  }, []);

  // Initialize filters from URL query in client runtime
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setSelectedCategory(params.get("category") || "");
    setSortBy(params.get("sort_by") || "default");
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCategorySelect = (slug: string) => {
    const nextCat = selectedCategory === slug ? "" : slug;
    setSelectedCategory(nextCat);
    
    // Update URL query parameters
    const params = new URLSearchParams(window.location.search);
    if (nextCat) {
      params.set("category", nextCat);
    } else {
      params.delete("category");
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    const params = new URLSearchParams(window.location.search);
    if (val !== "default") {
      params.set("sort_by", val);
    } else {
      params.delete("sort_by");
    }
    router.push(`/shop?${params.toString()}`);
  };

  const groupedByCategory = categories
    .map((cat) => ({
      category: cat,
      items: products.filter((p) => p.category_id === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  const shouldShowGroupedView = !selectedCategory && !searchInput.trim();

  const renderProductCards = (items: any[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
      {items.map((prod) => {
        const image = prod.images?.[0]?.url || "/catalogue-source.png";
        const isSaved = isWishlisted(prod.id);

        return (
          <div key={prod.id} className="group relative bg-brand-white rounded-2xl p-4 border border-brand-cream hover-lift">
            {/* Image Wrapper */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#f8f5f0] mb-4">
              <img
                src={image}
                alt={prod.name}
                width={600}
                height={600}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
              />
              
              {/* Actions */}
              <button
                onClick={() => toggleWishlist(prod)}
                className="absolute top-3 right-3 p-2 bg-brand-white/80 hover:bg-brand-white rounded-full text-brand-charcoal hover:text-brand-error transition-all shadow-sm z-10"
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-brand-error text-brand-error" : ""}`} />
              </button>
            </div>

            {/* Meta */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-brand-gold tracking-wider">
                {prod.category_name || "Artisan Craft"}
              </span>
              <h3 className="font-medium text-sm text-brand-charcoal line-clamp-1">
                <Link href={`/shop/${prod.slug}`} className="hover:text-brand-sage">
                  {prod.name}
                </Link>
              </h3>
              
              <p className="text-[11px] text-brand-charcoal/65 line-clamp-2 min-h-[32px]">
                {prod.description || "Handmade crochet creation by Kalakari."}
              </p>

              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-sm text-brand-charcoal">
                  INR {prod.price}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setQuickViewProduct(prod);
                      setSelectedVariant(prod.variants?.[0] || null);
                      setQvQuantity(1);
                    }}
                    className="p-1.5 bg-brand-cream hover:bg-brand-sage/10 text-brand-sage rounded-full transition-colors"
                    title="Quick View"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
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
  );

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-32 pb-20 flex-1 flex flex-col md:flex-row gap-10">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div className="flex items-center justify-between border-b border-brand-cream pb-4">
            <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-sage" />
              Catalogue Filter
            </h2>
            {(selectedCategory || searchInput) && (
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchInput("");
                  setSortBy("default");
                  router.push("/shop");
                  setTimeout(loadData, 50);
                }}
                className="text-[10px] text-brand-gold uppercase tracking-wider font-semibold hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-brand-charcoal/70">Search Store</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search crochet designs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-brand-cream/30 border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
              />
              <button type="submit" className="absolute right-3 top-2.5 hover:text-brand-sage transition-colors">
                <Search className="w-4 h-4 text-brand-charcoal/40" />
              </button>
            </div>
          </form>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-brand-charcoal/70">Studio Categories</h3>
            <div className="flex flex-wrap md:flex-col gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`text-left text-xs px-4 py-2 rounded-full md:rounded-xl border transition-all ${
                      isSelected
                        ? "bg-brand-sage border-brand-sage text-brand-white font-medium"
                        : "bg-brand-cream/30 border-brand-gold/20 text-brand-charcoal hover:border-brand-sage/40"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <div className="flex-1 space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-cream pb-4 gap-4 text-xs">
            <p className="text-brand-charcoal/60">
              Showing {products.length} exquisite handmade designs
            </p>
            
            <div className="flex items-center gap-2 self-end">
              <span className="text-brand-charcoal/60">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-brand-white border border-brand-gold/30 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-sage text-xs text-brand-charcoal"
              >
                <option value="default">Default Sort</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>

          {/* Grid Products */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 bg-brand-cream/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : apiError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-4">
              <h3 className="font-serif text-xl text-brand-charcoal">Shop API unavailable</h3>
              <p className="text-xs text-brand-charcoal/70 max-w-md">{apiError}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <h3 className="font-serif text-xl text-brand-charcoal">No products matching filters</h3>
              <p className="text-xs text-brand-charcoal/60 max-w-sm">
                Try searching for other terms or selecting a different category.
              </p>
            </div>
          ) : shouldShowGroupedView ? (
            <div className="space-y-12">
              {groupedByCategory.map((group) => (
                <section key={group.category.id} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-cream pb-2">
                    <h3 className="font-serif text-xl text-brand-charcoal font-bold">{group.category.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-brand-charcoal/50 font-semibold">
                      {group.items.length} designs
                    </span>
                  </div>
                  {renderProductCards(group.items)}
                </section>
              ))}
            </div>
          ) : (
            renderProductCards(products)
          )}
        </div>
      </main>

      {/* Quick View Dialog */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-brand-gold/25 relative flex flex-col md:flex-row gap-6 p-6 animate-zoom-in">
            
            {/* Close Button */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-brand-cream rounded-full text-brand-charcoal/60 hover:text-brand-charcoal z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Product Image */}
            <div className="relative w-full md:w-1/2 aspect-square bg-[#f8f5f0] rounded-xl overflow-hidden">
              <img
                src={quickViewProduct.images?.[0]?.url || "/catalogue-source.png"}
                alt={quickViewProduct.name}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>

            {/* Product Meta Forms */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest block">
                  {quickViewProduct.category_name || "Premium Crochet"}
                </span>
                <h3 className="font-serif text-xl font-bold text-brand-charcoal mt-1">
                  {quickViewProduct.name}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                  <span className="text-[10px] text-brand-charcoal/50 ml-1">(5.0 Artisan rating)</span>
                </div>
                <p className="text-xs text-brand-charcoal/70 leading-relaxed line-clamp-3 mt-3">
                  {quickViewProduct.description}
                </p>
                <p className="text-lg font-bold text-brand-charcoal mt-3">
                  INR {selectedVariant?.price_override != null ? selectedVariant.price_override : quickViewProduct.price}
                </p>

                {/* Variants Selector */}
                {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
                  <div className="space-y-1.5 mt-4">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-brand-charcoal/60">Select Variant:</label>
                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.variants.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            selectedVariant?.id === v.id
                              ? "bg-brand-sage text-brand-white border-brand-sage font-semibold"
                              : "bg-brand-cream/35 text-brand-charcoal border-brand-gold/15 hover:border-brand-sage/40"
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Cart Control */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    addToCart(quickViewProduct, selectedVariant, qvQuantity);
                    setQuickViewProduct(null);
                  }}
                  className="flex-1 bg-brand-sage hover:bg-brand-sage/95 text-brand-white py-3.5 rounded-full text-xs uppercase tracking-wider font-bold hover-lift text-center"
                >
                  Add to Basket
                </button>
                <Link
                  href={`/shop/${quickViewProduct.slug}`}
                  className="px-6 border border-brand-gold/30 hover:border-brand-sage py-3.5 rounded-full text-xs uppercase tracking-wider font-bold text-center text-brand-charcoal transition-all hover:bg-brand-cream/20"
                >
                  Details
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
