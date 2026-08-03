"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search } from "lucide-react";
import Image from "next/image";
import { destinations } from "@/data/destinations";
import FieldPopover from "./FieldPopover";

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

  /* FieldPopover owns dismissal — outside clicks and Escape route back here. */
  const close = useCallback(() => setShowDropdown(false), []);

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

      {/* Dropdown. No scrim here — the field behind stays live while typing. */}
      <FieldPopover
        open={showDropdown && filtered.length > 0}
        onClose={close}
        anchorRef={containerRef}
        width="320px"
        mobileWidth="anchor"
        align="start"
        scrim="never"
      >
        {/* Header */}
        <div
          className="px-4 pt-3 pb-2.5 border-b border-white/[0.07]"
          style={{ background: "linear-gradient(135deg, rgba(255,90,95,0.14) 0%, rgba(201,160,232,0.09) 100%)" }}
        >
          <div className="flex items-center gap-2">
            <Search size={11} className="text-trail-orange/60" />
            <span className="text-white/45 text-xs font-semibold tracking-widest uppercase font-body">
              Popular Destinations
            </span>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#FF5A5F_transparent]">
          {filtered.map((dest) => (
            <button
              key={dest.id}
              onMouseDown={() => handleSelect(dest.name)}
              className="w-full px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-white/[0.07] transition-colors duration-150 border-b border-white/[0.05] last:border-0 text-left group"
            >
              <div className="relative w-10 h-9 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10 group-hover:ring-compass-blue/35 transition-all duration-200">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  sizes="40px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm font-display group-hover:text-compass-blue transition-colors duration-150">
                  {dest.name}
                </p>
                <p className="text-white/40 text-xs mt-0.5 font-body">{dest.region}</p>
              </div>
              <span className="bg-white/[0.07] text-white/45 group-hover:bg-compass-blue/20 group-hover:text-compass-blue text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 font-body transition-all duration-150">
                {dest.operatorCount} ops
              </span>
            </button>
          ))}
        </div>
      </FieldPopover>
    </div>
  );
}
