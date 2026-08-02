"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Check, Minus, Route, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";
import { operators } from "@/data/operators";
import type { Operator } from "@/data/operators";
import { destinations } from "@/data/destinations";
import { formatPrice } from "@/lib/utils";
import { generateDestinationAlt } from "@/lib/seo/altText";
import ClipPanel, { type ClipFrame } from "@/components/ui/ClipPanel";
import {
  EASE_SETTLE,
  Reveal,
  Stagger,
  StaggerItem,
  useMotionProfile,
} from "@/components/motion/Reveal";

/* ── The showcase pair ──
   Rather than illustrate "we compare operators" with an icon, the section runs
   an actual comparison. Picked by finding the destination whose verified
   operators have the widest starting-price spread, so the saving in the
   callout is a real number derived from packages.ts — not a decorative one. */
const SHOWCASE = (() => {
  const byDestination = new Map<string, Operator[]>();

  for (const op of operators) {
    if (!op.verified) continue;
    for (const dest of op.destinations) {
      const bucket = byDestination.get(dest);
      if (bucket) bucket.push(op);
      else byDestination.set(dest, [op]);
    }
  }

  let best: { dest: string; low: Operator; high: Operator; gap: number } | null = null;

  for (const [dest, ops] of byDestination) {
    if (ops.length < 2) continue;
    const sorted = [...ops].sort((a, b) => a.startingPrice - b.startingPrice);
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    const gap = high.startingPrice - low.startingPrice;
    if (!best || gap > best.gap) best = { dest, low, high, gap };
  }

  return best;
})();

const prettify = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Two letters from the operator name — a stand-in until real logos land. */
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/* ── The film ──
   Until the real tour film exists this runs as a stills reel, which is a
   finished state rather than a placeholder: four catalogue photographs on a
   slow push, same chrome the video will use.

   To swap in the film: drop the file at `public/atlaso-tour.mp4`, set
   TOUR_FILM to "/atlaso-tour.mp4", and nothing else in this file changes.
   Keep it under ~8MB and silent-friendly — it autoplays muted, so anything
   that only works with sound on is wasted. */
const TOUR_FILM: string = "";

const FILM_FRAMES: ClipFrame[] = destinations.slice(0, 4).map((d) => ({
  src: d.heroImage,
  alt: generateDestinationAlt({
    subject: d.tagline,
    destination: d.name,
    region: d.region,
    season: d.bestTime,
  }),
  caption: `${d.name} · ${d.region}`,
}));

const REASONS = [
  {
    Icon: ShieldCheck,
    title: "Handpicked, then verified",
    body: "GST, PAN, licence and liability insurance are checked before an operator is listed. Curation runs on service quality — never on who pays for placement.",
    marks: ["Documents verified", "Never paid placement"],
  },
  {
    Icon: Route,
    title: "Book what fits you",
    body: "Budget adventures, luxury escapes, backpacking routes or curated experiences — filters follow how you actually travel, not the inventory anyone needs to move.",
    marks: ["Style-based matching", "No inventory pressure"],
  },
];

