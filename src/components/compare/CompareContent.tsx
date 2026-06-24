"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  SlidersHorizontal,
  Star,
  Plus,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { packages } from "@/data/packages";
import { formatPrice } from "@/lib/utils";
import { useSavedComparisons } from "@/hooks/useSavedComparisons";

const FILTER_SECTIONS = [
  { id: "price-breakdown", label: "Price Breakdown" },
  { id: "itinerary-overview", label: "Itinerary Overview" },
  { id: "stay-comfort", label: "Stay & Comfort" },
  { id: "trip-duration", label: "Trip Duration" },
];

const BEST_FOR_LABELS = ["Best For Budget", "Best For Comfort", "Premium Experience"];

const CARD_ACCENTS = [
  { border: "border-[#E85D75]", bg: "bg-pink-50", badge: "bg-green-100 text-green-700" },
  { border: "border-[#E2E8F0]", bg: "bg-white", badge: "bg-blue-100 text-blue-700" },
  { border: "border-[#E2E8F0]", bg: "bg-white", badge: "bg-purple-100 text-purple-700" },
];

const COL_BG = ["bg-pink-50", "bg-blue-50", "bg-purple-50"];

function getCancelFlex(policy: string): { label: string; high: boolean } {
  const lower = policy.toLowerCase();
  if (lower.includes("free")) return { label: "High", high: true };
  if (lower.includes("no refund")) return { label: "Low", high: false };
  return { label: "Medium", high: true };
}

