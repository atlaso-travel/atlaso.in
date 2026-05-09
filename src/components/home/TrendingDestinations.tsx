"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { destinations } from "@/data/destinations";
import { formatPrice } from "@/lib/utils";

const SCROLL_AMOUNT = 320;

export default function TrendingDestinations() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
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

  return (
    <section className="py-20 bg-map-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
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
        <div className="relative">
          {/* Left fade + button */}
          <div
            className={`absolute left-0 top-0 bottom-4 w-16 z-10 pointer-events-none transition-opacity duration-200 bg-gradient-to-r from-map-white to-transparent ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
          />
          <button
            onClick={() => scroll("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full shadow-md border border-map-border bg-white text-map-text flex items-center justify-center transition-all duration-200 ${canScrollLeft ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Scroll row */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 px-2 scrollbar-hide"
            onScroll={updateScrollState}
          >
            {destinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/search?destination=${encodeURIComponent(dest.name)}`}
                className="group w-72 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 bg-white border border-map-border"
              >
                {/* Image */}
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 288px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-atlas-night/60 to-transparent" />
                  {/* Best time badge */}
                  <div className="absolute top-3 right-3">
                    <span className="text-white/90 text-xs px-3 py-1 rounded-full bg-atlas-night/80 backdrop-blur-[4px]">
                      {dest.bestTime}
                    </span>
                  </div>
                  {/* Operator count */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-compass-blue text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {dest.operatorCount} Operators
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-map-text font-display">
                    {dest.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm mt-1 text-map-muted">
                    <MapPin size={12} />
                    <span>{dest.region}</span>
                  </div>
                  <div className="my-3 border-t border-map-border" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-compass-blue font-display">
                      From {formatPrice(dest.avgPrice)}
                    </span>
                    <span className="text-sm font-semibold text-trail-orange group-hover:translate-x-1 transition-transform duration-200 inline-flex">
                      View Operators →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right fade + button */}
          <div
            className={`absolute right-0 top-0 bottom-4 w-16 z-10 pointer-events-none transition-opacity duration-200 bg-gradient-to-l from-map-white to-transparent ${canScrollRight ? "opacity-100" : "opacity-0"}`}
          />
          <button
            onClick={() => scroll("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full shadow-md border border-map-border bg-white text-map-text flex items-center justify-center transition-all duration-200 ${canScrollRight ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
