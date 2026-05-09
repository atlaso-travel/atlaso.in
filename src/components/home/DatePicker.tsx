"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Mo","Tu","We","Th","Fr","Sa","Su"];

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function formatShort(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const today = startOfDay(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const secondMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const handleDayClick = (date: Date) => {
    if (date < today) return;
    if (!range.start || (range.start && range.end)) {
      setRange({ start: date, end: null });
    } else {
      if (date < range.start) setRange({ start: date, end: range.start });
      else setRange({ start: range.start, end: date });
    }
  };

  const isInRange = (date: Date): boolean => {
    const s = range.start;
    const e = range.end ?? hoverDate;
    if (!s || !e) return false;
    const [lo, hi] = s <= e ? [s, e] : [e, s];
    return date > lo && date < hi;
  };

  const nightCount =
    range.start && range.end
      ? Math.round((range.end.getTime() - range.start.getTime()) / 86400000)
      : 0;

  const handleApply = () => {
    if (range.start && range.end) {
      onChange(
        `${formatShort(range.start)} – ${formatShort(range.end)} · ${nightCount} night${nightCount !== 1 ? "s" : ""}`
      );
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setRange({ start: null, end: null });
    onChange("");
  };

  const renderMonthGrid = (year: number, month: number) => {
    const totalDays = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < offset; i++) {
      cells.push(<div key={`blank-${i}`} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const isPast = date < today;
      const isToday = sameDay(date, today);
      const isStart = range.start ? sameDay(date, range.start) : false;
      const isEnd = range.end ? sameDay(date, range.end) : false;
      const inRange = isInRange(date);
      const isHoverEnd = hoverDate && !range.end && range.start ? sameDay(date, hoverDate) : false;
      const effectiveEnd = range.end ?? (hoverDate && range.start ? hoverDate : null);
      const showEnd = isEnd || isHoverEnd;

      let wrapCls = "";
      if (inRange) {
        wrapCls = "bg-compass-blue/15";
        if (isStart && effectiveEnd && range.start! < effectiveEnd) wrapCls += " rounded-l-full";
        if (showEnd && range.start) wrapCls += " rounded-r-full";
      }

      let cellCls =
        "w-full aspect-square flex items-center justify-center text-sm rounded-full select-none ";
      if (isPast) {
        cellCls += "text-white/20 cursor-not-allowed";
      } else if (isStart || showEnd) {
        cellCls += "bg-compass-blue text-white font-bold cursor-pointer";
      } else if (isToday) {
        cellCls += "text-white ring-1 ring-compass-blue cursor-pointer hover:bg-white/10 transition-colors";
      } else if (inRange) {
        cellCls += "text-compass-blue font-medium cursor-pointer rounded-none";
      } else {
        cellCls += "text-white/70 cursor-pointer hover:bg-white/10 hover:text-white transition-colors";
      }

      cells.push(
        <div key={day} className={wrapCls}>
          <div
            className={cellCls}
            onClick={() => !isPast && handleDayClick(date)}
            onMouseEnter={() => !isPast && setHoverDate(date)}
            onMouseLeave={() => setHoverDate(null)}
          >
            {day}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* Trigger */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
        onClick={() => setIsOpen((o) => !o)}
      >
        <Calendar size={18} className="text-trail-orange/70 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="text-trail-orange text-xs font-semibold text-start tracking-widest uppercase block mb-0.5 pointer-events-none font-body">
            WHEN?
          </label>
          {value ? (
            <span className="text-white font-medium text-base text-left font-body block w-full">{value}</span>
          ) : (
            <span className="text-white/35 text-base text-left font-body block w-full">Add dates</span>
          )}
        </div>
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[9998] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Popup */}
      {isOpen && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:absolute md:top-[calc(100%+12px)] md:left-1/2 md:-translate-x-1/2 md:translate-y-0 z-[9999] w-[min(640px,92vw)] max-h-[90vh] md:max-h-none bg-atlas-night rounded-2xl shadow-2xl shadow-black/60 border border-white/10 overflow-hidden flex flex-col">

          {/* Top bar */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <h3 className="text-white font-bold text-lg font-display">Select Travel Dates</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Range display */}
          <div className="flex flex-wrap gap-4 items-center p-3 bg-white/5">
            <div className="flex-1">
              <p className="text-white/40 text-xs tracking-widest font-body">FROM</p>
              <p className={`font-bold text-base font-display ${range.start ? "text-white" : "text-white/30"}`}>
                {range.start ? formatShort(range.start) : "Select date"}
              </p>
            </div>
            <span className="text-white/30 text-lg">→</span>
            <div className="flex-1">
              <p className="text-white/40 text-xs tracking-widest font-body">TO</p>
              <p className={`font-bold text-base font-display ${range.end ? "text-white" : "text-white/30"}`}>
                {range.end ? formatShort(range.end) : "Select date"}
              </p>
            </div>
            {nightCount > 0 && (
              <span className="bg-compass-blue/20 text-compass-blue text-sm px-3 py-1 rounded-full flex-shrink-0 font-body">
                {nightCount} night{nightCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Calendar area */}
          <div className="p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevMonth}
                className="text-trail-orange hover:text-white transition-colors p-1"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-white font-semibold text-sm font-display">
                {MONTHS[viewMonth]} {viewYear} – {MONTHS[secondMonth]} {secondYear}
              </span>
              <button
                onClick={nextMonth}
                className="text-trail-orange hover:text-white transition-colors p-1"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { year: viewYear, month: viewMonth },
                { year: secondYear, month: secondMonth },
              ].map(({ year, month }) => (
                <div key={`${year}-${month}`}>
                  <p className="text-white font-bold text-sm sm:text-base text-center mb-3 font-display">
                    {MONTHS[month]} {year}
                  </p>
                  <div className="grid grid-cols-7 mb-2">
                    {DAY_LABELS.map((d) => (
                      <div key={d} className="text-white/30 text-xs text-center font-medium py-1 font-body">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                    {renderMonthGrid(year, month)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between p-3 border-t border-white/10">
            <button
              onClick={handleClear}
              className="text-white/50 text-xs hover:text-white transition-colors cursor-pointer font-body"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              disabled={!range.start || !range.end}
              className="bg-compass-blue text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-compass-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-body"
            >
              Apply Dates
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
