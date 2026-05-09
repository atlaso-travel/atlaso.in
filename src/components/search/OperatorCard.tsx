"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Check,
  ArrowRight,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import type { Package } from "@/data/packages";

interface OperatorCardProps {
  pkg: Package;
  isInCompare: boolean;
  onToggleCompare: (id: string) => void;
  isCompact?: boolean;
}

function formatDurationShort(duration: string): string {
  return duration
    .replace(/(\d+)\s*Days?/i, "$1D")
    .replace(/(\d+)\s*Nights?/i, "$1N");
}

function getBadge(pkg: Package): string | null {
  if (pkg.operatorRating >= 4.9) return "Top Rated";
  if (pkg.price <= 12000) return "Best Value";
  return null;
}

export default function OperatorCard({
  pkg,
  isInCompare,
  onToggleCompare,
  isCompact = true,
}: OperatorCardProps) {
  const badge = getBadge(pkg);

  /* ── COMPACT LIST ROW (default) ── */
  if (isCompact) {
    return (
      <div
        className={cn(
          "bg-white rounded-[14px] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3.5",
          "border transition-all duration-200 cursor-pointer mb-2",
          "hover:border-map-border-blue hover:shadow-blue-sm border-map-border"
        )}
      >
        {/* Image */}
        <div className="w-full h-32 sm:w-16 sm:h-16 flex-shrink-0 rounded-[10px] overflow-hidden">
          <Image
            src={pkg.images[0]}
            alt={pkg.title}
            width={320}
            height={180}
            className="object-cover w-full h-full rounded-[10px]"
          />
        </div>

        {/* Main Info */}
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          {/* Row 1 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[15px] text-map-text font-display whitespace-nowrap">
              {pkg.operatorName}
            </span>
            {pkg.operatorVerified && (
              <ShieldCheck size={14} className="text-summit-green flex-shrink-0" />
            )}
            {badge && (
              <span className="bg-trail-light text-trail-orange rounded-full text-[10px] px-2 py-0.5 font-semibold font-body">
                {badge}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <span className="text-xs text-trail-orange">★</span>
              <span className="text-xs font-semibold text-map-text">
                {pkg.operatorRating}
              </span>
              <span className="text-[11px] text-map-muted">({pkg.operatorReviews})</span>
            </span>
          </div>

          {/* Row 2 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-map-muted">
              {formatDurationShort(pkg.duration)}
            </span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="text-xs text-map-muted">{pkg.groupSize}</span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-map-border text-map-muted">
              {pkg.difficulty}
            </span>
          </div>

          {/* Row 3 */}
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <InclusionMini included={pkg.mealsIncluded} label="Meals" />
            <InclusionMini included={pkg.guideIncluded} label="Guide" />
            <InclusionMini included={pkg.transportIncluded} label="Transport" />
            <span className="bg-compass-light text-compass-blue rounded-full text-[10px] px-2 py-0.5 font-medium ml-auto whitespace-nowrap font-body">
              {pkg.destinationId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="w-full sm:w-24 sm:text-right flex-shrink-0 flex items-center justify-between sm:block">
          <span className="text-[10px] text-map-muted block">from</span>
          <span className="text-xl font-black text-compass-blue font-display block">
            {formatPrice(pkg.price)}
          </span>
          <span className="text-[10px] text-map-muted block">/person</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-row sm:flex-col gap-2 sm:gap-1.5 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(pkg.id);
            }}
            className={cn(
              "border rounded-lg px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 transition-all duration-150 flex-1 sm:flex-none",
              isInCompare
                ? "border-compass-blue text-compass-blue bg-compass-light"
                : "border-map-border text-map-muted bg-white"
            )}
          >
            {isInCompare ? <Check size={12} /> : <Plus size={12} />}
            {isInCompare ? "Added" : "Compare"}
          </button>

          <Link
            href={`/packages/${pkg.id}`}
            onClick={(e) => e.stopPropagation()}
            className="bg-compass-blue hover:bg-compass-hover text-white rounded-lg px-2.5 py-1.5 text-[11px] font-bold border-none cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 transition-colors duration-150 no-underline flex-1 sm:flex-none"
          >
            View →
          </Link>
        </div>
      </div>
    );
  }

  /* ── CARD GRID VIEW (when grid icon is active) ── */
  return (
    <div
      className={cn(
        "bg-white rounded-2xl overflow-hidden transition-all duration-200 flex flex-col border",
        isInCompare
          ? "border-compass-blue shadow-[0_0_0_2px_rgba(42,109,217,0.15)]"
          : "border-map-border hover:border-map-border-blue hover:shadow-card-hover"
      )}
    >
      {/* Image */}
      <div className="relative w-full h-40 flex-shrink-0">
        <Image
          src={pkg.images[0]}
          alt={pkg.title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
        {pkg.operatorVerified && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-summit-green text-white text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
              Verified
            </span>
          </div>
        )}
        {badge && (
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-trail-light text-trail-orange text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3.5 flex flex-col gap-2 flex-1">
        {/* Name + verified */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[15px] text-map-text font-display">
            {pkg.operatorName}
          </span>
          {pkg.operatorVerified && (
            <ShieldCheck size={14} className="text-summit-green" />
          )}
        </div>

        {/* Title */}
        <p className="text-xs text-map-muted m-0 leading-[1.4] line-clamp-2">
          {pkg.title}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <span className="text-[13px] text-trail-orange">★</span>
          <span className="text-[13px] font-semibold text-map-text">
            {pkg.operatorRating}
          </span>
          <span className="text-[11px] text-map-muted">({pkg.operatorReviews})</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {[formatDurationShort(pkg.duration), pkg.groupSize, pkg.difficulty].map((label) => (
            <span
              key={label}
              className="border border-map-border rounded-full px-2.5 py-0.5 text-[11px] text-map-muted"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Inclusions */}
        <div className="flex gap-2 flex-wrap">
          <InclusionMini included={pkg.mealsIncluded} label="Meals" />
          <InclusionMini included={pkg.guideIncluded} label="Guide" />
          <InclusionMini included={pkg.transportIncluded} label="Transport" />
        </div>

        {/* Price + buttons */}
        <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-[#F1F5F9]">
          <div>
            <span className="text-[10px] text-map-muted block">from</span>
            <span className="text-xl font-black text-compass-blue font-display">
              {formatPrice(pkg.price)}
            </span>
            <span className="text-[10px] text-map-muted block">/person</span>
          </div>

          <div className="flex flex-col gap-1.5 items-end">
            <button
              onClick={() => onToggleCompare(pkg.id)}
              className={cn(
                "border rounded-lg px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer flex items-center gap-1",
                isInCompare
                  ? "border-compass-blue text-compass-blue bg-compass-light"
                  : "border-map-border text-map-muted bg-white"
              )}
            >
              {isInCompare ? <Check size={11} /> : <Plus size={11} />}
              {isInCompare ? "Added" : "Compare"}
            </button>
            <Link
              href={`/packages/${pkg.id}`}
              className="bg-compass-blue text-white rounded-lg px-3 py-1.5 text-[11px] font-bold flex items-center gap-1 no-underline"
            >
              View <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InclusionMini({ included, label }: { included: boolean; label: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {included ? (
        <CheckCircle2 size={11} className="text-summit-green" />
      ) : (
        <XCircle size={11} className="text-red-400" />
      )}
      <span className={cn("text-[11px]", included ? "text-summit-green" : "text-red-400")}>
        {label}
      </span>
    </span>
  );
}
