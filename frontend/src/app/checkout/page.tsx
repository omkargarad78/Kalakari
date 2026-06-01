"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CreditCard, Landmark, CheckCircle2, ChevronRight, Copy, UploadCloud, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartSubtotal, discountAmount, shippingFee, cartTotal, coupon, giftNote, clearCart } = useCart();

  const [step, setStep] = useState(1); // 1: Shipping Address, 2: Delivery options, 3: UPI Payment, 4: Confirmation
  
  // Shipping Address Form
  const [fullName, setFullName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [createdAddressId, setCreatedAddressId] = useState("");

  // Delivery configuration
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [calculatedTotal, setCalculatedTotal] = useState(cartTotal);
  const [calculatedShipping, setCalculatedShipping] = useState(shippingFee);

  // Payment configuration
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Check if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && step !== 4) {
      router.push("/shop");
    }
  }, [cartItems, step]);

  // Load default address details if user is logged in
  useEffect(() => {
    const loadAddress = async () => {
      if (!user) return;
      try {
        const res = await api.get("/addresses/");
        if (res.data && res.data.length > 0) {
          const addr = res.data.find((a: any) => a.is_default) || res.data[0];
          setFullName(addr.full_name);
          setAddress1(addr.address_line1);
          setAddress2(addr.address_line2 || "");
          setCity(addr.city);
          setState(addr.state);
          setZip(addr.postal_code);
          setPhone(addr.phone);
          setCreatedAddressId(addr.id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadAddress();
  }, [user]);

  // Update total based on shipping method selection
  useEffect(() => {
    let nextShipping = shippingFee;
    if (shippingMethod === "express") {
      nextShipping = 300;
    }
    setCalculatedShipping(nextShipping);
    setCalculatedTotal(cartSubtotal - discountAmount + nextShipping);
  }, [shippingMethod, cartSubtotal, discountAmount, shippingFee]);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login or create an account to complete checkout.");
      router.push("/login?redirect=checkout");
      return;
    }
    
    // Save Address if not already saved
    if (!createdAddressId) {
      try {
        const res = await api.post("/addresses/", {
          full_name: fullName,
          address_line1: address1,
          address_line2: address2,
          city,
          state,
          postal_code: zip,
          country: "India",
          phone,
          address_type: "shipping",
          is_default: true
        });
        setCreatedAddressId(res.data.id);
      } catch (err) {
        console.error("Address save error:", err);
      }
    }
    setStep(2);
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setUploading(true);
    
    // Create FormData and upload
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/orders/upload-receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setScreenshotUrl(res.data.url);
    } catch (err) {
      console.error(err);
      // Fallback local mockup path
      setScreenshotUrl("/static/receipt-placeholder.png");
    } finally {
      setUploading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 6) {
      alert("Please enter a valid UPI Transaction UTR Reference number.");
      return;
    }
    setPlacingOrder(true);
    
    try {
      const checkoutPayload = {
        shipping_address_id: createdAddressId,
        billing_address_id: createdAddressId,
        coupon_code: coupon ? coupon.code : null,
        gift_note: giftNote || null,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          product_variant_id: item.variant ? item.variant.id : null,
          quantity: item.quantity
        })),
        transaction_id: utrNumber,
        screenshot_url: screenshotUrl || null
      };

      const res = await api.post("/orders/checkout", checkoutPayload);
      setPlacedOrderId(res.data.id);
      clearCart();
      setStep(4);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to process checkout. Please verify inventory.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Copy UPI ID helper
  const handleCopyUPI = () => {
    navigator.clipboard.writeText("familycrochet@upibank");
    alert("UPI ID copied to clipboard!");
  };

  // Generate UPI URI for QR Code (India Standard)
  const upiId = "familycrochet@upibank";
  const payeeName = "LAura Crochet Atelier";
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${calculatedTotal}&cu=INR&tn=OrderPayment`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-32 pb-20 flex-1 flex flex-col lg:flex-row gap-12">
        {/* Checkout Wizard Form container */}
        <div className="flex-1 space-y-8">
          
          {/* Header steps tracker */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60">
            <span className={step === 1 ? "text-brand-sage font-bold" : ""}>Shipping Address</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className={step === 2 ? "text-brand-sage font-bold" : ""}>Delivery Options</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className={step === 3 ? "text-brand-sage font-bold" : ""}>UPI Payment</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className={step === 4 ? "text-brand-sage font-bold" : ""}>Confirmation</span>
          </div>

          {/* STEP 1: Address form */}
          {step === 1 && (
            <div className="bg-brand-cream/20 p-6 md:p-8 rounded-2xl border border-brand-cream space-y-6">
              <h2 className="font-serif text-xl font-bold text-brand-charcoal">Shipping Information</h2>
              <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient Name"
                    className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Address Line 1</label>
                  <input
                    type="text"
                    required
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="House No, Apartment, Street"
                    className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="Landmark, Area"
                    className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Postal Code (ZIP)</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="Pin Code"
                    className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                  />
                </div>
                
                <button
                  type="submit"
                  className="md:col-span-2 bg-brand-sage hover:bg-brand-sage/95 text-brand-white py-3.5 rounded-full text-xs uppercase tracking-wider font-bold hover-lift text-center mt-4"
                >
                  Continue to Delivery options
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Delivery Options */}
          {step === 2 && (
            <div className="bg-brand-cream/20 p-6 md:p-8 rounded-2xl border border-brand-cream space-y-6">
              <h2 className="font-serif text-xl font-bold text-brand-charcoal">Delivery Speed Selection</h2>
              <form onSubmit={handleDeliverySubmit} className="space-y-4">
                <label className="flex gap-4 p-4 bg-brand-white border rounded-2xl cursor-pointer select-none items-center justify-between border-brand-sage">
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      name="shipping_speed"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="accent-brand-sage w-4 h-4"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-brand-charcoal">Standard Handcrafted Delivery</h3>
                      <p className="text-[10px] text-brand-charcoal/50">Delivered within 3-5 business days</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-charcoal">
                    {cartSubtotal >= 2000 ? "Free" : "INR 150.00"}
                  </span>
                </label>

                <label className="flex gap-4 p-4 bg-brand-white border rounded-2xl cursor-pointer select-none items-center justify-between border-brand-gold/30 hover:border-brand-sage/50">
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      name="shipping_speed"
                      value="express"
                      checked={shippingMethod === "express"}
                      onChange={() => setShippingMethod("express")}
                      className="accent-brand-sage w-4 h-4"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-brand-charcoal">Express Artisan Priority</h3>
                      <p className="text-[10px] text-brand-charcoal/50">Packed & shipped immediately. Delivery in 1-2 days</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-charcoal">INR 300.00</span>
                </label>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-brand-cream hover:bg-brand-cream/80 text-brand-charcoal py-3.5 rounded-full text-xs uppercase tracking-wider font-bold text-center border border-brand-gold/15"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-sage hover:bg-brand-sage/95 text-brand-white py-3.5 rounded-full text-xs uppercase tracking-wider font-bold hover-lift text-center"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: UPI QR Payment Verification */}
          {step === 3 && (
            <div className="bg-brand-cream/20 p-6 md:p-8 rounded-2xl border border-brand-cream space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-serif text-xl font-bold text-brand-charcoal">UPI Payment (Direct Bank Transfer)</h2>
                <p className="text-[10px] text-brand-gold uppercase tracking-wider font-bold">No checkout commission. Direct support to family artisans.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center justify-center bg-brand-white p-6 rounded-2xl border border-brand-cream">
                {/* QR Code */}
                <div className="bg-brand-cream/30 p-4 rounded-xl border border-brand-gold/25 flex flex-col items-center">
                  <img src={qrCodeUrl} alt="UPI Payment QR Code" className="w-40 h-40 object-contain rounded bg-white p-2" />
                  <span className="text-[9px] uppercase tracking-wider font-bold text-brand-charcoal/50 mt-2">Scan with any UPI App</span>
                </div>

                {/* Details */}
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-brand-charcoal/40 uppercase tracking-widest font-bold">Payee VPA ID:</span>
                    <div className="flex items-center gap-1 mt-1 font-semibold text-brand-charcoal">
                      <span>{upiId}</span>
                      <button onClick={handleCopyUPI} className="p-1 hover:bg-brand-cream rounded text-brand-sage" title="Copy UPI ID">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-brand-charcoal/40 uppercase tracking-widest font-bold">Amount to pay:</span>
                    <p className="text-base font-bold text-brand-charcoal">INR {calculatedTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Verification Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">UPI Transaction ID / 12-digit UTR Number</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter the 12-digit UTR reference code"
                    className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                  />
                </div>

                {/* Receipt image upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Upload Payment Screenshot (Optional)</label>
                  <div className="border border-dashed border-brand-gold/40 hover:border-brand-sage/60 rounded-xl p-4 bg-brand-white transition-all text-center relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <UploadCloud className="w-8 h-8 text-brand-sage/80" />
                      <span className="text-[10px] text-brand-charcoal/60">
                        {screenshotFile ? `Selected: ${screenshotFile.name}` : "Click or drag to upload transaction receipt image"}
                      </span>
                      {uploading && <span className="text-[9px] text-brand-gold font-medium animate-pulse">Uploading screenshot...</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-brand-cream hover:bg-brand-cream/80 text-brand-charcoal py-3.5 rounded-full text-xs uppercase tracking-wider font-bold text-center border border-brand-gold/15"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    disabled={placingOrder || uploading}
                    className="flex-1 bg-brand-sage hover:bg-brand-sage/95 text-brand-white py-3.5 rounded-full text-xs uppercase tracking-wider font-bold hover-lift text-center flex items-center justify-center gap-1.5"
                  >
                    {placingOrder ? "Processing..." : "Place Order & Pay"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: Success confirmation */}
          {step === 4 && (
            <div className="bg-brand-cream/20 p-8 md:p-12 rounded-3xl border border-brand-cream text-center space-y-6 max-w-xl mx-auto animate-zoom-in">
              <div className="w-16 h-16 bg-brand-sage/10 text-brand-sage rounded-full flex items-center justify-center mx-auto border border-brand-sage/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-charcoal">Your order is placed!</h2>
                <p className="text-xs uppercase tracking-wider font-bold text-brand-gold">Order Reference ID: #{placedOrderId?.slice(0,8)}</p>
              </div>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed max-w-sm mx-auto">
                Thank you! We received your UPI Transaction UTR reference. Our family artisans are verifying the statement transfer and will begin double-stitching your beautiful designs.
              </p>
              <div className="pt-4 flex flex-wrap gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="bg-brand-sage text-brand-white px-8 py-3 rounded-full text-xs uppercase tracking-wider font-semibold hover-lift"
                >
                  Track Order status
                </Link>
                <Link
                  href="/shop"
                  className="bg-brand-cream border border-brand-gold/20 text-brand-charcoal px-8 py-3 rounded-full text-xs uppercase tracking-wider font-semibold hover-lift"
                >
                  Keep Browsing
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Checkout basket summary sidebar */}
        {step !== 4 && (
          <aside className="w-full lg:w-96 space-y-6">
            <div className="bg-brand-cream/30 p-6 rounded-2xl border border-brand-cream space-y-4">
              <h3 className="font-serif text-sm font-semibold tracking-wide text-brand-charcoal">Basket Summary</h3>
              
              <div className="divide-y divide-brand-cream max-h-60 overflow-y-auto space-y-3 pr-2">
                {cartItems.map((item) => {
                  const price = item.variant?.price_override != null ? Number(item.variant.price_override) : Number(item.product.price);
                  return (
                    <div key={item.id} className="flex gap-3 py-3 items-center justify-between text-xs">
                      <div className="flex gap-2.5 items-center">
                        <img src={item.product.images?.[0]?.url} alt="" className="w-10 h-10 object-cover rounded" />
                        <div>
                          <h4 className="font-medium text-brand-charcoal truncate max-w-[140px]">{item.product.name}</h4>
                          {item.variant && <p className="text-[10px] text-brand-gold font-medium">{item.variant.name}</p>}
                          <p className="text-[10px] text-brand-charcoal/50">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-brand-charcoal">INR {price * item.quantity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Price Details */}
              <div className="space-y-2 text-xs text-brand-charcoal/80 border-t border-brand-cream pt-4">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span>INR {cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-brand-success font-medium">
                    <span>Promo Discount</span>
                    <span>- INR {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{calculatedShipping === 0 ? "Free Shipping" : `INR ${calculatedShipping.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-brand-cream pt-4">
                <span className="font-serif text-base font-semibold text-brand-charcoal">Total Amount</span>
                <span className="text-lg font-bold text-brand-charcoal">INR {calculatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Shield info */}
            <div className="bg-brand-cream/10 border border-brand-gold/15 p-4 rounded-xl flex items-start gap-2.5 text-[10px] text-brand-charcoal/60 leading-normal">
              <ShieldCheck className="w-5 h-5 text-brand-sage flex-shrink-0" />
              <div>
                <span className="font-bold text-brand-charcoal block mb-0.5">Secure Transaction Guarantee</span>
                Direct peer-to-peer UPI transfer is backed by official banking logs. Payments are cleared only after matching statement reference IDs.
              </div>
            </div>
          </aside>
        )}
      </main>

      <Footer />
    </div>
  );
}