/* ── The mini comparison ── */
function CompareShowcase() {
  const { reduced } = useMotionProfile();
  if (!SHOWCASE) return null;

  const { low, high, gap, dest } = SHOWCASE;
  const pctLess = Math.round((gap / high.startingPrice) * 100);

  /* The price row is a proportional bar pair rather than two numbers in a
     table. It is the one attribute where the difference is the whole point,
     and a shared scale states that difference before anyone reads a digit. */
  const PRICES = [
    { op: low, tone: "low" as const },
    { op: high, tone: "high" as const },
  ];

  const ROWS: {
    label: string;
    render: (op: Operator) => ReactNode;
  }[] = [
    {
      label: "Traveller rating",
      render: (op) => (
        <span className="flex items-center gap-1.5">
          <Star size={12} className="text-star fill-star flex-shrink-0" />
          <span className="text-espresso text-[13px] font-semibold tnum">
            {op.rating.toFixed(1)}
          </span>
          <span className="text-warm-taupe text-xs tnum">({op.reviewCount})</span>
        </span>
      ),
    },
    {
      label: "Trips completed",
      render: (op) => (
        <span className="text-espresso text-[13px] font-semibold tnum">
          {op.completedTrips.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      label: "Verification",
      render: (op) =>
        op.verified ? (
          <span className="flex items-center gap-1.5 text-summit-green text-[13px] font-semibold">
            <Check size={13} className="flex-shrink-0" />
            Verified
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-warm-taupe text-[13px]">
            <Minus size={13} className="flex-shrink-0" />
            Pending
          </span>
        ),
    },
  ];

  return (
    <div className="relative rounded-3xl border border-warm-line bg-white shadow-card overflow-hidden h-full flex flex-col">
      {/* Card head */}
      <div className="relative px-6 sm:px-7 pt-6 sm:pt-7 pb-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="mono-chart text-[10px] uppercase text-coral-ink/70">
            Live comparison / {prettify(dest)}
          </p>
          <span className="mono-chart text-[9px] uppercase text-warm-taupe border border-warm-line rounded-full px-2 py-1">
            2 of {operators.filter((o) => o.verified).length} verified
          </span>
        </div>

        <h3 className="font-display font-black text-2xl sm:text-[28px] text-espresso leading-tight tracking-display mb-2">
          Same region.
          <br />
          <span className="text-signature">{formatPrice(gap)} apart.</span>
        </h3>
        <p className="text-warm-taupe text-sm font-body leading-relaxed">
          Two verified operators running {prettify(dest)}. Same checks, same
          transparency — different price.
        </p>
      </div>

      {/* ── Price spread ── */}
      <div className="px-6 sm:px-7 pb-5 space-y-4">
        {PRICES.map(({ op, tone }, i) => {
          const width = (op.startingPrice / high.startingPrice) * 100;

          return (
            <div key={op.id}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className={`mono-chart w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
                      tone === "low"
                        ? "bg-blush-wash text-coral-ink border border-blush-tint"
                        : "bg-warm-peach text-warm-taupe border border-warm-line"
                    }`}
                  >
                    {initialsOf(op.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-[13px] text-espresso truncate">
                        {op.name}
                      </span>
                      <ShieldCheck size={12} className="text-summit-green flex-shrink-0" />
                    </span>
                    <span
                      className={`mono-chart text-[9px] uppercase ${
                        tone === "low" ? "text-coral-ink" : "text-warm-taupe"
                      }`}
                    >
                      {tone === "low" ? "Best value" : "Compared"}
                    </span>
                  </span>
                </span>

                <span
                  className={`price-hero flex-shrink-0 ${
                    tone === "low" ? "text-[22px] text-espresso" : "text-[18px] text-warm-taupe"
                  }`}
                >
                  {formatPrice(op.startingPrice)}
                </span>
              </div>

              <div className="h-2 rounded-full bg-blush-wash border border-warm-line/70 overflow-hidden">
                <motion.div
                  /* Solid coral, not the signature gradient — that is spent on
                     CTAs, the hero rule and the route element, and a fourth
                     home is how a signature becomes wallpaper. */
                  className={`h-full rounded-full ${
                    tone === "low" ? "bg-brand-coral" : "bg-warm-taupe/25"
                  }`}
                  initial={{ width: reduced ? `${width}%` : "0%" }}
                  whileInView={{ width: `${width}%` }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: reduced ? 0 : 0.9,
                    delay: reduced ? 0 : 0.15 + i * 0.12,
                    ease: EASE_SETTLE,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Everything else, still a table ──
          The label sits above the pair rather than in a third column — at this
          width a 3-column table would crush both values on mobile. */}
      <div className="px-6 sm:px-7 pb-6 sm:pb-7 mt-auto">
        <div className="rounded-2xl border border-warm-line overflow-hidden">
          {ROWS.map((row, i) => (
            <div key={row.label} className={i > 0 ? "border-t border-warm-line" : ""}>
              <p className="label-util px-4 pt-3">{row.label}</p>
              <div className="grid grid-cols-[1fr_1fr]">
                <div className="px-4 pb-3 pt-1 border-r border-warm-line flex items-center">
                  {row.render(low)}
                </div>
                <div className="px-4 pb-3 pt-1 flex items-center">{row.render(high)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* The payoff */}
        {gap > 0 && (
          <motion.div
            className="mt-4 flex items-center gap-2.5 rounded-2xl bg-summit-light border border-summit-green/20 px-4 py-3"
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: reduced ? 0.2 : 0.5, delay: 0.15, ease: EASE_SETTLE }}
          >
            <span className="w-6 h-6 rounded-full bg-summit-green/15 flex items-center justify-center flex-shrink-0">
              <Check size={13} className="text-summit-green" />
            </span>
            <p className="text-[13px] font-body text-espresso">
              <strong className="font-semibold">
                {formatPrice(gap)} less — {pctLess}% off the higher quote
              </strong>{" "}
              <span className="text-warm-taupe">
                for the same region and the same verification standard.
              </span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function WhyAtlaso() {
  const { reduced } = useMotionProfile();

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden bg-section-warm">
      <div className="absolute inset-0 wash-bottom pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ──
            The three headline numbers used to be a row of icon-circle stat
            tiles, which is the single most generic landing-page component
            there is. They read better as a claim in a sentence. */}
        <Stagger className="max-w-3xl mb-10 sm:mb-12" gap={0.07}>
          <StaggerItem as="p" className="eyebrow mb-4">
            Why Atlaso
          </StaggerItem>
          <StaggerItem
            as="h2"
            className="font-display font-black text-4xl md:text-5xl text-espresso leading-[1.05] tracking-display mb-5"
          >
            We don&apos;t list every operator.{" "}
            <span className="text-signature">We shortlist the right ones.</span>
          </StaggerItem>
          <StaggerItem as="p" className="text-warm-taupe text-base sm:text-[17px] font-body leading-[1.75]">
            Across{" "}
            <strong className="text-espresso font-semibold">100+ verified operators</strong>{" "}
            holding a{" "}
            <strong className="text-espresso font-semibold">4.8★ average</strong>{" "}
            traveller rating and{" "}
            <strong className="text-espresso font-semibold">10k+ trips compared</strong>
            , the job is the same every time: strip out the noise, put the real
            numbers next to each other, and let you decide.
          </StaggerItem>
        </Stagger>

        {/* ── Bento: film and two reasons on the left, live comparison down the
            right. The film carries the emotional half of the argument and the
            comparison carries the evidence, side by side on purpose. ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          <Reveal className="lg:col-span-7" distance={28}>
            <ClipPanel
              frames={FILM_FRAMES}
              videoSrc={TOUR_FILM || undefined}
              eyebrow="Atlaso in motion"
              runtime="0:45"
              title="Ninety seconds of research, not nine tabs"
              body="Pick a destination, see every verified operator running it, and compare the real numbers on one screen."
              sizes="(max-width: 1024px) 100vw, 600px"
              aspect="aspect-[16/9]"
            />
          </Reveal>

          <Reveal className="lg:col-span-5 lg:row-span-2" distance={28} delay={0.08}>
            <CompareShowcase />
          </Reveal>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {REASONS.map((reason, i) => (
              <Reveal key={reason.title} delay={0.12 + i * 0.08} distance={28}>
                <motion.div
                  className="h-full rounded-3xl border border-warm-line bg-white p-6 flex flex-col"
                  style={{ boxShadow: "0 1px 2px rgba(28,31,38,0.04), 0 4px 16px rgba(28,31,38,0.05)" }}
                  whileHover={
                    reduced
                      ? undefined
                      : {
                          y: -5,
                          boxShadow: "0 18px 44px rgba(28,31,38,0.10)",
                          borderColor: "#FFC9CB",
                        }
                  }
                  transition={{ duration: 0.38, ease: EASE_SETTLE }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 rounded-xl bg-blush-wash border border-blush-tint/70 flex items-center justify-center">
                      <reason.Icon size={16} className="text-coral-ink" />
                    </span>
                    <span className="mono-chart text-[10px] uppercase text-warm-taupe/70">
                      {String(i + 1).padStart(2, "0")} / {String(REASONS.length).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg text-espresso leading-snug tracking-display mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-warm-taupe text-[13px] font-body leading-relaxed mb-5">
                    {reason.body}
                  </p>

                  <ul className="mt-auto space-y-2 pt-4 border-t border-warm-line">
                    {reason.marks.map((mark) => (
                      <li
                        key={mark}
                        className="flex items-center gap-1.5 text-[12px] font-body text-espresso/75"
                      >
                        <Check size={12} className="text-summit-green flex-shrink-0" />
                        {mark}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── CTA ──
            On its own rule rather than floating under the left column, so the
            section closes across the full measure instead of trailing off. */}
        <Reveal className="mt-8 pt-7 border-t border-warm-line" delay={0.1}>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
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
                href="/search"
                className="bg-cta-gradient inline-flex items-center gap-2 text-white font-semibold text-sm px-7 py-3.5 rounded-full"
              >
                Search a destination &amp; compare operators
                <ArrowUpRight size={16} />
              </Link>
            </motion.span>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {["Free to compare", "No booking fee", "Verified operators only"].map((note) => (
                <span
                  key={note}
                  className="flex items-center gap-1.5 text-[12px] font-body text-warm-taupe"
                >
                  <Check size={12} className="text-summit-green flex-shrink-0" />
                  {note}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
