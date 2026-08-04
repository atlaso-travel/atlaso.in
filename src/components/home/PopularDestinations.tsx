"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { destinations, type Destination } from "@/data/destinations";
import { packages } from "@/data/packages";
import { formatPrice } from "@/lib/utils";
import { generateDestinationAlt } from "@/lib/seo/altText";
import GradedImage from "@/components/ui/GradedImage";
import { EASE_SETTLE, Reveal, useMotionProfile } from "@/components/motion/Reveal";

/* Same average-of-package-ratings a destination page shows in its hero —
   computed once here rather than re-derived per card. */
const RATING_BY_DEST = (() => {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const pkg of packages) {
    const bucket = totals.get(pkg.destinationId) ?? { sum: 0, count: 0 };
    bucket.sum += pkg.operatorRating;
    bucket.count += 1;
    totals.set(pkg.destinationId, bucket);
  }
  const ratings = new Map<string, number>();
  for (const [id, { sum, count }] of totals) ratings.set(id, sum / count);
  return ratings;
})();

/* Highest-rated destinations lead the deck — "popular" backed by the same
   numbers the rest of the catalogue is ranked on, not an arbitrary slice. */
const FEATURED = [...destinations]
  .sort((a, b) => (RATING_BY_DEST.get(b.id) ?? 0) - (RATING_BY_DEST.get(a.id) ?? 0))
  .slice(0, 8);

/* Four slots stay visible at once. Which one is enlarged marches left to
   right — 0, 1, 2, 3 — before the strip advances and it starts over from the
   left again, so the "big" treatment visibly travels through the row instead
   of always snapping back to the same spot. */
const VISIBLE_DEPTH = 4;
const AUTO_ADVANCE_MS = 2600;
const WIDTH_TRANSITION_MS = 700;

/** The rating badge, scrim and text block only make sense on the card that's
    actually wide enough to hold them. Fading them on the same clock as the
    width change means the incoming card shows its name while still a sliver,
    and the outgoing one keeps it while shrinking — two cards captioned at
    once. So the two directions run on different clocks: the losing card's
    caption drops out fast and immediately, the winning card's doesn't fade in
    until the width transition is almost done. */
function CONTENT_FADE(isBig: boolean): React.CSSProperties {
  return {
    opacity: isBig ? 1 : 0,
    transition: isBig
      ? `opacity 220ms ease ${WIDTH_TRANSITION_MS - 220}ms`
      : "opacity 120ms ease",
  };
}

/** The row's own rendered width, not a breakpoint guess — the strip sits in
    a 12-column grid on desktop and a full-width block below it, and a fixed
    pixel geometry that only accounted for the second case overflowed the
    lg:col-span-4 cell it actually gets. Card/sliver/gap sizes are derived
    from whatever width this measures, so the row always fits its parent. */
function useContainerWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/* Proportions carried over from the design's original fixed pixel values
   (292/384/46/8 at 454 total) — kept as ratios of the measured row width so
   any width fits without changing how the strip looks. */
const GAP_RATIO = 0.0176;
const SLIVER_RATIO = 0.1013;
const CARD_ASPECT = 384 / 292;

