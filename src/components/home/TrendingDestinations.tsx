"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight, ArrowRight, Heart } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { destinations } from "@/data/destinations";
import { formatPrice } from "@/lib/utils";
import { useInView } from "@/hooks/useIntersectionObserver";

const SCROLL_AMOUNT = 300;

const CATEGORY_EMOJI: Record<string, string> = {
  Mountains: "🏔️",
  Forests: "🌿",
  Adventure: "⚡",
  Beaches: "🏖️",
};

const STAGGER_DELAYS = [
  "delay-0",
  "delay-100",
  "delay-200",
  "delay-300",
  "delay-[400ms]",
];

export default function TrendingDestinations() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const { ref: sectionRef, inView } = useInView(0.1);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    const cardWidth = 300; // 280px card + 20px gap
    setActiveIndex(
      Math.min(Math.round(el.scrollLeft / cardWidth), destinations.length - 1)
    );
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? SCROLL_AMOUNT : -SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  const scrollToCard = (index: number) => {
    scrollRef.current?.scrollTo({
      left: index * 300,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-20 bg-map-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header — unchanged */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-trail-orange font-body">
            DISCOVER
          </p>
          <h2 className="text-4xl font-bold mb-2 text-map-text tracking-[-0.5px] font-display">
            Trending Destinations
          </h2>
          <p className="text-map-muted font-body">
            Handpicked for the season. Tap to compare operators.
          </p>
        </div>

        {/* Scroll container */}
        <div ref={sectionRef} className="relative">
          {/* Left nav button */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className={`absolute left-0 top-[45%] -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-2xl bg-white shadow-card-hover border border-map-border flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-compass-blue hover:border-compass-blue hover:shadow-blue-md group/btn ${
              canScrollLeft
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft
              size={20}
              className="text-map-muted group-hover/btn:text-white transition-colors"
            />
          </button>

          {/* Scroll row */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto overflow-y-visible scrollbar-hide pb-4 px-1 snap-x snap-mandatory scroll-smooth"
            onScroll={updateScrollState}
          >
            {destinations.map((dest, index) => (
              <div
                key={dest.id}
                className={`flex-shrink-0 snap-start transition-all duration-700 ease-out ${
                  inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                } ${STAGGER_DELAYS[index] ?? "delay-0"}`}
              >
                <Link
                  href={`/search?destination=${encodeURIComponent(dest.name)}`}
                  className="relative block w-[260px] sm:w-[280px] h-[340px] sm:h-[380px] rounded-3xl overflow-hidden cursor-pointer group shadow-card transition-all duration-500 hover:shadow-blue-lg hover:scale-[1.03] hover:-translate-y-2"
                >
                  {/* Layer 1 — Full bleed image */}
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="(max-width:768px) 100vw, 280px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Layer 2 — Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-compass-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Layer 3 — Top content: category + best time badges */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between z-10">
                    <span className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-white text-xs font-semibold font-body">
                      {CATEGORY_EMOJI[dest.category] ?? ""} {dest.category}
                    </span>
                    <span className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-white/90 text-xs font-body">
                      {dest.bestTime}
                    </span>
                  </div>

                  {/* Layer 6 — Favourite button (hover-reveal, decorative) */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 z-20">
                    <Heart size={14} className="text-white" />
                  </div>

                  {/* Layer 4 — Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    {/* Operator count row */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm"
                        style={{ background: dest.accentColor }}
                      >
                        {dest.operatorCount} Operators Available
                      </span>
                    </div>

                    {/* Destination name */}
                    <h3 className="font-display font-black text-white text-2xl leading-tight mb-1">
                      {dest.name}
                    </h3>

                    {/* Region */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <MapPin size={12} className="text-white/60" />
                      <span className="text-white/70 text-xs font-body">
                        {dest.region}
                      </span>
                    </div>

                    {/* Expanding divider line */}
                    <div
                      className="h-0.5 mb-4 w-8 group-hover:w-16 transition-all duration-500 rounded-full"
                      style={{ background: dest.accentColor }}
                    />

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-white/50 text-[10px] uppercase tracking-widest font-body">
                          from
                        </span>
                        <span className="text-white font-black font-display text-xl">
                          {formatPrice(dest.avgPrice)}
                        </span>
                      </div>
                      <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-white text-xs font-semibold font-body flex items-center gap-1.5 transition-all duration-300 group-hover:bg-compass-blue group-hover:border-compass-blue">
                        Explore <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Layer 5 — Hover reveal panel (slides up) */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20"
                    style={{
                      background: `linear-gradient(to top, ${dest.accentColor}, ${dest.accentColor}cc)`,
                    }}
                  >
                    <p className="text-white/60 text-[10px] uppercase tracking-widest mb-3">
                      Quick facts
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-white font-bold font-display text-base">
                          {dest.avgDuration}
                        </p>
                        <p className="text-white/60 text-[10px] font-body">
                          Avg Duration
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold font-display text-base">
                          {dest.difficulty}
                        </p>
                        <p className="text-white/60 text-[10px] font-body">
                          Difficulty
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold font-display text-base">
                          {dest.bestTime.split("–")[0].trim()}
                        </p>
                        <p className="text-white/60 text-[10px] font-body">
                          Best Time
                        </p>
                      </div>
                    </div>
                    <div className="my-3 border-t border-white/20" />
                    <div className="w-full bg-white text-compass-blue rounded-xl py-2.5 text-sm font-bold text-center hover:bg-compass-light transition-colors">
                      View All Operators →
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Right nav button */}
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className={`absolute right-0 top-[45%] -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-2xl bg-white shadow-card-hover border border-map-border flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-compass-blue hover:border-compass-blue hover:shadow-blue-md group/btn ${
              canScrollRight
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight
              size={20}
              className="text-map-muted group-hover/btn:text-white transition-colors"
            />
          </button>
        </div>

        {/* Scroll indicator dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {destinations.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              aria-label={`Go to destination ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 h-2 bg-compass-blue"
                  : "w-2 h-2 bg-map-border hover:bg-map-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
