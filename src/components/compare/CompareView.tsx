"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, ArrowDown, Bookmark, BookmarkCheck, Check, ChevronDown, Minus, Plus,
  Star, TriangleAlert, X,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import PriceBlock from "@/components/ui/PriceBlock";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import ContourField from "@/components/ui/ContourField";
import { useSavedComparisons } from "@/hooks/useSavedComparisons";
import type { Comparison } from "@/server/compare";
import type { PackageSummary } from "@/server/catalogue";

const SECTIONS = [
  { id: "price", label: "Price" },
  { id: "glance", label: "At a glance" },
  { id: "trust", label: "Trust & policy" },
  { id: "included", label: "What's included" },
  { id: "itinerary", label: "Day by day" },
] as const;

const VERDICT_STYLE: Record<string, string> = {
  "cheapest": "bg-fern-tint text-fern",
  "biggest-saving": "bg-fern-tint text-fern",
  "best-rated": "bg-indigo-tint text-indigo",
  "most-flexible": "bg-indigo-tint text-indigo",
  "longest": "bg-marigold-tint text-marigold",
  "smallest-group": "bg-marigold-tint text-marigold",
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

export default function CompareView({
  comparison,
  candidates,
  destinationName,
}: {
  comparison: Comparison;
  candidates: PackageSummary[];
  destinationName: string | null;
}) {
  const { columns, features, maxDays, spread } = comparison;
  const [open, setOpen] = useState<Set<string>>(new Set(SECTIONS.map((s) => s.id)));
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [picker, setPicker] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const { saveComparison } = useSavedComparisons();

  const ids = useMemo(() => columns.map((c) => c.pkg.id), [columns]);
  const n = columns.length;

  /* One grid drives every row, so a section header can never fall out of step
     with the cells underneath it. The label column is fixed; the operator
     columns share what remains, down to a floor that turns on the scroller. */
  const grid = {
    gridTemplateColumns: `152px repeat(${n}, minmax(200px, 1fr))`,
    /* An explicit floor rather than `min-w-max`: long itinerary copy would
       otherwise widen the columns to max-content and blow out the scroller. */
    minWidth: 152 + n * 200,
  } satisfies React.CSSProperties;

  const cheapest = useMemo(() => {
    const prices = columns.map((c) => c.pkg.price.platformPrice);
    return prices.length > 1 ? Math.min(...prices) : null;
  }, [columns]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const hrefWithout = (id: string) =>
    `/compare?ids=${ids.filter((x) => x !== id).join(",")}`;
  const hrefWith = (id: string) => `/compare?ids=${[...ids, id].join(",")}`;

  const handleSave = () => {
    saveComparison(`${destinationName ?? "Trip"} — ${n} operators`, ids);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  /* ── Nothing selected ── */
  if (n === 0) {
    return (
      <EmptyState
        title="Nothing to compare yet"
        body="Pick two or more packages from search and they'll line up here side by side — price, inclusions and itinerary against each other."
        cta={{ href: "/search", label: "Browse packages" }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-peach-wash pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-map-text text-sm font-semibold hover:text-compass-blue transition-colors"
          >
            <ArrowLeft size={15} />
            Back to results
          </Link>
          <label className="flex items-center gap-2 text-[13px] text-map-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyDifferences}
              onChange={(e) => setOnlyDifferences(e.target.checked)}
              className="w-4 h-4 accent-[#FF5A5F] cursor-pointer"
            />
            Only show differences
          </label>
        </div>

        <h1 className="font-display text-2xl sm:text-[32px] font-extrabold text-map-text tracking-tight">
          {n === 1 ? "One operator selected" : `Comparing ${n} operators`}
          {destinationName && (
            <span className="text-map-muted font-bold"> · {destinationName}</span>
          )}
        </h1>

        {spread && spread.gap > 0 && (
          <p className="mt-2 text-[14px] text-map-muted font-body">
            Prices here range from{" "}
            <b className="text-map-text tnum">{formatPrice(spread.lowest)}</b> to{" "}
            <b className="text-map-text tnum">{formatPrice(spread.highest)}</b> — a{" "}
            <b className="text-fern tnum">{formatPrice(spread.gap)}</b> difference for the
            same destination.
          </p>
        )}

        {/* One-package prompt */}
        {n === 1 && (
          <div className="mt-5 rounded-2xl border border-warm-line bg-map-card overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
              <div className="flex-1">
                <h2 className="font-display font-bold text-map-text text-[16px]">
                  A comparison needs at least two operators
                </h2>
                <p className="text-[13.5px] text-map-muted font-body mt-1">
                  {candidates.length > 0
                    ? `${candidates.length} other operator${candidates.length === 1 ? "" : "s"} run this destination, from ${formatPrice(candidates[0].price.platformPrice)}.`
                    : "No other operators run this destination yet."}
                </p>
              </div>
              {candidates.length > 0 && (
                <button onClick={() => setPicker(true)} className="btn-primary text-sm py-2.5">
                  <Plus size={15} /> Add an operator
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Comparison table ── */}
        <div className="mt-6 rounded-2xl border border-warm-line bg-map-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid" style={grid}>
              {/* Column headers */}
              <div className="sticky left-0 z-20 bg-peach-wash border-b border-r border-warm-line px-4 py-4 flex items-end">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-map-muted font-body">
                  Operators
                </span>
              </div>
              {columns.map((col, i) => (
                <div
                  key={col.pkg.id}
                  className={cn(
                    "relative bg-map-card border-b border-warm-line px-3.5 pt-3.5 pb-4",
                    i > 0 && "border-l border-warm-line"
                  )}
                >
                  <Link
                    href={hrefWithout(col.pkg.id)}
                    aria-label={`Remove ${col.pkg.operatorName}`}
                    className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-map-white/90 backdrop-blur border border-warm-line flex items-center justify-center text-map-muted hover:text-rust hover:border-rust transition-colors"
                  >
                    <X size={12} />
                  </Link>

                  <div className="h-[84px] rounded-xl overflow-hidden bg-peach-wash">
                    <Image
                      src={col.pkg.image}
                      alt={col.pkg.title}
                      width={320}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Reserved height, so titles line up across columns whether or
                      not an operator earned a verdict badge. */}
                  <div className="flex items-center gap-1.5 flex-wrap min-h-[20px] mt-2.5">
                    {col.verdicts.map((v) => (
                      <span
                        key={v.key}
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full font-body",
                          VERDICT_STYLE[v.key] ?? "bg-indigo-tint text-indigo"
                        )}
                      >
                        {v.label}
                      </span>
                    ))}
                  </div>

                  <p className="font-display font-bold text-[14px] text-map-text leading-tight truncate mt-1">
                    {col.pkg.operatorName}
                  </p>
                  <p className="text-[11.5px] text-map-muted font-body leading-snug line-clamp-2 mt-0.5 min-h-[30px]">
                    {col.pkg.title}
                  </p>
                  <div className="mt-2">
                    {col.pkg.operatorVerified ? (
                      <VerifiedBadge compact />
                    ) : (
                      <VerifiedBadge compact variant="pending" label="Unverified" />
                    )}
                  </div>
                </div>
              ))}

              {/* ── Price ── */}
              <SectionHeader
                id="price" label="Price" open={open} toggle={toggle}
                hint={spread && spread.gap > 0 ? `${formatPrice(spread.gap)} apart` : undefined}
              />
              {open.has("price") && (
                <>
                  <Row label="Operator's direct price" muted>
                    {columns.map((c, i) => (
                      <Cell key={c.pkg.id} i={i}>
                        <span className="tnum text-[13.5px] text-strike line-through decoration-[1.5px]">
                          {formatPrice(c.pkg.price.retailPrice)}
                        </span>
                      </Cell>
                    ))}
                  </Row>
                  <Row label="Atlaso price" emphasis>
                    {columns.map((c, i) => {
                      const isCheapest = cheapest === c.pkg.price.platformPrice;
                      return (
                        <Cell key={c.pkg.id} i={i} className={isCheapest ? "bg-fern-tint/60" : undefined}>
                          <span className="price-hero text-[25px] text-map-text block leading-none">
                            {formatPrice(c.pkg.price.platformPrice)}
                          </span>
                          {c.pkg.price.savings > 0 && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-fern-tint pl-1.5 pr-2.5 py-1 text-fern">
                              <ArrowDown size={12} strokeWidth={3} className="flex-shrink-0" />
                              <span className="tnum text-[12px] font-bold">
                                {formatPrice(c.pkg.price.savings)} off
                              </span>
                              <span className="text-[11.5px] font-semibold opacity-70 tnum">
                                ({c.pkg.price.savingsPct}%)
                              </span>
                            </span>
                          )}
                        </Cell>
                      );
                    })}
                  </Row>
                  <Row label="Per day">
                    {columns.map((c, i) => (
                      <Cell key={c.pkg.id} i={i}>
                        <span className="tnum text-[13px] text-map-muted">
                          {formatPrice(c.pricePerDay)}
                        </span>
                      </Cell>
                    ))}
                  </Row>
                  {columns.some((c) => c.pkg.needsPricingReview) && (
                    <div className="col-span-full bg-rust-tint border-b border-warm-line px-4 py-2.5 flex items-center gap-2">
                      <TriangleAlert size={14} className="text-rust flex-shrink-0" />
                      <span className="text-[12px] text-rust font-body">
                        One of these is priced below our minimum margin and is flagged for
                        internal review. The price shown is still what you would pay.
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* ── At a glance ── */}
              <SectionHeader id="glance" label="At a glance" open={open} toggle={toggle} />
              {open.has("glance") && (
                <>
                  <DataRow label="Duration" values={columns.map((c) => c.pkg.duration)} onlyDiff={onlyDifferences} />
                  <DataRow label="Group size" values={columns.map((c) => c.pkg.groupSize)} onlyDiff={onlyDifferences} />
                  <DataRow label="Difficulty" values={columns.map((c) => c.pkg.difficulty)} onlyDiff={onlyDifferences} />
                  <DataRow label="Stay" values={columns.map((c) => c.pkg.hotelType)} onlyDiff={onlyDifferences} />
                  <DataRow label="Minimum age" values={columns.map((c) => `${c.pkg.minAge} years`)} onlyDiff={onlyDifferences} />
                  <DataRow label="Starts at" values={columns.map((c) => c.pkg.pickupPoint)} onlyDiff={onlyDifferences} />
                  <DataRow label="Ends at" values={columns.map((c) => c.pkg.dropPoint)} onlyDiff={onlyDifferences} />
                  <DataRow
                    label="Next departure" onlyDiff={onlyDifferences}
                    values={columns.map((c) =>
                      c.pkg.nextDepartureDate
                        ? `${formatDate(c.pkg.nextDepartureDate)}${c.pkg.seatsLeftOnNext != null && c.pkg.seatsLeftOnNext <= 3 ? ` · ${c.pkg.seatsLeftOnNext} left` : ""}`
                        : "No dates open"
                    )}
                  />
                </>
              )}

              {/* ── Trust & policy ── */}
              <SectionHeader id="trust" label="Trust & policy" open={open} toggle={toggle} />
              {open.has("trust") && (
                <>
                  <Row label="Rating">
                    {columns.map((c, i) => (
                      <Cell key={c.pkg.id} i={i}>
                        <span className="flex items-center gap-1 font-display font-bold text-[14px] text-map-text tnum">
                          <Star size={12} className="fill-star text-star" />
                          {c.pkg.trust.rating}
                          <span className="font-body font-medium text-map-muted text-[12px]">
                            · {c.pkg.trust.reviewCount}
                          </span>
                        </span>
                      </Cell>
                    ))}
                  </Row>
                  <DataRow label="Booked (30 days)" values={columns.map((c) => `${c.pkg.trust.bookingsLast30d} people`)} onlyDiff={onlyDifferences} />
                  <DataRow label="Replies in" values={columns.map((c) => `${c.pkg.trust.responseMinutes} min`)} onlyDiff={onlyDifferences} />
                  <Row label="Verification">
                    {columns.map((c, i) => (
                      <Cell key={c.pkg.id} i={i}>
                        {c.pkg.operatorVerified ? (
                          <VerifiedBadge compact />
                        ) : (
                          <VerifiedBadge compact variant="pending" label="Unverified" />
                        )}
                      </Cell>
                    ))}
                  </Row>
                  <Row label="Cancellation">
                    {columns.map((c, i) => (
                      <Cell key={c.pkg.id} i={i}>
                        <span
                          className={cn(
                            "text-[11px] font-bold px-2 py-0.5 rounded-full font-body inline-block mb-1.5",
                            c.pkg.cancellationFlexibility === "HIGH"
                              ? "bg-fern-tint text-fern-quiet"
                              : c.pkg.cancellationFlexibility === "MEDIUM"
                              ? "bg-marigold-tint text-marigold"
                              : "bg-rust-tint text-rust"
                          )}
                        >
                          {c.pkg.cancellationFlexibility === "HIGH" ? "Flexible" : c.pkg.cancellationFlexibility === "MEDIUM" ? "Partial refund" : "Strict"}
                        </span>
                        <span className="block text-[11.5px] text-map-muted font-body leading-snug">
                          {c.pkg.cancellationPolicy}
                        </span>
                      </Cell>
                    ))}
                  </Row>
                  <DataRow label="Operating since" values={columns.map((c) => String(c.pkg.operatorFoundedYear))} onlyDiff={onlyDifferences} />
                </>
              )}

              {/* ── What's included ── */}
              <SectionHeader id="included" label="What's included" open={open} toggle={toggle} />
              {open.has("included") && (
                <>
                  {features
                    .filter((f) => !onlyDifferences || f.differs)
                    .map((f) => (
                      <Row key={f.label} label={f.label} flag={f.differs}>
                        {f.values.map((v, i) => (
                          <Cell key={i} i={i} center>
                            {v ? (
                              <Check size={17} className="text-fern-quiet" strokeWidth={3} />
                            ) : (
                              <Minus size={15} className="text-warm-line" strokeWidth={3} />
                            )}
                          </Cell>
                        ))}
                      </Row>
                    ))}
                  {columns.some((c) => c.uniqueInclusions.length > 0) && (
                    <Row label="Only with this operator" flag>
                      {columns.map((c, i) => (
                        <Cell key={c.pkg.id} i={i}>
                          {c.uniqueInclusions.length === 0 ? (
                            <span className="text-map-muted/50 text-[13px]">—</span>
                          ) : (
                            <ul className="space-y-1">
                              {c.uniqueInclusions.slice(0, 4).map((inc) => (
                                <li key={inc} className="text-[11.5px] text-map-text font-body leading-snug flex gap-1.5">
                                  <Check size={11} className="text-fern-quiet flex-shrink-0 mt-0.5" strokeWidth={3} />
                                  {inc}
                                </li>
                              ))}
                            </ul>
                          )}
                        </Cell>
                      ))}
                    </Row>
                  )}
                  <Row label="Not included" muted>
                    {columns.map((c, i) => (
                      <Cell key={c.pkg.id} i={i}>
                        <ul className="space-y-1">
                          {c.pkg.exclusions.slice(0, 4).map((ex) => (
                            <li key={ex} className="text-[11.5px] text-map-muted font-body leading-snug flex gap-1.5">
                              <Minus size={11} className="flex-shrink-0 mt-0.5" strokeWidth={3} />
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </Cell>
                    ))}
                  </Row>
                </>
              )}

              {/* ── Day by day ── */}
              <SectionHeader
                id="itinerary" label="Day by day" open={open} toggle={toggle}
                hint={`${maxDays} days`}
              />
              {open.has("itinerary") &&
                Array.from({ length: maxDays }, (_, i) => i + 1).map((day) => (
                  <Row key={day} label={`Day ${day}`}>
                    {columns.map((c, i) => {
                      const d = c.pkg.itinerary[day - 1];
                      return (
                        <Cell key={c.pkg.id} i={i}>
                          {d ? (
                            <>
                              <span className="block font-display font-bold text-[12.5px] text-map-text leading-snug">
                                {d.title}
                              </span>
                              <span className="block text-[11.5px] text-map-muted font-body leading-snug mt-0.5">
                                {d.description}
                              </span>
                            </>
                          ) : (
                            <span className="text-[11.5px] text-map-muted/60 font-body italic">
                              Trip has ended
                            </span>
                          )}
                        </Cell>
                      );
                    })}
                  </Row>
                ))}

              {/* Book row */}
              <div className="sticky left-0 z-20 bg-peach-wash border-r border-warm-line" />
              {columns.map((c, i) => (
                <div
                  key={c.pkg.id}
                  className={cn("bg-map-card px-3.5 py-3.5", i > 0 && "border-l border-warm-line")}
                >
                  <Link
                    href={`/packages/${c.pkg.slug}`}
                    className="btn-primary w-full text-[13.5px] py-2.5"
                  >
                    View & book
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-map-muted font-body">
          <span className="w-1.5 h-1.5 rounded-full bg-marigold-bright flex-shrink-0" />
          Marks a row where the operators differ.
        </p>

        {/* Add another operator */}
        {n >= 1 && n < 4 && candidates.length > 0 && (
          <div className="mt-5">
            <button
              onClick={() => setPicker((p) => !p)}
              className="flex items-center gap-2 text-[13.5px] font-semibold text-compass-blue hover:text-compass-hover transition-colors"
            >
              <Plus size={15} />
              Add another operator ({candidates.length} more run this trip)
            </button>
            {picker && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {candidates.map((cand) => (
                  <Link
                    key={cand.id}
                    href={hrefWith(cand.id)}
                    className="flex gap-3 p-3 rounded-xl border border-warm-line bg-map-card hover:border-compass-blue transition-colors"
                  >
                    <Image
                      src={cand.image}
                      alt={cand.title}
                      width={120}
                      height={120}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-[13px] text-map-text truncate">
                        {cand.operatorName}
                      </p>
                      <p className="text-[11.5px] text-map-muted font-body truncate">
                        {cand.duration}
                      </p>
                      <PriceBlock price={cand.price} size="inline" className="mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-atlas-night z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0 hidden sm:block">
            <p className="text-white text-[12.5px] font-bold">
              {n} operator{n === 1 ? "" : "s"} selected
            </p>
            <p className="text-white/55 text-[11.5px] truncate font-body">
              {columns.map((c) => c.pkg.operatorName).join(" · ")}
            </p>
          </div>
          {spread && spread.gap > 0 && (
            <p className="sm:hidden text-white text-[12px] font-body">
              <b className="tnum">{formatPrice(spread.gap)}</b> between cheapest and dearest
            </p>
          )}
          <div className="flex items-center gap-2 flex-shrink-0">
            {justSaved ? (
              <Link
                href="/comparisons"
                className="flex items-center gap-1.5 border border-fern text-fern text-[12.5px] font-bold px-4 py-2.5 rounded-xl whitespace-nowrap"
              >
                <BookmarkCheck size={14} /> Saved
              </Link>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 border border-white/25 text-white/85 hover:border-white hover:text-white text-[12.5px] font-bold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
              >
                <Bookmark size={14} /> Save
              </button>
            )}
            <Link
              href={`/packages/${columns[0].pkg.slug}`}
              className="bg-compass-blue hover:bg-compass-hover text-white font-bold text-[13.5px] px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              Book {formatPrice(columns[0].pkg.price.platformPrice)}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Layout primitives ───────────────────────────────────────────────────── */

/**
 * A section header is a single full-width row *inside* the table grid rather
 * than a separately sized element above it, which is what keeps it flush with
 * the columns at every viewport and column count.
 */
function SectionHeader({
  id, label, open, toggle, hint,
}: {
  id: string;
  label: string;
  open: Set<string>;
  toggle: (id: string) => void;
  hint?: string;
}) {
  const isOpen = open.has(id);
  return (
    <button
      onClick={() => toggle(id)}
      aria-expanded={isOpen}
      className="col-span-full bg-peach-wash border-b border-warm-line px-4 py-3 text-left hover:bg-light-coral-tint/25 transition-colors"
    >
      {/* Sticky inside the horizontal scroller, so the section label stays put
          while the operator columns pan under it. */}
      <span className="sticky left-4 flex w-fit items-center gap-2">
        <ChevronDown
          size={15}
          className={cn("text-map-muted transition-transform flex-shrink-0", !isOpen && "-rotate-90")}
        />
        <span className="font-display font-bold text-[13.5px] text-map-text">{label}</span>
        {hint && (
          <span className="text-[11.5px] text-map-muted font-body tnum">· {hint}</span>
        )}
      </span>
    </button>
  );
}

/**
 * `display: contents` — the cells participate directly in the parent grid, so a
 * row does not need its own column template.
 */
function Row({
  label, children, emphasis, muted, flag,
}: {
  label: string;
  children: React.ReactNode;
  emphasis?: boolean;
  muted?: boolean;
  flag?: boolean;
}) {
  return (
    <div className="contents">
      <div
        className={cn(
          "px-4 py-3 flex items-start gap-1.5 sticky left-0 z-10 border-b border-r border-warm-line",
          emphasis ? "bg-fern-tint" : "bg-peach-wash"
        )}
      >
        <span
          className={cn(
            "text-[12px] font-body leading-snug",
            emphasis ? "text-fern font-bold" : muted ? "text-map-muted" : "text-map-text font-semibold"
          )}
        >
          {label}
        </span>
        {flag && <span className="w-1.5 h-1.5 rounded-full bg-marigold-bright flex-shrink-0 mt-1.5" title="Differs" />}
      </div>
      {children}
    </div>
  );
}

/**
 * `i` is the column index: only columns after the first carry a left hairline,
 * so no double rule against the label column and no stray rule on the right
 * edge of the table.
 */
function Cell({
  children, center, i, className,
}: {
  children: React.ReactNode;
  center?: boolean;
  i: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-map-card px-3.5 py-3 min-w-0 border-b border-warm-line",
        i > 0 && "border-l border-warm-line",
        center && "flex items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  );
}

function DataRow({
  label, values, onlyDiff,
}: {
  label: string;
  values: string[];
  onlyDiff?: boolean;
}) {
  const differs = new Set(values).size > 1;
  if (onlyDiff && !differs) return null;
  return (
    <Row label={label} flag={differs}>
      {values.map((v, i) => (
        <Cell key={i} i={i}>
          <span className="text-[12.5px] text-map-text font-body leading-snug">{v}</span>
        </Cell>
      ))}
    </Row>
  );
}

export function EmptyState({
  title, body, cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <main className="min-h-[70vh] bg-map-white flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full text-center">
        <div className="relative h-28 mb-6 opacity-60">
          <ContourField seed={5.7} className="h-28" opacity={0.55} />
        </div>
        <h1 className="font-display text-xl font-extrabold text-map-text">{title}</h1>
        <p className="text-[14px] text-map-muted font-body mt-2 leading-relaxed">{body}</p>
        <Link href={cta.href} className="btn-primary inline-flex mt-6 text-sm">
          {cta.label}
        </Link>
      </div>
    </main>
  );
}
