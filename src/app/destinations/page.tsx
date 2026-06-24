"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Star, Heart, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CtaBanner from "@/components/home/CtaBanner";
import DestinationInput from "@/components/home/DestinationInput";
import DatePicker from "@/components/home/DatePicker";
import TravelersInput from "@/components/home/TravelersInput";
import { destinations } from "@/data/destinations";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = ["All", "Price: Low to High", "Price: High to Low", "Most Popular"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const ITEMS_PER_PAGE = 9;

const STATS = [
  { value: "50+", label: "Curated Destinations" },
  { value: "500+", label: "Verified Operators" },
  { value: "10K+", label: "Trips Compared" },
  { value: "4.8/5", label: "Average Traveler Rating" },
];

export default function DestinationsPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>("All");
  const [page, setPage] = useState(1);
  const [searchDest, setSearchDest] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const sorted = [...destinations].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.avgPrice - b.avgPrice;
    if (sortBy === "Price: High to Low") return b.avgPrice - a.avgPrice;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const featured = destinations.slice(0, 3);

  const handleSearch = () => {
    const params = new URLSearchParams({
      destination: searchDest || "Spiti Valley",
      dates,
      people: travelers,
    });
    router.push(`/search?${params.toString()}`);
  };

  const toggleSaved = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-[82vh] flex flex-col justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&q=80"
            alt="Mountain landscape"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(10,22,40,0.75) 0%, rgba(10,22,40,0.55) 50%, rgba(10,22,40,0.85) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16">
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight font-display mb-2">
            Explore Destinations
          </h1>
          <p className="text-3xl md:text-4xl lg:text-[3rem] font-black text-rose-pink font-display mb-5 leading-tight">
            Find Your Next Adventure
          </p>
          <p className="text-white/70 text-base md:text-lg font-body mb-9 max-w-2xl leading-relaxed">
            Discover India's most loved destinations, compare trusted operators, and find
            the trip that matches your travel style, budget, and expectations.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mb-9">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-5 py-3 min-w-[110px]"
              >
                <p className="text-white font-bold text-xl font-display">{stat.value}</p>
                <p className="text-white/60 text-xs font-body mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Search Panel */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2">
            <div className="flex flex-col md:flex-row md:items-stretch gap-1.5">
              <div className="flex-1 min-w-0 md:border-r md:border-white/10 md:pr-1.5">
                <DestinationInput value={searchDest} onChange={setSearchDest} />
              </div>
              <div className="flex-1 min-w-0 md:border-r md:border-white/10 md:pr-1.5">
                <DatePicker value={dates} onChange={setDates} />
              </div>
              <div className="md:w-44 min-w-0">
                <TravelersInput value={travelers} onChange={setTravelers} />
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={handleSearch}
                  className="w-full md:w-auto h-full px-5 py-3 md:py-0 bg-rose-pink text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-95 whitespace-nowrap"
                >
                  <Search size={16} />
                  Compare Operators
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured this month ── */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-map-text font-display mb-6">
            Featured this month
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featured.map((dest) => (
              <Link
                key={dest.id}
                href={`/destinations/${dest.id}`}
                className="group rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  {/* Top row */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-rose-pink text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                      Trending
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="bg-black/35 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-xs font-bold">4.2</span>
                        <span className="text-white/65 text-xs">(125)</span>
                      </div>
                      <button
                        onClick={(e) => toggleSaved(e, dest.id)}
                        className="w-7 h-7 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center hover:bg-rose-pink/80 transition-colors"
                      >
                        <Heart
                          size={13}
                          className={cn(
                            "transition-colors",
                            savedIds.has(dest.id)
                              ? "text-rose-pink fill-rose-pink"
                              : "text-white"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                  {/* Bottom: name + region */}
                  <div className="absolute bottom-3 left-4">
                    <p className="text-white font-bold text-[15px] font-display leading-snug">
                      {dest.name}
                    </p>
                    <p className="text-white/65 text-xs mt-0.5">{dest.region}</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between border-t border-map-border">
                  <span className="text-map-muted text-sm">
                    {dest.operatorCount} Operators Avl.
                  </span>
                  <span className="text-rose-pink font-bold text-sm">
                    From {formatPrice(dest.avgPrice)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore other Destinations ── */}
      <section className="py-10 bg-map-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-map-text font-display">
              Explore other Destinations
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-map-muted">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setPage(1);
                }}
                className="text-sm border border-map-border rounded-lg px-3 py-1.5 bg-white text-map-text focus:outline-none focus:ring-1 focus:ring-rose-pink"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((dest) => (
              <Link
                key={dest.id}
                href={`/destinations/${dest.id}`}
                className="group rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden rounded-t-3xl">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 288px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-base text-map-text font-display mb-0.5">
                    {dest.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-map-muted mb-2.5">
                    <MapPin size={11} />
                    <span>{dest.region}</span>
                  </div>
                  <p className="text-xs text-map-muted line-clamp-3 mb-3 font-body leading-[1.65]">
                    {dest.description}
                  </p>

                  {/* Stats row */}
                  <p className="text-xs text-map-muted mb-4">
                    4.2 Reviews&nbsp;•&nbsp;15 Trips&nbsp;•&nbsp;{dest.operatorCount} Operators
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-rose-pink">
                      From {formatPrice(dest.avgPrice)}
                    </span>
                    <span className="text-xs font-semibold text-rose-pink border border-rose-pink px-3 py-1.5 rounded-lg group-hover:bg-rose-pink group-hover:text-white transition-all duration-200">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-full border border-rose-pink text-rose-pink flex items-center justify-center disabled:opacity-40 hover:bg-rose-pink hover:text-white transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-8 h-8 rounded-full text-sm font-semibold transition-colors",
                    page === p
                      ? "bg-rose-pink text-white"
                      : "border border-map-border text-map-muted hover:border-rose-pink hover:text-rose-pink"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-full border border-rose-pink text-rose-pink flex items-center justify-center disabled:opacity-40 hover:bg-rose-pink hover:text-white transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <CtaBanner />

      <Footer />
    </>
  );
}
