"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowUpRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { destinations } from "@/data/destinations";
import { formatPrice } from "@/lib/utils";
import { useInView } from "@/hooks/useIntersectionObserver";

const COMPANY_LOGOS = [
  { name: "MakeMyTrip",      color: "#E91E63", bg: "#FFF0F5", abbr: "MMT"  },
  { name: "Yatra.com",       color: "#00A651", bg: "#F0FFF5", abbr: "YTR"  },
  { name: "Thrillophilia",   color: "#1565C0", bg: "#EFF4FD", abbr: "TH"   },
  { name: "India Hikes",     color: "#2E7D32", bg: "#F0FDF4", abbr: "IH"   },
  { name: "Cox & Kings",     color: "#B8860B", bg: "#FFFBEB", abbr: "C&K"  },
  { name: "Thomas Cook",     color: "#1A237E", bg: "#EEF2FF", abbr: "TC"   },
  { name: "SOTC Travel",     color: "#C62828", bg: "#FFF5F5", abbr: "SOTC" },
  { name: "Kesari Tours",    color: "#E65100", bg: "#FFF4ED", abbr: "KT"   },
  { name: "EaseMyTrip",      color: "#006064", bg: "#F0FDFD", abbr: "EMT"  },
  { name: "Spiti Ecosphere", color: "#6A1B9A", bg: "#F5F0FF", abbr: "SE"   },
  { name: "Club Mahindra",   color: "#D32F2F", bg: "#FFF5F5", abbr: "CM"   },
  { name: "OYO Rooms",       color: "#EE2A24", bg: "#FFF0F0", abbr: "OYO"  },
];

// Card fan geometry
const CARD_W = 280;
const CARD_H = 400;
const PEEK_WIDTHS = [48, 40, 32, 26];

// Precompute slot left offsets so the active card sits at x=0
// and each subsequent card peeks by PEEK_WIDTHS[i] pixels to the right.
const SLOT_LEFTS: number[] = (() => {
  const lefts = [0];
  let right = CARD_W;
  for (const peek of PEEK_WIDTHS) {
    right += peek;
    lefts.push(right - CARD_W);
  }
  return lefts;
})();

const CONTAINER_W = CARD_W + PEEK_WIDTHS.reduce((a, b) => a + b, 0); // 426

export default function TrendingDestinations() {
  const [activeCard, setActiveCard] = useState(0);
  const { ref: sectionRef, inView } = useInView(0.15);
  const visibleDests = destinations.slice(0, 5);

  // Auto-rotate cards every 3.5 s
  useEffect(() => {
    const timer = setInterval(
      () => setActiveCard((prev) => (prev + 1) % visibleDests.length),
      3500
    );
    return () => clearInterval(timer);
  }, [visibleDests.length]);

  return (

    <>
    <section className="relative w-full max-w-6xl mx-auto py-6 sm:py-12">
      <div className="flex items-center gap-6">
        <p className="text-xs text-map-muted font-body flex-shrink-0 max-w-[190px] leading-snug hidden sm:block">
          Partnering with trusted travel operators across India
        </p>

        <div className="relative flex-1 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="marquee-track" style={{ animationDuration: "30s" }}>
            {[...COMPANY_LOGOS, ...COMPANY_LOGOS].map((logo, i) => (
              <div
                key={i}
                className="flex-shrink-0 mx-3 flex items-center gap-2.5 px-4 py-2 rounded-xl border border-map-border bg-white shadow-card"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{
                    background: logo.bg,
                    color: logo.color,
                    border: `1.5px solid ${logo.color}30`,
                  }}
                >
                  {logo.abbr}
                </div>
                <span className="text-sm font-semibold text-map-text font-body whitespace-nowrap">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>




    {/* ── Main destinations section ── */}

    <section
      className="overflow-hidden"
      style={{ background: "linear-gradient(145deg,#ffffff 0%,#fff5f8 50%,#f3eeff 100%)" }}
    >
      <div ref={sectionRef} className="max-w-6xl mx-auto py-6 sm:py-12">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* Left: text content */}
          <div
            className={`flex-1 transition-all duration-700 ease-out ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <p className="text-rose-pink font-semibold text-xs font-body mb-3 tracking-widest uppercase">
              Explore
            </p>
            <h2 className="text-[3rem] sm:text-[3.5rem] font-black text-map-text leading-[1.05] font-display mb-5">
              Popular
              <br />
              Destinations
            </h2>
            <p className="text-map-muted font-body leading-relaxed mb-8 max-w-sm text-[0.9375rem]">
              Discover destinations, compare verified tour operators
              side-by-side, and book trips transparently —{" "}
              <strong className="text-map-text font-semibold">all in one place!</strong>
            </p>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 bg-rose-pink text-white font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              Explore all Destinations <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Right: stacked card fan */}
          <div
            className={`flex-1 flex flex-col items-center gap-5 transition-all duration-700 ease-out ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: inView ? "200ms" : "0ms" }}
          >
            {/* Card fan */}
            <div
              className="relative overflow-x-auto sm:overflow-visible pb-1 w-full"
              style={{ maxWidth: `${CONTAINER_W + 20}px` }}
            >
              <div
                className="relative mx-auto"
                style={{ width: `${CONTAINER_W}px`, height: `${CARD_H}px` }}
              >
                {visibleDests.map((dest, idx) => {
                  const slot =
                    (idx - activeCard + visibleDests.length) % visibleDests.length;
                  if (slot >= SLOT_LEFTS.length) return null;

                  const left = SLOT_LEFTS[slot];
                  const zIndex = 10 - slot;
                  const isActive = slot === 0;

                  return (
                    <button
                      key={dest.id}
                      onClick={() => setActiveCard(idx)}
                      className="absolute top-0 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-out focus:outline-none group/card"
                      style={{ left, width: CARD_W, height: CARD_H, zIndex }}
                    >
                      {/* Destination image */}
                      <Image
                        src={dest.image}
                        alt={dest.name}
                        fill
                        sizes="280px"
                        className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/15" />

                      {/* Active card details */}
                      {isActive && (
                        <>
                          {/* Rating badge */}
                          <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-map-text">4.2</span>
                          </div>

                          {/* Bottom content */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                            <h3 className="font-display font-black text-white text-2xl leading-tight mb-0.5">
                              {dest.name}
                            </h3>
                            <div className="flex items-center gap-1 mb-2">
                              <MapPin size={11} className="text-white/60" />
                              <span className="text-white/70 text-xs font-body">
                                {dest.region}
                              </span>
                            </div>
                            <p className="text-white/50 text-[11px] font-body mb-3 line-clamp-2 leading-relaxed">
                              {dest.description}
                            </p>
                            <div className="h-px bg-white/15 mb-3" />
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white/50 text-[10px] uppercase tracking-widest font-body">
                                  From
                                </p>
                                <p className="text-white font-black font-display text-xl">
                                  {formatPrice(dest.avgPrice)}
                                </p>
                              </div>
                              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-rose-pink hover:border-rose-pink">
                                <ArrowUpRight size={18} className="text-white" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {visibleDests.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCard(i)}
                  aria-label={`Go to destination ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeCard
                      ? "w-6 h-2 bg-rose-pink"
                      : "w-2 h-2 bg-map-border hover:bg-map-muted"
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>

    </>
  );
}
