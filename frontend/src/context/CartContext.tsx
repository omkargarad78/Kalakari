"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

export interface CartItem {
  id: string; // Combined key: product.id + (variant?.id || "")
  product: any;
  variant: any | null;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, variant: any | null, quantity?: number) => void;
  updateQuantity: (itemId: str, quantity: number) => void;
  removeFromCart: (itemId: str) => void;
  clearCart: () => void;
  coupon: any | null;
  couponCodeInput: string;
  setCouponCodeInput: (code: str) => void;
  applyCoupon: (code: str) => Promise<string>;
  removeCoupon: () => void;
  giftNote: string;
  setGiftNote: (note: str) => void;
  saveForLater: CartItem[];
  moveToSaveForLater: (itemId: str) => void;
  moveToCart: (itemId: str) => void;
  removeFromSaveForLater: (itemId: str) => void;
  cartSubtotal: number;
  discountAmount: number;
  shippingFee: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [saveForLater, setSaveForLater] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<any>(null);
  const [couponCodeInput, setCouponCodeInput] = useState<string>("");
  const [giftNote, setGiftNote] = useState<string>("");

  // Load from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) setCartItems(JSON.parse(storedCart));
      
      const storedSave = localStorage.getItem("save_for_later");
      if (storedSave) setSaveForLater(JSON.parse(storedSave));
      
      const storedCoupon = localStorage.getItem("applied_coupon");
      if (storedCoupon) setCoupon(JSON.parse(storedCoupon));

      const storedNote = localStorage.getItem("gift_note");
      if (storedNote) setGiftNote(storedNote);
    }
  }, []);

  // Save to local storage
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const saveLaterList = (items: CartItem[]) => {
    setSaveForLater(items);
    localStorage.setItem("save_for_later", JSON.stringify(items));
  };

  const addToCart = (product: any, variant: any | null, quantity: number = 1) => {
    const id = product.id + (variant ? `-${variant.id}` : "");
    const updated = [...cartItems];
    const index = updated.findIndex((item) => item.id === id);

    if (index > -1) {
      updated[index].quantity += quantity;
    } else {
      updated.push({ id, product, variant, quantity });
    }
    saveCart(updated);
  };

  const updateQuantity = (itemId: str, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const updated = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const removeFromCart = (itemId: str) => {
    const updated = cartItems.filter((item) => item.id !== itemId);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    removeCoupon();
    setGiftNote("");
    localStorage.removeItem("gift_note");
  };

  const applyCoupon = async (code: str): Promise<string> => {
    try {
      const response = await api.get(`/orders/coupons/validate/${code.trim().toUpperCase()}`);
      const couponData = response.data;
      setCoupon(couponData);
      localStorage.setItem("applied_coupon", JSON.stringify(couponData));
      return `Coupon applied successfully! You got a discount.`;
    } catch (error: any) {
      removeCoupon();
      throw new Error(error.response?.data?.detail || "Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCodeInput("");
    localStorage.removeItem("applied_coupon");
  };

  const updateGiftNote = (note: str) => {
    setGiftNote(note);
    localStorage.setItem("gift_note", note);
  };

  // Save for later workflows
  const moveToSaveForLater = (itemId: str) => {
    const itemToMove = cartItems.find((i) => i.id === itemId);
    if (!itemToMove) return;
    
    // Add to save list
    const updatedSave = [...saveForLater];
    if (!updatedSave.some((i) => i.id === itemId)) {
      updatedSave.push(itemToMove);
      saveLaterList(updatedSave);
    }
    
    // Remove from cart
    removeFromCart(itemId);
  };

  const moveToCart = (itemId: str) => {
    const itemToMove = saveForLater.find((i) => i.id === itemId);
    if (!itemToMove) return;

    addToCart(itemToMove.product, itemToMove.variant, itemToMove.quantity);
    removeFromSaveForLater(itemId);
  };

  const removeFromSaveForLater = (itemId: str) => {
    const updated = saveForLater.filter((i) => i.id !== itemId);
    saveLaterList(updated);
  };

  // Totals calculations
  const cartSubtotal = cartItems.reduce((sum, item) => {
    const price = item.variant?.price_override != null ? Number(item.variant.price_override) : Number(item.product.price);
    return sum + price * item.quantity;
  }, 0);

  let discountAmount = 0;
  let isFreeShippingCoupon = false;

  if (coupon && cartSubtotal >= Number(coupon.min_purchase_amount)) {
    if (coupon.discount_type === "Percentage") {
      discountAmount = cartSubtotal * (Number(coupon.value) / 100);
    } else if (coupon.discount_type === "Fixed") {
      discountAmount = Number(coupon.value);
    } else if (coupon.discount_type === "Free_Shipping") {
      isFreeShippingCoupon = true;
    }
  }

  // standard free shipping over 2000 INR
  const shippingFee = (cartSubtotal >= 2000 || cartSubtotal === 0 || isFreeShippingCoupon) ? 0 : 150;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        coupon,
        couponCodeInput,
        setCouponCodeInput,
        applyCoupon,
        removeCoupon,
        giftNote,
        setGiftNote: updateGiftNote,
        saveForLater,
        moveToSaveForLater,
        moveToCart,
        removeFromSaveForLater,
        cartSubtotal,
        discountAmount,
        shippingFee,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
