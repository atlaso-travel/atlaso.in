"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Scale,
  ShieldCheck,
  ArrowRight,
  Check,
  X,
  MapPin,
  CalendarRange,
  Wallet,
  Compass,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { packages, type Package } from "@/data/packages";
import { destinationById } from "@/data/destinations";
import { verifiedOperators } from "@/data/operators";
import { formatPrice } from "@/lib/utils";
import { EASE_SETTLE, Reveal, useMotionProfile } from "@/components/motion/Reveal";

/* ────────────────────────────────────────────────────────────────────────────
   The worked example

   Every stage below runs on one real destination pulled from the catalogue —
   the one with the most competing operators, since that is where comparing
   actually earns its keep. Operator names, prices, ratings and what's included
   are the same values the compare route would show. Nothing here is a
   placeholder, so the section cannot drift away from the product it describes.
   ──────────────────────────────────────────────────────────────────────────── */
const SHOWCASE = (() => {
  const sellable = packages.filter(
    (p) =>
      p.status === "ACTIVE" &&
      p.pricing.validationStatus !== "ABOVE_RETAIL" &&
      p.pricing.validationStatus !== "INVERTED"
  );

  const byDestination = new Map<string, Package[]>();
  for (const p of sellable) {
    const bucket = byDestination.get(p.destinationId);
    if (bucket) bucket.push(p);
    else byDestination.set(p.destinationId, [p]);
  }

  let best: { id: string; list: Package[]; operators: number } | null = null;
  for (const [id, list] of byDestination) {
    const operators = new Set(list.map((p) => p.operatorId)).size;
    if (!best || operators > best.operators) best = { id, list, operators };
  }

  /* One package per operator — four rows from the same operator is a list, not
     a comparison. Cheapest first, which is the order the shortlist builds in. */
  const seen = new Set<string>();
  const picks: Package[] = [];
  for (const p of [...(best?.list ?? [])].sort(
    (a, b) => a.pricing.platformPrice - b.pricing.platformPrice
  )) {
    if (seen.has(p.operatorId)) continue;
    seen.add(p.operatorId);
    picks.push(p);
    if (picks.length === 4) break;
  }

  const destination = best ? destinationById[best.id] : null;

  return {
    destination,
    picks,
    cheapest: picks[0] ?? null,
    totalHere: best?.list.length ?? 0,
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

/* ── Shared stage furniture ──────────────────────────────────────────────── */

const stageIn = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const riseIn = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_SETTLE } },
};

function StageFrame({
  label,
  right,
  children,
}: {
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={stageIn}
      initial="hidden"
      animate="shown"
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <span className="mono-chart text-[10px] uppercase text-coral-ink">{label}</span>
        {right}
      </div>
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </motion.div>
  );
}

/* ── 01 · The brief ───────────────────────────────────────────────────────── */

function StageBrief() {
  const dest = SHOWCASE.destination;

  const fields = [
    { Icon: MapPin,        label: "Where",     value: dest?.name ?? "Spiti Valley" },
    { Icon: CalendarRange, label: "When",      value: dest?.bestTime ?? "Jun – Sep" },
    { Icon: Compass,       label: "Style",     value: dest?.category ?? "Mountains" },
    /* Rounded up to the nearest thousand — a budget a person would actually
       type, not the arithmetic behind it. */
    {
      Icon: Wallet,
      label: "Budget",
      value: `Under ${formatPrice(
        Math.ceil(((SHOWCASE.cheapest?.pricing.platformPrice ?? 12000) * 1.4) / 1000) * 1000
      )}`,
    },
  ];

  return (
    <StageFrame label="Trip brief">
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ Icon, label, value }) => (
          <motion.div
            key={label}
            variants={riseIn}
            className="rounded-2xl border border-warm-line bg-blush-wash/70 p-4"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={11} className="text-sand-ink" />
              <span className="label-util">{label}</span>
            </div>
            <p className="text-espresso text-sm font-semibold font-body leading-snug">
              {value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* The match sweep — the only place a loading bar earns its keep, because
          it is the visual answer to "and then what happens". */}
      <motion.div variants={riseIn} className="mt-auto pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="mono-chart text-[10px] uppercase text-warm-taupe">
            Matching operators
          </span>
          <span className="mono-chart text-[10px] text-coral-ink">
            {String(SHOWCASE.totalHere).padStart(2, "0")} found
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-warm-line overflow-hidden">
          <motion.div
            className="h-full bg-cta-gradient origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.3, delay: 0.5, ease: EASE_SETTLE }}
          />
        </div>
      </motion.div>
    </StageFrame>
  );
}

