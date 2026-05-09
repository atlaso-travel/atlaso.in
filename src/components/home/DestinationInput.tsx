"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { destinations } from "@/data/destinations";

const PLACEHOLDERS = destinations.map((d) => d.name + "...");

interface DestinationInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function DestinationInput({ value, onChange }: DestinationInputProps) {
  const [placeholder, setPlaceholder] = useState("");
  const [userIsTyping, setUserIsTyping] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const destIdx = useRef(0);
  const charIdx = useRef(0);
  const isDeleting = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (userIsTyping) return;

    const tick = () => {
      const current = PLACEHOLDERS[destIdx.current];

      if (!isDeleting.current) {
        charIdx.current++;
        setPlaceholder(current.slice(0, charIdx.current));

        if (charIdx.current >= current.length) {
          timerRef.current = setTimeout(() => {
            isDeleting.current = true;
            timerRef.current = setTimeout(tick, 40);
          }, 1800);
          return;
        }
        timerRef.current = setTimeout(tick, 80);
      } else {
        charIdx.current--;
        setPlaceholder(current.slice(0, charIdx.current));

        if (charIdx.current <= 0) {
          isDeleting.current = false;
          destIdx.current = (destIdx.current + 1) % PLACEHOLDERS.length;
          timerRef.current = setTimeout(tick, 200);
          return;
        }
        timerRef.current = setTimeout(tick, 40);
      }
    };

    timerRef.current = setTimeout(tick, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userIsTyping]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setUserIsTyping(true);
    setShowDropdown(true);
  };

  const handleSelect = (name: string) => {
    onChange(name);
    setShowDropdown(false);
    setUserIsTyping(true);
  };

  const handleFocus = () => setShowDropdown(true);

  const filtered = value
    ? destinations.filter(
        (d) =>
          d.name.toLowerCase().includes(value.toLowerCase()) ||
          d.region.toLowerCase().includes(value.toLowerCase())
      )
    : destinations;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* Trigger input */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition">
        <MapPin size={18} className="text-trail-orange/70 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="text-trail-orange text-xs text-left font-semibold tracking-widest uppercase block mb-0.5 font-body">
            WHERE TO?
          </label>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full bg-transparent text-white text-left placeholder-white/35 text-base outline-none font-body"
          />
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 z-[1050] w-full sm:w-80 sm:right-auto bg-atlas-night rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
          <div className="px-4 pt-4 pb-2">
            <span className="text-white/40 text-xs font-semibold tracking-widest uppercase font-body">
              Popular Destinations
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#2A6DD9_transparent]">
            {filtered.map((dest) => (
              <button
                key={dest.id}
                onMouseDown={() => handleSelect(dest.name)}
                className="w-full px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-white/[0.08] transition-colors duration-150 border-b border-white/5 last:border-0 text-left"
              >
                <div className="relative w-12 h-10 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm font-display">{dest.name}</p>
                  <p className="text-white/50 text-xs mt-0.5 font-body">{dest.region}</p>
                </div>
                <span className="bg-compass-blue/20 text-compass-blue text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 font-body">
                  {dest.operatorCount} Operators
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
