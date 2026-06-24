"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Plus,
  Check,
  ArrowRight,
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import type { Package } from "@/data/packages";

interface OperatorCardProps {
  pkg: Package;
  isInCompare: boolean;
  onToggleCompare: (id: string) => void;
  isCompact?: boolean;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

function formatDurationShort(duration: string): string {
  return duration
    .replace(/(\d+)\s*Days?/i, "$1D")
    .replace(/(\d+)\s*Nights?/i, "$1N");
}

function getBadge(pkg: Package): { label: string; cls: string } | null {
  if (pkg.operatorRating >= 4.9)
    return { label: "Top Rated", cls: "bg-summit-light text-summit-green" };
  if (pkg.price <= 12000)
    return { label: "Best Value", cls: "bg-trail-light text-trail-orange" };
  return null;
}

function InclusionPill({ included, label }: { included: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1 rounded-full font-body whitespace-nowrap",
        included
          ? "bg-[#EDFAF3] text-[#16A34A]"
          : "bg-[#FFF1F2] text-[#F43F5E]"
      )}
    >
      {included ? (
        <CheckCircle2 size={13} strokeWidth={2} />
      ) : (
        <XCircle size={13} strokeWidth={2} />
      )}
      {label}
    </span>
  );
}

export default function OperatorCard({
  pkg,
  isInCompare,
  onToggleCompare,
  isCompact = true,
  isSaved = false,
  onToggleSave,
}: OperatorCardProps) {
  const badge = getBadge(pkg);

  /* ── LIST ROW ── */
  if (isCompact) {
    return (
      <div
        className={cn(
          "bg-white rounded-2xl border transition-all duration-200 overflow-hidden",
          isInCompare
            ? "border-compass-blue shadow-[0_0_0_2px_rgba(255,90,95,0.1)]"
            : "border-[#E8ECF0] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-[#D0D5DD]"
        )}
      >
        {/* Top section: image + content */}
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="w-[100px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden">
            <Image
              src={pkg.images[0]}
              alt={pkg.title}
              width={200}
              height={200}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            {/* Row 1: title + rating + heart */}
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  {badge && (
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold font-body", badge.cls)}>
                      {badge.label}
                    </span>
                  )}
                  {pkg.operatorVerified && (
                    <ShieldCheck size={12} className="text-summit-green" />
                  )}
                </div>
                <h3 className="font-bold text-[16px] text-[#0F172A] font-display leading-snug">
                  {pkg.title}
                </h3>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0 mt-0.5">
                <div className="flex items-center gap-0.5">
                  <span className="text-yellow-400 text-[14px]">★</span>
                  <span className="text-[13px] font-bold text-[#0F172A]">{pkg.operatorRating}</span>
                  <span className="text-[12px] text-[#94A3B8] font-body ml-0.5">({pkg.operatorReviews})</span>
                </div>
                {onToggleSave && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleSave(pkg.id); }}
                    className="p-0.5 transition-transform active:scale-90"
                    aria-label={isSaved ? "Remove from saved" : "Save trip"}
                  >
                    <Heart
                      size={18}
                      className={cn(
                        "transition-all duration-200",
                        isSaved ? "fill-[#F43F5E] text-[#F43F5E]" : "text-[#CBD5E1] hover:text-[#F43F5E]"
                      )}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: description */}
            <p className="text-[12px] text-[#64748B] font-body leading-snug line-clamp-1">
              {pkg.hotelType || pkg.operatorName}
            </p>

            {/* Row 3: stats */}
            <div className="flex items-center gap-2 text-[12px] text-[#94A3B8] font-body flex-wrap">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {formatDurationShort(pkg.duration)}
              </span>
              <span className="text-[#CBD5E1]">|</span>
              <span className="flex items-center gap-1">
                <Users size={11} />
                {pkg.groupSize}
              </span>
              <span className="text-[#CBD5E1]">|</span>
              <span>{pkg.difficulty}</span>
            </div>

            {/* Row 4: inclusion pills */}
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              <InclusionPill included={pkg.transportIncluded} label="Transport" />
              <InclusionPill included={!!pkg.hotelType} label="Stay" />
              <InclusionPill included={pkg.mealsIncluded} label="Meals" />
              <InclusionPill included={pkg.guideIncluded} label="Guide" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#F1F5F9]">
          <div>
            <p className="text-[11px] text-[#94A3B8] font-body leading-none mb-0.5">From</p>
            <p className="font-body text-[#0F172A]">
              <span className="text-[20px] font-black font-display">{formatPrice(pkg.price)}</span>
              <span className="text-[12px] text-[#94A3B8] ml-1">/ Person</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/packages/${pkg.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-compass-blue text-[13px] font-bold hover:underline transition-all no-underline font-body"
            >
              View Details
            </Link>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare(pkg.id); }}
              className={cn(
                "flex items-center gap-1.5 border rounded-xl px-4 py-2 text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 font-body",
                isInCompare
                  ? "bg-[#0A1628] text-white border-[#0A1628]"
                  : "bg-white text-[#374151] border-[#D1D5DB] hover:border-[#374151]"
              )}
            >
              {isInCompare ? (
                <>
                  <CheckCircle2 size={14} />
                  Compare
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Compare
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID CARD ── */
  return (
    <div
      className={cn(
        "bg-white rounded-2xl overflow-hidden flex flex-col border transition-all duration-200 group",
        isInCompare
          ? "border-compass-blue shadow-[0_0_0_2px_rgba(255,90,95,0.1)]"
          : "border-[#E8ECF0] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-[#D0D5DD]"
      )}
    >
      {/* Image */}
      <div className="relative w-full h-44 flex-shrink-0 overflow-hidden">
        <Image
          src={pkg.images[0]}
          alt={pkg.title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {pkg.operatorVerified && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-white/90 text-summit-green text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck size={10} />
              Verified
            </span>
          </div>
        )}
        {badge && (
          <div className="absolute top-2.5 right-2.5">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", badge.cls)}>
              {badge.label}
            </span>
          </div>
        )}
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(pkg.id)}
            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-90"
            style={{ top: badge ? "calc(2.5rem + 8px)" : undefined }}
          >
            <Heart
              size={15}
              className={cn(
                "transition-all",
                isSaved ? "fill-[#F43F5E] text-[#F43F5E]" : "text-[#64748B]"
              )}
            />
          </button>
        )}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="bg-black/60 text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium backdrop-blur-sm font-body">
            {formatDurationShort(pkg.duration)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3.5 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-[14px] text-[#0F172A] font-display leading-snug line-clamp-2">
          {pkg.title}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-[#64748B] font-body">{pkg.operatorName}</span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <span className="text-yellow-400 text-[12px]">★</span>
            <span className="text-[12px] font-bold text-[#0F172A]">{pkg.operatorRating}</span>
            <span className="text-[11px] text-[#94A3B8] font-body ml-0.5">({pkg.operatorReviews})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#94A3B8] font-body">
          <span>{pkg.groupSize}</span>
          <span className="text-[#CBD5E1]">•</span>
          <span className="border border-[#E2E8F0] rounded-full px-1.5 py-px">{pkg.difficulty}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <InclusionPill included={pkg.transportIncluded} label="Transport" />
          <InclusionPill included={!!pkg.hotelType} label="Stay" />
          <InclusionPill included={pkg.mealsIncluded} label="Meals" />
          <InclusionPill included={pkg.guideIncluded} label="Guide" />
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F1F5F9]">
          <div>
            <span className="text-[10px] text-[#94A3B8] block font-body">from</span>
            <span className="text-[18px] font-black text-compass-blue font-display leading-tight">
              {formatPrice(pkg.price)}
            </span>
            <span className="text-[10px] text-[#94A3B8] block font-body">/person</span>
          </div>

          <div className="flex flex-col gap-1.5 items-end">
            <button
              onClick={() => onToggleCompare(pkg.id)}
              className={cn(
                "border rounded-lg px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer flex items-center gap-1 transition-all font-body",
                isInCompare
                  ? "bg-[#0A1628] text-white border-[#0A1628]"
                  : "border-[#D1D5DB] text-[#374151] bg-white hover:border-[#374151]"
              )}
            >
              {isInCompare ? <CheckCircle2 size={11} /> : <Plus size={11} />}
              {isInCompare ? "Added" : "Compare"}
            </button>
            <Link
              href={`/packages/${pkg.id}`}
              className="bg-[#0A1628] hover:bg-[#0F1F3D] text-white rounded-lg px-3 py-1.5 text-[11px] font-bold flex items-center gap-1 no-underline transition-colors font-body"
            >
              View <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
