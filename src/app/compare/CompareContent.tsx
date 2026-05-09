"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { packages } from "@/data/packages";
import { operators } from "@/data/operators";
import { formatPrice } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";

type CellValue = string | boolean | number;

const ROWS: { label: string; key: keyof typeof packages[number] }[] = [
  { label: "Price", key: "price" },
  { label: "Duration", key: "duration" },
  { label: "Group Size", key: "groupSize" },
  { label: "Meals Included", key: "mealsIncluded" },
  { label: "Transport", key: "transportIncluded" },
  { label: "Guide", key: "guideIncluded" },
  { label: "Hotel Type", key: "hotelType" },
  { label: "Cancellation", key: "cancellationPolicy" },
  { label: "Rating", key: "operatorRating" },
];

function getCellLabel(key: string, val: CellValue): React.ReactNode {
  if (key === "price") {
    return (
      <span className="font-bold text-compass-blue text-base font-display">
        {formatPrice(val as number)}
      </span>
    );
  }
  if (key === "operatorRating") {
    return (
      <span className="flex items-center justify-center gap-1 font-black text-base font-display">
        <Star size={14} className="fill-trail-orange text-trail-orange" />
        {val}
      </span>
    );
  }
  if (typeof val === "boolean") {
    return val ? (
      <CheckCircle2 size={22} className="text-summit-green mx-auto fill-summit-light" />
    ) : (
      <XCircle size={22} className="text-red-400 mx-auto" />
    );
  }
  if (key === "cancellationPolicy") {
    const str = val as string;
    if (str.toLowerCase().includes("free")) {
      return <span className="text-summit-green font-medium text-sm">{str}</span>;
    }
    if (str.toLowerCase().includes("no refund")) {
      return <span className="text-red-400 font-medium text-sm">{str}</span>;
    }
  }
  return <span className="text-map-text text-sm font-body">{val as string}</span>;
}

