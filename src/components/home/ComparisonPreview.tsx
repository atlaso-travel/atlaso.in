"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Check, Minus, Star } from "lucide-react";
import { motion } from "framer-motion";
import { operators } from "@/data/operators";
import type { Operator } from "@/data/operators";
import { destinations } from "@/data/destinations";
import { formatPrice } from "@/lib/utils";
import ContourField from "@/components/ui/ContourField";
import {
  EASE_SETTLE,
  Reveal,
  Stagger,
  StaggerItem,
  useMotionProfile,
} from "@/components/motion/Reveal";

/* ── The matrix ──
   The destination with the deepest verified roster, cheapest four operators
   first. WhyAtlaso runs a two-up teaser; this is the escalation to the full
   attribute matrix — what the product screen actually looks like. Both are
   real rows out of packages.ts rather than invented ones. */
const MATRIX = (() => {
  const byDestination = new Map<string, Operator[]>();

  for (const op of operators) {
    if (!op.verified) continue;
    for (const dest of op.destinations) {
      const bucket = byDestination.get(dest);
      if (bucket) bucket.push(op);
      else byDestination.set(dest, [op]);
    }
  }

  let slug = "";
  let roster: Operator[] = [];
  for (const [dest, ops] of byDestination) {
    if (ops.length > roster.length) {
      slug = dest;
      roster = ops;
    }
  }

  const columns = [...roster]
    .sort((a, b) => a.startingPrice - b.startingPrice)
    .slice(0, 4);

  return {
    slug,
    columns,
    total: roster.length,
    destination: destinations.find((d) => d.slug === slug) ?? null,
  };
})();

const ROWS: { label: string; render: (op: Operator, i: number) => ReactNode }[] = [
  {
    label: "From, per person",
    render: (op) => (
      <span className="price-hero text-[21px] text-white">
        {formatPrice(op.startingPrice)}
      </span>
    ),
  },
  {
    label: "Rating",
    render: (op) => (
      <span className="flex items-center gap-1.5">
        <Star size={12} className="text-star fill-star flex-shrink-0" />
        <span className="text-white text-[13px] font-semibold tnum">
          {op.rating.toFixed(1)}
        </span>
        <span className="text-white/45 text-xs tnum">({op.reviewCount})</span>
      </span>
    ),
  },
  {
    label: "Trips completed",
    render: (op) => (
      <span className="text-white/85 text-[13px] font-semibold tnum">
        {op.completedTrips.toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    label: "Based in",
    render: (op) => (
      <span className="text-white/70 text-[13px] font-body">{op.city}</span>
    ),
  },
  {
    label: "Verified",
    render: (op) =>
      op.verified ? (
        <span className="flex items-center gap-1.5 text-[#8FC7AB] text-[13px] font-semibold">
          <Check size={13} className="flex-shrink-0" />
          Yes
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-white/40 text-[13px]">
          <Minus size={13} className="flex-shrink-0" />
          Pending
        </span>
      ),
  },
  {
    label: "Recognition",
    render: (op) =>
      op.badge ? (
        <span className="mono-chart text-[9px] uppercase text-warm-sand">
          {op.badge}
        </span>
      ) : (
        <span className="text-white/25 text-xs">—</span>
      ),
  },
];

export default function ComparisonPreview() {
  const { reduced } = useMotionProfile();
  const { columns, total, destination, slug } = MATRIX;

  if (!columns.length) return null;

  const label = destination?.name ?? slug.replace(/-/g, " ");

  return (
    <section
      className="relative overflow-hidden bg-espresso-deep py-12 sm:py-16"
    >
      <ContourField
        seed={6.2}
        stroke="201,160,232"
        opacity={0.2}
        scale={120}
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 wash-dark pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">

        <Stagger className="text-center max-w-2xl mx-auto mb-12 sm:mb-14" gap={0.07}>
          <StaggerItem as="p" className="mono-chart text-[11px] uppercase text-warm-sand mb-4">
            The Comparison
          </StaggerItem>
          <StaggerItem
            as="h2"
            className="font-display font-black text-4xl md:text-[3.25rem] text-white leading-[1.05] tracking-display mb-5"
          >
            We don&apos;t list the most operators.
            <br />
            <span className="text-signature">We list the right ones.</span>
          </StaggerItem>
          <StaggerItem as="p" className="text-white/60 text-[15px] font-body leading-relaxed">
            {total} verified operators run {label}. Here are four of them, on the
            same axes, with nothing hidden behind a quote request.
          </StaggerItem>
        </Stagger>

        {/* ── The matrix ── */}
        <Reveal distance={30}>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
            {/* Chart caption */}
            <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-white/10">
              <span className="mono-chart text-[10px] uppercase text-white/45">
                {label} / {columns.length} of {total} operators
              </span>
              {destination && (
                <span className="mono-chart text-[10px] uppercase text-white/30 hidden sm:block">
                  from {formatPrice(destination.priceFrom)}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                {/* Operator column heads */}
                <div className="grid grid-cols-[168px_repeat(4,1fr)] border-b border-white/10">
                  <div className="px-5 py-4" />
                  {columns.map((op, i) => (
                    <div
                      key={op.id}
                      className={`px-4 py-4 border-l border-white/[0.07] ${
                        i === 0 ? "bg-muted-coral/[0.10]" : ""
                      }`}
                    >
                      <p className="font-display font-bold text-[13px] text-white leading-snug mb-1 truncate">
                        {op.name}
                      </p>
                      <span
                        className={`mono-chart text-[9px] uppercase ${
                          i === 0 ? "text-muted-coral" : "text-white/35"
                        }`}
                      >
                        {i === 0 ? "Best value" : `Option ${i + 1}`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Attribute rows */}
                {ROWS.map((row, r) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-[168px_repeat(4,1fr)] ${
                      r > 0 ? "border-t border-white/[0.06]" : ""
                    }`}
                  >
                    <div className="px-5 py-4 flex items-center">
                      {/* Not `.label-util` — that utility hard-codes the warm
                          taupe, which disappears on the dark band. */}
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-white/40">
                        {row.label}
                      </span>
                    </div>
                    {columns.map((op, i) => (
                      <div
                        key={op.id}
                        className={`px-4 py-4 border-l border-white/[0.07] flex items-center ${
                          i === 0 ? "bg-muted-coral/[0.06]" : ""
                        }`}
                      >
                        {row.render(op, i)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── CTA ── */}
        <Reveal className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" delay={0.1}>
          <motion.span
            className="inline-block"
            whileHover={
              reduced ? undefined : { y: -2, boxShadow: "0 14px 36px rgba(255,90,95,0.4)" }
            }
            whileTap={reduced ? undefined : { scale: 0.985 }}
            transition={{ duration: 0.32, ease: EASE_SETTLE }}
            style={{ borderRadius: 9999 }}
          >
            <Link
              href={`/compare/${slug}`}
              className="bg-cta-gradient inline-flex items-center gap-2 text-white font-semibold text-sm px-7 py-3.5 rounded-full"
            >
              Open the full {label} comparison
              <ArrowUpRight size={16} />
            </Link>
          </motion.span>

          <Link
            href="/search"
            className="text-white/60 hover:text-white text-sm font-semibold transition-colors duration-200"
          >
            Or search another destination
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
