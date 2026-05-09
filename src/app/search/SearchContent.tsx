"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ChevronLeft,
  List,
  LayoutGrid,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FilterSidebar from "@/components/search/FilterSidebar";
import OperatorCard from "@/components/search/OperatorCard";
import CompareBar from "@/components/search/CompareBar";
import SortDropdown, { SortOption } from "@/components/search/SortDropdown";
import { packages } from "@/data/packages";
import type { Package } from "@/data/packages";
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
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("best-match");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(destination);
  const [isCompact, setIsCompact] = useState(true);

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
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.operatorRating - a.operatorRating);
        break;
      case "duration":
        result.sort((a, b) => a.durationDays - b.durationDays);
        break;
    }

    return result;
  }, [destination, filters, sort]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const operatorNames: Record<string, string> = {};
  packages.forEach((p) => {
    operatorNames[p.id] = p.operatorName;
  });

  const handleSearch = () => {
    router.push(`/search?destination=${encodeURIComponent(searchInput)}`);
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

  const destinationLabel =
    destination !== "All Destinations" ? destination : null;

  return (
    <>
      <Navbar />

      {/* Sticky section: back bar + search bar */}
      <div className="sticky top-16 z-40 bg-white">
        {/* Back bar */}
        <div className="border-b border-map-border px-6 py-2 flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-compass-blue text-[13px] font-semibold bg-transparent border-none cursor-pointer py-1 font-body hover:text-compass-hover transition-colors"
          >
            <ChevronLeft size={16} className="text-compass-blue" />
            Back to home
          </button>
          <span className="text-[#D1D5DB] text-[13px]">/</span>
          {destinationLabel && (
            <>
              <span className="text-map-muted text-[13px]">{destinationLabel}</span>
              <span className="text-[#D1D5DB] text-[13px]">/</span>
            </>
          )}
          <span className="text-map-muted text-[13px]">
            {filteredPackages.length} operator
            {filteredPackages.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Search bar */}
        <div className="border-b border-map-border shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 border border-map-border rounded-full px-4 py-2 flex-1 max-w-xl bg-map-white">
              <MapPin size={15} className="flex-shrink-0 text-map-muted" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-transparent text-sm flex-1 outline-none text-map-text"
                placeholder="Search destinations..."
              />
              <button
                onClick={handleSearch}
                className="bg-compass-blue text-white rounded-full p-1.5 transition hover:opacity-90"
              >
                <Search size={13} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <SortDropdown value={sort} onChange={setSort} />
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-1.5 border border-map-border rounded-full px-4 py-2 text-sm text-map-muted"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="min-h-screen bg-map-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-6">
          {/* Sidebar — 240px */}
          <aside
            className="hidden md:block flex-shrink-0 sticky top-32 h-fit"
            style={{ width: 240 }}
          >
            <FilterSidebar filters={filters} onChange={setFilters} />
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Results count bar */}
            <div className="flex items-center justify-between py-3 mb-3 border-b border-map-border">
              <span className="font-bold text-base text-map-text font-display">
                {filteredPackages.length} operator
                {filteredPackages.length !== 1 ? "s" : ""} found
                {destinationLabel && (
                  <span className="font-normal text-map-muted">
                    {" "}
                    for {destinationLabel}
                  </span>
                )}
              </span>

              {/* View toggle — hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setIsCompact(true)}
                  title="List view"
                  className={cn(
                    "p-1.5 rounded-lg border flex items-center cursor-pointer",
                    isCompact
                      ? "bg-compass-light border-map-border-blue text-compass-blue"
                      : "bg-transparent border-map-border text-map-muted"
                  )}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setIsCompact(false)}
                  title="Card view"
                  className={cn(
                    "p-1.5 rounded-lg border flex items-center cursor-pointer",
                    !isCompact
                      ? "bg-compass-light border-map-border-blue text-compass-blue"
                      : "bg-transparent border-map-border text-map-muted"
                  )}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>

            {filteredPackages.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2 text-map-text font-display">
                  No results found
                </h3>
                <p className="text-map-muted">
                  Try adjusting your filters or search a different destination
                </p>
              </div>
            ) : (
              <div
                className={isCompact ? "pb-24" : "grid grid-cols-1 sm:grid-cols-3 gap-4 pb-24"}
              >
                {filteredPackages.map((pkg) => (
                  <OperatorCard
                    key={pkg.id}
                    pkg={pkg}
                    isInCompare={compareIds.includes(pkg.id)}
                    onToggleCompare={toggleCompare}
                    isCompact={isCompact}
                  />
                ))}
              </div>
            )}
          </div>
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
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
      />

      <Footer />
    </>
  );
}
