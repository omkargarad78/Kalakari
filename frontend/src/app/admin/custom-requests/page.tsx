"use client";

import React, { useState, useEffect } from "react";
import { Hammer, Sparkles, X, Eye, CheckCircle, HelpCircle, DollarSign, Calendar, FileText, RefreshCw } from "lucide-react";
import api from "@/lib/api";

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Expandable custom request details
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  
  // Quotation form states
  const [quoteAmount, setQuoteAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [sendingQuote, setSendingQuote] = useState(false);

  // Receipt image zoom modal
  const [zoomImgUrl, setZoomImgUrl] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/custom-orders/admin/all");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteAmount || !selectedReq) return;
    setSendingQuote(true);

    try {
      await api.put(`/custom-orders/${selectedReq.id}/quote`, {
        quotation_amount: Number(quoteAmount),
        admin_notes: adminNotes || null
      });
      alert("Quotation pricing sent successfully to customer outbox & inbox!");
      // Reset
      setQuoteAmount("");
      setAdminNotes("");
      setSelectedReq(null);
      loadRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to send quotation.");
    } finally {
      setSendingQuote(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-brand-cream pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">Artisan Workshop</span>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal">Custom Crochet Projects Manager</h1>
        </div>
        <button
          onClick={loadRequests}
          className="p-2 bg-brand-cream hover:bg-brand-cream/80 text-brand-charcoal rounded-full"
          title="Refresh requests list"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Request Row table (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal">Design Pipelines</h2>

          {loading ? (
            <div className="h-64 bg-brand-cream/20 rounded-2xl animate-pulse" />
          ) : requests.length === 0 ? (
            <p className="text-[10px] text-brand-charcoal/50 text-center py-10 bg-brand-cream/10 border rounded-2xl border-dashed border-brand-gold/20">
              No custom crochet design requests submitted.
            </p>
          ) : (
            <div className="bg-brand-white border border-brand-cream rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-cream/30 border-b border-brand-cream text-brand-charcoal/70 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Customer Email</th>
                      <th className="p-4">Required Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Budget</th>
                      <th className="p-4 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-brand-cream/10 transition-colors">
                        <td className="p-4">
                          <div>
                            <h4 className="font-semibold text-brand-charcoal truncate max-w-[150px]">{r.user_name || "Guest User"}</h4>
                            <span className="text-[9px] text-brand-charcoal/50 font-medium">{r.user_email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-brand-charcoal/60">
                          {r.required_delivery_date ? new Date(r.required_delivery_date).toLocaleDateString() : "Flexible Date"}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            r.status === "Pending" ? "bg-amber-100 text-amber-800" :
                            r.status === "Quoted" ? "bg-indigo-100 text-indigo-800 font-extrabold animate-pulse" :
                            r.status === "Approved" ? "bg-emerald-100 text-emerald-800 font-bold" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-brand-charcoal">
                          {r.budget ? `INR ${r.budget}` : "Not stated"}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedReq(r);
                              setQuoteAmount(r.quotation_amount ? String(r.quotation_amount) : "");
                              setAdminNotes(r.admin_notes || "");
                            }}
                            className="p-1.5 hover:bg-brand-cream rounded-full text-brand-sage"
                            title="Inspect details & quote price"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Expandable Workspace Quotation slider (takes 1 col) */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal">Quotation Workspace</h2>

          {!selectedReq ? (
            <div className="bg-brand-cream/10 border border-brand-cream rounded-3xl p-8 text-center text-brand-charcoal/50">
              <Hammer className="w-10 h-10 mx-auto text-brand-charcoal/20 mb-2" />
              <p className="text-[10px] uppercase font-bold tracking-wider">Select a request row to review patterns and send quotes.</p>
            </div>
          ) : (
            <div className="bg-brand-cream/20 p-6 rounded-3xl border border-brand-cream space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-brand-cream pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-brand-charcoal">Project Specs</h3>
                  <span className="text-[9px] text-brand-charcoal/40 uppercase font-semibold">{new Date(selectedReq.created_at).toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setSelectedReq(null)}
                  className="p-1 hover:bg-brand-cream rounded-full text-brand-charcoal/40 hover:text-brand-charcoal"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Specs Details Card */}
              <div className="bg-brand-white p-4 rounded-2xl border border-brand-cream space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] text-brand-charcoal/40 uppercase font-bold block">Spec Details:</span>
                  <p className="text-brand-charcoal/80 leading-relaxed bg-brand-cream/25 p-3 rounded-xl border border-brand-cream/40">{selectedReq.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border-t border-brand-cream/60 pt-3">
                  <div>
                    <span className="text-[9px] text-brand-charcoal/40 uppercase font-bold block">Colors:</span>
                    <span className="font-semibold text-brand-charcoal">{selectedReq.preferred_colors || "Artisan Choice"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-charcoal/40 uppercase font-bold block">Target Budget:</span>
                    <span className="font-bold text-brand-charcoal">{selectedReq.budget ? `INR ${selectedReq.budget}` : "Flexible"}</span>
                  </div>
                </div>

                {selectedReq.reference_image_url && (
                  <div className="pt-2 border-t border-brand-cream/60 flex items-center justify-between">
                    <span className="text-[9px] text-brand-charcoal/40 uppercase font-bold">Sketch / Reference:</span>
                    <button
                      type="button"
                      onClick={() => setZoomImgUrl(selectedReq.reference_image_url)}
                      className="text-[10px] text-brand-sage font-bold underline uppercase tracking-wider"
                    >
                      View reference image
                    </button>
                  </div>
                )}
              </div>

              {/* Quotation pricing form */}
              {selectedReq.status === "Pending" && (
                <form onSubmit={handleSendQuote} className="bg-brand-white p-4 rounded-2xl border border-brand-gold/15 space-y-4">
                  <h4 className="font-serif text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-gold fill-brand-gold/15" />
                    Determine Quotation Price
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-brand-charcoal/50 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-brand-sage" />
                      Artisan Price (INR)
                    </label>
                    <input
                      type="number"
                      required
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="e.g. 4500"
                      className="w-full px-3 py-2 bg-brand-cream/25 border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-brand-charcoal/50"> Artisan Notes (Garment size duration care...)</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Notes on stitch speed timeline..."
                      className="w-full p-3 bg-brand-cream/25 border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal resize-none h-20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingQuote}
                    className="w-full bg-brand-sage hover:bg-brand-sage/95 text-brand-white py-3 rounded-xl font-bold uppercase tracking-wider text-center"
                  >
                    {sendingQuote ? "Sending Quote..." : "Send Quotation Email"}
                  </button>
                </form>
              )}

              {selectedReq.status === "Quoted" && (
                <div className="bg-brand-white p-4 rounded-2xl border border-indigo-200 text-center space-y-2">
                  <h4 className="text-xs font-bold text-brand-charcoal">Quoted Price: INR {selectedReq.quotation_amount}</h4>
                  <p className="text-[10px] text-brand-charcoal/50 leading-relaxed">Waiting for customer response approval on quote.</p>
                </div>
              )}

              {selectedReq.status === "Approved" && (
                <div className="bg-brand-white p-4 rounded-2xl border border-brand-success/20 text-center space-y-2 bg-brand-success/10 text-brand-success">
                  <CheckCircle className="w-5 h-5 mx-auto text-brand-success" />
                  <h4 className="text-xs font-bold uppercase">Quotation Accepted</h4>
                  <p className="text-[9px] text-brand-success/80">Customer accepted quote of INR {selectedReq.quotation_amount}. Order creation ready.</p>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* Reference Image modal view */}
      {zoomImgUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-white max-w-lg w-full rounded-2xl p-5 border border-brand-gold/25 relative animate-zoom-in flex flex-col items-center">
            <button
              onClick={() => setZoomImgUrl(null)}
              className="absolute top-3 right-3 p-1.5 bg-brand-cream hover:bg-brand-cream/80 text-brand-charcoal rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-sm font-bold text-brand-charcoal mb-4">Design Reference Photo</h3>
            <div className="bg-brand-cream/35 p-2 rounded-xl border border-brand-cream max-h-[70vh] overflow-auto">
              <img src={zoomImgUrl} alt="Submitted design references" className="w-full object-contain rounded" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