export default function CompareContent() {
  const params = useSearchParams();
  const idsParam = params.get("ids") || "";
  const ids = idsParam.split(",").filter(Boolean);

  const selected = packages.filter((p) => ids.includes(p.id));
  const pkgs = (selected.length >= 2 ? selected : packages.slice(0, 3)).slice(0, 3);
  const sortedPkgs = [...pkgs].sort((a, b) => a.price - b.price);

  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(FILTER_SECTIONS.map((f) => f.id))
  );
  const [justSaved, setJustSaved] = useState(false);

  const { saveComparison } = useSavedComparisons();

  const tripName =
    (sortedPkgs[0]?.destinationId ?? "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) + " Trip";

  const handleSave = () => {
    saveComparison(tripName, sortedPkgs.map((p) => p.id));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setTimeout(() => {
          sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
      return next;
    });
  };

  const clearAll = () => setActiveFilters(new Set());

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F7FA] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-[#1A2B4A] text-sm font-semibold hover:underline"
            >
              <ArrowLeft size={15} />
              Go back to Results
            </Link>
            <div className="flex items-center gap-1.5 border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white text-sm font-medium text-[#1A2B4A] cursor-pointer select-none shadow-sm">
              Sort By :
              <span className="text-[#E85D75] font-semibold ml-0.5">Best Match</span>
              <ChevronDown size={14} className="ml-0.5 text-[#1A2B4A]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl text-[#E85D75] mb-5">
            Comparing <span className="font-black">{sortedPkgs.length} Operators</span> 
          </h1>

          {/* Operator Cards Row */}
          <div
            className="grid gap-4 mb-6"
            style={{ gridTemplateColumns: `repeat(4, minmax(0, 1fr))` }}
          >
            {sortedPkgs.map((pkg, i) => {
              const accent = CARD_ACCENTS[i] ?? CARD_ACCENTS[1];
              const isBest = i === 0;
              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl overflow-hidden border-2 ${accent.border} shadow-sm`}
                >
                  {isBest && (
                    <div className="absolute top-3 left-3 z-10 bg-[#E85D75] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
                      Best Match
                    </div>
                  )}
                  <div className="h-32 sm:h-36 overflow-hidden">
                    <img
                      src={pkg.images[0]}
                      alt={pkg.operatorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`p-3 ${accent.bg}`}>
                    <h3 className="font-bold text-[#1A2B4A] text-sm mb-1 truncate">
                      {pkg.operatorName}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-[#1A2B4A]">
                        {pkg.operatorRating}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        ({pkg.operatorReviews})
                      </span>
                    </div>
                    <span
                      className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${accent.badge}`}
                    >
                      {BEST_FOR_LABELS[i] ?? "Best Value"}
                    </span>
                    <div className="mt-2">
                      <span className="text-[#1A2B4A] font-bold text-sm">
                        {formatPrice(pkg.price)}
                      </span>
                      <span className="text-gray-400 text-xs"> / Person</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add another operator slot */}
            <div className="border-2 border-dashed border-[#CBD5E1] rounded-2xl flex flex-col items-center justify-center p-4 min-h-[180px] cursor-pointer hover:border-[#1A2B4A] transition-colors bg-white">
              <div className="w-10 h-10 rounded-full bg-[#1A2B4A] flex items-center justify-center mb-2 shadow">
                <Plus size={18} className="text-white" />
              </div>
              <p className="text-[#1A2B4A] text-xs font-bold text-center">
                Add another operator
              </p>
              <p className="text-gray-400 text-[11px] text-center mt-0.5">
                Compare Upto 4
              </p>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex gap-5 items-start">
            {/* Filter Sidebar */}
            <div className="w-52 flex-shrink-0 sticky top-24">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0]">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal size={15} className="text-[#1A2B4A]" />
                    <span className="font-bold text-[#1A2B4A] text-sm">Filters</span>
                  </div>
                  <button
                    onClick={clearAll}
                    className="text-[#E85D75] text-xs font-semibold hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-0.5">
                  {FILTER_SECTIONS.map((filter) => {
                    const active = activeFilters.has(filter.id);
                    return (
                      <button
                        key={filter.id}
                        onClick={() => toggleFilter(filter.id)}
                        className="flex items-center gap-2.5 w-full py-2.5 px-2 rounded-xl text-left hover:bg-gray-50 transition-colors"
                      >
                        <SlidersHorizontal
                          size={13}
                          className={active ? "text-[#1A2B4A]" : "text-gray-300"}
                        />
                        <span
                          className={`text-sm font-medium ${
                            active ? "text-[#1A2B4A]" : "text-gray-300"
                          }`}
                        >
                          {filter.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Quick Verdict */}
              <div>
                <h2 className="text-base font-bold text-[#1A2B4A] mb-3">Quick Verdict</h2>
                <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm">
                  {/* Header row */}
                  <div
                    className="grid bg-[#0A1628] text-white text-[11px] font-semibold"
                    style={{
                      gridTemplateColumns: `1.6fr repeat(${4 + Math.max(0, sortedPkgs.length - 1)}, 1fr)`,
                    }}
                  >
                    <div className="px-4 py-3">Operator</div>
                    <div className="px-3 py-3 text-center">Price (from)</div>
                    <div className="px-3 py-3 text-center">Rating</div>
                    <div className="px-3 py-3 text-center">Meals</div>
                    <div className="px-3 py-3 text-center">Cancel Flex</div>
                    <div className="px-3 py-3 text-center">Best For</div>
                  </div>

                  {sortedPkgs.map((pkg, i) => {
                    const flex = getCancelFlex(pkg.cancellationPolicy);
                    return (
                      <div
                        key={pkg.id}
                        className={`grid items-center border-b border-[#F1F5F9] last:border-0 ${
                          i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"
                        }`}
                        style={{ gridTemplateColumns: `1.6fr 1fr 1fr 1fr 1fr 1fr` }}
                      >
                        {/* Operator */}
                        <div className="px-4 py-3 flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#E8EFF8] flex items-center justify-center text-[#1A2B4A] text-[10px] font-black flex-shrink-0">
                            {pkg.operatorName
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <span className="text-xs font-semibold text-[#1A2B4A] truncate">
                            {pkg.operatorName}
                          </span>
                        </div>
                        {/* Price */}
                        <div className="px-3 py-3 text-center">
                          <span className="text-[#E85D75] font-bold text-sm">
                            {formatPrice(pkg.price)}
                          </span>
                        </div>
                        {/* Rating */}
                        <div className="px-3 py-3 flex items-center justify-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-[#1A2B4A]">
                            {pkg.operatorRating}
                          </span>
                        </div>
                        {/* Meals */}
                        <div className="px-3 py-3 flex justify-center">
                          {pkg.mealsIncluded ? (
                            <CheckCircle2
                              size={18}
                              className="text-green-500 fill-green-100"
                            />
                          ) : (
                            <span className="text-gray-300 text-sm">—</span>
                          )}
                        </div>
                        {/* Cancel Flex */}
                        <div className="px-3 py-3 flex justify-center">
                          <span
                            className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                              flex.high
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-500"
                            }`}
                          >
                            {flex.label}
                          </span>
                        </div>
                        {/* Best For */}
                        <div className="px-3 py-3 text-center">
                          <span className="text-[11px] font-medium text-[#64748B]">
                            {BEST_FOR_LABELS[i] ?? "Value Seekers"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Targeted Breakdown */}
              <div>
                <h2 className="text-base font-bold text-[#1A2B4A] mb-3">
                  Targeted Breakdown
                </h2>
                <div className="space-y-4">
                  {activeFilters.has("price-breakdown") && (
                    <BreakdownSection
                      id="price-breakdown"
                      title="Price Breakdown"
                      sectionRefs={sectionRefs}
                      pkgs={sortedPkgs}
                      rows={[
                        {
                          label: "Base Price",
                          values: sortedPkgs.map((p) =>
                            formatPrice(Math.round(p.price * 0.68))
                          ),
                        },
                        {
                          label: "Tax & Fees",
                          values: sortedPkgs.map((p) =>
                            formatPrice(Math.round(p.price * 0.18))
                          ),
                        },
                        {
                          label: "Hidden Charges",
                          values: sortedPkgs.map(() => "₹0"),
                        },
                        {
                          label: "Total Price",
                          values: sortedPkgs.map((p) => formatPrice(p.price)),
                          highlightFirst: true,
                        },
                      ]}
                    />
                  )}

                  {activeFilters.has("itinerary-overview") && (
                    <BreakdownSection
                      id="itinerary-overview"
                      title="Itinerary Overview"
                      sectionRefs={sectionRefs}
                      pkgs={sortedPkgs}
                      rows={[
                        {
                          label: "Duration",
                          values: sortedPkgs.map((p) => p.duration),
                        },
                        {
                          label: "Destinations Covered",
                          values: sortedPkgs.map((p) =>
                            String(Math.max(p.durationDays - 1, 1))
                          ),
                        },
                        {
                          label: "Pace",
                          values: sortedPkgs.map((p) =>
                            p.difficulty === "Easy" ? "Relaxed" : "Moderate"
                          ),
                        },
                      ]}
                    />
                  )}

                  {activeFilters.has("stay-comfort") && (
                    <BreakdownSection
                      id="stay-comfort"
                      title="Stay & Comfort"
                      sectionRefs={sectionRefs}
                      pkgs={sortedPkgs}
                      rows={[
                        {
                          label: "Stay Type",
                          values: sortedPkgs.map((p) => p.hotelType),
                        },
                        {
                          label: "Meals",
                          values: sortedPkgs.map((p) =>
                            p.mealsIncluded ? "Included" : "Not Included"
                          ),
                        },
                        {
                          label: "Transport",
                          values: sortedPkgs.map((p) =>
                            p.transportIncluded ? "Included" : "Not Included"
                          ),
                        },
                        {
                          label: "Guide",
                          values: sortedPkgs.map((p) =>
                            p.guideIncluded ? "Expert Guide" : "Self-guided"
                          ),
                        },
                      ]}
                    />
                  )}

                  {activeFilters.has("trip-duration") && (
                    <BreakdownSection
                      id="trip-duration"
                      title="Trip Duration"
                      sectionRefs={sectionRefs}
                      pkgs={sortedPkgs}
                      rows={[
                        {
                          label: "Total Days",
                          values: sortedPkgs.map((p) => `${p.durationDays} Days`),
                        },
                        {
                          label: "Nights",
                          values: sortedPkgs.map((p) => `${p.durationDays - 1} Nights`),
                        },
                        {
                          label: "Group Size",
                          values: sortedPkgs.map((p) => p.groupSize),
                        },
                        {
                          label: "Difficulty",
                          values: sortedPkgs.map((p) => p.difficulty),
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A1628] z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex -space-x-2 flex-shrink-0">
              {sortedPkgs.map((pkg) => (
                <div
                  key={pkg.id}
                  className="w-8 h-8 rounded-full border-2 border-[#0A1628] bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-black"
                >
                  {pkg.operatorName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold">
                {sortedPkgs.length} Operators selected
              </p>
              <p className="text-gray-400 text-[11px] truncate">
                {sortedPkgs.map((p) => p.operatorName).join(" • ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {justSaved ? (
              <Link
                href="/comparisons"
                className="flex items-center gap-1.5 border border-green-400 text-green-400 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-green-400/10 transition-colors whitespace-nowrap"
              >
                <BookmarkCheck size={14} />
                Saved! View
              </Link>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 border border-white/30 text-white/80 hover:border-white hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
              >
                <Bookmark size={14} />
                Save Comparison
              </button>
            )}
            <button className="bg-[#E85D75] hover:bg-[#d14d65] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              View Detailed Itinerary
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

type BreakdownRow = {
  label: string;
  values: string[];
  highlightFirst?: boolean;
};

function BreakdownSection({
  id,
  title,
  pkgs,
  rows,
  sectionRefs,
}: {
  id: string;
  title: string;
  pkgs: typeof packages;
  rows: BreakdownRow[];
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      ref={(el) => {
        sectionRefs.current[id] = el;
      }}
      className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm"
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2
            size={17}
            className="text-green-500 fill-green-100 flex-shrink-0"
          />
          <span className="font-bold text-[#1A2B4A] text-sm">{title}</span>
        </div>
        <CheckCircle2
          size={17}
          className="text-green-500 fill-green-100 flex-shrink-0"
        />
      </button>

      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-[#64748B] w-36">
                  Parameter
                </th>
                {pkgs.map((pkg, i) => (
                  <th key={pkg.id} className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold ${COL_BG[i] ?? "bg-gray-50"} text-[#1A2B4A]`}
                    >
                      🐼 {pkg.operatorName}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={row.label}
                  className={`border-b border-[#F1F5F9] last:border-0 ${
                    ri % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"
                  }`}
                >
                  <td className="px-5 py-3 text-xs text-[#64748B] font-medium">
                    {row.label}
                  </td>
                  {row.values.map((val, vi) => (
                    <td key={vi} className="px-4 py-3 text-center">
                      <span
                        className={
                          row.highlightFirst && vi === 0
                            ? "text-[#E85D75] font-bold text-sm"
                            : "text-xs text-[#64748B]"
                        }
                      >
                        {val}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
