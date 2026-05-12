"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DestinationInput from "./DestinationInput";
import DatePicker from "./DatePicker";
import TravelersInput from "./TravelersInput";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

const POPULAR_TAGS = ["Spiti Valley", "Leh Ladakh", "Meghalaya", "Rishikesh", "Coorg"];

const STATS = [
  { target: 200, suffix: "+", label: "Verified Operators" },
  { target: 50, suffix: "+", label: "Destinations" },
  { target: 10000, suffix: "+", label: "Happy Travelers" },
];

export default function HeroSection() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams({
      destination: destination || "Spiti Valley",
      dates,
      people: travelers,
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    router.push(`/search?destination=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-visible">
      {/* Background layer 1: image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
          alt="Hero background – Himalayan landscape"
          fill
          sizes="100vw"
          className="object-cover object-[center_55%]"
          priority
        />
        {/* dark gradient */}
        <div className="absolute inset-0 bg-hero-gradient" />
        {/* radial blue glow */}
        <div className="absolute inset-0 bg-blue-glow" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center pt-24 pb-10 md:pb-48 px-4 w-full max-w-4xl mx-auto">
        {/* Top badge */}
        <div
          className="animate-fade-in mb-8 glass-light rounded-full px-5 py-2 inline-flex items-center gap-2.5"
          style={{ animationDelay: "0ms" }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0 bg-trail-orange" />
          <span className="text-white/80 text-sm font-medium font-body">
            India&apos;s First Travel Operator Comparison Platform
          </span>
        </div>

        {/* Main heading — semantic H1 for SEO; brand tagline rendered as visible subtitle below */}
        <h1
          className="animate-fade-up text-5xl md:text-6xl lg:text-7xl font-extrabold text-center leading-[1.05] mb-2 font-display tracking-[-1.5px] sr-only"
          style={{ animationDelay: "150ms", opacity: 0 }}
        >
          Compare Travel Operators in India
        </h1>

        {/* Brand tagline — visually prominent, semantically a subtitle */}
        <p
          aria-hidden="true"
          className="animate-fade-up text-5xl md:text-6xl lg:text-7xl font-extrabold text-center leading-[1.05] mb-4 font-display tracking-[-1.5px]"
          style={{ animationDelay: "150ms", opacity: 0 }}
        >
          <span className="text-white">Your map to</span>
          <br />
          <span className="text-blue-400">the right operator.</span>
        </p>

        {/* Subtext */}
        <p
          className="animate-fade-up text-white/65 text-lg md:text-xl max-w-xl mx-auto font-normal mb-6 font-body"
          style={{ animationDelay: "250ms", opacity: 0 }}
        >
          Stop guessing. Compare real operators, real prices and real inclusions — side by side.
        </p>

        {/* Search widget */}
        <div
          className="animate-fade-up relative z-[1050] w-full max-w-4xl"
          style={{ animationDelay: "350ms", opacity: 0 }}
        >
          <div className="glass-dark rounded-2xl p-2.5 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-stretch gap-2">
              <div className="flex-1 md:border-r md:border-white/10 md:pr-2">
                <DestinationInput value={destination} onChange={setDestination} />
              </div>
              <div className="flex-1 md:border-r md:border-white/10 md:pr-2">
                <DatePicker value={dates} onChange={setDates} />
              </div>
              <div className="md:w-48">
                <TravelersInput value={travelers} onChange={setTravelers} />
              </div>
              <div className="flex-shrink-0 md:ml-2">
                <button
                  onClick={handleSearch}
                  className="w-full md:w-auto bg-compass-blue text-white font-bold text-base p-4 rounded-full flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-105 active:scale-95 animate-pulse-blue"
                >
                  <Search size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular tags */}
        <div
          className="animate-fade-up mt-4 flex flex-wrap items-center gap-2 justify-center"
          style={{ animationDelay: "450ms", opacity: 0 }}
        >
          <span className="text-white/40 text-sm mr-1 font-body">Popular:</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="bg-white/[0.08] border border-white/10 rounded-full px-4 py-1.5 text-white/75 text-sm cursor-pointer transition-all duration-200 hover:text-white hover:border-white/30"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative mt-6 px-4 pb-8 md:absolute md:bottom-0 md:left-0 md:right-0 md:z-0 md:mt-0 md:px-6 md:pb-7">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0B1427] via-[#0E1C34] to-[#0B1427] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(42,109,217,0.18),transparent_55%)]" />
            <div className="relative grid grid-cols-3 divide-y divide-white/10 sm:divide-y-0 sm:divide-x">
              {STATS.map((stat) => (
                <div key={stat.label} className="px-4 sm:px-6 py-4 text-center">
                  <p className="font-bold  text-xl sm:text-3xl leading-none text-compass-blue font-display">
                    <AnimatedNumber target={stat.target} suffix={stat.suffix} />
                  </p>
                  <p className="text-white/60 text-xs mt-1 tracking-wide font-body">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
