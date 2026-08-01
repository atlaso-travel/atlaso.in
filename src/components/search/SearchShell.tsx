"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import SearchFilters, { type FilterState } from "@/components/search/SearchFilters";
import PackageCard from "@/components/search/PackageCard";
import ContourField from "@/components/ui/ContourField";
import { useSavedOperators } from "@/hooks/useSavedOperators";
import type { PackageSummary } from "@/server/catalogue";

const SORTS = [
  { value: "best-match", label: "Best match" },
  { value: "savings", label: "Biggest saving" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "duration", label: "Shortest trip" },
];

const MAX_COMPARE = 4;

export default function SearchShell({
  results,
  total,
  totalInCatalogue,
  cheapestAvailable,
  filterState,
  bounds,
  sort,
  destinationLabel,
}: {
  results: PackageSummary[];
  total: number;
  totalInCatalogue: number;
  cheapestAvailable: number | null;
  filterState: FilterState;
  bounds: { min: number; max: number };
  sort: string;
  destinationLabel: string | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [compact, setCompact] = useState(true);
  const { savedIds, toggleSave } = useSavedOperators();

  const setSort = (value: string) => {
    const q = new URLSearchParams(params.toString());
    if (value === "best-match") q.delete("sort");
    else q.set("sort", value);
    router.replace(`/search?${q.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const q = new URLSearchParams(params.toString());
    ["min", "max", "dur", "diff", "inc", "grp", "rating", "month"].forEach((k) => q.delete(k));
    router.replace(`/search?${q.toString()}`, { scroll: false });
  };

  const toggleCompare = (id: string) =>
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_COMPARE
        ? [...prev, id]
        : prev
    );

  const selected = compareIds
    .map((id) => results.find((r) => r.id === id))
    .filter((r): r is PackageSummary => Boolean(r));

  const filtersApplied =
    filterState.durations.length + filterState.difficulties.length +
    filterState.inclusions.length + filterState.groupSizes.length +
    (filterState.minRating ? 1 : 0) + (filterState.month ? 1 : 0) +
    (filterState.max < bounds.max ? 1 : 0);

  return (
    <>
      <main className="min-h-screen bg-map-white max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-9 flex gap-5">
        <aside className="hidden md:block flex-shrink-0 sticky top-20 h-fit w-[248px]">
          <SearchFilters state={filterState} bounds={bounds} resultCount={total} />
        </aside>

        <div className="flex-1 min-w-0">
          {/* Control bar */}
          <div className="bg-map-card rounded-2xl border border-map-border px-4 py-3 flex items-center gap-3 mb-4">
            <p className="text-[13px] text-map-muted font-body flex-1 min-w-0 truncate">
              <span className="font-bold text-map-text tnum">{total}</span>
              {" "}package{total !== 1 ? "s" : ""}
              {destinationLabel && (
                <> in <span className="font-semibold text-map-text">{destinationLabel}</span></>
              )}
            </p>

            <div className="relative flex-shrink-0">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort results"
                className="appearance-none bg-white border border-map-border rounded-full pl-3.5 pr-8 py-1.5 text-[13px] text-map-text font-body cursor-pointer hover:border-compass-blue transition-colors focus:outline-none focus:ring-2 focus:ring-compass-blue/30"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-map-muted pointer-events-none" />
            </div>

            <button
              onClick={() => setDrawer(true)}
              className="md:hidden flex items-center gap-1.5 border border-map-border rounded-full px-3.5 py-1.5 text-[13px] text-map-muted"
            >
              <SlidersHorizontal size={13} />
              Filters
              {filtersApplied > 0 && (
                <span className="bg-compass-blue text-white text-[10px] font-bold px-1.5 rounded-full">
                  {filtersApplied}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setCompact(true)}
                aria-label="List view"
                aria-pressed={compact}
                className={cn(
                  "p-1.5 rounded-lg border transition-all",
                  compact ? "bg-compass-light border-map-border-blue text-compass-blue" : "border-map-border text-map-muted"
                )}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setCompact(false)}
                aria-label="Grid view"
                aria-pressed={!compact}
                className={cn(
                  "p-1.5 rounded-lg border transition-all",
                  !compact ? "bg-compass-light border-map-border-blue text-compass-blue" : "border-map-border text-map-muted"
                )}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>

          {/* Results */}
          {total === 0 ? (
            <NoResults
              destinationLabel={destinationLabel}
              cheapestAvailable={cheapestAvailable}
              filtersApplied={filtersApplied}
              totalInCatalogue={totalInCatalogue}
              onClear={clearFilters}
            />
          ) : (
            <div
              className={cn(
                compact ? "flex flex-col gap-3" : "grid grid-cols-1 lg:grid-cols-2 gap-4",
                selected.length > 0 ? "pb-32" : "pb-8"
              )}
            >
              {results.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  isCompact={compact}
                  isInCompare={compareIds.includes(pkg.id)}
                  onToggleCompare={toggleCompare}
                  compareFull={compareIds.length >= MAX_COMPARE}
                  isSaved={savedIds.includes(pkg.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[10000] flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="relative ml-auto w-[86vw] max-w-sm h-full overflow-y-auto bg-map-card rounded-l-3xl border-l border-map-border">
            <SearchFilters
              state={filterState}
              bounds={bounds}
              onClose={() => setDrawer(false)}
              isMobile
              resultCount={total}
            />
          </div>
        </div>
      )}

      {/* Compare tray */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-atlas-night shadow-2xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="flex -space-x-2 flex-shrink-0">
              {selected.map((p) => (
                <span key={p.id} className="relative w-9 h-9 rounded-full border-2 border-atlas-night overflow-hidden">
                  <Image src={p.image} alt={p.operatorName} fill sizes="36px" className="object-cover" />
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1 hidden sm:block">
              <p className="text-white text-[12.5px] font-bold">
                {selected.length} selected
                {selected.length < 2 && <span className="text-white/50 font-medium"> · add one more to compare</span>}
              </p>
              <p className="text-white/55 text-[11.5px] truncate font-body">
                {selected.map((p) => p.operatorName).join(" · ")}
              </p>
            </div>
            <button
              onClick={() => setCompareIds([])}
              className="text-white/50 hover:text-white text-[12px] font-body flex items-center gap-1"
            >
              <X size={13} /> Clear
            </button>
            <Link
              href={`/compare?ids=${compareIds.join(",")}`}
              aria-disabled={selected.length < 2}
              className={cn(
                "font-bold text-[13.5px] px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap",
                selected.length < 2
                  ? "bg-white/15 text-white/40 pointer-events-none"
                  : "bg-compass-blue text-white hover:bg-compass-hover"
              )}
            >
              Compare {selected.length}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function NoResults({
  destinationLabel, cheapestAvailable, filtersApplied, totalInCatalogue, onClear,
}: {
  destinationLabel: string | null;
  cheapestAvailable: number | null;
  filtersApplied: number;
  totalInCatalogue: number;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-map-border bg-map-card px-6 py-12 text-center">
      <div className="max-w-sm mx-auto">
        <div className="h-24 mb-5 opacity-55">
          <ContourField seed={9.4} className="h-24" opacity={0.5} />
        </div>
        <h3 className="font-display text-lg font-extrabold text-map-text">
          {filtersApplied > 0 ? "Nothing matches those filters" : "No packages here yet"}
        </h3>
        <p className="text-[13.5px] text-map-muted font-body mt-2 leading-relaxed">
          {filtersApplied > 0 && cheapestAvailable != null ? (
            <>
              The cheapest trip{destinationLabel ? ` in ${destinationLabel}` : ""} is{" "}
              <b className="text-map-text tnum">{formatPrice(cheapestAvailable)}</b>. Try
              loosening the price or date filter.
            </>
          ) : destinationLabel ? (
            <>
              No operator runs {destinationLabel} on Atlaso yet. There are{" "}
              <b className="text-map-text tnum">{totalInCatalogue}</b> packages across our other
              destinations.
            </>
          ) : (
            <>Try a different destination or clear your filters.</>
          )}
        </p>
        <div className="flex items-center justify-center gap-2.5 mt-5 flex-wrap">
          {filtersApplied > 0 && (
            <button onClick={onClear} className="btn-primary text-sm py-2.5">
              Clear filters
            </button>
          )}
          <Link href="/destinations" className="btn-outline text-sm py-2.5">
            Browse destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
