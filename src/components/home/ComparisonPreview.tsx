"use client";

import Image from "next/image";
import { CheckCircle2, Star } from "lucide-react";
import { useInView } from "@/hooks/useIntersectionObserver";

const TABLE_ROWS = [
  { abbr: "A", color: "#E91E63", bg: "#FFF0F5", price: "₹12,499", rating: "4.8★", meals: true, flex: "High", flexGreen: true,  best: true  },
  { abbr: "B", color: "#00A651", bg: "#F0FFF5", price: "₹12,499", rating: "4.2★", meals: true, flex: "High", flexGreen: true,  best: false },
  { abbr: "C", color: "#1565C0", bg: "#EFF4FD", price: "₹12,499", rating: "4.2★", meals: true, flex: "Low",  flexGreen: false, best: false },
  { abbr: "D", color: "#B8860B", bg: "#FFFBEB", price: "₹12,499", rating: "4.2★", meals: true, flex: "High", flexGreen: true,  best: false },
];

const DEST_STATS = ["12K+ Travelers Compared", "Best for Groups", "Adventurous Escapes"];

export default function ComparisonPreview() {
  const { ref, inView } = useInView(0.1);

  return (
    <section className="py-20 bg-white">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Top text ── */}
        <div
          className={`mb-12 transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2
            className={`font-display font-black text-4xl md:text-5xl text-map-text leading-tight mb-2 transition-all duration-500 ease-out delay-100 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            We don&apos;t list the most operators.
          </h2>
          <h2
            className={`font-display font-black text-4xl md:text-5xl leading-tight mb-6 transition-all duration-500 ease-out delay-200 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{
              background: "linear-gradient(90deg, #E91E63 0%, #AB47BC 55%, #7E57C2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            We list the right ones.
          </h2>


          <p className="text-map-muted text-sm font-body leading-relaxed max-w-2xl mb-2">
            Unlike platforms that overwhelm you with endless listings, Atlaso carefully selects
            operators that meet our quality, transparency, and traveler satisfaction standards.
          </p>
          <p className="text-map-muted text-sm font-body leading-relaxed max-w-2xl">
            We then compare the best options side-by-side — helping you find the experience that
            truly matches your travel style, budget, and expectations.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

          {/* Left: full-height mountain image card */}
          <div
            className={`relative rounded-3xl overflow-hidden min-h-[440px] transition-all duration-700 ease-out delay-100 ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
              alt="Mountain landscape"
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="font-display font-black text-3xl text-white leading-tight mb-3">
                The Right Trips.
                <br />
                Not Just More Options.
              </h3>
              <p className="text-white/60 text-sm font-body leading-relaxed">
                Atlaso helps travelers compare carefully selected operators side-by-side — so every
                decision feels clearer, smarter, and more trustworthy.
              </p>
            </div>
          </div>

          {/* Right: stacked cards */}
          <div
            className={`flex flex-col gap-4 transition-all duration-700 ease-out delay-200 ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            {/* Comparison table card */}
            <div className="rounded-3xl overflow-x-auto bg-[#12122a] border border-white/10 flex-1">
              <div className="min-w-[440px]">
              {/* Header */}
              <div className="grid grid-cols-6 px-4 py-3 text-[10px] font-semibold text-white/40 font-body border-b border-white/10">
                <span>Operator</span>
                <span className="col-span-2">Price (Ranging from)</span>
                <span>Rating</span>
                <span>Meals</span>
                <span>Cancel Flex</span>
              </div>

              {/* Rows */}
              {TABLE_ROWS.map((row, i) => (
                <div
                  key={i}
                  className={`relative grid grid-cols-6 items-center px-4 py-3 border-b border-white/5 ${
                    row.best ? "bg-white/[0.06]" : ""
                  }`}
                >
                  {/* Best Match badge */}
                  {row.best && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold bg-rose-pink text-white px-2.5 py-0.5 rounded-full z-10">
                      Best Match
                    </span>
                  )}

                  {/* Operator avatar */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ background: row.bg, color: row.color, border: `1.5px solid ${row.color}30` }}
                  >
                    {row.abbr}
                  </div>

                  {/* Price */}
                  <span className="col-span-2 text-rose-pink font-semibold text-xs font-display">
                    {row.price}
                  </span>

                  {/* Rating */}
                  <span className="text-yellow-400 text-[10px] font-semibold">{row.rating}</span>

                  {/* Meals */}
                  <CheckCircle2 size={14} className="text-green-400" />

                  {/* Cancel flex */}
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
            </div>

            {/* Destination preview card */}
            <div className="relative rounded-3xl overflow-hidden h-[210px] flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80"
                alt="Spiti Valley"
                fill
                sizes="(max-width:768px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/25" />

              {/* Top row: name + rating */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                <span className="text-white font-black font-display text-sm tracking-widest uppercase">
                  Spiti Valley
                </span>
                <div className="bg-white rounded-full px-2.5 py-1 flex items-center gap-1 shadow">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-map-text">4.2</span>
                </div>
              </div>

              {/* Middle badge */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <span className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1 text-white text-[11px] font-semibold">
                  Most compared destination this month
                </span>
              </div>

              {/* Bottom stats */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-white/10 flex items-center gap-4">
                {DEST_STATS.map((stat, i) => (
                  <div key={stat} className={`flex-1 ${i > 0 ? "border-l border-white/15 pl-4" : ""}`}>
                    <p className="text-white text-[10px] font-body leading-snug">{stat}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
