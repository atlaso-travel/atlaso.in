"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Filters {
  budget: [number, number];
  duration: string[];
  difficulty: string[];
  inclusions: string[];
  groupSize: string[];
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const DURATION_OPTIONS = ["3-4 Days", "5-6 Days", "7-8 Days", "9+ Days"];
const DIFFICULTY_OPTIONS = ["Easy", "Moderate", "Challenging"];
const INCLUSION_OPTIONS = ["Meals", "Transport", "Guide", "Accommodation", "Insurance"];
const GROUP_OPTIONS = ["Solo", "Small (2-6)", "Medium (7-12)", "Large (13+)"];

export default function FilterSidebar({
  filters,
  onChange,
  onClose,
  isMobile,
}: FilterSidebarProps) {
  const toggle = <T extends string>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const clearAll = () =>
    onChange({ budget: [0, 30000], duration: [], difficulty: [], inclusions: [], groupSize: [] });

  return (
    <div
      className={cn(
        "bg-white p-4",
        isMobile ? "rounded-none" : "rounded-2xl border border-map-border"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={15} className="text-map-text" />
          <span className="font-bold text-map-text text-sm font-display">
            Filter Results
          </span>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="text-map-muted bg-transparent border-none cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Budget */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-map-text mb-2 uppercase tracking-[0.05em]">
          Budget Range
        </h4>
        <div className="text-[11px] text-compass-blue font-semibold text-right mb-1">
          ₹{filters.budget[0].toLocaleString("en-IN")} – ₹
          {filters.budget[1].toLocaleString("en-IN")}
        </div>
        <input
          type="range"
          min={0}
          max={30000}
          step={500}
          value={filters.budget[1]}
          onChange={(e) =>
            onChange({ ...filters, budget: [filters.budget[0], Number(e.target.value)] })
          }
          className="w-full accent-[#2A6DD9]"
        />
      </div>

      {/* Duration */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-map-text mb-2 uppercase tracking-[0.05em]">
          Trip Duration
        </h4>
        <div className="flex flex-col gap-1.5">
          {DURATION_OPTIONS.map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.duration.includes(d)}
                onChange={() =>
                  onChange({ ...filters, duration: toggle(filters.duration, d) })
                }
                className="accent-[#2A6DD9] w-3.5 h-3.5"
              />
              <span className="text-xs text-map-muted">{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-map-text mb-2 uppercase tracking-[0.05em]">
          Difficulty
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() =>
                onChange({ ...filters, difficulty: toggle(filters.difficulty, d) })
              }
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full border cursor-pointer font-medium transition-all duration-150",
                filters.difficulty.includes(d)
                  ? "bg-compass-blue text-white border-compass-blue"
                  : "bg-white text-map-muted border-map-border"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Inclusions */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-map-text mb-2 uppercase tracking-[0.05em]">
          Inclusions
        </h4>
        <div className="flex flex-col gap-1.5">
          {INCLUSION_OPTIONS.map((inc) => (
            <label key={inc} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inclusions.includes(inc)}
                onChange={() =>
                  onChange({
                    ...filters,
                    inclusions: toggle(filters.inclusions, inc),
                  })
                }
                className="accent-[#2A6DD9] w-3.5 h-3.5"
              />
              <span className="text-xs text-map-muted">{inc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Group size */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-map-text mb-2 uppercase tracking-[0.05em]">
          Group Size
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {GROUP_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() =>
                onChange({ ...filters, groupSize: toggle(filters.groupSize, g) })
              }
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full border cursor-pointer font-medium transition-all duration-150",
                filters.groupSize.includes(g)
                  ? "bg-compass-blue text-white border-compass-blue"
                  : "bg-white text-map-muted border-map-border"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={clearAll}
        className="text-trail-orange text-xs font-medium bg-transparent border-none cursor-pointer p-0"
      >
        Clear All Filters
      </button>
    </div>
  );
}
