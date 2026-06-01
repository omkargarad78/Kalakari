"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlist: string[]; // List of product IDs
  wishlistProducts: any[];
  toggleWishlist: (product: any) => Promise<void>;
  isWishlisted: (productId: str) => boolean;
  loadWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

  const loadWishlist = async () => {
    if (!user) {
      setWishlist([]);
      setWishlistProducts([]);
      return;
    }
    try {
      const response = await api.get("/wishlist/");
      const items = response.data;
      setWishlist(items.map((i: any) => i.product_id));
      setWishlistProducts(items.map((i: any) => i.product));
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const toggleWishlist = async (product: any) => {
    if (!user) {
      alert("Please login to save items to your wishlist.");
      return;
    }
    const productId = product.id;
    const exists = wishlist.includes(productId);
    
    // Optimistic Update
    if (exists) {
      setWishlist(wishlist.filter((id) => id !== productId));
      setWishlistProducts(wishlistProducts.filter((p) => p.id !== productId));
      try {
        await api.delete(`/wishlist/${productId}`);
      } catch (error) {
        console.error("Failed to remove from wishlist:", error);
        // rollback
        loadWishlist();
      }
    } else {
      setWishlist([...wishlist, productId]);
      setWishlistProducts([...wishlistProducts, product]);
      try {
        await api.post("/wishlist/", { product_id: productId });
      } catch (error) {
        console.error("Failed to add to wishlist:", error);
        // rollback
        loadWishlist();
      }
    }
  };

  const isWishlisted = (productId: str) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistProducts, toggleWishlist, isWishlisted, loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
