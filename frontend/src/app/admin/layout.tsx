"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BarChart3, Package, ShieldCheck, Landmark, LogOut, Loader2, Home, Hammer, Tags } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "Admin")) {
      router.push("/login?redirect=admin");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-sage" />
      </div>
    );
  }

  if (!user || user.role !== "Admin") {
    return (
      <div className="min-h-screen bg-brand-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-brand-error" />
        <h1 className="font-serif text-xl font-bold text-brand-charcoal">Access Denied</h1>
        <p className="text-xs text-brand-charcoal/60 max-w-xs">You must be logged in as an administrator to access the workshop dashboard.</p>
        <Link href="/login" className="bg-brand-sage text-brand-white px-6 py-2.5 rounded-full text-xs font-semibold hover-lift">
          Go to Login
        </Link>
      </div>
    );
  }

  const sidebarLinks = [
    { label: "Overview Stats", href: "/admin", icon: BarChart3 },
    { label: "Category Manager", href: "/admin/categories", icon: Tags },
    { label: "Product Manager", href: "/admin/products", icon: Package },
    { label: "Order Manager", href: "/admin/orders", icon: Landmark },
    { label: "Custom Projects", href: "/admin/custom-requests", icon: Hammer }
  ];

  return (
    <div className="min-h-screen flex bg-brand-white text-brand-charcoal">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-brand-cream/30 border-r border-brand-cream flex flex-col flex-shrink-0">
        {/* Logo Banner */}
        <div className="p-6 border-b border-brand-cream text-center">
          <span className="text-[9px] uppercase font-bold tracking-widest text-brand-gold block">Artisan Workshop</span>
          <h2 className="font-serif text-lg font-bold text-brand-charcoal tracking-[0.15em] mt-1">KALAKARI ADMIN</h2>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-1.5 text-xs font-semibold uppercase tracking-wider text-brand-charcoal/70">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-cream hover:text-brand-charcoal transition-all"
              >
                <Icon className="w-4 h-4 text-brand-sage" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-brand-cream space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-brand-cream text-xs font-semibold uppercase tracking-wider text-brand-charcoal/75 transition-colors"
          >
            <Home className="w-4 h-4 text-brand-sage" />
            <span>Store Front</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-brand-error/10 text-xs font-semibold uppercase tracking-wider text-brand-charcoal/75 hover:text-brand-error transition-colors"
          >
            <LogOut className="w-4 h-4 text-brand-sage" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow flex flex-col min-w-0 bg-brand-white p-8 md:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
