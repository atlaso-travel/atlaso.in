"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DestinationInput from "./DestinationInput";
import DatePicker from "./DatePicker";
import TravelersInput from "./TravelersInput";

const AVATAR_COLORS = ["#E91E63", "#9C27B0", "#FF5722", "#4CAF50", "#2196F3"];
const AVATAR_INITIALS = ["R", "M", "P", "A", "S"];

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

  return (
    <section className="relative z-10 w-full py-16 sm:py-24">
      {/* ── Background ── */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
          alt="Hero background – Himalayan landscape"
          fill
          sizes="100vw"
          className="object-cover object-[center_55%]"
          priority
        />
        {/* base overlay */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(100deg, rgba(5,10,25,0.85) 0%, rgba(5,10,25,0.60) 45%, rgba(5,10,25,0.15) 100%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
      </div>


      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto">
        <h1 className="sr-only">Compare Travel Operators in India — Atlaso</h1>

        {/* ── Heading ── */}
        <div
          className="animate-fade-up mb-6"
          style={{ animationDelay: "100ms", opacity: 0 }}
        >
          <p className="text-[2.6rem] md:text-[3.2rem] lg:text-[3.6rem] font-bold text-white leading-[1.15] font-display mb-1">
            Your Map to the
          </p>
          <p
            className="text-[3.2rem] md:text-[4rem] lg:text-[4.8rem] font-black leading-[1.1] font-display"
            style={{
              background: "linear-gradient(90deg, #E040C8 0%, #E91E63 40%, #FF6B6B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            RIGHT OPERATOR
          </p>
        </div>

        {/* ── Subtext ── */}
        <p
          className="animate-fade-up text-white/70 text-[1rem] md:text-[1.0625rem] font-body leading-[1.7] mb-10"
          style={{ animationDelay: "200ms", opacity: 0 }}
        >
          Discover destinations, compare verified tour operators side-by-side,
          and book trips transparently —{" "}
          <span className="text-white font-semibold">all in one place!</span>
        </p>

        {/* ── Search widget ── */}
        <div
          className="animate-fade-up mb-8 relative z-10"
          style={{ animationDelay: "300ms", opacity: 0 }}
        >
          <div className="glass-dark rounded-2xl border border-white/10" style={{ padding: "8px" }}>
            <div className="flex flex-col md:flex-row md:items-stretch gap-1.5">
              <div className="flex-1 min-w-0 md:border-r md:border-white/10 md:pr-1.5">
                <DestinationInput value={destination} onChange={setDestination} />
              </div>
              <div className="flex-1 min-w-0 md:border-r md:border-white/10 md:pr-1.5">
                <DatePicker value={dates} onChange={setDates} />
              </div>
              <div className="md:w-44 min-w-0">
                <TravelersInput value={travelers} onChange={setTravelers} />
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={handleSearch}
                  className="w-full md:w-auto h-full px-4 bg-rose-pink text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-95 whitespace-nowrap"
                >
                  <Search size={16} />
                  Compare Operators
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Social proof ── */}
        <div
          className="animate-fade-up flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 "
          style={{ animationDelay: "400ms", opacity: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {AVATAR_COLORS.map((color, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white/60 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                  style={{ background: color }}
                >
                  {AVATAR_INITIALS[i]}
                </div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-white/60 bg-rose-pink flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                +
              </div>
            </div>
            <span className="text-white/75 text-sm font-body leading-snug">
              Trusted by{" "}
              <span className="text-white font-semibold">250k+</span>{" "}
              Travellers throughout India
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 text-lg leading-none">★</span>
            <span className="text-white font-bold text-sm">4.2/5</span>
            <span className="text-white/60 text-sm font-body">
              from 14,000+ Travellers
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
