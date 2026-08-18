"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Heart,
  Mountain,
  CalendarDays,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import CtaBanner from "@/components/home/CtaBanner";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Destination } from "@/data/destinations";

interface PackageItem {
  id: string;
  title: string;
  price: number;
  duration: string;
  groupSize: string;
  mealsIncluded: boolean;
  guideIncluded: boolean;
  transportIncluded: boolean;
  hotelType: string;
  images: string[];
  operatorRating: number;
  operatorReviews: number;
}

interface Props {
  dest: Destination;
  packages: PackageItem[];
  minPrice: number;
  avgRating: number;
  totalReviews: number;
}

type TabId = "overview" | "experiences" | "best-time" | "faqs" | "itineraries";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "experiences", label: "Experiences" },
  { id: "best-time", label: "Best Time To Visit" },
  { id: "faqs", label: "FAQs" },
  { id: "itineraries", label: "Available Itineraries" },
];

const MONTH_KEYS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
] as const;

const MONTH_NAMES: Record<string, string> = {
  jan: "January", feb: "February", mar: "March", apr: "April",
  may: "May", jun: "June", jul: "July", aug: "August",
  sep: "September", oct: "October", nov: "November", dec: "December",
};

function shortDuration(d: string) {
  const m = d.match(/(\d+)\s*Days?[^/]*\/\s*(\d+)\s*Nights?/i);
  return m ? `${m[1]}D / ${m[2]}N` : d;
}

