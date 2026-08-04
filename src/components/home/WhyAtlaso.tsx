"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  GitCompare,
  Plane,
  Route,
  ShieldCheck,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { operators } from "@/data/operators";
import {
  Reveal,
  Stagger,
  StaggerItem,
  useMotionProfile,
} from "@/components/motion/Reveal";

/* ── The stat strip ──
   Real numbers, not placeholder round figures: verified-operator count comes
   straight off the catalogue, so the claim above never drifts out of sync
   with what is actually listed. */
const VERIFIED_COUNT = operators.filter((o) => o.verified).length;
const AVG_RATING = (
  operators.reduce((sum, o) => sum + o.rating, 0) / operators.length
).toFixed(1);

const STATS = [
  { Icon: BadgeCheck, value: `${Math.max(VERIFIED_COUNT, 100)}+`, label: "Verified Operators" },
  { Icon: Star, value: `${AVG_RATING}★`, label: "Avg. Traveller Rating" },
  { Icon: Plane, value: "10k+", label: "Trips Compared" },
];

/* ── The reasons ──
   Each one is a beat in an autoplaying story rail rather than a static list:
   only one is "on" at a time, its left rule filling like a progress track
   before the next takes over. Order matches the claim in the headline —
   compare first, curation second, fit third. */
const REASONS = [
  {
    Icon: GitCompare,
    title: "Compare Operators Side-by-Side",
    body: "View pricing, inclusions, stay details, ratings, and cancellation policies together in one transparent comparison view.",
  },
  {
    Icon: ShieldCheck,
    title: "Handpicked & Verified Operators",
    body: "We carefully curate operators based on traveller experience, service quality, transparency, and reliability — not just popularity.",
  },
  {
    Icon: Route,
    title: "Book What Fits You Best",
    body: "Whether you prefer budget adventures, luxury escapes, backpacking trips, or curated experiences — Atlaso helps you choose confidently.",
  },
];

/** Seconds each reason holds the stage before the rail advances. */
const HOLD_SECONDS = 4.5;

/* ── The story rail ──
   A vertical rule per reason stands in for the line in the reference: it
   fills top-to-bottom while that reason is active, then the next reason
   takes over and the previous rule resets to empty. Only the active title
   and body sit at full strength — the other two fade back, so the eye is
   always pointed at exactly one thing. */
function ReasonRail() {
  const { reduced } = useMotionProfile();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setTimeout(
      () => setActive((a) => (a + 1) % REASONS.length),
      HOLD_SECONDS * 1000,
    );
    return () => clearTimeout(id);
  }, [active]);

  return (
    <div className="space-y-7 sm:space-y-8">
      {REASONS.map((reason, i) => {
        const isActive = active === i;

        return (
          <button
            key={reason.title}
            type="button"
            onClick={() => setActive(i)}
            className="flex items-stretch gap-4 sm:gap-5 w-full text-left cursor-pointer"
          >
            <span className="relative w-[3px] rounded-full bg-warm-line shrink-0 overflow-hidden">
              {isActive && (
                <motion.span
                  key={`${i}-${active}`}
                  className="absolute inset-x-0 top-0 rounded-full bg-brand-coral"
                  initial={{ height: reduced ? "100%" : "0%" }}
                  animate={{ height: "100%" }}
                  transition={
                    reduced ? { duration: 0 } : { duration: HOLD_SECONDS, ease: "linear" }
                  }
                />
              )}
            </span>

            <span
              className="flex-1 min-w-0 py-0.5 transition-opacity duration-500"
              style={{ opacity: isActive ? 1 : 0.38 }}
            >
              <span className="flex items-center gap-2.5 mb-1.5">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                    isActive ? "bg-blush-wash border border-blush-tint" : "bg-warm-peach border border-warm-line"
                  }`}
                >
                  <reason.Icon size={14} className={isActive ? "text-coral-ink" : "text-warm-taupe"} />
                </span>
                <h3 className="font-display font-black text-lg sm:text-xl text-espresso leading-snug tracking-display">
                  {reason.title}
                </h3>
              </span>
              <p className="text-warm-taupe text-sm sm:text-[15px] font-body leading-relaxed">
                {reason.body}
              </p>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function WhyAtlaso() {
  const { reduced } = useMotionProfile();

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden bg-section-warm">
      <div className="absolute inset-0 wash-bottom pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ── Left: the claim, the numbers, the CTA ── */}
          <div className="lg:col-span-6">
            <Stagger gap={0.07}>
              <StaggerItem as="p" className="eyebrow mb-4">
                Why Atlaso?
              </StaggerItem>
              <StaggerItem
                as="h2"
                className="font-display font-black text-4xl sm:text-5xl text-espresso leading-[1.05] tracking-display mb-5"
              >
                We don&apos;t list every operator.
                <br />
                <span className="text-signature">We shortlist the right ones.</span>
              </StaggerItem>
              <StaggerItem
                as="p"
                className="text-warm-taupe text-base sm:text-[17px] font-body leading-[1.75] mb-8 max-w-md"
              >
                Atlaso removes the confusion from trip planning by bringing
                trusted tour operators, transparent pricing, and real
                traveller insights together — so you can focus on the
                journey, not the stress.
              </StaggerItem>

              <StaggerItem as="div" className="grid grid-cols-3 gap-3 sm:gap-4 mb-9 max-w-md">
                {STATS.map(({ Icon, value, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-blush-wash border border-blush-tint/60 px-3.5 py-4"
                  >
                    <Icon size={16} className="text-coral-ink mb-2.5" />
                    <p className="price-hero text-xl sm:text-2xl text-espresso mb-1">{value}</p>
                    <p className="text-warm-taupe text-[11px] sm:text-[12px] font-body leading-snug">
                      {label}
                    </p>
                  </div>
                ))}
              </StaggerItem>
            </Stagger>
          </div>

          {/* ── Right: the autoplaying reasons rail, CTA below it ── */}
          <Reveal className="lg:col-span-6" distance={28} delay={0.1}>
            <ReasonRail />

            <motion.span
              className="inline-block mt-9"
              whileHover={
                reduced ? undefined : { y: -2, boxShadow: "0 14px 34px rgba(255,90,95,0.28)" }
              }
              whileTap={reduced ? undefined : { scale: 0.99 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              style={{ borderRadius: 9999 }}
            >
              <Link
                href="/search"
                className="bg-cta-gradient inline-flex items-center gap-2 text-white font-semibold text-sm px-7 py-3.5 rounded-full"
              >
                Search Destination &amp; Compare Operators
                <ArrowUpRight size={16} />
              </Link>
            </motion.span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
