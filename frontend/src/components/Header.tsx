"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Heart, User, Menu, X, Search, Sparkles, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import CartSidebar from "./CartSidebar";

export default function Header() {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Monitor scrolling to add sticky effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { label: "Boutique Shop", href: "/shop" },
    { label: "Our Story", href: "/about" },
    { label: "Bespoke Requests", href: "/custom-order" },
    { label: "Get In Touch", href: "/contact" }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? "bg-brand-white/80 backdrop-blur-md py-3 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border-b border-brand-cream/60"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1 text-brand-charcoal hover:text-brand-sage transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-[0.2em] text-brand-charcoal hover:opacity-85 transition-opacity flex items-center gap-1.5"
          >
            L&apos;AURA
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-brand-charcoal/70">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-brand-charcoal transition-colors relative py-1 ${
                    isActive ? "text-brand-charcoal font-bold" : ""
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-sage rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            {/* Search link */}
            <Link
              href="/shop"
              className="p-1.5 text-brand-charcoal/80 hover:text-brand-sage transition-colors"
              title="Search Catalog"
            >
              <Search className="w-4.5 h-4.5" />
            </Link>

            {/* Wishlist */}
            <Link
              href="/dashboard/wishlist"
              className="p-1.5 text-brand-charcoal/80 hover:text-brand-sage transition-colors relative"
              title="Your Wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-gold text-brand-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-brand-charcoal/80 hover:text-brand-sage transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-sage text-brand-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Auth Profile */}
            {user ? (
              <div className="relative group flex items-center gap-2">
                <Link
                  href={user.role === "Admin" ? "/admin" : "/dashboard"}
                  className="p-1.5 text-brand-charcoal/80 hover:text-brand-sage transition-colors flex items-center gap-1"
                  title="Your Account"
                >
                  <User className="w-4.5 h-4.5" />
                  <span className="hidden lg:inline text-[10px] uppercase font-semibold tracking-wider">
                    {user.full_name.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="hidden group-hover:flex absolute top-8 right-0 bg-brand-white border border-brand-cream/60 py-1.5 px-3 rounded-lg shadow-md items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold hover:text-brand-error text-brand-charcoal/80 whitespace-nowrap z-50 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="p-1.5 text-brand-charcoal/80 hover:text-brand-sage transition-colors"
                title="Login"
              >
                <User className="w-4.5 h-4.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-brand-white z-50 flex flex-col p-6 animate-fade-in md:hidden">
            <div className="flex justify-between items-center mb-10">
              <span className="font-serif text-xl font-bold tracking-[0.2em] text-brand-charcoal">
                L&apos;AURA
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 hover:bg-brand-cream rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-brand-charcoal" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 text-base font-serif font-medium text-brand-charcoal">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border-b border-brand-cream pb-3 hover:text-brand-sage transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Link
                  href={user.role === "Admin" ? "/admin" : "/dashboard"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border-b border-brand-cream pb-3 text-brand-sage flex items-center gap-1.5"
                >
                  <User className="w-5 h-5" />
                  Account Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border-b border-brand-cream pb-3 text-brand-sage flex items-center gap-1.5"
                >
                  <User className="w-5 h-5" />
                  Login / Register
                </Link>
              )}
            </nav>

            <div className="mt-auto border-t border-brand-cream pt-6 text-center space-y-2">
              <p className="text-xs text-brand-charcoal/50">Handcrafted with care by our family</p>
              <div className="flex justify-center gap-1 text-[10px] uppercase font-bold tracking-widest text-brand-gold">
                <Sparkles className="w-3.5 h-3.5" />
                Pure Cotton & Mohair Yarn
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
