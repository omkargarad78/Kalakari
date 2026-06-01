"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Trash2, Plus, Minus, Gift, Tag, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    coupon,
    couponCodeInput,
    setCouponCodeInput,
    applyCoupon,
    removeCoupon,
    giftNote,
    setGiftNote,
    saveForLater,
    moveToCart,
    moveToSaveForLater,
    removeFromSaveForLater,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
  } = useCart();

  const [couponError, setCouponError] = useState<string>("");
  const [couponSuccess, setCouponSuccess] = useState<string>("");
  const [showGiftInput, setShowGiftInput] = useState<boolean>(!!giftNote);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponError("");
    setCouponSuccess("");
    try {
      const msg = await applyCoupon(couponCodeInput);
      setCouponSuccess(msg);
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-white shadow-2xl z-50 flex flex-col h-full border-l border-brand-gold/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-cream flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-sage" />
                <h2 className="font-serif text-xl font-semibold tracking-wide text-brand-charcoal">Your Basket</h2>
                <span className="text-xs bg-brand-cream text-brand-sage px-2 py-0.5 rounded-full font-medium">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-brand-cream rounded-full transition-colors text-brand-charcoal/60 hover:text-brand-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center text-brand-sage">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-lg text-brand-charcoal/80">Your basket is empty</h3>
                  <p className="text-sm text-brand-charcoal/60 max-w-xs">
                    Fill it with our beautiful premium handmade crochet designs.
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="mt-2 inline-flex items-center gap-2 bg-brand-sage text-brand-white px-6 py-2 rounded-full font-medium hover:bg-brand-sage/90 transition-colors hover-lift"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const price = item.variant?.price_override != null ? Number(item.variant.price_override) : Number(item.product.price);
                    const image = item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=200";

                    return (
                      <div key={item.id} className="flex gap-4 p-3 bg-brand-cream/40 rounded-xl border border-brand-cream/60">
                        {/* Image */}
                        <div className="w-20 h-20 bg-brand-cream rounded-lg overflow-hidden relative flex-shrink-0">
                          <img
                            src={image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-medium text-sm text-brand-charcoal line-clamp-1">{item.product.name}</h4>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-brand-charcoal/40 hover:text-brand-error p-0.5 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {item.variant && (
                              <p className="text-xs text-brand-gold font-medium mt-0.5">{item.variant.name}</p>
                            )}
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-brand-gold/30 rounded-full overflow-hidden bg-brand-white">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-brand-cream text-brand-charcoal/60 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-semibold text-brand-charcoal w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-brand-cream text-brand-charcoal/60 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-sm font-semibold text-brand-charcoal">INR {price * item.quantity}</p>
                              <button
                                onClick={() => moveToSaveForLater(item.id)}
                                className="text-[10px] text-brand-sage underline hover:text-brand-sage/80 block mt-0.5"
                              >
                                Save for later
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Save For Later Section */}
              {saveForLater.length > 0 && (
                <div className="border-t border-brand-cream pt-6">
                  <h3 className="font-serif text-sm font-semibold text-brand-charcoal/80 mb-3 tracking-wide">
                    Saved For Later ({saveForLater.length})
                  </h3>
                  <div className="space-y-3">
                    {saveForLater.map((item) => {
                      const image = item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=200";
                      const price = item.variant?.price_override != null ? Number(item.variant.price_override) : Number(item.product.price);
                      return (
                        <div key={item.id} className="flex gap-3 p-2 bg-brand-white rounded-lg border border-brand-cream items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <img src={image} alt={item.product.name} className="w-10 h-10 object-cover rounded" />
                            <div>
                              <h4 className="text-xs font-medium text-brand-charcoal line-clamp-1">{item.product.name}</h4>
                              <p className="text-[10px] text-brand-charcoal/60">INR {price}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => moveToCart(item.id)}
                              className="text-[10px] bg-brand-cream text-brand-sage px-2.5 py-1 rounded-full font-medium hover:bg-brand-sage hover:text-brand-white transition-all"
                            >
                              Move to Bag
                            </button>
                            <button
                              onClick={() => removeFromSaveForLater(item.id)}
                              className="text-brand-charcoal/40 hover:text-brand-error"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Gift Wrap Note */}
              {cartItems.length > 0 && (
                <div className="border-t border-brand-cream pt-4">
                  <button
                    onClick={() => setShowGiftInput(!showGiftInput)}
                    className="flex items-center gap-2 text-xs font-semibold text-brand-sage hover:text-brand-sage/80 transition-colors"
                  >
                    <Gift className="w-4 h-4" />
                    {showGiftInput ? "Remove gift message" : "Add a complimentary gift message?"}
                  </button>
                  {showGiftInput && (
                    <textarea
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Write a message to be hand-written on our custom-embossed cotton paper cards..."
                      className="mt-2 w-full p-3 bg-brand-cream/30 border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage/60 text-brand-charcoal resize-none h-20"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Checkout Actions Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-brand-cream/30 border-t border-brand-cream space-y-4">
                {/* Coupon Form */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-brand-charcoal/40" />
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      placeholder="Coupon Code"
                      className="w-full pl-9 pr-3 py-2 bg-brand-white border border-brand-gold/30 rounded-full text-xs uppercase tracking-wider focus:outline-none focus:border-brand-sage"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-sage text-brand-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-brand-sage/90 transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {couponError && <p className="text-[10px] text-brand-error font-medium px-2">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-brand-success font-medium px-2">{couponSuccess}</p>}

                {coupon && (
                  <div className="flex justify-between items-center bg-brand-sage/10 text-brand-sage px-3 py-1.5 rounded-full text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Promo: {coupon.code} (Saved {coupon.discount_type === "Percentage" ? `${coupon.value}%` : `INR ${coupon.value}`})
                    </span>
                    <button onClick={removeCoupon} className="hover:text-brand-error">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Pricing Details */}
                <div className="space-y-2 text-xs text-brand-charcoal/80 border-b border-brand-cream pb-3">
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
                    <span>{shippingFee === 0 ? "Free Shipping" : `INR ${shippingFee.toFixed(2)}`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-serif text-base font-semibold text-brand-charcoal">Total Amount</span>
                  <span className="text-lg font-bold text-brand-charcoal">INR {cartTotal.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-brand-sage text-brand-white py-3 rounded-full font-semibold hover:bg-brand-sage/90 transition-colors hover-lift text-sm tracking-wide"
                >
                  Secure Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
