"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Baby, CalendarDays, CheckCircle, ChevronDown, Clock, Hotel, IndianRupee,
  Languages, MapPin, Mountain, Plane, ShieldCheck, Star, Users, XCircle,
} from "lucide-react";
import TrustRow from "@/components/ui/TrustRow";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { cn, formatPrice } from "@/lib/utils";
import type { PackageDetail } from "@/server/catalogue";

const TABS = [
  { id: "overview", label: "Trip Overview" },
  { id: "itinerary", label: "Day-wise Plan" },
  { id: "inclusions", label: "Inclusions & Exclusions" },
  { id: "pricing", label: "Pricing" },
  { id: "gallery", label: "Gallery & Reviews" },
  { id: "operator", label: "About Operator" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

/**
 * The body of the package page: a sticky tab bar over one panel at a time, with
 * the enquiry column alongside.
 *
 * Every panel is rendered into the HTML and the inactive ones are hidden with
 * the `hidden` attribute rather than dropped from the tree. Conditional
 * rendering would leave five sixths of the page — itinerary, inclusions,
 * pricing, reviews — out of the server HTML, which is exactly the text this page
 * needs to be found for.
 */
export default function PackageTabs({
  pkg,
  sidebar,
  insight,
}: {
  pkg: PackageDetail;
  sidebar: React.ReactNode;
  insight?: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("overview");
  const [openDays, setOpenDays] = useState<number[]>([1]);

  const toggleDay = (day: number) =>
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const perDay = Math.round(pkg.price.platformPrice / Math.max(pkg.durationDays, 1));
  const openDepartures = pkg.departures.filter((d) => !d.soldOut);
  const rating = pkg.packageReviewCount > 0 ? pkg.packageRating : pkg.trust.rating;
  const reviewCount =
    pkg.packageReviewCount > 0 ? pkg.packageReviewCount : pkg.trust.reviewCount;

  return (
    <>
      {/* ── Tab bar ── */}
      <div className="sticky top-16 z-30 bg-white border-b border-warm-line shadow-sm">
        <div
          role="tablist"
          aria-label="Package details"
          className="max-w-6xl mx-auto px-2 sm:px-4 flex overflow-x-auto scrollbar-hide"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-3.5 sm:px-4 py-4 text-[13.5px] font-semibold font-body whitespace-nowrap border-b-2 transition-colors cursor-pointer",
                tab === t.id
                  ? "border-rose-pink text-rose-pink"
                  : "border-transparent text-map-muted hover:text-map-text"
              )}
            >
              {t.label}
              {t.id === "gallery" && reviewCount > 0 && (
                <span className="ml-1.5 text-[12px] text-map-muted tnum">({reviewCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Panels + enquiry column ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-9 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <aside
          id="enquiry"
          className="w-full lg:w-[336px] flex-shrink-0 order-1 lg:order-2 lg:sticky lg:top-[104px]"
        >
          {sidebar}
        </aside>

        <div className="flex-1 min-w-0 w-full order-2 lg:order-1">
          {/* ── Trip Overview ── */}
          <Panel id="overview" active={tab === "overview"}>
            <H2>About this Trip</H2>
            <p className="text-[14px] text-map-muted font-body leading-relaxed">
              {pkg.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
              <StatCard icon={IndianRupee} label="Starting from" value={formatPrice(pkg.price.platformPrice)} />
              <StatCard icon={Clock} label="Duration" value={pkg.duration} />
              <StatCard icon={Users} label="Group size" value={pkg.groupSize} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
              <Fact icon={Mountain} label="Difficulty" value={pkg.difficulty} />
              <Fact icon={Hotel} label="Stay" value={pkg.hotelType} />
              <Fact icon={Baby} label="Minimum age" value={`${pkg.minAge} years`} />
              <Fact icon={MapPin} label="Starts at" value={pkg.pickupPoint} />
              <Fact icon={MapPin} label="Ends at" value={pkg.dropPoint} />
              <Fact
                icon={CalendarDays}
                label="Departures open"
                value={openDepartures.length ? `${openDepartures.length} dates` : "None right now"}
              />
            </div>

            {pkg.highlights.length > 0 && (
              <>
                <H3 className="mt-7">Trip highlights</H3>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[12px] font-medium text-rose-pink bg-rose-light rounded-full px-3 py-1 font-body"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="mt-7">
              <TrustRow signals={pkg.trust} />
            </div>

            {insight && <div className="mt-6">{insight}</div>}
          </Panel>

          {/* ── Day-wise Plan ── */}
          <Panel id="itinerary" active={tab === "itinerary"}>
            {pkg.highlights.length > 0 && (
              <>
                <H2>Itinerary highlights</H2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-7">
                  {pkg.highlights.slice(0, 6).map((h) => (
                    <div
                      key={h}
                      className="flex items-center gap-2.5 rounded-xl bg-rose-light/60 border border-rose-pink/15 px-3.5 py-2.5"
                    >
                      <Plane size={15} className="text-rose-pink flex-shrink-0" />
                      <span className="text-[12.5px] font-semibold text-map-text font-body leading-snug">
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <H2>Day-wise itinerary</H2>
            <ol className="flex flex-col gap-2.5">
              {pkg.itinerary.map((day) => {
                const open = openDays.includes(day.day);
                return (
                  <li
                    key={day.day}
                    className="rounded-xl border border-warm-line bg-map-card overflow-hidden"
                  >
                    <button
                      onClick={() => toggleDay(day.day)}
                      aria-expanded={open}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-peach-wash transition-colors cursor-pointer"
                    >
                      <span className="w-8 h-8 rounded-lg bg-rose-pink text-white font-display font-extrabold text-[13px] flex items-center justify-center flex-shrink-0 tnum">
                        {day.day}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-display font-bold text-[14px] text-map-text leading-snug">
                          {day.title}
                        </span>
                        <span
                          className={cn(
                            "block text-[12.5px] text-map-muted font-body mt-0.5",
                            !open && "truncate"
                          )}
                        >
                          {day.description}
                        </span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "text-map-muted flex-shrink-0 transition-transform",
                          open && "rotate-180"
                        )}
                      />
                    </button>
                    {open && day.activities.length > 0 && (
                      <div className="px-3.5 pb-3.5 pl-[56px] flex flex-wrap gap-1.5">
                        {day.activities.map((a) => (
                          <span
                            key={a}
                            className="text-[11.5px] font-medium text-map-text bg-peach-wash border border-warm-line rounded-full px-2.5 py-1 font-body"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Panel>

          {/* ── Inclusions & Exclusions ── */}
          <Panel id="inclusions" active={tab === "inclusions"}>
            <H2>Inclusions</H2>
            <ul className="flex flex-col gap-2.5">
              {pkg.inclusions.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-summit-light/70 border border-summit-green/15 px-4 py-3"
                >
                  <CheckCircle size={17} className="text-summit-green flex-shrink-0 mt-px" />
                  <span className="text-[13.5px] text-map-text font-body leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <H2 className="mt-8">Exclusions</H2>
            <ul className="flex flex-col gap-2.5">
              {pkg.exclusions.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-rose-light/70 border border-rose-pink/15 px-4 py-3"
                >
                  <XCircle size={17} className="text-rose-pink flex-shrink-0 mt-px" />
                  <span className="text-[13.5px] text-map-text font-body leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-xl border border-warm-line bg-map-card p-4">
              <h3 className="flex items-center gap-2 font-display font-bold text-[14px] text-map-text">
                <ShieldCheck size={15} className="text-summit-green flex-shrink-0" />
                Cancellation — {pkg.cancellationPolicy}
              </h3>
              <p className="text-[13px] text-map-muted font-body leading-relaxed mt-1.5">
                {pkg.cancellationDescription}
              </p>
            </div>
          </Panel>

          {/* ── Pricing ── */}
          <Panel id="pricing" active={tab === "pricing"}>
            <H2>Pricing breakdown</H2>
            <div className="rounded-xl border border-warm-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse">
                  <thead>
                    <tr className="bg-atlas-night">
                      <Th>What</Th>
                      <Th align="right">Per person</Th>
                      <Th>Note</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-warm-line">
                      <Td label>Operator&apos;s direct price</Td>
                      <Td align="right">
                        <span className="tnum text-strike line-through decoration-[1.5px]">
                          {formatPrice(pkg.price.retailPrice)}
                        </span>
                      </Td>
                      <Td muted>What {pkg.operatorName} charges when you book them directly</Td>
                    </tr>
                    <tr className="border-b border-warm-line bg-summit-light/40">
                      <Td label>Atlaso price</Td>
                      <Td align="right">
                        <span className="price-hero text-[18px] text-map-text">
                          {formatPrice(pkg.price.platformPrice)}
                        </span>
                      </Td>
                      <Td muted>
                        {pkg.price.savings > 0 ? (
                          <b className="text-summit-green tnum font-bold">
                            You save {formatPrice(pkg.price.savings)} ({pkg.price.savingsPct}%)
                          </b>
                        ) : (
                          "Same as the operator's direct price"
                        )}
                      </Td>
                    </tr>
                    <tr>
                      <Td label>Per day</Td>
                      <Td align="right">
                        <span className="tnum">{formatPrice(perDay)}</span>
                      </Td>
                      <Td muted>
                        {formatPrice(pkg.price.platformPrice)} across {pkg.durationDays} days
                      </Td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-[12px] text-map-muted font-body mt-2.5 leading-relaxed">
              All prices are per person in INR, as published by {pkg.operatorName}. Savings are
              measured against that operator&apos;s own direct price for the same trip and dates.
            </p>

            <H2 className="mt-8">Departure dates</H2>
            {pkg.departures.length === 0 ? (
              <p className="text-[13.5px] text-map-muted font-body">
                No dates are published for this trip yet.
              </p>
            ) : (
              <div className="rounded-xl border border-warm-line overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse">
                    <thead>
                      <tr className="bg-atlas-night">
                        <Th>Departs</Th>
                        <Th>Returns</Th>
                        <Th align="right">Seats left</Th>
                        <Th align="right">Book</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {pkg.departures.map((d) => (
                        <tr key={d.id} className="border-b border-warm-line last:border-b-0">
                          <Td label>{formatDate(d.startDate)}</Td>
                          <Td muted>{formatDate(d.endDate)}</Td>
                          <Td align="right">
                            {d.soldOut ? (
                              <span className="text-[12px] font-bold text-rust bg-rust-tint rounded-full px-2 py-0.5 font-body">
                                Sold out
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  "tnum text-[13px] font-semibold",
                                  d.seatsLeft <= 3 ? "text-rose-pink" : "text-map-text"
                                )}
                              >
                                {d.seatsLeft} of {d.seatsTotal}
                              </span>
                            )}
                          </Td>
                          <Td align="right">
                            {d.soldOut ? (
                              <span className="text-[12.5px] text-map-muted font-body">—</span>
                            ) : (
                              <Link
                                href={`/book/${pkg.slug}`}
                                className="text-[12.5px] font-bold text-rose-pink hover:underline font-body"
                              >
                                Book
                              </Link>
                            )}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Panel>

          {/* ── Gallery & Reviews ── */}
          <Panel id="gallery" active={tab === "gallery"}>
            <H2>Gallery</H2>
            {/* The lead image takes a 2×2 block and the rest fill the last
                column, which squares off at the three images every package
                carries — and still tiles without a hole at other counts. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 auto-rows-[104px] sm:auto-rows-[128px] gap-2.5">
              {pkg.images.map((src, i) => (
                <div
                  key={src}
                  className={cn(
                    "relative rounded-xl overflow-hidden bg-peach-wash",
                    i === 0 && "col-span-2 row-span-2"
                  )}
                >
                  <Image
                    src={src}
                    alt={`${pkg.title} — view ${i + 1}`}
                    fill
                    sizes="(max-width:640px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <H2 className="mt-8">Traveller reviews</H2>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5">
                <Star size={16} className="fill-star text-star" />
                <b className="font-display font-extrabold text-[18px] text-map-text tnum">
                  {rating}
                </b>
              </span>
              <span className="text-[13px] text-map-muted font-body tnum">
                {reviewCount} review{reviewCount === 1 ? "" : "s"} for {pkg.operatorName}
              </span>
            </div>

            {pkg.reviews.length === 0 ? (
              <p className="text-[13.5px] text-map-muted font-body py-4">
                No reviews for this trip yet. Reviews can only be left after a completed trip
                booked through Atlaso.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {pkg.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-warm-line bg-map-card p-4"
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
                                  : "fill-warm-line text-warm-line"
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
                ))}
              </div>
            )}
          </Panel>

          {/* ── About Operator ── */}
          <Panel id="operator" active={tab === "operator"}>
            <H2>About {pkg.operatorName}</H2>
            <div className="rounded-2xl border border-warm-line bg-map-card p-5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-display font-extrabold text-[17px] text-map-text">
                  {pkg.operatorName}
                </span>
                {pkg.operatorVerified ? (
                  <VerifiedBadge compact />
                ) : (
                  <VerifiedBadge compact variant="pending" label="Unverified" />
                )}
              </div>
              <p className="text-[13.5px] text-map-muted font-body leading-relaxed mt-2">
                {pkg.operatorVerified
                  ? `Business registration, tourism licence and insurance checked by Atlaso. Running trips since ${pkg.operatorFoundedYear}.`
                  : `${pkg.operatorName} is still going through verification. Their packages stay listed and labelled so you always know which is which.`}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                <Fact icon={CalendarDays} label="Operating since" value={String(pkg.operatorFoundedYear)} />
                <Fact icon={Mountain} label="Trips completed" value={pkg.operatorCompletedTrips.toLocaleString("en-IN")} />
                <Fact icon={Clock} label="Replies in" value={`${pkg.trust.responseMinutes} min`} />
                <Fact icon={Star} label="Rating" value={`${pkg.trust.rating} (${pkg.trust.reviewCount})`} />
              </div>

              {pkg.operatorLanguages.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-4">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] text-map-muted font-body">
                    <Languages size={14} /> Guides speak
                  </span>
                  {pkg.operatorLanguages.map((l) => (
                    <span
                      key={l}
                      className="text-[12px] font-medium text-map-text bg-peach-wash border border-warm-line rounded-full px-2.5 py-0.5 font-body"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-5">
                <Link href={`/operators/${pkg.operatorSlug}`} className="btn-outline text-sm py-2.5">
                  View operator profile
                </Link>
                <Link href={`/compare?ids=${pkg.id}`} className="btn-outline text-sm py-2.5">
                  Compare with other operators
                </Link>
              </div>
            </div>

            <p className="text-[12.5px] text-map-muted font-body mt-3 leading-relaxed">
              {pkg.trust.bookingsLast30d} people booked with {pkg.operatorName} through Atlaso in
              the last 30 days.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}

/* ── Primitives ──────────────────────────────────────────────────────────── */

function Panel({
  id, active, children,
}: {
  id: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={`panel-${id}`} role="tabpanel" aria-label={id} hidden={!active}>
      {children}
    </section>
  );
}

function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-display font-extrabold text-[18px] text-map-text mb-3", className)}>
      {children}
    </h2>
  );
}

function H3({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-display font-bold text-[14.5px] text-map-text mb-2", className)}>
      {children}
    </h3>
  );
}

/** The three headline numbers, with the icon repeated as a watermark. */
function StatCard({
  icon: Icon, label, value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-rose-light/50 border border-rose-pink/15 p-4">
      <Icon
        size={78}
        className="absolute -right-3 -bottom-4 text-rose-pink opacity-[0.07]"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mb-2.5 shadow-sm">
          <Icon size={17} className="text-rose-pink" />
        </div>
        <p className="text-[11.5px] text-map-muted font-body">{label}</p>
        <p className="font-display font-bold text-rose-pink text-[15px] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function Fact({
  icon: Icon, label, value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-warm-line bg-map-card px-3 py-2.5 min-w-0">
      <span className="label-util flex items-center gap-1.5">
        <Icon size={11} /> {label}
      </span>
      <span className="block font-display font-bold text-[13px] text-map-text mt-0.5 truncate">
        {value}
      </span>
    </div>
  );
}

function Th({
  children, align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-[12px] font-bold text-white/90 font-body uppercase tracking-[0.06em]",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children, align = "left", label, muted,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  label?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-[13px] font-body align-middle",
        align === "right" ? "text-right" : "text-left",
        label && "font-semibold text-map-text",
        muted && "text-map-muted"
      )}
    >
      {children}
    </td>
  );
}