function DestinationCard({
  dest,
  isBig,
  cardW,
  cardH,
  sliverW,
  onFocus,
}: {
  dest: Destination;
  isBig: boolean;
  cardW: number;
  cardH: number;
  sliverW: number;
  onFocus: () => void;
}) {
  const rating = RATING_BY_DEST.get(dest.id) ?? 4.8;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        width: isBig ? cardW : sliverW,
        height: cardH,
        transition: `width ${WIDTH_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
      className="relative flex-shrink-0"
    >
      <Link
        href={`/destinations/${dest.slug}`}
        aria-label={
          isBig ? `View ${dest.name} packages` : `Bring ${dest.name} to the front`
        }
        onClick={(e) => {
          if (!isBig) {
            e.preventDefault();
            onFocus();
          }
        }}
        className={`group block h-full w-full ${isBig ? "" : "cursor-pointer"}`}
        tabIndex={isBig ? 0 : -1}
      >
        <GradedImage
          src={dest.image}
          alt={generateDestinationAlt({
            subject: dest.tagline,
            destination: dest.name,
            region: dest.region,
          })}
          sizes={`${cardW}px`}
          ratio="fill"
          focus="landscape"
          className="rounded-3xl h-full border border-warm-line/60 shadow-card"
          imageClassName={isBig ? "transition-transform duration-700 group-hover:scale-[1.06]" : ""}
        >
          {/* Full content only reads on the enlarged card — the peeking
              slivers stay pure image, same as a filmstrip frame rather than a
              stack of cards fanned out behind it. */}
          <span
            className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 bg-white rounded-full pl-2 pr-2.5 py-1 shadow-sm"
            style={CONTENT_FADE(isBig)}
          >
            <Star size={12} className="text-star fill-star" />
            <span className="text-[12px] font-bold text-espresso tnum">
              {rating.toFixed(1)}
            </span>
          </span>

          <div
            className="absolute inset-0 bg-gradient-to-t from-[#1A100D]/92 via-[#1A100D]/25 to-transparent"
            style={CONTENT_FADE(isBig)}
          />

          <div
            className={`absolute bottom-0 left-0 right-0 p-5 ${!isBig ? "pointer-events-none" : ""}`}
            style={CONTENT_FADE(isBig)}
          >
            <h3 className="font-display font-black text-xl text-white leading-tight tracking-display truncate">
              {dest.name}
            </h3>
            <p className="text-white/65 text-[12px] font-body mb-2">{dest.state}</p>
            <p className="text-white/55 text-[11px] font-body leading-snug line-clamp-2 mb-4">
              {dest.tagline}
            </p>

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="mono-chart text-[9px] uppercase text-white/50 mb-0.5">
                  From
                </p>
                <span className="price-hero text-white text-lg leading-none">
                  {formatPrice(dest.priceFrom)}
                </span>
              </div>
              <span className="w-9 h-9 rounded-full bg-espresso flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <ArrowUpRight size={16} className="text-white" />
              </span>
            </div>
          </div>
        </GradedImage>
      </Link>
    </motion.div>
  );
}

/* ── The filmstrip ──
   Four same-height frames in a single row — never a deck fanned out behind
   itself. Every tick the strip advances by one destination *and* the
   enlarged slot steps to the next position (0 → 1 → 2 → 3 → 0…), so the
   "big" treatment visibly travels across the row from left to right before
   the whole strip rolls over, rather than always snapping back to the same
   spot. Clicking a peeking sliver pulls it into focus immediately; clicking
   the enlarged card opens it. Widths are plain CSS transitions rather than a
   layout-animated transform, so the photo inside never stretches while it
   resizes. */
export default function PopularDestinations() {
  const { reduced } = useMotionProfile();
  const [rowRef, rowWidth] = useContainerWidth<HTMLDivElement>(320);
  const [order, setOrder] = useState(() => FEATURED.map((d) => d.id));
  const [bigSlot, setBigSlot] = useState(0);
  const [paused, setPaused] = useState(false);

  const byId = useRef(new Map(FEATURED.map((d) => [d.id, d]))).current;

  useEffect(() => {
    if (reduced || paused) return;
    const timer = setInterval(() => {
      setBigSlot((prev) => {
        const next = (prev + 1) % VISIBLE_DEPTH;
        if (next === 0) {
          setOrder((prevOrder) => [...prevOrder.slice(1), prevOrder[0]]);
        }
        return next;
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [reduced, paused]);

  const gap = Math.round(rowWidth * GAP_RATIO);
  const sliverW = Math.round(rowWidth * SLIVER_RATIO);
  const cardW = Math.max(0, rowWidth - (VISIBLE_DEPTH - 1) * (sliverW + gap));
  const cardH = Math.round(cardW * CARD_ASPECT);

  const visible = order
    .slice(0, VISIBLE_DEPTH)
    .map((id) => byId.get(id))
    .filter((d): d is Destination => Boolean(d));

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden bg-warm-ivory">
      <div className="absolute inset-0 bg-section-glow pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          <Reveal className="lg:col-span-6" distance={28}>
            <p className="eyebrow mb-3">Explore</p>
            <h2 className="font-display font-black text-4xl md:text-5xl text-espresso leading-[1.05] tracking-display mb-4">
              Popular
              <br />
              Destinations
            </h2>
            <p className="text-warm-taupe text-[0.9375rem] font-body leading-relaxed mb-7 max-w-sm">
              Discover destinations, compare verified tour operators
              side-by-side, and book trips transparently —{" "}
              <strong className="text-espresso font-semibold">
                all in one place!
              </strong>
            </p>

            <motion.span
              className="inline-block"
              whileHover={
                reduced ? undefined : { y: -2, boxShadow: "0 14px 34px rgba(255,90,95,0.28)" }
              }
              whileTap={reduced ? undefined : { scale: 0.99 }}
              transition={{ duration: 0.32, ease: EASE_SETTLE }}
              style={{ borderRadius: 9999 }}
            >
              <Link
                href="/destinations"
                className="bg-cta-gradient inline-flex items-center gap-2 text-white font-semibold text-sm px-6 py-3.5 rounded-full"
              >
                Explore all Destinations
                <ArrowUpRight size={16} />
              </Link>
            </motion.span>
          </Reveal>

          <Reveal className="lg:col-span-6" distance={28} delay={0.1}>
            <div
              ref={rowRef}
              className="relative mx-auto lg:mx-0 flex w-full max-w-[500px]"
              style={{ height: cardH, gap }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <AnimatePresence initial={false}>
                {visible.map((dest, i) => (
                  <DestinationCard
                    key={dest.id}
                    dest={dest}
                    isBig={i === bigSlot}
                    cardW={cardW}
                    cardH={cardH}
                    sliverW={sliverW}
                    onFocus={() => setBigSlot(i)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
