"use client";

import React, { useState, useEffect } from "react";
import { Check, X, ShieldAlert, Landmark, Eye, RefreshCw, Search, Calendar, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Expandable Order Details States
  const [detailOrder, setDetailOrder] = useState<any | null>(null);
  
  // Verification receipt preview modal
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const q = `/orders/all?status=${selectedStatus}&search=${searchVal}`;
      const res = await api.get(q);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  // UPI payment approval
  const handleVerifyPayment = async (orderId: string, approve: boolean) => {
    const action = approve ? "APPROVE" : "REJECT";
    if (!confirm(`Are you sure you want to ${action} payment for Order #${orderId.slice(0,8)}?`)) return;
    try {
      await api.put(`/orders/${orderId}/verify-payment?is_completed=${approve}`);
      alert(`UPI Transaction payment ${approve ? "Approved" : "Rejected"} successfully.`);
      // refresh details if open
      if (detailOrder && detailOrder.id === orderId) {
        const freshRes = await api.get(`/orders/${orderId}`);
        setDetailOrder(freshRes.data);
      }
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  // Dropdown status updates
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      alert(`Order status updated to ${newStatus}.`);
      if (detailOrder && detailOrder.id === orderId) {
        const freshRes = await api.get(`/orders/${orderId}`);
        setDetailOrder(freshRes.data);
      }
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const statusOptions = [
    "Pending",
    "Confirmed",
    "Processing",
    "Packed",
    "Dispatched",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Returned"
  ];

  return (
    <div className="space-y-10 animate-fade-in text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-brand-cream pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">Artisan Workshop</span>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal">UPI Payment Verifier & Orders</h1>
        </div>
        <button
          onClick={loadOrders}
          className="p-2 bg-brand-cream hover:bg-brand-cream/80 text-brand-charcoal rounded-full"
          title="Refresh orders list"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar Search / Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-cream/15 p-4 rounded-2xl border border-brand-cream text-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-charcoal/40" />
            <input
              type="text"
              placeholder="Search by Order ID or User Email..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-2 bg-brand-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal font-medium"
            />
          </div>
          <button type="submit" className="bg-brand-sage text-brand-white px-4 py-2 rounded-xl font-bold uppercase">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 self-end">
          <span className="text-brand-charcoal/60">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-brand-white border border-brand-gold/30 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-sage text-brand-charcoal font-medium"
          >
            <option value="">All Orders</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main panel columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Orders Rows list (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal">Artisan Pipeline</h2>

          {loading ? (
            <div className="h-64 bg-brand-cream/20 rounded-2xl animate-pulse" />
          ) : orders.length === 0 ? (
            <p className="text-[10px] text-brand-charcoal/50 text-center py-10 bg-brand-cream/10 border rounded-2xl border-dashed border-brand-gold/20">
              No orders found matching parameters.
            </p>
          ) : (
            <div className="bg-brand-white border border-brand-cream rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-brand-cream/30 border-b border-brand-cream text-brand-charcoal/70 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Order Ref</th>
                      <th className="p-4">UTR Reference</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-brand-cream/10 transition-colors">
                        <td className="p-4">
                          <div>
                            <h4 className="font-mono font-bold text-brand-charcoal">#{o.id.slice(0, 8)}</h4>
                            <span className="text-[8px] text-brand-charcoal/50 font-medium">{new Date(o.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-semibold text-brand-charcoal/80">
                          {o.payment?.transaction_id || "N/A"}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            o.payment?.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                            o.payment?.status === "Pending" ? "bg-amber-100 text-amber-800 animate-pulse" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {o.payment?.status || "Unpaid"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-brand-charcoal">{o.status}</span>
                        </td>
                        <td className="p-4 text-right font-bold text-brand-charcoal">INR {o.total_amount}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setDetailOrder(o)}
                            className="p-1.5 hover:bg-brand-cream rounded-full text-brand-sage"
                            title="Inspect UTR receipt & verify"
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

        {/* Right: Expandable Order detail verifier (takes 1 col) */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal">Verifier Workspace</h2>

          {!detailOrder ? (
            <div className="bg-brand-cream/10 border border-brand-cream rounded-3xl p-8 text-center text-brand-charcoal/50">
              <Landmark className="w-10 h-10 mx-auto text-brand-charcoal/20 mb-2" />
              <p className="text-[10px] uppercase font-bold tracking-wider">Select an order row to audit payment reference numbers.</p>
            </div>
          ) : (
            <div className="bg-brand-cream/20 p-6 rounded-3xl border border-brand-cream space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-brand-cream pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-brand-charcoal">Order #{detailOrder.id.slice(0, 8)}</h3>
                  <span className="text-[9px] text-brand-charcoal/40 uppercase font-semibold">{new Date(detailOrder.created_at).toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setDetailOrder(null)}
                  className="p-1 hover:bg-brand-cream rounded-full text-brand-charcoal/40 hover:text-brand-charcoal"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* UPI Payment Status verification logs */}
              {detailOrder.payment && (
                <div className="bg-brand-white p-4 rounded-2xl border border-brand-cream space-y-4">
                  <h4 className="font-serif text-xs font-bold text-brand-charcoal flex items-center gap-1">
                    <Landmark className="w-4 h-4 text-brand-sage" />
                    UPI Statement Audit
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-brand-charcoal/50">UTR Transaction Ref ID:</span>
                      <span className="font-mono font-bold text-brand-charcoal">{detailOrder.payment.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-charcoal/50">Reported Paid Amount:</span>
                      <span className="font-bold text-brand-charcoal">INR {detailOrder.payment.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-charcoal/50 font-medium">Receipt File:</span>
                      {detailOrder.payment.screenshot_url ? (
                        <button
                          type="button"
                          onClick={() => setPreviewScreenshotUrl(detailOrder.payment.screenshot_url)}
                          className="text-[10px] text-brand-sage underline font-bold uppercase tracking-wider"
                        >
                          View Receipt Image
                        </button>
                      ) : (
                        <span className="text-brand-charcoal/40 italic">No screenshot uploaded</span>
                      )}
                    </div>
                  </div>

                  {detailOrder.payment.status === "Pending" && (
                    <div className="flex gap-2.5 pt-2 border-t border-brand-cream/60">
                      <button
                        onClick={() => handleVerifyPayment(detailOrder.id, false)}
                        className="flex-1 bg-brand-white border border-brand-error/35 text-brand-error hover:bg-brand-error/5 py-2 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(detailOrder.id, true)}
                        className="flex-1 bg-brand-sage text-brand-white hover:bg-brand-sage/95 py-2 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    </div>
                  )}

                  {detailOrder.payment.status === "Completed" && (
                    <div className="flex items-center gap-1.5 text-brand-success font-semibold text-[10px] uppercase justify-center bg-brand-success/10 border border-brand-success/20 py-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-brand-success" />
                      UPI verified payment cleared
                    </div>
                  )}

                  {detailOrder.payment.status === "Failed" && (
                    <div className="flex items-center gap-1.5 text-brand-error font-semibold text-[10px] uppercase justify-center bg-brand-error/10 border border-brand-error/20 py-2 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-brand-error" />
                      UPI Transaction rejected
                    </div>
                  )}
                </div>
              )}

              {/* Status Selector Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-brand-charcoal/50">Update Stitching Speed Pipeline</label>
                <select
                  value={detailOrder.status}
                  onChange={(e) => handleStatusChange(detailOrder.id, e.target.value)}
                  className="w-full bg-brand-white border border-brand-gold/30 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-sage text-brand-charcoal font-semibold"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Shipping Address */}
              {detailOrder.shipping_address && (
                <div className="bg-brand-white p-4 rounded-2xl border border-brand-cream space-y-2 text-xs">
                  <h4 className="font-serif text-xs font-bold text-brand-charcoal">Delivery Destination</h4>
                  <p className="font-semibold text-brand-charcoal">{detailOrder.shipping_address.full_name}</p>
                  <p className="text-brand-charcoal/70">{detailOrder.shipping_address.address_line1}</p>
                  {detailOrder.shipping_address.address_line2 && <p className="text-brand-charcoal/70">{detailOrder.shipping_address.address_line2}</p>}
                  <p className="text-brand-charcoal/70">{detailOrder.shipping_address.city}, {detailOrder.shipping_address.state} - {detailOrder.shipping_address.postal_code}</p>
                  <p className="text-brand-charcoal/50 mt-1">Contact: {detailOrder.shipping_address.phone}</p>
                </div>
              )}

              {/* Items Summary list */}
              <div className="space-y-3">
                <h4 className="font-serif text-xs font-bold text-brand-charcoal">Stitched Items</h4>
                <div className="divide-y divide-brand-cream/60 bg-brand-white rounded-2xl border border-brand-cream overflow-hidden">
                  {detailOrder.items?.map((item: any) => (
                    <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <h5 className="font-semibold text-brand-charcoal line-clamp-1">{item.product_name || "Custom Crochet"}</h5>
                        {item.variant_name && <p className="text-[10px] text-brand-gold font-medium">{item.variant_name}</p>}
                        <p className="text-[9px] text-brand-charcoal/40">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-brand-charcoal">INR {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gift Note details */}
              {detailOrder.gift_note && (
                <div className="bg-brand-white p-4 rounded-2xl border border-brand-gold/20 space-y-1.5 text-xs">
                  <h4 className="font-bold text-brand-gold uppercase tracking-wider text-[9px] block">Cotton gift card message</h4>
                  <p className="italic text-brand-charcoal/80 leading-relaxed font-serif">&ldquo;{detailOrder.gift_note}&rdquo;</p>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* Screenshot Receipt Preview Modal */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-white max-w-lg w-full rounded-2xl p-5 border border-brand-gold/25 relative animate-zoom-in flex flex-col items-center">
            <button
              onClick={() => setPreviewScreenshotUrl(null)}
              className="absolute top-3 right-3 p-1.5 bg-brand-cream hover:bg-brand-cream/80 text-brand-charcoal rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-sm font-bold text-brand-charcoal mb-4">UTR Screenshot Audit</h3>
            <div className="bg-brand-cream/35 p-2 rounded-xl border border-brand-cream max-h-[70vh] overflow-auto">
              <img src={previewScreenshotUrl} alt="Transaction statement receipt" className="w-full object-contain rounded" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
