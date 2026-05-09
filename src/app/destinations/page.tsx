"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { destinations } from "@/data/destinations";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Mountains", "Forests", "Adventure", "Beaches"] as const;
type Category = (typeof CATEGORIES)[number];

export default function DestinationsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered =
    activeCategory === "All"
      ? destinations
      : destinations.filter((d) => d.category === activeCategory);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="py-16 text-center bg-atlas-night">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-display">
          Explore All Destinations
        </h1>
        <p className="text-white/60 text-lg font-body">Find your next adventure</p>
      </div>

      {/* Category filter */}
      <div className="border-b border-map-border sticky top-16 z-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                activeCategory === cat
                  ? "bg-compass-blue text-white border-compass-blue"
                  : "text-map-muted bg-transparent border-map-border"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="py-12 bg-map-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((dest) => (
              <Link
                key={dest.id}
                href={`/search?destination=${encodeURIComponent(dest.name)}`}
                className="group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 288px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-compass-blue/90 text-white text-xs px-2.5 py-1 rounded-full">
                      {dest.operatorCount} Operators
                    </span>
                    <span className="bg-black/40 backdrop-blur-[4px] text-white text-xs px-2.5 py-1 rounded-full">
                      {dest.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-1 text-map-text font-display">
                    {dest.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm mb-2 text-map-muted">
                    <MapPin size={13} />
                    <span>{dest.region}</span>
                  </div>
                  <p className="text-sm mb-4 line-clamp-2 text-map-muted font-body">
                    {dest.description}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[dest.avgDuration, dest.difficulty, `Best: ${dest.bestTime}`].map((label) => (
                      <span
                        key={label}
                        className="rounded-full text-xs px-2.5 py-1 bg-map-white text-map-muted"
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-map-border pt-4 flex items-center justify-between">
                    <span className="font-bold text-lg text-compass-blue font-display">
                      From {formatPrice(dest.avgPrice)}
                    </span>
                    <span className="text-sm font-medium text-trail-orange group-hover:translate-x-1 transition-transform">
                      Explore →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg text-map-muted">No destinations in this category yet.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
