"use client";

import Link from "next/link";
import { CheckCircle2, Star, Send } from "lucide-react";
import { useInView } from "@/hooks/useIntersectionObserver";

const STATS = [
  { Icon: CheckCircle2, value: "100+", label: "Verified Operators"  },
  { Icon: Star,         value: "4.8★", label: "Avg.Traveler Rating" },
  { Icon: Send,         value: "10k+", label: "Trips Compared"      },
];

// prefix = non-bold text before the bold word; rest = text after
const FEATURES = [
  {
    prefix: "",
    bold:   "Compare",
    rest:   " Operators Side-by-Side",
    desc:   "View pricing, inclusions, stay details, ratings, and cancellation policies together in one transparent comparison view.",
  },
  {
    prefix: "",
    bold:   "Handpicked",
    rest:   " & Verified Operators",
    desc:   "We carefully curate operators based on traveler experience, service quality, transparency, and reliability — not just popularity.",
  },
  {
    prefix: "Book What Fits ",
    bold:   "You",
    rest:   " Best",
    desc:   "Whether you prefer budget adventures, luxury escapes, backpacking trips, or curated experiences — Atlaso helps you choose confidently.",
  },
];

export default function WhyAtlaso() {
  const { ref, inView } = useInView(0.12);

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FFF0F8 0%, #F8F0FF 50%, #F0F4FF 100%)" }}
    >
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* ── Left column ── */}
          <div>

            {/* Label */}
            <p
              className={`text-rose-pink text-sm font-semibold mb-4 font-body transition-all duration-500 ease-out ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              Why Atlaso?
            </p>

            {/* Heading line 1 */}
            <h2
              className={`font-display font-black text-4xl md:text-5xl text-map-text leading-tight mb-2 transition-all duration-500 ease-out delay-100 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              We don&apos;t list every operator.
            </h2>

            {/* Heading line 2 — pink → purple gradient */}
            <h2
              className={`font-display font-black text-4xl md:text-5xl leading-tight mb-6 transition-all duration-500 ease-out delay-200 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                background: "linear-gradient(90deg, #E91E63 0%, #AB47BC 55%, #7E57C2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              We shortlist the right ones.
            </h2>

            {/* Description */}
            <p
              className={`text-map-muted text-base font-body leading-relaxed mb-8 max-w-md transition-all duration-500 ease-out delay-300 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              Atlaso removes the confusion from trip planning by bringing trusted tour
              operators, transparent pricing, and real traveler insights together — so you
              can focus on the journey, not the stress.
            </p>

            {/* Stats */}
            <div className="flex gap-4 flex-wrap">
              {STATS.map(({ Icon, value, label }, i) => (
                <div
                  key={label}
                  className={`bg-white rounded-2xl px-5 py-4 shadow-sm border border-rose-pink/10 min-w-[105px] flex flex-col items-center transition-all duration-500 ease-out ${
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: inView ? `${400 + i * 100}ms` : "0ms" }}
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-light flex items-center justify-center mb-2">
                    <Icon size={17} className="text-rose-pink" />
                  </div>
                  <p className="font-display font-black text-2xl text-rose-pink">{value}</p>
                  <p className="text-map-muted text-[11px] font-body mt-1 leading-tight text-center">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="relative pl-0 md:pl-10 flex flex-col">
            {/* Vertical accent line */}
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-0.5 bg-rose-pink/30 rounded-full" />

            {/* Feature list */}
            <div className="flex flex-col divide-y divide-rose-pink/10 flex-1">
              {FEATURES.map(({ prefix, bold, rest, desc }, i) => (
                <div
                  key={bold}
                  className={`py-7 ${i === 0 ? "pt-0" : ""} transition-all duration-500 ease-out ${
                    inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                  }`}
                  style={{ transitionDelay: inView ? `${200 + i * 160}ms` : "0ms" }}
                >
                  <h3 className={`font-display text-xl mb-2 ${i === 0 ? "text-map-text" : "text-map-muted"}`}>
                    {prefix && <span className="font-semibold">{prefix}</span>}
                    <span className="font-black">{bold}</span>
                    <span className="font-semibold">{rest}</span>
                  </h3>
                  <p className={`text-sm font-body leading-relaxed ${i === 0 ? "text-map-muted" : "text-map-muted/60"}`}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              className={`mt-8 transition-all duration-500 ease-out ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: inView ? "680ms" : "0ms" }}
            >
              <Link
                href="/search"
                className="flex items-center justify-center w-full bg-rose-pink text-white font-semibold text-sm px-6 py-4 rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Search Destination &amp; Compare Operators
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
