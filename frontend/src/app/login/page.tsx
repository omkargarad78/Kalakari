"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [redirect, setRedirect] = useState("");

  const { login, register, user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setRedirect(params.get("redirect") || "");
  }, []);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === "Admin") {
        router.push("/admin");
      } else {
        router.push(redirect ? `/${redirect}` : "/dashboard");
      }
    }
  }, [user, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        // AuthContext automatically redirects on success
      } else {
        await register(email, password, fullName);
        setSuccess("Account created successfully! Please log in below.");
        setIsLogin(true);
        setPassword("");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-md mx-auto px-6 w-full pt-36 pb-20 flex-1 flex flex-col justify-center">
        <div className="bg-brand-cream/20 p-8 rounded-3xl border border-brand-gold/15 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-brand-sage tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
              Kalakari
            </span>
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-xs text-brand-charcoal/60">
              {isLogin ? "Log in to track orders & wishlists" : "Join us to request custom designs & slow fashion"}
            </p>
          </div>

          {error && (
            <div className="bg-brand-error/10 text-brand-error border border-brand-error/20 text-xs p-3.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-brand-success/10 text-brand-success border border-brand-success/20 text-xs p-3.5 rounded-xl font-medium">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-brand-charcoal/40" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-brand-charcoal/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-brand-charcoal/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl text-xs focus:outline-none focus:border-brand-sage"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-brand-charcoal/40 hover:text-brand-sage"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-sage hover:bg-brand-sage/95 text-brand-white py-3 rounded-full text-xs uppercase tracking-wider font-bold hover-lift text-center flex items-center justify-center"
            >
              {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center text-xs text-brand-charcoal/60 border-t border-brand-cream pt-4">
            {isLogin ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-brand-sage font-bold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-brand-sage font-bold hover:underline"
                >
                  Log In
                </button>
              </p>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