export default function DestinationTabs({
  dest,
  packages,
  minPrice,
  avgRating,
  totalReviews,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [savedPkgs, setSavedPkgs] = useState<Set<string>>(new Set());

  const toggleSaved = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSavedPkgs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      {/* ── Tab Bar ── */}
      <div className="sticky top-16 z-20 bg-white border-b border-map-border shadow-sm">
        <div className="max-w-5xl mx-auto flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer",
                activeTab === tab.id
                  ? "border-rose-pink text-rose-pink"
                  : "border-transparent text-map-muted hover:text-map-text"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>













      {/* ── Tab Content ── */}
      <div className="max-w-5xl w-full mx-auto py-6 sm:py-10">

        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-bold text-map-text font-display mb-3">
              About {dest.name}
            </h2>
            <p className="text-map-muted font-body leading-relaxed text-sm mb-8">
              {dest.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <CalendarDays size={20} className="text-trail-orange" />,
                  label: "Best Season",
                  value: dest.bestTime,
                },
                {
                  icon: <Mountain size={20} className="text-trail-orange" />,
                  label: "Itineraries Available",
                  value: `${packages.length || "10"}+ trips`,
                },
                {
                  icon: <IndianRupee size={20} className="text-trail-orange" />,
                  label: "Starting From",
                  value: formatPrice(minPrice),
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-rose-light/50 border border-rose-pink/15 rounded-2xl p-5"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
                    {card.icon}
                  </div>
                  <p className="text-xs text-map-muted mb-1">{card.label}</p>
                  <p className="font-bold text-rose-pink text-base font-display">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Experiences */}
        {activeTab === "experiences" && (
          <div>
            <h2 className="text-xl font-bold text-map-text font-display mb-3">
              About {dest.name}
            </h2>
            <p className="text-map-muted font-body leading-relaxed text-sm mb-7">
              {dest.description}
            </p>
            <div className="space-y-3">
              {dest.experiences.map((exp) => (
                <div
                  key={exp.title}
                  className="bg-rose-light/30 border border-rose-pink/10 rounded-2xl p-4 flex gap-4 items-start"
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Mountain size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-rose-pink text-sm mb-0.5">
                      {exp.title}
                    </p>
                    <p className="text-map-muted text-xs leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Best Time To Visit */}
        {activeTab === "best-time" && (
          <div>
            <p className="text-map-muted text-sm mb-6">
              Choose your travel window wisely. Each season in {dest.name} offers a
              different experience.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MONTH_KEYS.map((key) => {
                const status = dest.monthStatuses[key];
                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-2xl px-4 py-4",
                      status === "best"
                        ? "bg-rose-pink"
                        : status === "ideal"
                        ? "bg-rose-light border border-rose-pink/25"
                        : "bg-white border border-map-border"
                    )}
                  >
                    <p
                      className={cn(
                        "font-semibold text-sm",
                        status === "best"
                          ? "text-white"
                          : status === "ideal"
                          ? "text-rose-pink"
                          : "text-map-text"
                      )}
                    >
                      {MONTH_NAMES[key]}
                    </p>
                    <p
                      className={cn(
                        "text-xs mt-0.5",
                        status === "best"
                          ? "text-white/80"
                          : status === "ideal"
                          ? "text-rose-pink/70"
                          : "text-map-muted"
                      )}
                    >
                      {status === "best"
                        ? "Best time"
                        : status === "ideal"
                        ? "Ideal"
                        : "Closed"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQs */}
        {activeTab === "faqs" && (
          <div className="space-y-3">
            {dest.faqs.map((faq, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl px-5 py-4 transition-colors",
                  openFaq === i
                    ? "bg-rose-light border border-rose-pink/20"
                    : "bg-white border border-map-border"
                )}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      openFaq === i ? "text-rose-pink" : "text-map-text"
                    )}
                  >
                    {faq.question}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp size={16} className="text-rose-pink flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-map-muted flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <p className="text-map-muted text-sm mt-3 leading-relaxed font-body">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Available Itineraries */}
        {activeTab === "itineraries" && (
          <div>
            {packages.length > 0 ? (
              <>
                <div className="space-y-4">
                  {packages.map((pkg) => {
                    const tags = [
                      pkg.transportIncluded && { label: "Transport", green: true },
                      { label: "Stay", green: true },
                      pkg.mealsIncluded && { label: "Meals", green: true },
                      pkg.guideIncluded && { label: "Guide", green: false },
                    ].filter(Boolean) as { label: string; green: boolean }[];

                    return (
                      <div
                        key={pkg.id}
                        className="bg-white rounded-2xl border border-map-border p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="relative w-[72px] h-[72px] flex-shrink-0 rounded-xl overflow-hidden">
                            <Image
                              src={pkg.images[0]}
                              alt={pkg.title}
                              fill
                              sizes="72px"
                              className="object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <h3 className="font-bold text-map-text text-sm font-display leading-snug">
                                {pkg.title}
                              </h3>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-0.5">
                                  <Star
                                    size={11}
                                    className="text-yellow-400 fill-yellow-400"
                                  />
                                  <span className="text-xs font-bold text-map-text">
                                    {pkg.operatorRating}
                                  </span>
                                  <span className="text-xs text-map-muted">
                                    ({pkg.operatorReviews})
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => toggleSaved(e, pkg.id)}
                                  className="text-map-muted hover:text-rose-pink transition-colors"
                                >
                                  <Heart
                                    size={14}
                                    className={cn(
                                      savedPkgs.has(pkg.id)
                                        ? "fill-rose-pink text-rose-pink"
                                        : ""
                                    )}
                                  />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-map-muted mb-1">
                              {pkg.hotelType}
                            </p>
                            <p className="text-xs text-map-muted mb-2.5">
                              {shortDuration(pkg.duration)}&nbsp;&nbsp;|&nbsp;&nbsp;
                              {pkg.groupSize}
                            </p>

                            {/* Inclusion Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {tags.map((tag) => (
                                <span
                                  key={tag.label}
                                  className={cn(
                                    "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium",
                                    tag.green
                                      ? "bg-summit-light text-summit-green"
                                      : "bg-rose-light text-rose-pink"
                                  )}
                                >
                                  {tag.green ? (
                                    <CheckCircle size={9} />
                                  ) : (
                                    <XCircle size={9} />
                                  )}
                                  {tag.label}
                                </span>
                              ))}
                            </div>

                            {/* Price + CTA */}
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-[10px] text-map-muted leading-none mb-0.5">
                                  From
                                </p>
                                <p className="font-bold text-sm text-map-text">
                                  {formatPrice(pkg.price)}{" "}
                                  <span className="text-xs font-normal text-map-muted">
                                    / Person
                                  </span>
                                </p>
                              </div>
                              <Link
                                href={`/packages/${pkg.id}`}
                                className="text-xs font-semibold text-rose-pink hover:underline"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-right mt-5">
                  <Link
                    href={`/search?destination=${encodeURIComponent(dest.name)}`}
                    className="text-sm font-semibold text-rose-pink hover:underline"
                  >
                    View All
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-map-muted text-sm">
                No itineraries listed yet.{" "}
                <Link
                  href={`/search?destination=${encodeURIComponent(dest.name)}`}
                  className="text-rose-pink underline"
                >
                  Search all operators for {dest.name}
                </Link>
              </p>
            )}
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <CtaBanner />
    </>
  );
}
