"use client";

import {
  Search,
  BarChart3,
  CheckCircle,
  CheckCircle2,
  XCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useIntersectionObserver";

/* ─── Step 1 visual ──────────────────────────────────────── */
function SearchVisual() {
  return (
    <div className="-rotate-1 relative">
      <div className="bg-white rounded-3xl shadow-blue-md border border-map-border p-5 w-full max-w-sm relative">
        {/* Decorative dot */}
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-compass-blue rounded-full" />

        <p className="text-[10px] font-bold tracking-widest text-trail-orange mb-2 uppercase">
          Where to?
        </p>

        {/* Destination row */}
        <div className="flex items-center gap-3 bg-map-white rounded-xl p-3 mb-4">
          <MapPin size={16} className="text-trail-orange flex-shrink-0" />
          <span className="flex-1 text-map-text font-medium text-sm font-body">
            Spiti Valley, Himachal Pradesh
          </span>
          <div className="bg-compass-blue text-white rounded-xl px-3 py-2 text-xs font-bold ml-auto whitespace-nowrap font-body">
            Search
          </div>
        </div>

        {/* Popular tags */}
        <div className="flex gap-2 flex-wrap">
          {["Spiti Valley", "Leh Ladakh", "Rishikesh"].map((tag) => (
            <span
              key={tag}
              className="bg-compass-light text-compass-blue rounded-full text-xs px-3 py-1 font-medium font-body"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-4 -right-4 bg-compass-blue text-white text-xs px-3 py-1.5 rounded-xl font-semibold shadow-md whitespace-nowrap -rotate-2 font-body">
        50+ Destinations 🗺️
      </div>
    </div>
  );
}

/* ─── Step 2 visual ──────────────────────────────────────── */
function CompareVisual() {
  return (
    <div className="rotate-1 bg-white rounded-3xl shadow-blue-md border border-map-border p-5 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-map-muted mb-3">
        <BarChart3 size={12} />
        Comparing 2 operators
      </div>

      {/* Operator snippets */}
      {[
        { name: "Alpine Treks Co", price: "₹14,999", badge: "Top Rated", badgeCls: "bg-trail-light text-trail-orange" },
        { name: "Summit Squad",    price: "₹9,999",  badge: "Best Value", badgeCls: "bg-summit-light text-summit-green" },
      ].map((op) => (
        <div
          key={op.name}
          className="flex items-center justify-between bg-map-white rounded-xl p-2.5 mb-2"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-map-text font-display">{op.name}</span>
            <ShieldCheck size={12} className="text-summit-green" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm text-compass-blue font-display">{op.price}</span>
            <span className={cn("rounded text-[9px] px-1 font-semibold font-body", op.badgeCls)}>
              {op.badge}
            </span>
          </div>
        </div>
      ))}

      {/* Mini table */}
      <div className="mt-3">
        {/* Column headers */}
        <div className="flex items-center py-1.5 mb-1">
          <span className="flex-1 text-xs text-map-muted font-medium font-body" />
          <span className="w-24 text-center text-xs font-bold text-map-text border-b-2 border-compass-blue pb-0.5 font-display">
            Alpine Co
          </span>
          <span className="w-24 text-center text-xs font-bold text-map-text border-b-2 border-trail-orange pb-0.5 font-display">
            Summit
          </span>
        </div>

        {/* Rows */}
        {[
          {
            label: "Price",
            a: <span className="text-compass-blue font-black text-xs font-display">₹14,999</span>,
            b: <span className="text-compass-blue font-black text-xs font-display">₹9,999</span>,
          },
          {
            label: "Meals",
            a: <CheckCircle2 size={14} className="text-summit-green mx-auto" />,
            b: <CheckCircle2 size={14} className="text-summit-green mx-auto" />,
          },
          {
            label: "Transport",
            a: <CheckCircle2 size={14} className="text-summit-green mx-auto" />,
            b: <XCircle size={14} className="text-red-400 mx-auto" />,
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center py-2.5 border-b border-map-border last:border-0"
          >
            <span className="flex-1 text-xs text-map-muted font-medium font-body">{row.label}</span>
            <div className="w-24 flex justify-center">{row.a}</div>
            <div className="w-24 flex justify-center">{row.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 3 visual ──────────────────────────────────────── */
function BookingVisual() {
  return (
    <div className="-rotate-1 relative">
      {/* Floating success badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-summit-green text-white text-xs px-4 py-1.5 rounded-full font-semibold shadow-md whitespace-nowrap flex items-center gap-1.5 z-10 font-body">
        <CheckCircle size={12} />
        Booking Confirmed! 🎉
      </div>

      <div className="bg-white rounded-3xl shadow-blue-md border border-map-border p-5 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pt-1">
          <div>
            <p className="text-sm font-bold text-map-text font-display">Alpine Treks Co</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck size={14} className="text-summit-green" />
              <span className="text-summit-green text-xs font-medium font-body">Verified Operator</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-map-muted block font-body">from</span>
            <span className="font-black text-2xl text-compass-blue font-display leading-none">₹14,999</span>
          </div>
        </div>

        {/* Inclusions */}
        <div className="flex flex-col gap-2 my-4">
          {["Meals included", "Guide included", "Transport included"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-map-text">
              <CheckCircle2 size={14} className="text-summit-green flex-shrink-0" />
              <span className="font-body">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full bg-compass-blue text-white font-bold rounded-2xl py-3 px-5 text-sm text-center mt-2 font-body">
          Book Now — It&apos;s Free to Compare
        </div>
      </div>
    </div>
  );
}

/* ─── Step config ─────────────────────────────────────────── */
const STEPS = [
  {
    number: "01",
    label: "Step 01",
    icon: Search,
    iconBg: "bg-compass-blue",
    accentText: "text-compass-blue",
    ghostColor: "text-compass-blue/[0.06]",
    pillBg: "bg-compass-blue",
    title: "Tell us where you want to go",
    desc: "Enter your destination, travel dates and group size. Takes less than 10 seconds.",
    pills: ["⚡ 10 seconds", "🗺️ 50+ Destinations"],
    visual: <SearchVisual />,
  },
  {
    number: "02",
    label: "Step 02",
    icon: BarChart3,
    iconBg: "bg-trail-orange",
    accentText: "text-trail-orange",
    ghostColor: "text-trail-orange/[0.06]",
    pillBg: "bg-trail-orange",
    title: "See all operators, side by side",
    desc: "Compare prices, what's included, ratings and cancellation policy — all in one place.",
    pills: ["📊 Side by side", "✅ All inclusions shown"],
    visual: <CompareVisual />,
  },
  {
    number: "03",
    label: "Step 03",
    icon: CheckCircle,
    iconBg: "bg-summit-green",
    accentText: "text-summit-green",
    ghostColor: "text-summit-green/[0.06]",
    pillBg: "bg-summit-green",
    title: "Book with full confidence",
    desc: "Know exactly what you're getting before you pay. No hidden fees. No surprises.",
    pills: ["🔒 Verified operators", "💰 No hidden costs"],
    visual: <BookingVisual />,
  },
] as const;

/* ─── Globe SVG decoration ────────────────────────────────── */
function GlobeDecor() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.04] pointer-events-none select-none"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="90" stroke="#2A6DD9" strokeWidth="2" />
      <ellipse cx="100" cy="100" rx="55" ry="90" stroke="#2A6DD9" strokeWidth="1.5" />
      <ellipse cx="100" cy="100" rx="90" ry="40" stroke="#2A6DD9" strokeWidth="1.5" />
      <line x1="10" y1="100" x2="190" y2="100" stroke="#2A6DD9" strokeWidth="1.5" />
      <line x1="100" y1="10" x2="100" y2="190" stroke="#2A6DD9" strokeWidth="1.5" />
    </svg>
  );
}

/* ─── Step component ──────────────────────────────────────── */
function Step({
  step,
  index,
  inView,
}: {
  step: (typeof STEPS)[number];
  index: number;
  inView: boolean;
}) {
  const Icon = step.icon;
  const isReversed = index % 2 === 1;
  const textDelay = index === 0 ? "delay-0" : index === 1 ? "delay-150" : "delay-300";
  const visualDelay = index === 0 ? "delay-200" : index === 1 ? "delay-[350ms]" : "delay-500";
  const pill1Delay = index === 0 ? "delay-[400ms]" : index === 1 ? "delay-[500ms]" : "delay-[600ms]";
  const pill2Delay = index === 0 ? "delay-500" : index === 1 ? "delay-[600ms]" : "delay-700";
  const textInitial = isReversed ? "opacity-0 translate-x-8" : "opacity-0 -translate-x-8";
  const visualInitial = isReversed ? "opacity-0 -translate-x-8" : "opacity-0 translate-x-8";

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center min-h-[280px] max-w-5xl mx-auto mb-4 md:mb-0"
      )}
    >
      {/* Text side */}
      <div
        className={cn(
          "flex flex-col justify-center py-6 sm:py-12 relative",
          isReversed ? "md:order-last" : "",
          "transition-all duration-700 ease-out",
          textDelay,
          inView ? "opacity-100 translate-x-0" : textInitial
        )}
      >
        {/* Ghost number */}
        <span
          className={cn(
            "hidden md:block absolute -left-4 top-0 font-black font-display text-[140px] leading-none select-none pointer-events-none",
            step.ghostColor
          )}
        >
          {step.number}
        </span>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold font-display flex-shrink-0",
              step.iconBg
            )}
          >
            {index + 1}
          </div>
          <span className={cn("text-sm font-semibold", step.accentText)}>{step.label}</span>
        </div>

        {/* Icon */}
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative z-10",
            step.iconBg
          )}
        >
          <Icon size={24} className="text-white" />
        </div>

        {/* Title */}
        <h3 className="font-display font-black text-3xl text-map-text mb-3 leading-tight relative z-10">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-map-muted text-base font-body leading-relaxed max-w-sm relative z-10">
          {step.desc}
        </p>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mt-5 relative z-10">
          {step.pills.map((pill, pi) => (
            <span
              key={pill}
              className={cn(
                "bg-white border border-map-border rounded-full px-3 py-1 text-xs font-medium text-map-text shadow-sm font-body transition-all duration-700 ease-out",
                pi === 0 ? pill1Delay : pill2Delay,
                inView ? "opacity-100" : "opacity-0"
              )}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Visual side */}
      <div
        className={cn(
          "relative flex items-center justify-center py-8",
          isReversed ? "md:order-first" : "",
          "transition-all duration-700 ease-out",
          visualDelay,
          inView ? "opacity-100 translate-x-0" : visualInitial
        )}
      >
        {step.visual}
      </div>
    </div>
  );
}

/* ─── Connecting line ─────────────────────────────────────── */
function ConnectingLine({ inView }: { inView: boolean }) {
  const circles = [
    { color: "bg-compass-blue", delay: "delay-500" },
    { color: "bg-trail-orange", delay: "delay-700" },
    { color: "bg-summit-green", delay: "delay-900" },
  ];

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[260px] bottom-[100px] w-px hidden md:block">
      {/* Track */}
      <div className="absolute inset-0 bg-gradient-to-b from-compass-blue via-trail-orange to-summit-green opacity-20" />
      {/* Animated fill */}
      <div
        className={cn(
          "w-full bg-gradient-to-b from-compass-blue via-trail-orange to-summit-green transition-all duration-[2000ms] ease-out delay-300",
          inView ? "h-full" : "h-0"
        )}
      />
      {/* Circle connectors at 0%, 50%, 100% */}
      {circles.map((c, i) => (
        <div
          key={i}
          className={cn(
            "absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white transition-all duration-300 ease-out",
            c.color,
            c.delay,
            inView ? "scale-100" : "scale-0"
          )}
          style={{ top: `${i * 50}%` }}
        />
      ))}
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────── */
export default function HowItWorks() {
  const { ref: sectionRef, inView: sectionInView } = useInView(0.1);
  const { ref: step0Ref, inView: step0InView } = useInView(0.2);
  const { ref: step1Ref, inView: step1InView } = useInView(0.2);
  const { ref: step2Ref, inView: step2InView } = useInView(0.2);

  const stepRefs = [step0Ref, step1Ref, step2Ref];
  const stepInViews = [step0InView, step1InView, step2InView];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="bg-compass-light py-20 relative overflow-hidden"
    >
      {/* Background decorations */}
      {/* <GlobeDecor /> */}
      <div className="absolute inset-0 bg-dots pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-map-border-blue rounded-full px-4 py-1.5 text-compass-blue text-xs font-semibold mb-6 font-body">
            <span className="w-2 h-2 bg-compass-blue rounded-full animate-pulse" />
            Simple 3-step process
          </div>

          <h2 className="font-display font-black text-5xl text-map-text tracking-tight mb-4">
            How Atlaso Works
          </h2>

          <p className="text-map-muted text-lg max-w-xl font-body">
            From search to booking in minutes — no calls, no waiting, no guesswork.
          </p>
        </div>

        {/* Steps + connecting line */}
        <div className="flex flex-col gap-0 relative">
          <ConnectingLine inView={sectionInView} />

          {STEPS.map((step, i) => (
            <div key={step.number} ref={stepRefs[i]}>
              <Step step={step} index={i} inView={stepInViews[i]} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-map-white pointer-events-none" />
    </section>
  );
}
