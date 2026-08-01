"use client";

import { useState } from "react";
import { Check, ChevronDown, Minus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PackageDetail } from "@/server/catalogue";

const TABS = ["itinerary", "inclusions", "reviews"] as const;
type Tab = (typeof TABS)[number];

const LABELS: Record<Tab, string> = {
  itinerary: "Itinerary",
  inclusions: "What's included",
  reviews: "Reviews",
};

export default function PackageTabs({ pkg }: { pkg: PackageDetail }) {
  const [tab, setTab] = useState<Tab>("itinerary");
  const [openDays, setOpenDays] = useState<number[]>([1]);

  const toggleDay = (day: number) =>
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  return (
    <div>
      {/* Tab bar — scrollable on narrow screens rather than wrapping */}
      <div
        role="tablist"
        aria-label="Package details"
        className="flex gap-1 border-b border-map-border overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-3 text-[14px] font-semibold font-body whitespace-nowrap border-b-2 -mb-px transition-colors",
              tab === t
                ? "border-compass-blue text-compass-blue"
                : "border-transparent text-map-muted hover:text-map-text"
            )}
          >
            {LABELS[t]}
            {t === "reviews" && pkg.packageReviewCount > 0 && (
              <span className="ml-1.5 text-[12px] text-map-muted tnum">
                ({pkg.packageReviewCount})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {tab === "itinerary" && (
          <ol className="flex flex-col gap-2.5">
            {pkg.itinerary.map((day) => {
              const open = openDays.includes(day.day);
              return (
                <li
                  key={day.day}
                  className="rounded-xl border border-map-border bg-map-card overflow-hidden"
                >
                  <button
                    onClick={() => toggleDay(day.day)}
                    aria-expanded={open}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-map-white transition-colors"
                  >
                    <span className="w-9 h-9 rounded-lg bg-compass-light text-compass-blue font-display font-extrabold text-[12px] flex items-center justify-center flex-shrink-0 tnum">
                      D{day.day}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-display font-bold text-[14.5px] text-map-text leading-snug">
                        {day.title}
                      </span>
                      {!open && (
                        <span className="block text-[12.5px] text-map-muted font-body truncate mt-0.5">
                          {day.description}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-map-muted flex-shrink-0 transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 pl-[60px]">
                      <p className="text-[13.5px] text-map-muted font-body leading-relaxed">
                        {day.description}
                      </p>
                      {day.activities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {day.activities.map((a) => (
                            <span
                              key={a}
                              className="text-[11.5px] font-medium text-map-text bg-map-white border border-map-border rounded-full px-2.5 py-1 font-body"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {tab === "inclusions" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <h3 className="font-display font-bold text-[14px] text-map-text mb-2.5">
                Included
              </h3>
              <ul className="flex flex-col gap-2">
                {pkg.inclusions.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[13.5px] text-map-text font-body leading-snug">
                    <Check size={15} className="text-summit-green flex-shrink-0 mt-0.5" strokeWidth={2.6} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-[14px] text-map-text mb-2.5">
                Not included
              </h3>
              <ul className="flex flex-col gap-2">
                {pkg.exclusions.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[13.5px] text-map-muted font-body leading-snug">
                    <Minus size={15} className="flex-shrink-0 mt-0.5" strokeWidth={2.6} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2 rounded-xl bg-map-white border border-map-border p-4">
              <h3 className="font-display font-bold text-[13.5px] text-map-text mb-1">
                Cancellation — {pkg.cancellationPolicy}
              </h3>
              <p className="text-[13px] text-map-muted font-body leading-relaxed">
                {pkg.cancellationDescription}
              </p>
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="flex flex-col gap-3">
            {pkg.reviews.length === 0 ? (
              <p className="text-[13.5px] text-map-muted font-body py-6 text-center">
                No reviews yet. Reviews can only be left after a completed trip booked
                through Atlaso.
              </p>
            ) : (
              pkg.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-map-border bg-map-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="avatar-circle flex-shrink-0">{review.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-[13.5px] text-map-text">
                          {review.name}
                        </span>
                        {review.verified && (
                          <span className="text-[10.5px] font-bold text-summit-green bg-summit-light rounded-full px-2 py-0.5 font-body">
                            Verified booking
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < review.rating
                                ? "fill-star text-star"
                                : "fill-map-border text-map-border"
                            }
                          />
                        ))}
                        <span className="text-[11.5px] text-map-muted font-body ml-1">
                          {review.date}
                        </span>
                      </div>
                      <p className="text-[13.5px] text-map-text font-body leading-relaxed mt-2">
                        {review.text}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
