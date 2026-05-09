"use client";

import { useState, useRef, useEffect } from "react";
import { Users } from "lucide-react";

interface Counts {
  adults: number;
  children: number;
  infants: number;
}

interface TravelersInputProps {
  value: string;
  onChange: (val: string) => void;
}

function buildSummary(counts: Counts): string {
  const parts: string[] = [];
  parts.push(`${counts.adults} Adult${counts.adults !== 1 ? "s" : ""}`);
  if (counts.children > 0)
    parts.push(`${counts.children} Child${counts.children !== 1 ? "ren" : ""}`);
  if (counts.infants > 0)
    parts.push(`${counts.infants} Infant${counts.infants !== 1 ? "s" : ""}`);
  return parts.join(" · ");
}

const ROWS: { key: keyof Counts; label: string; sub: string; min: number }[] = [
  { key: "adults", label: "Adults", sub: "Age 13+", min: 1 },
  { key: "children", label: "Children", sub: "Age 2–12", min: 0 },
  { key: "infants", label: "Infants", sub: "Under 2", min: 0 },
];

export default function TravelersInput({ value, onChange }: TravelersInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState<Counts>({ adults: 2, children: 0, infants: 0 });
  const [editing, setEditing] = useState<keyof Counts | null>(null);
  const [editVal, setEditVal] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditing(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setEditing(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const update = (key: keyof Counts, delta: number, min: number) => {
    setCounts((prev) => ({
      ...prev,
      [key]: Math.max(min, Math.min(20, prev[key] + delta)),
    }));
  };

  const startEdit = (key: keyof Counts) => {
    setEditing(key);
    setEditVal(String(counts[key]));
  };

  const commitEdit = (key: keyof Counts, min: number) => {
    const num = parseInt(editVal, 10);
    if (!isNaN(num)) {
      setCounts((prev) => ({ ...prev, [key]: Math.max(min, Math.min(20, num)) }));
    }
    setEditing(null);
  };

  const handleDone = () => {
    onChange(buildSummary(counts));
    setIsOpen(false);
  };

  const displayValue = value || buildSummary(counts);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* Trigger */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
        onClick={() => setIsOpen((o) => !o)}
      >
        <Users size={18} className="text-trail-orange/70 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="text-trail-orange text-xs font-semibold text-left tracking-widest uppercase block mb-0.5 pointer-events-none font-body">
            TRAVELERS
          </label>
          <span className="text-white text-base font-medium text-left truncate block font-body">
            {displayValue}
          </span>
        </div>
      </div>

      {/* Popup */}
      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] left-0 right-0 z-[9999] w-full md:w-[290px] md:left-auto md:right-0 bg-atlas-night/95 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] border border-white/15 overflow-hidden backdrop-blur-md">
          <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-white/[0.06] to-transparent">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-trail-orange/80" />
              <p className="text-white font-bold text-base font-display">Travelers</p>
            </div>
          </div>

          {ROWS.map(({ key, label, sub, min }) => (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex-1">
                <p className="text-white font-semibold text-sm font-body">{label}</p>
                <p className="text-white/40 text-xs font-body">{sub}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => update(key, -1, min)}
                  disabled={counts[key] <= min}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 text-white/60 text-lg hover:border-compass-blue hover:text-compass-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  –
                </button>

                {editing === key ? (
                  <input
                    type="number"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onBlur={() => commitEdit(key, min)}
                    onKeyDown={(e) => e.key === "Enter" && commitEdit(key, min)}
                    autoFocus
                    min={min}
                    max={20}
                    className="w-10 bg-transparent text-white font-bold text-base text-center outline-none border-b border-compass-blue [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                ) : (
                  <span
                    onClick={() => startEdit(key)}
                    className="text-white font-bold text-base w-8 text-center cursor-pointer select-none font-display"
                  >
                    {counts[key]}
                  </span>
                )}

                <button
                  onClick={() => update(key, 1, min)}
                  disabled={counts[key] >= 20}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 text-white/60 text-lg hover:border-compass-blue hover:text-compass-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <div className="px-5 py-3 bg-white/5">
            <p className="text-white/70 text-sm font-body">{buildSummary(counts)}</p>
          </div>

          <div className="px-5 pb-5 pt-3">
            <button
              onClick={handleDone}
              className="w-full bg-compass-blue text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-compass-hover transition-colors font-body"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
