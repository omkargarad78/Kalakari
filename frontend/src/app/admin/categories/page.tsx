"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import api from "@/lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const canSubmit = useMemo(() => !!name.trim() && !!slug.trim(), [name, slug]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/categories");
      setCategories(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editId) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleEdit = (c: any) => {
    setEditId(c.id);
    setName(c.name || "");
    setSlug(c.slug || "");
    setDescription(c.description || "");
    setImageUrl(c.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products may lose their category assignment.")) return;
    await api.delete(`/products/categories/${id}`);
    if (editId === id) resetForm();
    loadCategories();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
    };

    if (editId) {
      await api.put(`/products/categories/${editId}`, payload);
    } else {
      await api.post("/products/categories", payload);
    }

    resetForm();
    loadCategories();
  };

  return (
    <div className="space-y-10 animate-fade-in text-xs">
      <div className="flex justify-between items-center border-b border-brand-cream pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">Artisan Workshop</span>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal">Category Manager</h1>
        </div>
        <button
          onClick={loadCategories}
          className="p-2 bg-brand-cream hover:bg-brand-cream/80 text-brand-charcoal rounded-full"
          title="Refresh categories list"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal">Existing Categories</h2>

          {loading ? (
            <div className="h-64 bg-brand-cream/20 rounded-2xl animate-pulse" />
          ) : categories.length === 0 ? (
            <p className="text-[10px] text-brand-charcoal/50 text-center py-10 bg-brand-cream/10 border rounded-2xl border-dashed border-brand-gold/20">
              No categories found.
            </p>
          ) : (
            <div className="bg-brand-white border border-brand-cream rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-cream/30 border-b border-brand-cream text-brand-charcoal/70 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Name</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Image</th>
                      <th className="p-4 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-brand-cream/10 transition-colors">
                        <td className="p-4 font-semibold text-brand-charcoal">{c.name}</td>
                        <td className="p-4 font-mono text-brand-charcoal/70">{c.slug}</td>
                        <td className="p-4">
                          {c.image_url ? (
                            <a className="text-brand-sage underline" href={c.image_url} target="_blank" rel="noreferrer">
                              view
                            </a>
                          ) : (
                            <span className="text-brand-charcoal/40">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(c)}
                              className="px-3 py-1.5 rounded-full bg-brand-cream hover:bg-brand-cream/80 text-[10px] uppercase tracking-wider font-bold"
                            >
                              <Save className="inline w-3.5 h-3.5 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="px-3 py-1.5 rounded-full bg-brand-error/10 hover:bg-brand-error/15 text-brand-error text-[10px] uppercase tracking-wider font-bold"
                            >
                              <Trash2 className="inline w-3.5 h-3.5 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal">{editId ? "Edit Category" : "Add Category"}</h2>

          <form onSubmit={handleSubmit} className="bg-brand-cream/20 p-5 rounded-2xl border border-brand-cream space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Name</label>
              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage"
                placeholder="Hair Accessories"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage font-mono"
                placeholder="hair-accessories"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage min-h-20"
                placeholder="Short description for the category..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Image URL (optional)</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage"
                placeholder="/catalogue-source.png"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-brand-white border border-brand-gold/20 rounded-xl py-2 font-semibold text-brand-charcoal text-[10px] uppercase"
              >
                {editId ? "Cancel" : "Reset"}
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 bg-brand-sage hover:bg-brand-sage/90 disabled:opacity-60 rounded-xl py-2 font-semibold text-brand-white text-[10px] uppercase flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {editId ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

