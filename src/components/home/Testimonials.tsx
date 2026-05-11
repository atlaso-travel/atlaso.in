"use client";

import { Star, MapPin, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useInView } from "@/hooks/useIntersectionObserver";

type CardStyle = "A" | "B" | "C";

interface Review {
  headline: string;
  text: string;
  name: string;
  init: string;
  dest: string;
  rating: number;
  style: CardStyle;
}

const ALL_REVIEWS: Review[] = [
  {
    headline: "Finally, total clarity.",
    text: "Compared 4 operators in one page. Booked with complete confidence. Never going back to WhatsApp research.",
    name: "Rahul S", init: "RS", dest: "Spiti Valley", rating: 5, style: "A",
  },
  {
    headline: "Saved me ₹8,000.",
    text: "The comparison table showed me Summit Squad had everything Peak Pathways offered — at a way lower price. Unreal.",
    name: "Priya M", init: "PM", dest: "Leh Ladakh", rating: 5, style: "B",
  },
  {
    headline: "10 minutes. Done.",
    text: "Used Atlaso for Meghalaya. Found Nomad Tribe, compared 3 operators, booked. The root bridges trek was beyond words.",
    name: "Aditya N", init: "AN", dest: "Meghalaya", rating: 5, style: "A",
  },
  {
    headline: "No surprises. At all.",
    text: "Cancellation policy, hidden costs, what's excluded — I saw everything before paying. This is how travel should work.",
    name: "Kavya R", init: "KR", dest: "Coorg", rating: 5, style: "C",
  },
  {
    headline: "Google in 2 minutes.",
    text: "Would've taken 2 days to find this on Google. Compared 3 Ladakh operators in under 5 minutes. Atlaso is a game changer.",
    name: "Siddharth R", init: "SR", dest: "Rishikesh", rating: 5, style: "A",
  },
  {
    headline: "Verified means verified.",
    text: "The verified badge actually means something here. Our guide from Alpine Treks was professional, punctual, and incredible.",
    name: "Ananya S", init: "AS", dest: "Spiti Valley", rating: 5, style: "B",
  },
  {
    headline: "Group of 8. No stress.",
    text: "Found an operator who could handle our group size with custom pricing. Saved us countless WhatsApp headaches.",
    name: "Vikram P", init: "VP", dest: "Leh Ladakh", rating: 4, style: "A",
  },
  {
    headline: "Under ₹10k. Unbelievable.",
    text: "Atlaso showed me a budget option I'd never have found otherwise. 6 days in Spiti for under ₹10,000. Absolutely incredible.",
    name: "Sneha T", init: "ST", dest: "Spiti Valley", rating: 5, style: "C",
  },
  {
    headline: "Cancelled. Full refund.",
    text: "Medical emergency 5 days before. Because I checked cancellation policy on Atlaso before booking, I got a full refund.",
    name: "Rohan D", init: "RD", dest: "Coorg", rating: 5, style: "A",
  },
  {
    headline: "Premium at Pangong.",
    text: "Peak Pathways luxury camp at Pangong Lake — found and compared here. Waking up to that view was worth every rupee.",
    name: "Ishaan M", init: "IM", dest: "Leh Ladakh", rating: 5, style: "B",
  },
  {
    headline: "Northeast, finally easy.",
    text: "Northeast India is underrated and Atlaso's operator list proved it. Nomad Tribe was absolutely spectacular.",
    name: "Divya P", init: "DP", dest: "Meghalaya", rating: 5, style: "A",
  },
  {
    headline: "Found a hidden gem.",
    text: "Himalayan Souls gave us a genuine local homestay experience. Found them only because Atlaso listed them. Pure magic.",
    name: "Kartik B", init: "KB", dest: "Spiti Valley", rating: 4, style: "C",
  },
  {
    headline: "One row. Everything.",
    text: "Meals, transport, guide, hotel type — all in one comparison row per operator. Done in 10 minutes. Why doesn't everyone do this?",
    name: "Nisha G", init: "NG", dest: "Rishikesh", rating: 5, style: "A",
  },
  {
    headline: "Best decision of 2024.",
    text: "Zenith Expeditions 10-day Ladakh. Found and compared on Atlaso. The naturalist guide transformed the entire experience.",
    name: "Amit V", init: "AV", dest: "Leh Ladakh", rating: 5, style: "B",
  },
  {
    headline: "My family felt safe.",
    text: "Traveled with parents and kids. The detailed inclusions and operator profile gave us confidence. Zero anxiety. Perfect trip.",
    name: "Meera J", init: "MJ", dest: "Coorg", rating: 5, style: "A",
  },
  {
    headline: "Rafting. Best price.",
    text: "Bungee + rafting combo in Rishikesh at the best price I found anywhere. Trailblazers India was exactly what we needed.",
    name: "Arjun K", init: "AK", dest: "Rishikesh", rating: 5, style: "C",
  },
];


