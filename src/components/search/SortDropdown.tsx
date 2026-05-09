"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption =
  | "best-match"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "duration";

const OPTIONS: { value: SortOption; label: string; sub?: string }[] = [
  { value: "best-match", label: "Best Match", sub: "Recommended" },
  { value: "price-asc", label: "Price", sub: "Low → High" },
  { value: "price-desc", label: "Price", sub: "High → Low" },
  { value: "rating", label: "Top Rated", sub: "By review score" },
  { value: "duration", label: "Duration", sub: "Shortest first" },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (val: SortOption) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = OPTIONS.find((o) => o.value === value)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative z-[1060]">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 cursor-pointer transition-all duration-150 whitespace-nowrap border",
          open
            ? "bg-compass-light border-map-border-blue"
            : "bg-white border-map-border"
        )}
      >
        <span className="text-xs text-slate-400 font-body">Sort by:</span>
        <span className="text-[13px] font-semibold text-map-text font-body">
          {current.label}
          {current.sub ? ` · ${current.sub}` : ""}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-map-muted transition-transform duration-200",
            open ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-map-border rounded-[14px] shadow-[0_8px_32px_rgba(15,23,42,0.12)] min-w-[220px] overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-3.5 pt-2.5 pb-2 border-b border-[#F1F5F9]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] font-body">
              Sort Results
            </span>
          </div>

          {/* Options */}
          <div className="p-1.5">
            {OPTIONS.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-[10px] border-none cursor-pointer text-left transition-colors duration-100",
                    active ? "bg-compass-light" : "bg-transparent hover:bg-[#F8FAFC]"
                  )}
                >
                  <div>
                    <span
                      className={cn(
                        "block text-[13px] font-body",
                        active ? "font-bold text-compass-blue" : "font-medium text-map-text"
                      )}
                    >
                      {opt.label}
                    </span>
                    {opt.sub && (
                      <span
                        className={cn(
                          "block text-[11px] font-body mt-px",
                          active ? "text-blue-400" : "text-slate-400"
                        )}
                      >
                        {opt.sub}
                      </span>
                    )}
                  </div>
                  {active && (
                    <Check size={14} className="text-compass-blue flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
