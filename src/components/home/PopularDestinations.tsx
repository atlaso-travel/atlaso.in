"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { motion } from "framer-motion";
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

/* How many cards stay visible at once — one in front, three peeking behind
   it. A fifth slot is animated but invisible, so the card leaving the front
   fades out instead of popping away mid-shuffle. */
const VISIBLE_DEPTH = 4;
const AUTO_ADVANCE_MS = 3400;

/** Small enough that the two size presets below are worth hardcoding rather
    than measuring — this stack only ever has two shapes, phone and not. */
function useIsCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return compact;
}

function DestinationCard({
  dest,
  stackIndex,
  geometry,
  onBringToFront,
}: {
  dest: Destination;
  stackIndex: number;
  geometry: { cardW: number; cardH: number; peek: number; yStep: number };
  onBringToFront: (id: string) => void;
}) {
  const rating = RATING_BY_DEST.get(dest.id) ?? 4.8;
  const isFront = stackIndex === 0;
  const { cardW, cardH, peek, yStep } = geometry;

  return (
    <motion.div
      className="absolute top-0 left-0"
      style={{ width: cardW, height: cardH, zIndex: VISIBLE_DEPTH - stackIndex }}
      initial={false}
      animate={{
        x: stackIndex * peek,
        y: stackIndex * yStep,
        scale: 1 - stackIndex * 0.045,
        opacity: stackIndex < VISIBLE_DEPTH ? 1 : 0,
      }}
      transition={{ duration: 0.55, ease: EASE_SETTLE }}
    >
      <Link
        href={`/destinations/${dest.slug}`}
        aria-label={
          isFront
            ? `View ${dest.name} packages`
            : `Bring ${dest.name} to the front`
        }
        onClick={(e) => {
          if (!isFront) {
            e.preventDefault();
            onBringToFront(dest.id);
          }
        }}
        className={`group block h-full w-full ${isFront ? "" : "cursor-pointer"}`}
        tabIndex={isFront ? 0 : -1}
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
          imageClassName={isFront ? "transition-transform duration-700 group-hover:scale-[1.06]" : ""}
        >
          <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 bg-white rounded-full pl-2 pr-2.5 py-1 shadow-sm">
            <Star size={12} className="text-star fill-star" />
            <span className="text-[12px] font-bold text-espresso tnum">
              {rating.toFixed(1)}
            </span>
          </span>

          <div className="absolute inset-0 bg-gradient-to-t from-[#1A100D]/92 via-[#1A100D]/25 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5">
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

/* ── The deck ──
   Rather than a marquee that scrolls whole cards past the frame, this keeps
   one card up front and the next three permanently peeking behind it — the
   sliver never goes away, it just cycles which destination it belongs to.
   Clicking any peeking sliver reorders the deck so that card comes forward;
   left alone, the deck advances itself on a timer. */
export default function PopularDestinations() {
  const { reduced } = useMotionProfile();
  const compact = useIsCompact();
  const [order, setOrder] = useState(() => FEATURED.map((d) => d.id));
  const [paused, setPaused] = useState(false);

  const byId = useRef(new Map(FEATURED.map((d) => [d.id, d]))).current;

  useEffect(() => {
    if (reduced || paused) return;
    const timer = setInterval(() => {
      setOrder((prev) => [...prev.slice(1), prev[0]]);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [reduced, paused]);

  const bringToFront = (id: string) => {
    setOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx <= 0) return prev;
      return [id, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  const geometry = compact
    ? { cardW: 232, cardH: 312, peek: 20, yStep: 7 }
    : { cardW: 292, cardH: 384, peek: 30, yStep: 9 };

  const stackW = geometry.cardW + (VISIBLE_DEPTH - 1) * geometry.peek;
  const stackH = geometry.cardH + (VISIBLE_DEPTH - 1) * geometry.yStep;

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden bg-warm-ivory">
      <div className="absolute inset-0 bg-section-glow pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          <Reveal className="lg:col-span-8" distance={28}>
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

          <Reveal className="lg:col-span-4" distance={28} delay={0.1}>
            <div
              className="relative mx-auto lg:mx-0"
              style={{ width: stackW, height: stackH }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {order.map((id, i) => {
                if (i > VISIBLE_DEPTH) return null;
                const dest = byId.get(id);
                if (!dest) return null;
                return (
                  <DestinationCard
                    key={id}
                    dest={dest}
                    stackIndex={i}
                    geometry={geometry}
                    onBringToFront={bringToFront}
                  />
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