function StarRow({ rating, dark = false }: { rating: number; dark?: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={
            i < rating
              ? "fill-trail-orange text-trail-orange"
              : dark
              ? "fill-white/20 text-white/20"
              : "fill-map-border text-map-border"
          }
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const isB = review.style === "B";
  const isC = review.style === "C";

  const outerClass = isC
    ? "bg-atlas-night border-white/10"
    : isB
    ? "bg-compass-light border-map-border-blue"
    : "bg-white border-map-border";

  const headlineClass = isC
    ? "text-white"
    : isB
    ? "text-compass-blue"
    : "text-map-text";

  const bodyClass = isC
    ? "text-white/60"
    : isB
    ? "text-compass-blue/70"
    : "text-map-muted";

  const dividerClass = isC ? "border-white/10" : "border-map-border";
  const nameClass = isC ? "text-white" : "text-map-text";
  const locationClass = isC ? "text-white/50" : "text-map-muted";
  const pillClass = isC
    ? "bg-white/10 text-white"
    : "bg-compass-light text-compass-blue";

  return (
    <div
      className={`flex-shrink-0 w-[280px] sm:w-[340px] mx-3 rounded-3xl p-7 border ${outerClass} shadow-sm hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-default flex flex-col justify-between min-h-[260px]`}
    >
      {/* Top — headline + body */}
      <div>
        <h3
          className={`font-display font-bold text-xl leading-tight mb-2 ${headlineClass}`}
        >
          {review.headline}
        </h3>
        <p
          className={`text-sm font-body leading-relaxed line-clamp-3 ${bodyClass}`}
        >
          {review.text}
        </p>
      </div>

      {/* Bottom — person info + tags */}
      <div className={`border-t ${dividerClass} mt-5 pt-4`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm font-display bg-gradient-to-br from-compass-blue to-trail-orange">
            {review.init}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold text-sm font-display truncate ${nameClass}`}
            >
              {review.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin size={11} className={locationClass} />
              <span className={`text-xs font-body ${locationClass}`}>
                Traveled to {review.dest}
              </span>
            </div>
          </div>
          <StarRow rating={review.rating} dark={isC} />
        </div>

        <div className="flex items-center justify-between mt-4">
          <span
            className={`rounded-full text-[11px] px-3 py-1 font-semibold ${pillClass}`}
          >
            {review.dest}
          </span>
          <div className="flex items-center gap-1 text-summit-green text-[11px] font-medium">
            <ShieldCheck size={12} />
            Verified Traveler
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [hoverPaused, setHoverPaused] = useState(false);
  const [btnPaused, setBtnPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: sectionRef, inView } = useInView(0.1);

  const isPaused = hoverPaused || btnPaused;
  const playState = isPaused ? "paused" : "running";

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  const handleScroll = (dir: "left" | "right") => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setBtnPaused(true);
    setCurrentIndex((prev) =>
      dir === "right" ? Math.min(prev + 1, 4) : Math.max(prev - 1, 0)
    );
    pauseTimerRef.current = setTimeout(() => setBtnPaused(false), 3000);
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "right" ? 364 : -364,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-map-white py-20 overflow-visible">
      {/* Header */}
      <div
        ref={sectionRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 text-center mb-14 transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <span className="text-xs font-semibold tracking-widest uppercase text-trail-orange font-body block mb-3">
          WHAT TRAVELERS SAY
        </span>
        <h2 className="font-display font-black text-5xl text-map-text tracking-tight mb-4">
          Loved by adventurers
        </h2>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl font-black font-display text-compass-blue leading-none">
            4.9
          </span>
          <span className="text-2xl text-map-muted font-body">/5.0</span>
          <span className="text-trail-orange text-2xl">★★★★★</span>
        </div>
        <p className="text-map-muted text-sm font-body">
          Based on 2,400+ verified reviews from real travelers
        </p>
      </div>

      {/* Marquee rows */}
      <div className="relative">
        {/* Left edge fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-map-white to-transparent z-10 pointer-events-none" />
        {/* Right edge fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-map-white to-transparent z-10 pointer-events-none" />

        {/* Row 1 — scrolls left */}
        <div
          ref={scrollRef}
          className="overflow-hidden w-full"
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
        >
          <div
            className="marquee-track"
            style={{ animationPlayState: playState }}
          >
            {[...ALL_REVIEWS, ...ALL_REVIEWS].map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={() => handleScroll("left")}
          aria-label="Scroll left"
          className="w-12 h-12 rounded-2xl bg-white border border-map-border shadow-card flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-compass-blue hover:border-compass-blue hover:shadow-blue-sm group"
        >
          <ChevronLeft
            size={20}
            className="text-map-muted group-hover:text-white transition-colors"
          />
        </button>

        <div className="flex items-center gap-2 px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-6 h-2 bg-compass-blue"
                  : "w-2 h-2 bg-map-border"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => handleScroll("right")}
          aria-label="Scroll right"
          className="w-12 h-12 rounded-2xl bg-white border border-map-border shadow-card flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-compass-blue hover:border-compass-blue hover:shadow-blue-sm group"
        >
          <ChevronRight
            size={20}
            className="text-map-muted group-hover:text-white transition-colors"
          />
        </button>
      </div>
    </section>
  );
}
