"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";
import { operators } from "@/data/operators";
import type { Operator } from "@/data/operators";
import { formatPrice } from "@/lib/utils";
import {
  EASE_SETTLE,
  Reveal,
  Stagger,
  StaggerItem,
  useMotionProfile,
} from "@/components/motion/Reveal";

/** Two-letter monogram — operators have no logo assets yet (`logoUrl: null`). */
function monogram(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => /[A-Za-z]/.test(word[0] ?? ""))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

const MARK_TONES = [
  { bg: "#FFE9E7", fg: "#CC3A40" },
  { bg: "#FFF0DF", fg: "#A05A16" },
  { bg: "#EEF1F5", fg: "#55606F" },
];

const prettify = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* Highest-rated verified operators, tie-broken by review volume so a 5.0 with
   nine reviews can't outrank a 4.9 with three hundred. */
const RANKED = operators
  .filter((op) => op.verified)
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

const FEATURED = RANKED[0];
const REGISTER = RANKED.slice(1, 6);

/* ── The lead entry ──
   One operator carries real weight; the rest are a register beneath it. A row
   of three identical cards gives every operator the same visual authority,
   which is exactly the flattening a ranked list should avoid. */
function LeadEntry({ operator }: { operator: Operator }) {
  const { reduced } = useMotionProfile();
  const tone = MARK_TONES[0];

  return (
    <motion.div
      className="rounded-3xl border border-blush-tint bg-blush-wash p-6 sm:p-8"
      whileHover={
        reduced
          ? undefined
          : { y: -4, boxShadow: "0 20px 48px rgba(28,31,38,0.10)" }
      }
      transition={{ duration: 0.38, ease: EASE_SETTLE }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-7">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-lg flex-shrink-0"
          style={{ background: tone.bg, color: tone.fg }}
        >
          {monogram(operator.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="mono-chart text-[10px] uppercase text-coral-ink">
              Top rated
            </span>
            {operator.badge && (
              <>
                <span className="w-1 h-1 rounded-full bg-warm-taupe/40" />
                <span className="mono-chart text-[10px] uppercase text-sand-ink">
                  {operator.badge}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-display font-black text-2xl sm:text-[28px] text-espresso tracking-display">
              {operator.name}
            </h3>
            <ShieldCheck
              size={18}
              className="text-summit-green flex-shrink-0"
              aria-label="Verified operator"
            />
          </div>

          <div className="flex items-center gap-1.5 text-warm-taupe mb-4">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="text-[13px] font-body">
              {operator.city}, {operator.state} · operating since {operator.foundedYear}
            </span>
          </div>

          <p className="text-warm-taupe text-sm font-body leading-relaxed max-w-xl mb-5">
            {operator.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {operator.destinations.map((dest) => (
              <span
                key={dest}
                className="text-[11px] font-medium text-warm-taupe bg-white/70 border border-warm-line rounded-full px-2.5 py-1"
              >
                {prettify(dest)}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-5 pt-5 border-t border-blush-tint">
            <div className="flex items-center gap-6 sm:gap-8">
              <div>
                <p className="label-util mb-1">Rating</p>
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="text-star fill-star" />
                  <span className="font-display font-bold text-espresso tnum">
                    {operator.rating.toFixed(1)}
                  </span>
                  <span className="text-warm-taupe text-xs tnum">
                    ({operator.reviewCount})
                  </span>
                </span>
              </div>
              <div>
                <p className="label-util mb-1">Trips run</p>
                <span className="font-display font-bold text-espresso tnum">
                  {operator.completedTrips.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <p className="label-util mb-1">From</p>
                <span className="price-hero text-[22px] text-espresso">
                  {formatPrice(operator.startingPrice)}
                </span>
              </div>
            </div>

            <motion.span
              className="inline-block"
              whileHover={
                reduced
                  ? undefined
                  : { y: -2, boxShadow: "0 12px 30px rgba(255,90,95,0.28)" }
              }
              whileTap={reduced ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.32, ease: EASE_SETTLE }}
              style={{ borderRadius: 9999 }}
            >
              <Link
                href={`/operators/${operator.slug}`}
                className="bg-cta-gradient inline-flex items-center gap-2 text-white font-semibold text-sm px-5 py-3 rounded-full"
              >
                View packages
                <ArrowUpRight size={15} />
              </Link>
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── The register ──
   Hairline rows are the right pattern here in a way they were not for the
   feature list: this is genuinely tabular, ranked data with figures that
   should align down the column. It reads as a registry, not as prose blocks. */
function RegisterRow({ operator, index }: { operator: Operator; index: number }) {
  const tone = MARK_TONES[(index + 1) % MARK_TONES.length];

  return (
    <Link
      href={`/operators/${operator.slug}`}
      className="group flex items-center gap-4 sm:gap-5 py-5 border-t border-warm-line transition-colors duration-300 hover:bg-blush-wash/60 -mx-4 px-4 sm:-mx-5 sm:px-5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-coral/40"
    >
      <span className="mono-chart text-[11px] text-warm-taupe/60 hidden sm:block w-6 flex-shrink-0">
        {String(index + 2).padStart(2, "0")}
      </span>

      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-[11px] flex-shrink-0"
        style={{ background: tone.bg, color: tone.fg }}
      >
        {monogram(operator.name)}
      </span>

      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="font-display font-bold text-[15px] text-espresso truncate">
            {operator.name}
          </span>
          <ShieldCheck size={13} className="text-summit-green flex-shrink-0" />
        </span>
        <span className="mono-chart block text-[10px] uppercase text-warm-taupe/80 mt-1 truncate">
          {operator.city} · est {operator.foundedYear} ·{" "}
          {operator.destinations.length} region
          {operator.destinations.length === 1 ? "" : "s"}
        </span>
      </span>

      {/* Metrics drop off below md — the row keeps its identity and price,
          which are the two things worth scanning on a phone. */}
      <span className="hidden md:flex items-center gap-1.5 flex-shrink-0">
        <Star size={13} className="text-star fill-star" />
        <span className="text-[13px] font-semibold text-espresso tnum">
          {operator.rating.toFixed(1)}
        </span>
        <span className="text-xs text-warm-taupe tnum">({operator.reviewCount})</span>
      </span>

      <span className="hidden lg:block text-[13px] text-warm-taupe tnum flex-shrink-0 w-20 text-right">
        {operator.completedTrips.toLocaleString("en-IN")} trips
      </span>

      <span className="text-right flex-shrink-0">
        <span className="block font-display font-bold text-[15px] text-espresso tnum">
          {formatPrice(operator.startingPrice)}
        </span>
        <span className="mono-chart block text-[9px] uppercase text-warm-taupe/70 mt-0.5">
          per person
        </span>
      </span>

      <ArrowUpRight
        size={16}
        className="text-warm-taupe/50 flex-shrink-0 transition-all duration-300 group-hover:text-coral-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

export default function TopOperators() {
  if (!FEATURED) return null;

  return (
    <section
      className="relative py-12 sm:py-16 bg-warm-ivory overflow-hidden"
    >
      <div className="absolute inset-0 wash-top-right pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <Stagger className="mb-10 sm:mb-12" gap={0.07}>
          <div className="flex items-end justify-between gap-8 border-b border-warm-line pb-7">
            <div className="max-w-xl">
              <StaggerItem as="p" className="eyebrow mb-3">
                The Register
              </StaggerItem>
              <StaggerItem
                as="h2"
                className="font-display font-black text-4xl md:text-5xl text-espresso leading-[1.05] tracking-display mb-4"
              >
                Operators{" "}
                <span className="text-signature">worth your deposit.</span>
              </StaggerItem>
              <StaggerItem as="p" className="text-warm-taupe text-[0.9375rem] font-body leading-relaxed">
                Ranked on traveller rating, then on how many people have actually
                travelled with them. Documents verified before a single package
                goes live.
              </StaggerItem>
            </div>

            <StaggerItem
              as="span"
              className="mono-chart text-[11px] text-warm-taupe uppercase whitespace-nowrap hidden sm:block pb-2"
            >
              {RANKED.length} Verified
            </StaggerItem>
          </div>
        </Stagger>

        {/* Lead entry */}
        <Reveal className="mb-4" distance={28}>
          <LeadEntry operator={FEATURED} />
        </Reveal>

        {/* Register */}
        <Stagger className="mt-8" gap={0.05}>
          {REGISTER.map((operator, i) => (
            <StaggerItem key={operator.id}>
              <RegisterRow operator={operator} index={i} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-10" delay={0.08}>
          <Link
            href="/operators"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral-ink hover:text-espresso transition-colors duration-200 group"
          >
            View the full register of {RANKED.length} verified operators
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
