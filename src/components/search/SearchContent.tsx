"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ChevronLeft,
  List,
  LayoutGrid,
  Star,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FilterSidebar from "@/components/search/FilterSidebar";
import OperatorCard from "@/components/search/OperatorCard";
import CompareBar from "@/components/search/CompareBar";
import SortDropdown, { SortOption } from "@/components/search/SortDropdown";
import DestinationInput from "@/components/home/DestinationInput";
import DatePicker from "@/components/home/DatePicker";
import TravelersInput from "@/components/home/TravelersInput";
import { packages } from "@/data/packages";
import { destinations } from "@/data/destinations";
import type { Package } from "@/data/packages";
import { useSavedOperators } from "@/hooks/useSavedOperators";
import { cn } from "@/lib/utils";

interface Filters {
  budget: [number, number];
  duration: string[];
  difficulty: string[];
  inclusions: string[];
  groupSize: string[];
}

const DEFAULT_FILTERS: Filters = {
  budget: [0, 30000],
  duration: [],
  difficulty: [],
  inclusions: [],
  groupSize: [],
};

export default function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const destination = params.get("destination") || "All Destinations";
  const initialDates = params.get("dates") || "";
  const initialPeople = params.get("people") || "";

  /* Search widget state — mirrors the hero inputs */
  const [searchDest, setSearchDest] = useState(destination);
  const [searchDates, setSearchDates] = useState(initialDates);
  const [searchPeople, setSearchPeople] = useState(initialPeople);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("best-match");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const { savedIds, toggleSave } = useSavedOperators();

  /* Resolve destination data for hero */
  const destData = destinations.find(
    (d) =>
      d.name.toLowerCase() === destination.toLowerCase() ||
      d.id === destination.toLowerCase().replace(/\s+/g, "-")
  );

  const filteredPackages = useMemo(() => {
    let result: Package[] = [...packages];

    if (destination && destination !== "All Destinations") {
      result = result.filter(
        (p) =>
          p.destinationId.replace(/-/g, " ").toLowerCase().includes(destination.toLowerCase()) ||
          p.operatorName.toLowerCase().includes(destination.toLowerCase()) ||
          p.title.toLowerCase().includes(destination.toLowerCase())
      );
    }

    result = result.filter(
      (p) => p.price >= filters.budget[0] && p.price <= filters.budget[1]
    );

    if (filters.difficulty.length > 0) {
      result = result.filter((p) => filters.difficulty.includes(p.difficulty));
    }

    switch (sort) {
      case "price-asc":  result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating":     result.sort((a, b) => b.operatorRating - a.operatorRating); break;
      case "duration":   result.sort((a, b) => a.durationDays - b.durationDays); break;
    }

    return result;
  }, [destination, filters, sort]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const operatorNames: Record<string, string> = {};
  const operatorImages: Record<string, string> = {};
  packages.forEach((p) => {
    operatorNames[p.id] = p.operatorName;
    operatorImages[p.id] = p.images[0];
  });

  const handleSearch = () => {
    const q = new URLSearchParams({ destination: searchDest || "All Destinations" });
    if (searchDates) q.set("dates", searchDates);
    if (searchPeople) q.set("people", searchPeople);
    router.push(`/search?${q.toString()}`);
  };

  const handleBack = () => {
    const savedY = sessionStorage.getItem("homeScrollY");
    if (window.history.length > 1) {
      router.back();
      if (savedY) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedY), behavior: "smooth" });
          sessionStorage.removeItem("homeScrollY");
        }, 100);
      }
    } else {
      router.push("/");
    }
  };

  const destinationLabel = destination !== "All Destinations" ? destination : null;
  const heroImage = destData?.heroImage ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80";

  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative z-5 min-h-[340px]">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={destination}
            fill
            sizes="100vw"
            className="object-cover object-[center_55%]"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(5,10,25,0.88) 0%, rgba(5,10,25,0.65) 45%, rgba(5,10,25,0.25) 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </div>


        <div className="relative max-w-6xl mx-auto py-6 sm:py-10">
          {/* Back */}
          {/* <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/90 text-[13px] mb-6 transition-colors group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button> */}

          {/* Region */}
          {destData && (
            <div
              className="flex items-center gap-1.5 mb-1.5 animate-fade-up"
              style={{ animationDelay: "60ms", opacity: 0 }}
            >
              <MapPin size={12} className="text-compass-blue" />
              <span className="text-white/55 text-[13px] font-body">{destData.region}</span>
            </div>
          )}

          {/* Title */}
          <h1
            className="text-[2.2rem] sm:text-[3rem] font-black text-white font-display leading-tight mb-3 animate-fade-up"
            style={{ animationDelay: "110ms", opacity: 0 }}
          >
            {destinationLabel ?? "Explore Operators"}
          </h1>

          {/* Stats row */}
          <div
            className="flex flex-wrap items-center gap-3 mb-7 animate-fade-up"
            style={{ animationDelay: "170ms", opacity: 0 }}
          >
            {destData ? (
              <>
                <div className="flex items-center gap-1">
                  <Star size={13} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-[13px]">4.8</span>
                  <span className="text-white/45 text-[13px] font-body">(124 reviews)</span>
                </div>
                <span className="text-white/25 text-xs">•</span>
                <span className="text-white/60 text-[13px] font-body">
                  <span className="text-white font-bold">{filteredPackages.length * 3}</span> Trips
                </span>
                <span className="text-white/25 text-xs">•</span>
                <span className="text-white/60 text-[13px] font-body">
                  <span className="text-white font-bold">{filteredPackages.length}</span> Operators
                </span>
                <span className="text-white/25 text-xs">•</span>
                <span className="bg-white/10 text-white/70 text-[11px] px-2.5 py-0.5 rounded-full font-body">
                  {destData.difficulty}
                </span>
                <span className="bg-white/10 text-white/70 text-[11px] px-2.5 py-0.5 rounded-full font-body">
                  Best: {destData.bestTime}
                </span>
              </>
            ) : (
              <span className="text-white/60 text-[13px] font-body">
                <span className="text-white font-bold">{filteredPackages.length}</span> operators found
              </span>
            )}
          </div>

          {/* ── Search widget (same style as HeroSection) ── */}
          <div
            className="animate-fade-up max-w-5xl mx-auto "
            style={{ animationDelay: "230ms", opacity: 0 }}
          >
            <div className="glass-dark rounded-2xl border border-white/10" style={{ padding: "8px" }}>
              <div className="flex flex-col md:flex-row md:items-center gap-1.5">
                <div className="flex-1 min-w-0 md:border-r md:border-white/10 md:pr-1.5">
                  <DestinationInput value={searchDest} onChange={setSearchDest} />
                </div>
                <div className="flex-1 min-w-0 md:border-r md:border-white/10 md:pr-1.5">
                  <DatePicker value={searchDates} onChange={setSearchDates} />
                </div>
                <div className="md:w-44 min-w-0">
                  <TravelersInput value={searchPeople} onChange={setSearchPeople} />
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={handleSearch}
                    className="p-4 bg-compass-blue text-white font-bold text-lg rounded-full flex items-center justify-center transition-all duration-200 hover:bg-compass-hover active:scale-95 cursor-pointer"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>














      {/* ── Main content ── */}
      <main className="min-h-screen bg-[#F5F7FA] max-w-6xl w-full mx-auto py-6 sm:py-10 flex gap-4">
        
        {/* Filter sidebar */}
        <aside
          className="hidden md:block flex-shrink-0 sticky top-20 h-fit"
          style={{ width: 240 }}
        >
          <FilterSidebar filters={filters} onChange={setFilters} />
        </aside>

        {/* Results area */}
        <div className="flex-1 min-w-0">

          {/* ── Control bar (above results) ── */}
          <div className="bg-white rounded-2xl border border-[#E8ECF0] px-4 py-3 flex items-center gap-3 mb-4">
            <p className="text-[13px] text-map-muted font-body flex-1 min-w-0 truncate">
              <span className="font-bold text-map-text">{filteredPackages.length}</span>{" "}
              Operator{filteredPackages.length !== 1 ? "s" : ""} found
              {destinationLabel && (
                <>
                  {" "}for{" "}
                  <span className="font-semibold text-map-text">{destinationLabel}</span>
                </>
              )}
            </p>

            <SortDropdown value={sort} onChange={setSort} />

            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 border border-map-border rounded-full px-3.5 py-1.5 text-[13px] text-map-muted"
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>

            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setIsCompact(true)}
                title="List view"
                className={cn(
                  "p-1.5 rounded-lg border transition-all cursor-pointer",
                  isCompact
                    ? "bg-compass-light border-map-border-blue text-compass-blue"
                    : "border-map-border text-map-muted hover:bg-[#F8FAFC]"
                )}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setIsCompact(false)}
                title="Grid view"
                className={cn(
                  "p-1.5 rounded-lg border transition-all cursor-pointer",
                  !isCompact
                    ? "bg-compass-light border-map-border-blue text-compass-blue"
                    : "border-map-border text-map-muted hover:bg-[#F8FAFC]"
                )}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>

          {/* Cards */}
          {filteredPackages.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2 text-map-text font-display">
                No results found
              </h3>
              <p className="text-map-muted font-body text-sm">
                Try adjusting your filters or search a different destination
              </p>
            </div>
          ) : (
            <div
              className={
                isCompact
                  ? "flex flex-col gap-3 pb-28"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-28"
              }
            >
              {filteredPackages.map((pkg, i) => (
                <div
                  key={pkg.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 55}ms`, opacity: 0 }}
                >
                  <OperatorCard
                    pkg={pkg}
                    isInCompare={compareIds.includes(pkg.id)}
                    onToggleCompare={toggleCompare}
                    isCompact={isCompact}
                    isSaved={savedIds.includes(pkg.id)}
                    onToggleSave={toggleSave}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>








      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-[85vw] max-w-sm h-full overflow-y-auto shadow-2xl bg-white rounded-l-3xl border-l border-map-border">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onClose={() => setMobileFilterOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}

      <CompareBar
        selectedIds={compareIds}
        operatorNames={operatorNames}
        operatorImages={operatorImages}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
      />

      <Footer />
    </>
  );
}
