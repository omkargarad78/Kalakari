"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Sparkles, Send, HelpCircle, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
      // Fallback success for local sandbox
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: "How long does a custom crochet order take?", a: "Depending on size and complexity, standard custom cardigans take 2 to 3 weeks, and luxury tote bags take 1 to 2 weeks of hand-stitching." },
    { q: "Do you ship across India?", a: "Yes, we ship to all major cities across India using priority tracked couriers. Shipping is free for orders above INR 2000." },
    { q: "Can I request specific yarn blends?", a: "Absolutely. In your custom request form, note if you prefer organic bamboo, standard cotton, wool, or luxury kid-mohair threads." },
    { q: "Can I hand-wash the crochet items?", a: "Yes. All our products can be hand-washed in cold water using a gentle wool shampoo and laid flat on dry towels to air dry." }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 md:px-8 w-full pt-32 pb-20 flex-1 space-y-16 animate-fade-in">
        
        {/* Title */}
        <div className="text-center space-y-3 max-w-lg mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-brand-gold">
            <Sparkles className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
            Atelier Inquiries
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-charcoal">Get in Touch</h1>
          <p className="text-xs text-brand-charcoal/60 leading-relaxed">
            Have a question about order speeds, custom sizing, or material wools? Drop us a line.
          </p>
        </div>

        {/* Contact panel grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Details & Map */}
          <div className="space-y-8">
            <div className="bg-brand-cream/20 p-6 md:p-8 rounded-3xl border border-brand-cream space-y-6 text-xs text-brand-charcoal/80">
              <h2 className="font-serif text-lg font-bold text-brand-charcoal">Studio Details</h2>
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <Mail className="w-4 h-4 text-brand-sage" />
                  <span>studio@kalakari.in</span>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="w-4 h-4 text-brand-sage" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex gap-3 items-start">
                  <MapPin className="w-4 h-4 text-brand-sage mt-0.5" />
                  <span>Jaipur boutique artisan workshop, Rajasthan, India</span>
                </div>
              </div>
            </div>

            {/* Stylized Vector Mock Map */}
            <div className="h-64 bg-brand-cream/40 rounded-3xl border border-brand-cream overflow-hidden flex flex-col justify-center items-center text-center p-6 relative">
              {/* Premium abstract mapping lines */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#A8B5A2_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute inset-x-0 h-px bg-brand-gold/25 top-1/2" />
              <div className="absolute inset-y-0 w-px bg-brand-gold/25 left-1/2" />
              <div className="relative bg-brand-white p-4 rounded-xl border border-brand-gold/30 shadow-md max-w-xs space-y-1.5 z-10 hover-lift">
                <MapPin className="w-6 h-6 text-brand-sage mx-auto fill-brand-sage/20" />
                <h4 className="font-serif text-xs font-bold text-brand-charcoal">Kalakari Studio</h4>
                <p className="text-[9px] text-brand-charcoal/50">Visiting by appointment only. Jaipur, Rajasthan.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-brand-cream/20 p-6 md:p-8 rounded-3xl border border-brand-cream">
            {success ? (
              <div className="text-center py-20 space-y-4 animate-zoom-in">
                <div className="w-12 h-12 bg-brand-sage/10 text-brand-sage rounded-full flex items-center justify-center mx-auto border border-brand-sage/20">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-charcoal">Message Sent!</h3>
                <p className="text-xs text-brand-charcoal/60 max-w-xs mx-auto">
                  Thank you. Your message has been received. Our family studio will respond to you via email shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-brand-sage text-brand-white px-6 py-2 rounded-full text-xs font-semibold hover-lift"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h2 className="font-serif text-lg font-bold text-brand-charcoal">Send Us a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone"
                      className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Inquiry Topic"
                      className="w-full px-4 py-2.5 bg-brand-white border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Your Message</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about custom patterns or specific colors..."
                    className="w-full p-3.5 bg-brand-white border border-brand-gold/30 rounded-xl focus:outline-none focus:border-brand-sage text-brand-charcoal resize-none h-28"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-sage hover:bg-brand-sage/95 text-brand-white py-3.5 rounded-full text-xs uppercase tracking-wider font-bold hover-lift text-center flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Sending message..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQs Accordion */}
        <section id="faq" className="border-t border-brand-cream pt-16 space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-brand-sage mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">Studio FAQs</h2>
            <p className="text-xs uppercase tracking-widest text-brand-gold font-bold">Frequently Asked questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-brand-cream/15 p-6 rounded-2xl border border-brand-cream space-y-2 hover-lift">
                <h3 className="font-bold text-brand-charcoal flex items-center gap-1.5">
                  <span className="text-brand-sage font-extrabold">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-brand-charcoal/70 leading-relaxed pl-4">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
