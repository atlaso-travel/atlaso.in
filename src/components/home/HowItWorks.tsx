"use client";

import { MapPin, CheckCircle2 } from "lucide-react";

/* ─── Step 1 visual: search widget (light card) ─────────────── */
function SearchVisual() {
  return (
    <div className="mt-6 rounded-2xl bg-black/[0.04] border border-black/[0.07] p-4">
      <p className="text-map-muted text-[10px] font-semibold uppercase tracking-widest mb-2 font-body">
        Where to?
      </p>
      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-map-border shadow-sm">
        <MapPin size={14} className="text-rose-pink flex-shrink-0" />
        <span className="text-map-muted text-sm font-body">Search Destinations</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl px-3 py-2 border border-map-border">
          <p className="text-map-muted/70 text-[10px] font-body">Arrival and Departure Dates</p>
          <p className="text-map-muted text-xs font-body mt-0.5">Enter dates</p>
        </div>
        <div className="bg-white rounded-xl px-3 py-2 border border-map-border">
          <p className="text-map-muted/70 text-[10px] font-body">Travellers</p>
          <p className="text-map-muted text-xs font-body mt-0.5">Select people</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Comparison table (dark cards) ─────────────────────────── */
function CompareVisual() {
  const rows = [
    { price: "₹12,499", rating: "4.8★", meals: true, flex: "High", flexGreen: true  },
    { price: "₹12,499", rating: "4.2★", meals: true, flex: "High", flexGreen: true  },
    { price: "₹12,499", rating: "4.2★", meals: true, flex: "Low",  flexGreen: false },
  ];

  return (
    <div className="mt-6 rounded-2xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className="grid grid-cols-6 bg-white/5 px-3 py-2 text-[10px] font-semibold text-white/40 font-body">
        <span>Operator</span>
        <span className="col-span-2">Price (Ranging from)</span>
        <span>Rating</span>
        <span>Meals</span>
        <span>Cancel Flex</span>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-6 items-center px-3 py-2.5 border-t border-white/5">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[9px] text-white font-bold">
            {["A", "B", "C"][i]}
          </div>
          <span className="col-span-2 text-white font-semibold text-xs font-display">{row.price}</span>
          <span className="text-yellow-400 text-[10px] font-semibold">{row.rating}</span>
          <CheckCircle2 size={14} className="text-green-400" />
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${
              row.flexGreen ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {row.flex}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────── */
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end mb-14">
          <div className="w-1/2 flex flex-col items-start md:justify-between gap-2 ">
            <p className="text-rose-pink text-sm font-semibold mb-3 font-body mb-6">How Atlaso Works</p>  
            <h2
              className ="font-display font-black text-4xl md:text-5xl text-map-text leading-tight transition-all duration-500 ease-out delay-100"
            >
              Plan Smarter.
            </h2>
            <h2
              className="font-display font-black text-4xl md:text-5xl leading-tight transition-all duration-500 ease-out delay-200"
              style={{
                background: "linear-gradient(90deg, #E91E63 0%, #AB47BC 55%, #7E57C2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Book Better.
            </h2>
          </div>
          <p className=" w-1/2text-map-muted text-base max-w-sm font-body leading-relaxed md:pb-2">
            Atlaso removes the confusion from trip planning by bringing trusted tour operators,
            transparent pricing, and real traveler insights together — so you can focus on the
            journey, not the stress.
          </p>
        </div>

        {/* 2×2 card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Card 1 — Step 1, light pink */}
          <div className="relative rounded-3xl bg-rose-light border border-rose-pink/10 p-8 overflow-hidden">
            <span className="absolute bottom-4 right-6 font-black font-display text-[120px] leading-none text-rose-pink/[0.08] select-none pointer-events-none">
              Step 1
            </span>
            <p className="text-rose-pink text-sm font-semibold mb-3 font-body">Step 1</p>
            <h3 className="font-display font-black text-2xl text-map-text mb-2">
              Tell us about your trip
            </h3>
            <p className="text-map-muted text-sm font-body leading-relaxed max-w-xs">
              Choose your destination, travel style, budget, and dates — we&apos;ll find operators that match your journey.
            </p>
            <SearchVisual />
          </div>

          {/* Card 2 — Step 2, dark maroon */}
          <div className="relative rounded-3xl bg-maroon-dark border border-white/5 p-8 overflow-hidden">
            <span className="absolute bottom-4 right-6 font-black font-display text-[120px] leading-none text-white/[0.05] select-none pointer-events-none">
              Step 2
            </span>
            <p className="text-rose-pink text-sm font-semibold mb-3 font-body">Step 2</p>
            <h3 className="font-display font-black text-2xl text-white mb-2">
              Add the trips that fit your needs
            </h3>
            <p className="text-white/60 text-sm font-body leading-relaxed max-w-xs">
              You can add upto 4 operators at once to see the comparison.
            </p>
            <CompareVisual />
          </div>

          {/* Card 3 — Step 3, dark maroon */}
          <div className="relative rounded-3xl bg-maroon-dark border border-white/5 p-8 overflow-hidden">
            <span className="absolute bottom-4 right-6 font-black font-display text-[120px] leading-none text-white/[0.05] select-none pointer-events-none">
              Step 3
            </span>
            <p className="text-rose-pink text-sm font-semibold mb-3 font-body">Step 3</p>
            <h3 className="font-display font-black text-2xl text-white mb-2">
              Compare operators side-by-side
            </h3>
            <p className="text-white/60 text-sm font-body leading-relaxed max-w-xs">
              View pricing, inclusions, stay details, ratings, and policies together in one transparent comparison view.
            </p>
            <CompareVisual />
          </div>

          {/* Card 4 — Step 4, light pink */}
          <div className="relative rounded-3xl bg-rose-light border border-rose-pink/10 p-8 overflow-hidden flex flex-col justify-between">
            <span className="absolute bottom-4 right-6 font-black font-display text-[120px] leading-none text-rose-pink/[0.08] select-none pointer-events-none">
              Step 4
            </span>
            <div>
              <p className="text-rose-pink text-sm font-semibold mb-3 font-body">Step 4</p>
              <h3 className="font-display font-black text-2xl text-map-text mb-3">
                Book with complete confidence
              </h3>
              <p className="text-map-muted text-sm font-body leading-relaxed max-w-xs">
                Understand exactly what&apos;s included before booking — with verified operators,
                transparent pricing, and no hidden surprises.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: "100+", label: "Verified Operators" },
                { value: "4.8★", label: "Avg. Rating"        },
                { value: "10k+", label: "Trips Compared"     },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-black font-display text-2xl text-rose-pink">{stat.value}</p>
                  <p className="text-map-muted text-[11px] font-body mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
