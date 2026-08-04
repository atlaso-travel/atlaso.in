"use client";

import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { packages } from "@/data/packages";
import { destinationById } from "@/data/destinations";
import { verifiedOperators } from "@/data/operators";
import { formatPrice } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

/* ────────────────────────────────────────────────────────────────────────────
   The worked example

   Pulled from the catalogue so the section can quote a real number of
   operators and a real destination rather than an invented stat.
   ──────────────────────────────────────────────────────────────────────────── */
const SHOWCASE = (() => {
  const sellable = packages.filter(
    (p) =>
      p.status === "ACTIVE" &&
      p.pricing.validationStatus !== "ABOVE_RETAIL" &&
      p.pricing.validationStatus !== "INVERTED"
  );

  const byDestination = new Map<string, number>();
  for (const p of sellable) {
    byDestination.set(p.destinationId, (byDestination.get(p.destinationId) ?? 0) + 1);
  }

  let best: { id: string; operators: number } | null = null;
  for (const [id, list] of Object.entries(
    sellable.reduce<Record<string, Set<string>>>((acc, p) => {
      (acc[p.destinationId] ??= new Set()).add(p.operatorId);
      return acc;
    }, {})
  )) {
    if (!best || list.size > best.operators) best = { id, operators: list.size };
  }

  return {
    destination: best ? destinationById[best.id] : null,
    operatorsHere: best?.operators ?? 0,
  };
})();

const SAVINGS = (() => {
  const values = packages
    .filter(
      (p) =>
        p.status === "ACTIVE" &&
        p.pricing.validationStatus !== "ABOVE_RETAIL" &&
        p.pricing.validationStatus !== "INVERTED"
    )
    .map((p) => p.pricing.savings)
    .filter((s) => s > 0);

  return values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;
})();

/* ── Steps ────────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    number: "1",
    title: "Tell us about your trip",
    body: "Choose your destination, travel style, budget, and dates — we'll find operators that match your journey.",
    tone: "light",
    span: "narrow",
  },
  {
    number: "2",
    title: "Add the trips that fit your needs",
    body: "You can add up to 4 operators at once to see the comparison.",
    tone: "dark",
    span: "wide",
  },
  {
    number: "3",
    title: "Compare operators side-by-side",
    body: "View pricing, inclusions, stay details, ratings and policies together in one transparent comparison view.",
    tone: "dark",
    span: "wide",
  },
  {
    number: "4",
    title: "Book with complete confidence",
    body: "Understand exactly what's included before booking — with verified operators, transparent pricing.",
    tone: "light",
    span: "narrow",
  },
] as const;

function StepCard({ step }: { step: (typeof STEPS)[number] }) {
  const isDark = step.tone === "dark";

  return (
    <div
      className={`group relative h-full flex flex-col overflow-hidden rounded-3xl border p-6 sm:p-8 ${
        isDark
          ? "border-white/10 bg-step-dusk"
          : "border-warm-line bg-blush-wash"
      }`}
    >
      {/* Oversized step label, bleeding off the top edge — decorative only. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none select-none whitespace-nowrap absolute -top-3 sm:-top-5 left-5 font-display font-black text-[3.5rem] sm:text-[4.5rem] leading-none tracking-tighter ${
          isDark ? "text-white/[0.08]" : "text-brand-coral/10"
        }`}
      >
        Step {step.number}
      </span>

      <div className="relative">
        <p
          className={`mono-chart text-[11px] uppercase mb-3 ${
            isDark ? "text-warm-sand" : "text-coral-ink"
          }`}
        >
          Step {step.number}
        </p>
        <h3
          className={`font-display font-bold text-xl sm:text-2xl leading-snug tracking-display mb-3 ${
            isDark ? "text-white" : "text-espresso"
          }`}
        >
          {step.title}
        </h3>
        <p
          className={`font-body text-sm leading-relaxed ${
            isDark ? "text-white/60" : "text-warm-taupe"
          }`}
        >
          {step.body}
        </p>
      </div>

      {/* Media well — reserved for a product screenshot or short GIF of this
          step in action. Swap the placeholder below for real media. */}
      <div
        className={`relative mt-6 flex-1 min-h-[150px] sm:min-h-[180px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 ${
          isDark
            ? "border-white/15 bg-white/[0.04]"
            : "border-blush-tint/70 bg-white/60"
        }`}
      >
        <ImageIcon
          size={22}
          className={isDark ? "text-white/30" : "text-coral-ink/40"}
        />
        <span
          className={`text-[11px] font-body ${
            isDark ? "text-white/40" : "text-warm-taupe"
          }`}
        >
          Image / GIF placeholder
        </span>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-12 sm:py-16 bg-warm-ivory overflow-hidden"
    >
      <div className="absolute inset-0 wash-top-left pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12 sm:mb-14">
          <div className="flex items-end justify-between gap-8 border-b border-warm-line pb-7">
            <div>
              <p className="eyebrow mb-3">How Atlaso Works</p>
              <h2 className="font-display font-black text-4xl md:text-5xl text-espresso leading-[1.05] tracking-display mb-4">
                Plan smarter. <span className="text-signature">Book better.</span>
              </h2>
              <p className="text-warm-taupe font-body leading-relaxed text-[0.9375rem] max-w-xl">
                Atlaso removes the confusion from trip planning by bringing
                trusted tour operators, transparent pricing, and real
                traveler insights together — so you can focus on the
                journey, not the stress.
              </p>
            </div>
          </div>
        </Reveal>

        <Stagger
          className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-7"
          gap={0.08}
        >
          {STEPS.map((step) => (
            <StaggerItem
              key={step.number}
              as="div"
              className={step.span === "wide" ? "md:col-span-7" : "md:col-span-5"}
            >
              <StepCard step={step} />
            </StaggerItem>
          ))}
        </Stagger>
{/* 
        <Reveal className="mt-10" delay={0.1}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-1">
            <Link
              href="/search"
              className="group inline-flex items-center gap-2 text-espresso font-semibold text-sm border-b-2 border-brand-coral/40 hover:border-brand-coral pb-1 transition-colors"
            >
              Start with step one
              <ArrowRight
                size={15}
                className="text-coral-ink transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <p className="mono-chart text-[10.5px] text-warm-taupe uppercase">
              {verifiedOperators.length} verified · avg {formatPrice(SAVINGS)} saved
              {SHOWCASE.destination
                ? ` · ${SHOWCASE.operatorsHere} operators running ${SHOWCASE.destination.name}`
                : ""}
            </p>
          </div>
        </Reveal> */}
      </div>
    </section>
  );
}
