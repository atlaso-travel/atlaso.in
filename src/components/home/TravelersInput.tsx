"use client";

import { useState, useRef, useCallback } from "react";
import { Users } from "lucide-react";
import FieldPopover from "./FieldPopover";

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

  /* FieldPopover owns dismissal — outside clicks, the scrim and Escape all
     route back through here. */
  const close = useCallback(() => {
    setIsOpen(false);
    setEditing(null);
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
      <FieldPopover
        open={isOpen}
        onClose={close}
        anchorRef={containerRef}
        width="272px"
        mobileWidth="anchor"
        align="end"
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b border-white/10"
          style={{ background: "linear-gradient(135deg, rgba(255,90,95,0.16) 0%, rgba(249,115,22,0.05) 100%)" }}
        >
          <div className="flex items-center gap-2">
            <Users size={13} className="text-trail-orange/70" />
            <p className="text-white font-bold text-sm font-display">Travelers</p>
          </div>
        </div>

        {/* Rows */}
        {ROWS.map(({ key, label, sub, min }) => (
          <div
            key={key}
            className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex-1">
              <p className="text-white font-semibold text-sm font-body">{label}</p>
              <p className="text-white/35 text-xs font-body">{sub}</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => update(key, -1, min)}
                disabled={counts[key] <= min}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-white/15 text-white/50 text-base hover:border-compass-blue hover:text-compass-blue hover:bg-compass-blue/10 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
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
                  className="w-8 bg-transparent text-white font-bold text-sm text-center outline-none border-b border-compass-blue [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              ) : (
                <span
                  onClick={() => startEdit(key)}
                  className="text-white font-bold text-sm w-8 text-center cursor-pointer select-none font-display"
                >
                  {counts[key]}
                </span>
              )}

              <button
                onClick={() => update(key, 1, min)}
                disabled={counts[key] >= 20}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-white/15 text-white/50 text-base hover:border-compass-blue hover:text-compass-blue hover:bg-compass-blue/10 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.03] border-t border-white/[0.06]">
          <p className="text-white/35 text-xs font-body truncate">{buildSummary(counts)}</p>
          <button
            onClick={handleDone}
            className="bg-compass-blue text-white rounded-xl px-4 py-1.5 font-semibold text-xs hover:bg-compass-hover transition-colors font-body flex-shrink-0"
          >
            Done
          </button>
        </div>
      </FieldPopover>
    </div>
  );
}
