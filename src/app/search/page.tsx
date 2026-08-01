import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchHero from "@/components/search/SearchHero";
import SearchShell from "@/components/search/SearchShell";
import type { FilterState } from "@/components/search/SearchFilters";
import { searchPackages, getPriceBounds, type SortOption } from "@/server/catalogue";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search tour packages",
  description:
    "Search verified Indian tour operators by destination, price, dates, duration and rating. Every price shown is below the operator's own direct rate.",
  robots: { index: false, follow: true },
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1653844573020-71f77a0ccb8c?w=1600&q=80";

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const csv = (v: string | string[] | undefined): string[] => {
  const s = one(v);
  return s ? s.split(",").filter(Boolean) : [];
};

const num = (v: string | string[] | undefined): number | undefined => {
  const s = one(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;
  const bounds = await getPriceBounds();

  const destination = one(sp.destination) ?? "";
  const sort = (one(sp.sort) ?? "best-match") as SortOption;

  const result = await searchPackages({
    destination: destination || undefined,
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    durations: csv(sp.dur),
    difficulties: csv(sp.diff),
    inclusions: csv(sp.inc),
    groupSizes: csv(sp.grp),
    minRating: num(sp.rating),
    month: one(sp.month),
    sort,
  });

  const filterState: FilterState = {
    min: num(sp.min) ?? bounds.min,
    max: num(sp.max) ?? bounds.max,
    durations: csv(sp.dur),
    difficulties: csv(sp.diff),
    inclusions: csv(sp.inc),
    groupSizes: csv(sp.grp),
    minRating: num(sp.rating) ?? null,
    month: one(sp.month) ?? null,
  };

  const dest = result.appliedDestination;
  const heroImage = dest?.heroImage ?? FALLBACK_HERO;

  const operatorCount = new Set(result.packages.map((p) => p.operatorId)).size;
  const avgRating =
    result.packages.length > 0
      ? (
          result.packages.reduce((s, p) => s + p.trust.rating, 0) / result.packages.length
        ).toFixed(1)
      : null;

  return (
    <>
      <Navbar />

      <section className="relative min-h-[320px]">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={dest?.name ?? "Indian adventure destinations"}
            fill
            sizes="100vw"
            className="object-cover object-[center_55%]"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg,rgba(10,14,26,.9) 0%,rgba(10,14,26,.7) 45%,rgba(10,14,26,.35) 100%)",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-11">
          {dest && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin size={12} className="text-marigold-bright" />
              <span className="text-white/60 text-[13px] font-body">{dest.region}</span>
            </div>
          )}

          <h1 className="text-[2rem] sm:text-[2.9rem] font-black text-white font-display leading-tight tracking-tight">
            {dest?.name ?? "Compare operators"}
          </h1>

          {/* Real counts only. The previous hero showed a hardcoded 4.8 rating,
              "(124 reviews)", and results x 3 as a trip count. */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3 mb-7 text-[13px] font-body">
            <span className="text-white/70">
              <b className="text-white tnum">{result.total}</b> package
              {result.total === 1 ? "" : "s"}
            </span>
            {result.packages.length > 0 && (
              <>
                <span className="text-white/25">•</span>
                <span className="text-white/70">
                  <b className="text-white tnum">{operatorCount}</b> operators
                </span>
                <span className="text-white/25">•</span>
                <span className="inline-flex items-center gap-1 text-white/70">
                  <Star size={12} className="fill-star text-star" />
                  <b className="text-white tnum">{avgRating}</b> average
                </span>
                {result.cheapestAvailable != null && (
                  <>
                    <span className="text-white/25">•</span>
                    <span className="text-white/70">
                      from{" "}
                      <b className="text-white tnum">
                        {formatPrice(result.cheapestAvailable)}
                      </b>
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          <div className="max-w-5xl">
            <SearchHero
              destination={destination || "All Destinations"}
              dates={one(sp.dates) ?? ""}
              people={one(sp.people) ?? ""}
            />
          </div>
        </div>
      </section>

      <SearchShell
        results={result.packages}
        total={result.total}
        totalInCatalogue={result.totalInCatalogue}
        cheapestAvailable={result.cheapestAvailable}
        filterState={filterState}
        bounds={bounds}
        sort={sort}
        destinationLabel={dest?.name ?? (destination || null)}
      />

      <Footer />
    </>
  );
}
