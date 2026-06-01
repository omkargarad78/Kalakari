"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Heart, Package, Hammer, MapPin, Loader2, Compass, Plus, Trash2, ShieldAlert } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [customRequests, setCustomRequests] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Address modal states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");

  const loadDashboardData = async () => {
    try {
      const [ordersRes, customRes, addrRes] = await Promise.all([
        api.get("/orders/history"),
        api.get("/custom-orders/my-requests"),
        api.get("/addresses/")
      ]);
      setOrders(ordersRes.data);
      setCustomRequests(customRes.data);
      setAddresses(addrRes.data);
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=dashboard");
    } else if (user) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/addresses/", {
        full_name: fullName,
        address_line1: address1,
        address_line2: address2 || null,
        city,
        state,
        postal_code: zip,
        country: "India",
        phone,
        address_type: "shipping",
        is_default: addresses.length === 0
      });
      // Reset form
      setFullName("");
      setAddress1("");
      setAddress2("");
      setCity("");
      setState("");
      setZip("");
      setPhone("");
      setShowAddressForm(false);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id: str) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/addresses/${id}`);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptQuote = async (customOrderId: str) => {
    try {
      await api.put(`/custom-orders/${customOrderId}/respond?accept=true`);
      alert("Quotation accepted! You can now proceed to checkout.");
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-white">
        <Header />
        <div className="flex-grow flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-brand-sage" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-32 pb-20 flex-1 space-y-12 animate-fade-in">
        
        {/* Banner greeting */}
        <div className="bg-brand-cream/35 border border-brand-gold/15 p-8 md:p-12 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">Customer Studio account</span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-brand-charcoal">
              Welcome Back, {user?.full_name}
            </h1>
            <p className="text-xs text-brand-charcoal/60">
              Check slow-fashion order updates and bespoke artisan project progress.
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link
              href="/shop"
              className="bg-brand-sage text-brand-white px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold hover-lift"
            >
              Explore Shop
            </Link>
            <Link
              href="/dashboard/wishlist"
              className="bg-brand-white border border-brand-gold/20 text-brand-charcoal px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold hover-lift flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 text-brand-error" />
              Wishlist
            </Link>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main section: Orders & Custom requests (takes 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Orders list */}
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                <Package className="w-4.5 h-4.5 text-brand-sage" />
                Handmade Orders History
              </h2>

              {orders.length === 0 ? (
                <div className="bg-brand-cream/10 border border-brand-cream p-8 rounded-2xl text-center space-y-3">
                  <p className="text-xs text-brand-charcoal/60">No orders placed yet.</p>
                  <Link href="/shop" className="inline-block text-xs text-brand-sage font-bold uppercase tracking-wider hover:underline">
                    Browse standard catalogs
                  </Link>
                </div>
              ) : (
                <div className="bg-brand-white border border-brand-cream rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-brand-cream/30 border-b border-brand-cream text-brand-charcoal/70 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="p-4">Order Ref</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Stitching Status</th>
                          <th className="p-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-cream">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-brand-cream/10 transition-colors">
                            <td className="p-4 font-mono font-semibold">#{o.id.slice(0, 8)}</td>
                            <td className="p-4 text-brand-charcoal/60">{new Date(o.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                o.status === "Pending" ? "bg-amber-100 text-amber-800" :
                                o.status === "Cancelled" ? "bg-red-100 text-red-800" :
                                "bg-emerald-100 text-emerald-800"
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="p-4 text-right font-bold">INR {o.total_amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Custom requests */}
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                <Hammer className="w-4.5 h-4.5 text-brand-sage" />
                Artisan Custom Requests
              </h2>

              {customRequests.length === 0 ? (
                <div className="bg-brand-cream/10 border border-brand-cream p-8 rounded-2xl text-center space-y-3">
                  <p className="text-xs text-brand-charcoal/60">No custom designs submitted.</p>
                  <Link href="/custom-order" className="inline-block text-xs text-brand-sage font-bold uppercase tracking-wider hover:underline">
                    Request custom crochet
                  </Link>
                </div>
              ) : (
                <div className="bg-brand-white border border-brand-cream rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-brand-cream/30 border-b border-brand-cream text-brand-charcoal/70 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="p-4">Custom ID</th>
                          <th className="p-4">Artisan status</th>
                          <th className="p-4 text-right font-semibold">Quote Amount</th>
                          <th className="p-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-cream">
                        {customRequests.map((c) => (
                          <tr key={c.id} className="hover:bg-brand-cream/10 transition-colors">
                            <td className="p-4 font-mono font-semibold">#{c.id.slice(0, 8)}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                c.status === "Pending" ? "bg-amber-100 text-amber-800" :
                                c.status === "Quoted" ? "bg-indigo-100 text-indigo-800 font-extrabold" :
                                c.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="p-4 text-right font-bold text-brand-charcoal/80">
                              {c.quotation_amount ? `INR ${c.quotation_amount}` : "Calculating..."}
                            </td>
                            <td className="p-4 text-center">
                              {c.status === "Quoted" && (
                                <button
                                  onClick={() => handleAcceptQuote(c.id)}
                                  className="text-[10px] bg-brand-sage text-brand-white px-3 py-1.5 rounded-full font-bold hover:bg-brand-sage/95 transition-all shadow-sm"
                                >
                                  Accept Quote
                                </button>
                              )}
                              {c.status === "Approved" && (
                                <span className="text-[10px] text-brand-sage font-medium">Approved! Ready.</span>
                              )}
                              {c.status === "Pending" && (
                                <span className="text-[10px] text-brand-charcoal/40">Reviewing specifications...</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar: Address Book (takes 1 col) */}
          <div className="space-y-8">
            
            {/* Address Management */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-brand-cream pb-3">
                <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-brand-sage" />
                  Address Book
                </h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-brand-sage hover:text-brand-sage/80 p-1"
                  title="Add Address"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Address Form modal slide */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-brand-cream/30 p-4 rounded-xl border border-brand-gold/15 space-y-3 text-xs">
                  <input
                    type="text"
                    placeholder="Recipient Full Name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-lg focus:outline-none focus:border-brand-sage"
                  />
                  <input
                    type="text"
                    placeholder="Address line 1"
                    required
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-lg focus:outline-none focus:border-brand-sage"
                  />
                  <input
                    type="text"
                    placeholder="Address line 2 (Optional)"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-lg focus:outline-none focus:border-brand-sage"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-lg focus:outline-none focus:border-brand-sage"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-lg focus:outline-none focus:border-brand-sage"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Pin Code"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-lg focus:outline-none focus:border-brand-sage"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="px-3 py-2 bg-brand-white border border-brand-gold/20 rounded-lg focus:outline-none focus:border-brand-sage"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 bg-brand-cream border border-brand-gold/20 rounded-lg py-2 font-semibold text-brand-charcoal text-[10px] uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-brand-sage hover:bg-brand-sage/90 rounded-lg py-2 font-semibold text-brand-white text-[10px] uppercase"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Address list */}
              {addresses.length === 0 ? (
                <p className="text-[10px] text-brand-charcoal/50 text-center py-4 bg-brand-cream/10 border rounded-xl border-dashed border-brand-gold/20">
                  No addresses saved yet. Add one to speed up checkouts.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <div key={a.id} className="bg-brand-cream/20 p-4 border border-brand-cream rounded-xl flex justify-between items-start text-xs">
                      <div>
                        <h4 className="font-semibold text-brand-charcoal">{a.full_name}</h4>
                        <p className="text-brand-charcoal/70 mt-1">{a.address_line1}</p>
                        {a.address_line2 && <p className="text-brand-charcoal/70">{a.address_line2}</p>}
                        <p className="text-brand-charcoal/70">{a.city}, {a.state} - {a.postal_code}</p>
                        <p className="text-brand-charcoal/50 mt-1">Phone: {a.phone}</p>
                        {a.is_default && (
                          <span className="inline-block mt-2 bg-brand-sage/10 text-brand-sage text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-brand-sage/20">
                            Default Address
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(a.id)}
                        className="text-brand-charcoal/40 hover:text-brand-error p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
