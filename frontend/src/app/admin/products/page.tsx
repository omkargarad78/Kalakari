"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Image as ImageIcon, Sparkles, Check, X, RefreshCw, Upload } from "lucide-react";
import api from "@/lib/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields for Add/Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [materials, setMaterials] = useState("");
  const [handmadeDetails, setHandmadeDetails] = useState("");
  const [shippingInfo, setShippingInfo] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [description, setDescription] = useState("");

  // Variant/Image Modal States
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [variantName, setVariantName] = useState("");
  const [variantStock, setVariantStock] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/products"),
        api.get("/products/categories")
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !categoryId) {
        setCategoryId(catRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Sync Slug automatically based on name
  const handleNameChange = (val: str) => {
    setName(val);
    if (!editId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug,
      price: Number(price),
      stock: Number(stock),
      category_id: categoryId || null,
      materials: materials || null,
      handmade_details: handmadeDetails || null,
      shipping_info: shippingInfo || null,
      is_featured: isFeatured,
      is_visible: isVisible,
      description: description || null
    };

    try {
      if (editId) {
        await api.put(`/products/${editId}`, payload);
        alert("Product updated successfully!");
      } else {
        await api.post("/products/", payload);
        alert("Product created successfully! Row added.");
      }
      // Reset form fields
      setEditId(null);
      setName("");
      setSlug("");
      setPrice("");
      setStock("");
      setMaterials("");
      setHandmadeDetails("");
      setShippingInfo("");
      setIsFeatured(false);
      setIsVisible(true);
      setDescription("");
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save product.");
    }
  };

  const handleEditInit = (p: any) => {
    setEditId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setPrice(String(p.price));
    setStock(String(p.stock));
    setCategoryId(p.category_id || "");
    setMaterials(p.materials || "");
    setHandmadeDetails(p.handmade_details || "");
    setShippingInfo(p.shipping_info || "");
    setIsFeatured(p.is_featured);
    setIsVisible(p.is_visible);
    setDescription(p.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: str) => {
    if (!confirm("Are you sure you want to delete this product? All files mapping to it will be lost.")) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Variant addition CRUD
  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantName || !variantStock) return;
    try {
      await api.post(`/products/${selectedProduct.id}/variants`, {
        name: variantName,
        stock: Number(variantStock)
      });
      setVariantName("");
      setVariantStock("");
      // refresh modal item
      const freshRes = await api.get(`/products/${selectedProduct.slug}`);
      setSelectedProduct(freshRes.data);
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Image Upload CRUD
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProduct) return;
    setUploadingImage(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("position", String(selectedProduct.images?.length || 0));

    try {
      await api.post(`/products/${selectedProduct.id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const freshRes = await api.get(`/products/${selectedProduct.slug}`);
      setSelectedProduct(freshRes.data);
      loadProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-brand-cream pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">Artisan Workshop</span>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal">Handmade Product Manager</h1>
        </div>
        <button
          onClick={loadProducts}
          className="p-2 bg-brand-cream hover:bg-brand-cream/80 text-brand-charcoal rounded-full"
          title="Refresh products list"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Product Rows Table (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal">Studio Catalogue</h2>

          {loading ? (
            <div className="h-64 bg-brand-cream/20 rounded-2xl animate-pulse" />
          ) : products.length === 0 ? (
            <p className="text-[10px] text-brand-charcoal/50 text-center py-10 bg-brand-cream/10 border rounded-2xl border-dashed border-brand-gold/20">
              No products found in catalogue.
            </p>
          ) : (
            <div className="bg-brand-white border border-brand-cream rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-cream/30 border-b border-brand-cream text-brand-charcoal/70 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Product Info</th>
                      <th className="p-4">Price</th>
                      <th className="p-4 text-center">In Stock</th>
                      <th className="p-4 text-center">Visibility</th>
                      <th className="p-4 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream">
                    {products.map((p) => {
                      const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=150";
                      return (
                        <tr key={p.id} className="hover:bg-brand-cream/10 transition-colors">
                          <td className="p-4">
                            <div className="flex gap-3 items-center">
                              <img src={img} alt="" className="w-10 h-10 object-cover rounded bg-brand-cream" />
                              <div>
                                <h4 className="font-medium text-brand-charcoal truncate max-w-[160px]">{p.name}</h4>
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-brand-gold">{p.category_name || "Uncategorized"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-brand-charcoal">INR {p.price}</td>
                          <td className="p-4 text-center font-bold text-brand-sage">{p.stock}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              p.is_visible ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}>
                              {p.is_visible ? "Visible" : "Hidden"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleEditInit(p)}
                                className="p-1 text-brand-charcoal/65 hover:text-brand-sage"
                                title="Edit Product metadata"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedProduct(p)}
                                className="p-1 text-brand-charcoal/65 hover:text-brand-gold"
                                title="Upload images and setup variants"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-1 text-brand-charcoal/65 hover:text-brand-error"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Add/Edit Product Panel (takes 1 col) */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal">
            {editId ? "Edit Stitching Design" : "New Stitching Design"}
          </h2>

          <form onSubmit={handleSubmit} className="bg-brand-cream/20 p-6 rounded-3xl border border-brand-cream space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-brand-charcoal/50">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Sage Green Tote Bag"
                className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-brand-charcoal/50">URL Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="sage-green-tote-bag"
                className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-brand-charcoal/50">Price (INR)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2499"
                  className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-brand-charcoal/50">Total Stock</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="8"
                  className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-brand-charcoal/50">Select Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-brand-charcoal/50">Yarn & Materials Used</label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="100% Cotton, mohair"
                className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-brand-charcoal/50">Handmade Effort Details</label>
              <input
                type="text"
                value={handmadeDetails}
                onChange={(e) => setHandmadeDetails(e.target.value)}
                placeholder="12 hours of stitching"
                className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-brand-charcoal/50">Description Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Garment size details..."
                className="w-full p-3 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal resize-none h-16"
              />
            </div>

            <div className="flex gap-6 items-center">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-charcoal/70">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-brand-sage"
                />
                <span>Feature Product</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-charcoal/70">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="w-4 h-4 accent-brand-sage"
                />
                <span>Visible in shop</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setName("");
                    setSlug("");
                    setPrice("");
                    setStock("");
                    setMaterials("");
                    setHandmadeDetails("");
                    setShippingInfo("");
                    setIsFeatured(false);
                    setIsVisible(true);
                    setDescription("");
                  }}
                  className="flex-1 bg-brand-cream border border-brand-gold/20 text-brand-charcoal py-3 rounded-full font-bold uppercase tracking-wider text-center"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-brand-sage hover:bg-brand-sage/95 text-brand-white py-3 rounded-full font-bold uppercase tracking-wider text-center"
              >
                {editId ? "Update Product" : "Publish Live"}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Modal for images & variants setup */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative space-y-6 border border-brand-gold/25 animate-zoom-in overflow-y-auto max-h-[90vh]">
            
            {/* Close */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1 hover:bg-brand-cream rounded-full text-brand-charcoal/50 hover:text-brand-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">Image & Variant Workspace</span>
              <h2 className="font-serif text-xl font-bold text-brand-charcoal">{selectedProduct.name}</h2>
            </div>

            {/* Upload Gallery */}
            <div className="space-y-3 pt-2">
              <h3 className="font-serif text-sm font-semibold text-brand-charcoal">Design Photos Gallery</h3>
              
              <div className="flex flex-wrap gap-3">
                {selectedProduct.images?.map((img: any) => (
                  <div key={img.id} className="w-20 h-20 bg-brand-cream rounded-lg overflow-hidden border border-brand-cream relative">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}

                {/* Uploader Trigger box */}
                <div className="w-20 h-20 border border-dashed border-brand-gold/40 hover:border-brand-sage/50 rounded-lg flex flex-col items-center justify-center relative cursor-pointer bg-brand-cream/10 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 text-brand-charcoal/40" />
                  <span className="text-[8px] text-brand-charcoal/50 mt-1 uppercase font-bold">Upload</span>
                </div>
              </div>
              {uploadingImage && <p className="text-[9px] text-brand-gold font-semibold animate-pulse">Uploading file to gallery...</p>}
            </div>

            {/* Variants configuration */}
            <div className="space-y-4 pt-4 border-t border-brand-cream">
              <h3 className="font-serif text-sm font-semibold text-brand-charcoal">Configure Variants</h3>
              
              {/* List */}
              {selectedProduct.variants?.length === 0 ? (
                <p className="text-[10px] text-brand-charcoal/40">No custom variants defined (using standard stock).</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {selectedProduct.variants?.map((v: any) => (
                    <span key={v.id} className="bg-brand-cream text-brand-sage text-xs px-3.5 py-1.5 rounded-full font-semibold border border-brand-gold/15">
                      {v.name} (Stock: {v.stock})
                    </span>
                  ))}
                </div>
              )}

              {/* Add Variant Form */}
              <form onSubmit={handleAddVariant} className="flex gap-4 items-end bg-brand-cream/20 p-4 rounded-xl border border-brand-cream">
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-brand-charcoal/50">Variant Name</label>
                  <input
                    type="text"
                    required
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    placeholder="e.g. Color: Sage Green"
                    className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-lg focus:outline-none focus:border-brand-sage"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-brand-charcoal/50">Stock</label>
                  <input
                    type="number"
                    required
                    value={variantStock}
                    onChange={(e) => setVariantStock(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-lg focus:outline-none focus:border-brand-sage"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-sage text-brand-white px-4 py-2.5 rounded-lg font-bold uppercase tracking-wider"
                >
                  Add Option
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
