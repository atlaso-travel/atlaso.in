"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Clock, Heart, Minus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import PriceBlock from "@/components/ui/PriceBlock";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import TrustRow from "@/components/ui/TrustRow";
import type { PackageSummary } from "@/server/catalogue";

/**
 * Search result card. Every price on it comes from the server-computed
 * `PublicPrice` on the summary — there is no arithmetic in this file.
 */

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", timeZone: "UTC",
  });
}

function Inclusion({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11.5px] font-medium px-2 py-0.5 rounded-full font-body whitespace-nowrap",
        on ? "bg-fern-tint text-fern-quiet" : "bg-map-white text-map-muted"
      )}
    >
      {on ? <Check size={11} strokeWidth={3} /> : <Minus size={11} strokeWidth={3} />}
      {label}
    </span>
  );
}

export default function PackageCard({
  pkg,
  isCompact,
  isInCompare,
  onToggleCompare,
  compareFull,
  isSaved,
  onToggleSave,
}: {
  pkg: PackageSummary;
  isCompact: boolean;
  isInCompare: boolean;
  onToggleCompare: (id: string) => void;
  compareFull: boolean;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const scarce = pkg.seatsLeftOnNext != null && pkg.seatsLeftOnNext <= 3;

  const compareToggle = (
    <button
      onClick={() => onToggleCompare(pkg.id)}
      disabled={!isInCompare && compareFull}
      aria-pressed={isInCompare}
      className={cn(
        "text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-all font-body whitespace-nowrap",
        isInCompare
          ? "bg-compass-blue text-white border-compass-blue"
          : compareFull
          ? "border-map-border text-map-border cursor-not-allowed"
          : "border-map-border text-map-muted hover:border-compass-blue hover:text-compass-blue"
      )}
    >
      {isInCompare ? "Added" : "Compare"}
    </button>
  );

  const saveToggle = (
    <button
      onClick={() => onToggleSave(pkg.id)}
      aria-label={isSaved ? "Remove from saved" : "Save this package"}
      aria-pressed={isSaved}
      className="w-8 h-8 rounded-full border border-map-border bg-white/90 flex items-center justify-center hover:border-compass-blue transition-colors flex-shrink-0"
    >
      <Heart
        size={14}
        className={isSaved ? "fill-compass-blue text-compass-blue" : "text-map-muted"}
      />
    </button>
  );

  return (
    <article
      className={cn(
        "bg-map-card rounded-2xl border transition-all overflow-hidden",
        isInCompare
          ? "border-compass-blue shadow-blue-sm"
          : "border-map-border hover:border-map-border-blue hover:shadow-card-hover"
      )}
    >
      <div className={cn(isCompact ? "flex flex-col sm:flex-row" : "flex flex-col")}>
        {/* Image */}
        <div
          className={cn(
            "relative flex-shrink-0",
            isCompact ? "sm:w-[210px] h-[160px] sm:h-auto" : "h-[168px]"
          )}
        >
          <Image
            src={pkg.image}
            alt={pkg.title}
            fill
            sizes="(max-width:640px) 100vw, 210px"
            className="object-cover"
          />
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
            {pkg.price.savingsPct >= 12 && (
              <span className="bg-fern text-white text-[10.5px] font-extrabold px-2 py-0.5 rounded-full tnum">
                {pkg.price.savingsPct}% below direct
              </span>
            )}
            {scarce && (
              <span className="bg-marigold-bright text-[#231303] text-[10.5px] font-extrabold px-2 py-0.5 rounded-full">
                {pkg.seatsLeftOnNext} seats left
              </span>
            )}
          </div>
          <div className="absolute top-2.5 right-2.5">{saveToggle}</div>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 p-4 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="font-display font-bold text-[13px] text-map-text">
                  {pkg.operatorName}
                </span>
                {pkg.operatorVerified ? (
                  <VerifiedBadge compact />
                ) : (
                  <VerifiedBadge compact variant="pending" label="Unverified" />
                )}
              </div>
              <h3 className="font-display font-bold text-[16px] text-map-text leading-snug">
                <Link href={`/packages/${pkg.slug}`} className="hover:text-compass-blue transition-colors">
                  {pkg.title}
                </Link>
              </h3>
              <p className="text-[12.5px] text-map-muted font-body leading-snug mt-1 line-clamp-2">
                {pkg.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[12px] text-map-muted font-body flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} /> {pkg.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={12} /> {pkg.groupSize}
            </span>
            {pkg.nextDepartureDate && (
              <span className="tnum">Next: {formatDate(pkg.nextDepartureDate)}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Inclusion on={pkg.mealsIncluded} label="Meals" />
            <Inclusion on={pkg.transportIncluded} label="Transport" />
            <Inclusion on={pkg.guideIncluded} label="Guide" />
          </div>

          {!isCompact && <TrustRow signals={pkg.trust} />}

          <div className="flex items-end justify-between gap-3 mt-auto pt-1">
            <PriceBlock price={pkg.price} size="card" />
            <div className="flex items-center gap-2 flex-shrink-0">
              {compareToggle}
              <Link href={`/packages/${pkg.slug}`} className="btn-primary text-[13px] px-4 py-2">
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