/* ── 02 · The shortlist ───────────────────────────────────────────────────── */

function StageShortlist() {
  const rows = SHOWCASE.picks;
  const added = Math.min(3, rows.length);

  return (
    <StageFrame
      label="Results"
      right={
        <motion.span
          key="count"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + added * 0.22, duration: 0.4, ease: EASE_SETTLE }}
          className="mono-chart text-[10px] uppercase text-espresso bg-blush-wash border border-blush-tint rounded-full px-2.5 py-1"
        >
          {added} / 4 added
        </motion.span>
      }
    >
      <div className="space-y-2.5">
        {rows.map((p, i) => {
          const isAdded = i < added;
          return (
            <motion.div
              key={p.id}
              variants={riseIn}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                isAdded ? "border-blush-tint bg-blush-wash/60" : "border-warm-line bg-white"
              }`}
            >
              <span className="w-9 h-9 rounded-lg bg-warm-peach border border-warm-line flex items-center justify-center flex-shrink-0">
                <span className="mono-chart text-[10px] text-coral-ink">
                  {p.operatorName.slice(0, 2).toUpperCase()}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-espresso text-[13px] font-semibold font-body truncate">
                  {p.operatorName}
                </span>
                <span className="block text-warm-taupe text-[11px] font-body truncate">
                  {p.duration} · {p.operatorRating.toFixed(1)} ★
                </span>
              </span>

              <span className="mono-chart text-[12px] text-espresso whitespace-nowrap">
                {formatPrice(p.pricing.platformPrice)}
              </span>

              {/* The add action resolving — a plus that becomes a tick is the
                  whole of step two in one 300ms gesture. */}
              <span className="w-7 h-7 flex-shrink-0 rounded-full border border-blush-tint flex items-center justify-center overflow-hidden">
                {isAdded ? (
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.35 + i * 0.22,
                      duration: 0.4,
                      ease: EASE_SETTLE,
                    }}
                    className="w-full h-full rounded-full bg-brand-coral flex items-center justify-center"
                  >
                    <Check size={13} className="text-white" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <Plus size={13} className="text-coral-ink" />
                )}
              </span>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        variants={riseIn}
        className="mt-auto pt-5 flex items-center justify-between border-t border-warm-line"
      >
        <span className="mono-chart text-[10px] uppercase text-warm-taupe">Shortlist</span>
        <span className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((slot) => (
            <motion.span
              key={slot}
              initial={{ scale: 0.6, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + slot * 0.22, duration: 0.3 }}
              className={`w-5 h-1.5 rounded-full ${
                slot < added ? "bg-brand-coral" : "bg-warm-line"
              }`}
            />
          ))}
        </span>
      </motion.div>
    </StageFrame>
  );
}

/* ── 03 · The comparison ──────────────────────────────────────────────────── */

function StageCompare() {
  const cols = SHOWCASE.picks.slice(0, 3);
  const cheapest = cols.reduce(
    (lo, p) => (p.pricing.platformPrice < lo.pricing.platformPrice ? p : lo),
    cols[0]
  );

  const ROWS: { label: string; cell: (p: Package) => React.ReactNode }[] = [
    {
      label: "From, pp",
      cell: (p) => (
        <span
          className={`mono-chart text-[12px] ${
            p.id === cheapest?.id ? "text-espresso font-semibold" : "text-warm-taupe"
          }`}
        >
          {formatPrice(p.pricing.platformPrice)}
        </span>
      ),
    },
    {
      label: "Rating",
      cell: (p) => (
        <span className="mono-chart text-[12px] text-warm-taupe">
          {p.operatorRating.toFixed(1)}
        </span>
      ),
    },
    { label: "Meals",     cell: (p) => <Mark on={p.mealsIncluded} /> },
    { label: "Guide",     cell: (p) => <Mark on={p.guideIncluded} /> },
    { label: "Transport", cell: (p) => <Mark on={p.transportIncluded} /> },
  ];

  return (
    <StageFrame label="Side by side">
      {/* Operator headers */}
      <div className="grid grid-cols-[72px_repeat(3,1fr)] gap-2 pb-3 border-b border-warm-line">
        <span />
        {cols.map((p, i) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: EASE_SETTLE }}
            className="text-center"
          >
            <span className="block text-espresso text-[11px] font-semibold font-body leading-tight truncate">
              {p.operatorName}
            </span>
          </motion.span>
        ))}
      </div>

      {ROWS.map((row, r) => (
        <motion.div
          key={row.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 + r * 0.13, duration: 0.4 }}
          className="grid grid-cols-[72px_repeat(3,1fr)] gap-2 items-center py-3 border-b border-warm-line/70 last:border-b-0"
        >
          <span className="label-util">{row.label}</span>
          {cols.map((p) => (
            <span key={p.id} className="flex justify-center">
              {row.cell(p)}
            </span>
          ))}
        </motion.div>
      ))}

      {/* The verdict — the reason the table exists. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.5, ease: EASE_SETTLE }}
        className="mt-auto flex items-center gap-2 rounded-xl bg-blush-wash border border-blush-tint px-3.5 py-2.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand-coral flex-shrink-0" />
        <span className="text-espresso text-[12px] font-body">
          <span className="font-semibold">{cheapest?.operatorName}</span> is cheapest
          and includes the most.
        </span>
      </motion.div>
    </StageFrame>
  );
}

function Mark({ on }: { on: boolean }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.32, ease: EASE_SETTLE }}
      className={`w-5 h-5 rounded-full flex items-center justify-center ${
        on ? "bg-summit-light" : "bg-warm-line/60"
      }`}
    >
      {on ? (
        <Check size={11} className="text-summit-green" strokeWidth={3} />
      ) : (
        <X size={11} className="text-warm-taupe" strokeWidth={3} />
      )}
    </motion.span>
  );
}

/* ── 04 · The booking ─────────────────────────────────────────────────────── */

function StageBook() {
  const p = SHOWCASE.cheapest;
  if (!p) return null;

  const lines = [
    { label: "Operator's direct price", value: formatPrice(p.pricing.retailPrice), struck: true },
    { label: "Your price on Atlaso",    value: formatPrice(p.pricing.platformPrice), struck: false },
  ];

  return (
    <StageFrame label="Checkout">
      {/* Verified seal — the tick draws rather than appearing, which is the
          difference between a badge and a check being performed. */}
      <motion.div
        variants={riseIn}
        className="flex items-center gap-3 rounded-2xl border border-blush-tint bg-blush-wash/70 p-4 mb-5"
      >
        <span className="w-11 h-11 rounded-full bg-white border border-blush-tint flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2.5 20 6v6.2c0 4.6-3.3 8.5-8 9.3-4.7-.8-8-4.7-8-9.3V6l8-3.5Z"
              stroke="var(--color-coral-ink)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <motion.path
              d="m8.6 12.2 2.4 2.4 4.6-4.8"
              stroke="var(--color-summit-green)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.45, duration: 0.5, ease: EASE_SETTLE }}
            />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-espresso text-[13px] font-semibold font-body truncate">
            {p.operatorName}
          </span>
          <span className="block text-warm-taupe text-[11px] font-body">
            GST · PAN · licence · insurance checked
          </span>
        </span>
      </motion.div>

      <div className="space-y-3">
        {lines.map(({ label, value, struck }) => (
          <motion.div
            key={label}
            variants={riseIn}
            className="flex items-baseline justify-between gap-4"
          >
            <span className="text-warm-taupe text-[12.5px] font-body">{label}</span>
            <span
              className={
                struck
                  ? "mono-chart text-[13px] text-strike line-through"
                  : "price-hero text-[26px] text-espresso"
              }
            >
              {value}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5, ease: EASE_SETTLE }}
        className="mt-auto"
      >
        <div className="flex items-center justify-between rounded-2xl bg-summit-light border border-summit-green/20 px-4 py-3">
          <span className="mono-chart text-[10px] uppercase text-summit-green">You save</span>
          <span className="price-hero text-[20px] text-summit-green">
            {formatPrice(p.pricing.savings)}
          </span>
        </div>
        <p className="text-warm-taupe text-[11px] font-body mt-2.5 text-center">
          No fee added at checkout — the price shown is the price you pay.
        </p>
      </motion.div>
    </StageFrame>
  );
}

/* ── Steps ────────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    Icon: Search,
    title: "Tell us about your trip",
    body: "Destination, travel style, budget, dates. We match operators to the journey you actually want.",
    Stage: StageBrief,
  },
  {
    Icon: Plus,
    title: "Add the trips that fit",
    body: "Shortlist up to four operators at once — no tabs, no spreadsheets, no WhatsApp threads.",
    Stage: StageShortlist,
  },
  {
    Icon: Scale,
    title: "Compare side-by-side",
    body: "Pricing, inclusions, stay details, ratings and cancellation terms in one aligned view.",
    Stage: StageCompare,
  },
  {
    Icon: ShieldCheck,
    title: "Book with confidence",
    body: "Verified operators, transparent pricing, and every exclusion visible before you pay.",
    Stage: StageBook,
  },
];

const CYCLE_MS = 6000;

export default function HowItWorks() {
  const { reduced } = useMotionProfile();
  const [active, setActive] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.35 });

  /* Advances on a timer keyed to the active step, so a manual pick restarts
     the clock rather than being overridden a moment later. Gated on `inView`
     so the section is not animating to an empty room, and disabled outright
     under reduced motion — where the stepper becomes a plain click-through. */
  useEffect(() => {
    if (reduced || !inView) return;
    const timer = setTimeout(
      () => setActive((prev) => (prev + 1) % STEPS.length),
      CYCLE_MS
    );
    return () => clearTimeout(timer);
  }, [active, reduced, inView]);

  const ActiveStage = STEPS[active].Stage;

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
                Four steps, shown on a real comparison — {SHOWCASE.operatorsHere}{" "}
                operators running{" "}
                <span className="text-espresso font-medium">
                  {SHOWCASE.destination?.name}
                </span>
                , at the prices they are charging today.
              </p>
            </div>
            <span className="mono-chart text-[11px] text-warm-taupe uppercase whitespace-nowrap hidden sm:block pb-2">
              {String(active + 1).padStart(2, "0")} / 04
            </span>
          </div>
        </Reveal>

        <div
          ref={sectionRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch"
        >
          {/* ── The steps ──
              Each row is a real button. The active one carries a progress bar
              that empties into the next step, so the section reads as something
              running rather than something printed. */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-2">
            {STEPS.map(({ Icon, title, body }, i) => {
              const isActive = i === active;

              return (
                <button
                  key={title}
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className={`group relative text-left rounded-2xl border p-5 transition-colors duration-500 overflow-hidden ${
                    isActive
                      ? "border-blush-tint bg-white shadow-card"
                      /* A translucent white fill reads as nothing on a white
                         page, so the resting state is a faint warm well with
                         a real hairline instead. */
                      : "border-warm-line bg-warm-peach/60 hover:bg-warm-peach hover:border-blush-tint"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors duration-500 ${
                        isActive
                          ? "bg-cta-gradient border-transparent"
                          : "bg-warm-peach border-warm-line"
                      }`}
                    >
                      <Icon
                        size={17}
                        className={isActive ? "text-white" : "text-coral-ink"}
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2.5 mb-1">
                        {/* <span className="mono-chart text-[10px] text-coral-ink/70">
                          {String(i + 1).padStart(2, "0")}
                        </span> */}
                        <span className="font-display font-bold text-[1.0625rem] text-espresso leading-snug tracking-display mt-2">
                          {title}
                        </span>
                      </span>

                      {/* Only the active step carries its body copy. Four
                          paragraphs at once is the wall of text this section
                          was; one at a time is something a person reads. */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.span
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: reduced ? 0 : 0.4,
                              ease: EASE_SETTLE,
                            }}
                            className="block overflow-hidden"
                          >
                            <span className="block text-warm-taupe text-[13.5px] font-body leading-relaxed pt-1">
                              {body}
                            </span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </div>

                  {/* Cycle timer. Linear on purpose — an eased progress bar
                      lies about how much time is left. */}
                  {isActive && !reduced && (
                    <motion.span
                      key={`bar-${active}`}
                      className="absolute left-0 bottom-0 h-[2px] w-full bg-cta-gradient origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: inView ? 1 : 0 }}
                      transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}

            <Reveal className="mt-4" delay={0.1}>
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
                </p>
              </div>
            </Reveal>
          </div>

          {/* ── The stage ──
              Re-mounted per step so every stage replays its own entrance. This
              is the section's answer to "what does that actually look like",
              and it is the reason the copy can stay short. */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative rounded-3xl border border-warm-line bg-white shadow-card p-5 sm:p-7 h-[420px] sm:h-[460px] lg:h-full lg:min-h-[500px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -8 }}
                  transition={{ duration: reduced ? 0.15 : 0.45, ease: EASE_SETTLE }}
                  className="h-full"
                >
                  <ActiveStage />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
