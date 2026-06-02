"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, UploadCloud, Compass, Hammer, Calendar, CircleDollarSign } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";

export default function CustomOrderPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [preferredColors, setPreferredColors] = useState("");
  const [budget, setBudget] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  // Image reference states
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      // Prompt warning but let them see the details first. We block on submit.
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReferenceFile(file);
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    try {
      // reuse orders upload endpoint for general uploads
      const res = await api.post("/orders/upload-receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setReferenceUrl(res.data.url);
    } catch (err) {
      console.error(err);
      setReferenceUrl("/static/custom-placeholder.png");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a custom crochet design request.");
      router.push("/login?redirect=custom-order");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/custom-orders/", {
        description,
        preferred_colors: preferredColors || null,
        budget: budget ? Number(budget) : null,
        required_delivery_date: requiredDate ? new Date(requiredDate).toISOString() : null,
        additional_notes: additionalNotes || null,
        reference_image_url: referenceUrl || null
      });
      setSuccess(true);
      // Reset
      setDescription("");
      setPreferredColors("");
      setBudget("");
      setRequiredDate("");
      setAdditionalNotes("");
      setReferenceFile(null);
      setReferenceUrl("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit custom request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 md:px-8 w-full pt-32 pb-20 flex-1 flex flex-col md:flex-row gap-12">
        {/* Story Section */}
        <div className="flex-1 space-y-6 self-start md:sticky md:top-28">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-brand-gold bg-brand-cream px-3.5 py-1 rounded-full border border-brand-gold/20">
            <Compass className="w-3.5 h-3.5 text-brand-gold" />
            Slow Fashion Atelier
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-brand-charcoal leading-[1.2]">
            Bespoke Crochet <br />
            <span className="font-serif italic font-normal text-brand-sage">Tailored For You</span>
          </h1>
          <p className="text-xs text-brand-charcoal/70 leading-relaxed">
            Have a specific style, size, or pattern in mind? Our family studio creates customized crochet cardigans, luxury bags, custom flowers, and custom plush amigurumi.
          </p>
          <div className="space-y-4 pt-4 border-t border-brand-cream text-xs">
            <div className="flex gap-3 items-start">
              <span className="bg-brand-cream p-2 rounded-full font-bold text-brand-sage text-center w-7 h-7 flex items-center justify-center">1</span>
              <div>
                <h4 className="font-bold text-brand-charcoal">Submit Specifications</h4>
                <p className="text-brand-charcoal/60 leading-normal mt-0.5">Tell us the colors, sizes, upload a drawing or Unsplash reference photo.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-brand-cream p-2 rounded-full font-bold text-brand-sage text-center w-7 h-7 flex items-center justify-center">2</span>
              <div>
                <h4 className="font-bold text-brand-charcoal">Artisan Review & Quote</h4>
                <p className="text-brand-charcoal/60 leading-normal mt-0.5">Mother Artisan reviews the stitches difficulty and sends a price quote to your email and dashboard.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-brand-cream p-2 rounded-full font-bold text-brand-sage text-center w-7 h-7 flex items-center justify-center">3</span>
              <div>
                <h4 className="font-bold text-brand-charcoal">Accept & Begin Stitching</h4>
                <p className="text-brand-charcoal/60 leading-normal mt-0.5">Once you accept the quote, you check out via UPI. We begin hand-stitching with priority status.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Request Form */}
        <div className="w-full md:w-[480px] flex-shrink-0">
          {success ? (
            <div className="bg-brand-cream/30 p-8 rounded-3xl border border-brand-gold/15 text-center space-y-4 animate-zoom-in">
              <div className="w-12 h-12 bg-brand-sage/10 text-brand-sage rounded-full flex items-center justify-center mx-auto border border-brand-sage/20">
                <Hammer className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-brand-charcoal">Request Submitted!</h2>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Thank you! We received your custom design specifications. Mother Artisan will review the project and respond with a quote within 24 hours.
              </p>
              <div className="pt-2 flex gap-3 justify-center">
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-brand-sage text-brand-white px-6 py-2.5 rounded-full text-xs font-semibold hover-lift"
                >
                  Submit Another Request
                </button>
                <Link
                  href="/dashboard"
                  className="bg-brand-white border border-brand-gold/20 text-brand-charcoal px-6 py-2.5 rounded-full text-xs font-semibold hover-lift"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-brand-cream/20 p-6 md:p-8 rounded-3xl border border-brand-cream shadow-md space-y-6">
              <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-gold fill-brand-gold" />
                Custom Project Form
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Design Specifications</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe size, garment shape, stitches density, yarn preferences (e.g. oversize crop mohair cardigan with bubble sleeves)..."
                    className="w-full p-3.5 bg-brand-white border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal resize-none h-28"
                  />
                </div>

                {/* Colors */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Preferred Color Palette</label>
                  <input
                    type="text"
                    value={preferredColors}
                    onChange={(e) => setPreferredColors(e.target.value)}
                    placeholder="Sage Green, Soft Cream, Sunset Rose"
                    className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Budget */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-brand-charcoal/60 flex items-center gap-1">
                      <CircleDollarSign className="w-3.5 h-3.5 text-brand-sage" />
                      Budget (INR)
                    </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="Estimated INR"
                      className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage"
                    />
                  </div>

                  {/* Date picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-brand-charcoal/60 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-sage" />
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal"
                    />
                  </div>
                </div>

                {/* Image Reference */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Reference Photo / Sketch</label>
                  <div className="border border-dashed border-brand-gold/40 hover:border-brand-sage/60 rounded-xl p-4 bg-brand-white transition-all text-center relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <UploadCloud className="w-8 h-8 text-brand-sage/80" />
                      <span className="text-[10px] text-brand-charcoal/60">
                        {referenceFile ? `Reference: ${referenceFile.name}` : "Upload a drawing or mood board reference image"}
                      </span>
                      {uploading && <span className="text-[9px] text-brand-gold font-medium animate-pulse">Uploading file...</span>}
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Artisan Notes</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Enter sizes or special notes here..."
                    className="w-full p-3 bg-brand-white border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage resize-none h-16"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="w-full bg-brand-sage hover:bg-brand-sage/95 text-brand-white py-3.5 rounded-full text-xs uppercase tracking-wider font-bold hover-lift text-center"
                >
                  {submitting ? "Submitting specifications..." : "Submit to Artisan Studio"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
