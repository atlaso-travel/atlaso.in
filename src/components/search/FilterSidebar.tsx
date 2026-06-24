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

const DURATION_OPTIONS = ["3-4 Days", "5-7 Days", "7-9 Days"];
const INCLUSION_OPTIONS = ["Transportation", "Stay", "Accommodation", "Meals"];
const GROUP_OPTIONS = ["Solo", "Small (2-4)", "Medium (7-12)", "Large (13+)"];

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

  const hasActive =
    filters.duration.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.inclusions.length > 0 ||
    filters.groupSize.length > 0 ||
    filters.budget[1] < 30000;

  const budgetPct = (filters.budget[1] / 30000) * 100;

  return (
    <div
      className={cn(
        "bg-white",
        isMobile ? "rounded-none p-5" : "rounded-2xl border border-[#F0F0F5] p-5 shadow-sm"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#1E293B]" strokeWidth={2.5} />
          <span className="font-bold text-[#1E293B] text-[15px] font-display">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button
              onClick={clearAll}
              className="text-compass-blue text-[13px] font-semibold hover:text-compass-hover transition-colors font-body underline underline-offset-2"
            >
              Clear all
            </button>
          )}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="text-map-muted hover:text-map-text bg-transparent border-none cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F0F0F5] mb-2" />

      {/* Budget Range */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-[13px] font-bold text-[#1E293B] font-display">Budget Range</h4>
        </div>
        <div className="flex justify-between text-[12px] text-[#64748B] font-body mb-1">
          <span>₹0</span>
          <span>₹30,000+</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={30000}
            step={500}
            value={filters.budget[1]}
            onChange={(e) =>
              onChange({ ...filters, budget: [filters.budget[0], Number(e.target.value)] })
            }
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FF5A5F 0%, #FF5A5F ${budgetPct}%, #E2E8F0 ${budgetPct}%, #E2E8F0 100%)`,
              accentColor: "#FF5A5F",
            }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F0F0F5] mb-2" />

      {/* Trip Duration */}
      <div className="mb-2">
        <h4 className="text-[13px] font-bold text-[#1E293B] mb-1 font-display">Trip Duration</h4>
        <div className="flex flex-wrap gap-2">
          {/* All pill */}
          <button
            onClick={() => onChange({ ...filters, duration: [] })}
            className={cn(
              "text-[9px] px-2 py-1 rounded-full border cursor-pointer font-medium transition-all duration-150 font-body",
              filters.duration.length === 0
                ? "bg-compass-blue text-white border-compass-blue"
                : "bg-white text-[#64748B] border-[#FFBCBE] hover:border-compass-blue hover:text-compass-blue"
            )}
          >
            All
          </button>
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => onChange({ ...filters, duration: toggle(filters.duration, d) })}
              className={cn(
                "text-[9px] px-2 py-1 rounded-full border cursor-pointer font-medium transition-all duration-150 font-body",
                filters.duration.includes(d)
                  ? "bg-compass-blue text-white border-compass-blue"
                  : "bg-white text-[#64748B] border-[#FFBCBE] hover:border-compass-blue hover:text-compass-blue"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F0F0F5] mb-2" />

      {/* Group Size */}
      <div className="mb-2">
        <h4 className="text-[13px] font-bold text-[#1E293B] mb-1 font-display">Group Size</h4>
        <div className="flex flex-wrap gap-2">
          {GROUP_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => onChange({ ...filters, groupSize: toggle(filters.groupSize, g) })}
              className={cn(
                "text-[9px] px-2 py-1 rounded-full border cursor-pointer font-medium transition-all duration-150 font-body",
                filters.groupSize.includes(g)
                  ? "bg-compass-blue text-white border-compass-blue"
                  : "bg-white text-[#64748B] border-[#FFBCBE] hover:border-compass-blue hover:text-compass-blue"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F0F0F5] mb-2" />

      {/* Inclusions */}
      <div>
        <h4 className="text-[13px] font-bold text-[#1E293B] mb-1 font-display">Inclusions</h4>
        <div className="flex flex-col gap-1.5">
          {INCLUSION_OPTIONS.map((inc) => {
            const checked = filters.inclusions.includes(inc);
            return (
              <label key={inc} className="flex items-center gap-1 cursor-pointer group">
                <div
                  onClick={() => onChange({ ...filters, inclusions: toggle(filters.inclusions, inc) })}
                  className={cn(
                    "w-5 h-5 rounded-[5px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all",
                    checked
                      ? "bg-compass-blue border-compass-blue"
                      : "border-[#FFBCBE] group-hover:border-compass-blue bg-white"
                  )}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange({ ...filters, inclusions: toggle(filters.inclusions, inc) })}
                  className="sr-only"
                />
                <span className={cn(
                  "text-[10px] transition-colors font-body",
                  checked ? "text-[#1E293B] font-medium" : "text-[#64748B] group-hover:text-[#1E293B]"
                )}>
                  {inc}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
 