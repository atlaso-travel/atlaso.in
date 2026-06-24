"use client";

import { useState } from "react";
import { TrendingUp, Users, Star, ShieldCheck, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const BENEFITS = [
  {
    Icon: TrendingUp,
    title: "Reach 10,000+ Active Travelers",
    desc: "Travelers on Atlaso are actively comparing operators and ready to book. Your package appears when they search your destinations.",
  },
  {
    Icon: Star,
    title: "Build Your Reputation",
    desc: "Collect verified reviews from real customers. High ratings = more visibility in search results.",
  },
  {
    Icon: Users,
    title: "No Commission on First 10 Bookings",
    desc: "Get started for free. We believe in proving value before charging for it.",
  },
  {
    Icon: ShieldCheck,
    title: "Verified Operator Badge",
    desc: "After a simple verification process, earn a badge that increases traveler trust and click-through rates by 40%.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    desc: "Perfect for getting started",
    features: ["List up to 3 packages", "Basic profile page", "Verified badge eligible", "Email support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₹2,999",
    period: "/month",
    desc: "For growing operators",
    features: [
      "Unlimited packages",
      "Priority search ranking",
      "Analytics dashboard",
      "Featured in Top Operators",
      "WhatsApp support",
    ],
    cta: "Start Growth Plan",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "₹7,999",
    period: "/month",
    desc: "For established operators",
    features: [
      "Everything in Growth",
      "Homepage featured placement",
      "Custom landing page",
      "Dedicated account manager",
      "API integration",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const INPUT_CLS =
  "w-full border border-map-border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-map-text focus:border-compass-blue";

export default function OperatorsPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    destinations: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thanks! We'll get back to you within 24 hours.");
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="py-20 text-center relative overflow-hidden bg-atlas-night">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,90,95,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight font-display">
            Grow with Atlaso
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto font-body">
            List your packages. Reach 10,000+ comparison-ready travelers. Get booked on merit, not ad spend.
          </p>
          <a
            href="#apply"
            className="inline-block bg-compass-blue text-white font-bold px-8 py-3.5 rounded-full transition-all hover:scale-105 hover:opacity-90 shadow-lg"
          >
            Apply to List Free
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-map-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-map-text font-display">
            Why list on Atlaso?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-6 border border-map-border bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-compass-light">
                  <Icon size={24} className="text-compass-blue" />
                </div>
                <h3 className="font-bold mb-2 text-map-text font-display">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-map-muted font-body">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-compass-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-map-text font-display">
            Simple, transparent pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "rounded-2xl p-7",
                  plan.highlighted
                    ? "bg-compass-blue shadow-xl scale-105"
                    : "bg-white border border-map-border"
                )}
              >
                <h3
                  className={cn(
                    "font-bold text-lg mb-1 font-display",
                    plan.highlighted ? "text-white" : "text-map-text"
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "text-sm mb-4 font-body",
                    plan.highlighted ? "text-white/70" : "text-map-muted"
                  )}
                >
                  {plan.desc}
                </p>
                <div className="mb-6">
                  <span
                    className={cn(
                      "text-4xl font-black font-display",
                      plan.highlighted ? "text-white" : "text-compass-blue"
                    )}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={cn(
                        "text-sm font-body",
                        plan.highlighted ? "text-white/70" : "text-map-muted"
                      )}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check
                        size={14}
                        className={plan.highlighted ? "text-white" : "text-compass-blue"}
                      />
                      <span
                        className={plan.highlighted ? "text-white/90" : "text-map-text"}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#apply"
                  className={cn(
                    "block w-full py-3 rounded-xl text-sm font-bold text-center transition-all hover:opacity-90",
                    plan.highlighted
                      ? "bg-white text-compass-blue"
                      : "bg-compass-light text-compass-blue"
                  )}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="apply" className="py-20 bg-map-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-map-text font-display">
              Apply to List Your Packages
            </h2>
            <p className="text-map-muted font-body">
              We&apos;ll review your application and get back within 24 hours.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-8 space-y-5 border border-map-border bg-white"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-map-text">
                  Your Name *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={INPUT_CLS}
                  placeholder="Rajesh Kumar"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-map-text">
                  Company Name *
                </label>
                <input
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={INPUT_CLS}
                  placeholder="Adventure Trails Co"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-map-text">
                  Email *
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={INPUT_CLS}
                  placeholder="rajesh@adventure.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-map-text">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={INPUT_CLS}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-map-text">
                Destinations you cover *
              </label>
              <input
                required
                value={formData.destinations}
                onChange={(e) => setFormData({ ...formData, destinations: e.target.value })}
                className={INPUT_CLS}
                placeholder="Spiti Valley, Ladakh, Rishikesh..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-map-text">
                Tell us about your business
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`${INPUT_CLS} resize-none`}
                placeholder="Years in operation, team size, specialties..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-compass-blue text-white font-bold py-3.5 rounded-xl transition-all text-base hover:opacity-90"
            >
              Submit Application
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