export default function CompareContent() {
  const params = useSearchParams();
  const idsParam = params.get("ids") || "";
  const ids = idsParam.split(",").filter(Boolean);

  const selected = packages.filter((p) => ids.includes(p.id));
  const pkgs = selected.length >= 2 ? selected : packages.slice(0, 3);

  const bestValueIdx = pkgs.reduce(
    (best, p, i) => (p.price < pkgs[best].price ? i : best),
    0
  );
  const topRatedIdx = pkgs.reduce(
    (best, p, i) => (p.operatorRating > pkgs[best].operatorRating ? i : best),
    0
  );
  const getLabel = (i: number): "best" | "top" | null => {
    if (i === bestValueIdx) return "best";
    if (i === topRatedIdx) return "top";
    return null;
  };

  const lowestPrice = Math.min(...pkgs.map((p) => p.price));
  const highestRating = Math.max(...pkgs.map((p) => p.operatorRating));

  const destName =
    pkgs[0]?.destinationId
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

  const getOperatorBadge = (operatorId: string) =>
    operators.find((o) => o.id === operatorId)?.badge ?? null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8 sm:py-10 bg-map-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-compass-blue text-sm font-medium hover:underline mb-6"
          >
            <ArrowLeft size={16} />
            Back to Results
          </Link>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-4xl font-black text-map-text font-display">
              Comparing {pkgs.length} Operators
            </h1>
            <p className="text-map-muted mt-1 font-body">
              Your map to the right operator. No fluff. Just facts.
            </p>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-compass-light text-compass-blue rounded-full px-4 py-1.5 text-sm font-medium font-body">
              <MapPin size={14} />
              {destName}
            </div>
            <Link
              href="/search"
              className="border border-map-border rounded-full px-4 py-2 text-sm text-map-muted hover:border-compass-blue hover:text-compass-blue transition-all flex items-center gap-1 font-body"
            >
              <ArrowLeft size={14} />
              Add More
            </Link>
          </div>

          {/* Operator header cards */}
          <div className="overflow-x-auto -mx-4 px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-0">
            <div
              className="grid gap-4 sm:gap-5 mb-4 min-w-[720px] sm:min-w-0"
              style={{ gridTemplateColumns: `160px repeat(${pkgs.length}, minmax(0, 1fr))` }}
            >
              <div className="hidden sm:block" />

              {pkgs.map((pkg, i) => {
                const badge = getOperatorBadge(pkg.operatorId);
                const label = getLabel(i);
                const isBest = label === "best";
                const isTop = label === "top";

                return (
                  <div
                    key={pkg.id}
                    className={`relative bg-map-card rounded-2xl p-4 sm:p-5 text-center shadow-sm border-2 transition-all ${
                      isBest
                        ? "border-trail-orange shadow-trail-orange/15 shadow-lg"
                        : isTop
                        ? "border-compass-blue shadow-compass-blue/15 shadow-lg"
                        : "border-map-border"
                    }`}
                  >
                    {/* Ribbon */}
                    {isBest && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-trail-orange text-white text-xs font-bold px-4 py-1 rounded-full shadow-md whitespace-nowrap z-10">
                        ⭐ Best Value
                      </span>
                    )}
                    {isTop && !isBest && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-compass-blue text-white text-xs font-bold px-4 py-1 rounded-full shadow-md whitespace-nowrap z-10">
                        🏆 Top Rated
                      </span>
                    )}

                    {/* Operator initials */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-compass-light flex items-center justify-center text-compass-blue font-black text-lg sm:text-xl font-display mx-auto mb-3">
                      {pkg.operatorName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-map-text font-display mb-1">
                      {pkg.operatorName}
                    </h3>

                    <StarRating
                      rating={pkg.operatorRating}
                      showNumber
                      reviewCount={pkg.operatorReviews}
                      className="justify-center mb-2"
                      size={13}
                    />

                    {pkg.operatorVerified && (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <ShieldCheck size={12} className="text-summit-green" />
                        <span className="text-summit-green text-xs font-medium">Verified</span>
                      </div>
                    )}

                    {badge && (
                      <span className="bg-trail-light text-trail-orange text-xs px-2.5 py-0.5 rounded-full font-medium block mb-3 font-body">
                        {badge}
                      </span>
                    )}

                    {/* Price */}
                    <div className="my-3">
                      <span className="text-3xl sm:text-4xl font-black text-compass-blue font-display">
                        {formatPrice(pkg.price)}
                      </span>
                      <span className="text-map-muted text-sm font-body">/person</span>
                    </div>

                    <Link
                      href={`/packages/${pkg.id}`}
                      className="block w-full bg-compass-blue hover:bg-compass-hover text-white rounded-2xl py-3 font-bold text-sm transition-all font-body"
                    >
                      Book Now
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison rows */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="bg-map-card border border-map-border rounded-2xl overflow-hidden shadow-sm min-w-[720px] sm:min-w-0">
              {ROWS.map((row, ri) => {
                const isEven = ri % 2 === 0;

                return (
                  <div
                    key={row.label}
                    className={`grid items-center border-b border-map-border last:border-0 ${isEven ? "bg-map-white" : "bg-map-card"}`}
                    style={{ gridTemplateColumns: `160px repeat(${pkgs.length}, minmax(0, 1fr))` }}
                  >
                    <div className="py-4 px-4 sm:px-5 text-map-text font-semibold text-sm font-body">
                      {row.label}
                    </div>

                    {pkgs.map((pkg) => {
                      const val = pkg[row.key] as CellValue;
                      const isLowest =
                        row.key === "price" && (val as number) === lowestPrice;
                      const isHighestRating =
                        row.key === "operatorRating" && (val as number) === highestRating;

                      return (
                        <div
                          key={pkg.id}
                          className={`py-4 px-4 sm:px-5 text-center ${
                            isLowest || isHighestRating ? "bg-compass-light/40" : ""
                          }`}
                        >
                          {getCellLabel(row.key, val)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 rounded-2xl p-6 sm:p-8 text-center border border-compass-blue/20 bg-compass-light">
            <h3 className="text-xl sm:text-2xl font-bold text-map-text font-display mb-2">
              Made your decision?
            </h3>
            <p className="text-map-muted font-body mb-6">
              Book directly with your preferred operator below
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {pkgs.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/packages/${pkg.id}`}
                  className="bg-compass-blue hover:bg-compass-hover text-white rounded-xl px-6 py-3 font-bold text-sm transition-all hover:scale-105 shadow-sm font-body"
                >
                  Book {pkg.operatorName}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
