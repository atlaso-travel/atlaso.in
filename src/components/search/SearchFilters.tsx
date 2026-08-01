"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { cn, formatPrice } from "@/lib/utils";

/**
 * URL-driven filters. Every change writes to the query string and the server
 * re-queries — nothing is filtered in the browser. That means a filtered result
 * set is shareable, survives a refresh, and will keep working unchanged when the
 * query moves from src/data to Postgres.
 */

export interface FilterState {
  min: number;
  max: number;
  durations: string[];
  difficulties: string[];
  inclusions: string[];
  groupSizes: string[];
  minRating: number | null;
  month: string | null;
}

const DURATIONS = [
  { key: "1-3", label: "1–3 days" },
  { key: "4-6", label: "4–6 days" },
  { key: "7-9", label: "7–9 days" },
  { key: "10+", label: "10+ days" },
];
const DIFFICULTIES = ["Easy", "Moderate"];
const INCLUSIONS = [
  { key: "meals", label: "Meals" },
  { key: "transport", label: "Transport" },
  { key: "guide", label: "Guide" },
];
const GROUPS = [
  { key: "small", label: "Up to 8" },
  { key: "medium", label: "9–14" },
  { key: "large", label: "15+" },
];
const RATINGS = [4.5, 4.7, 4.8];

const MONTHS = [
  { key: "2026-08", label: "Aug" }, { key: "2026-09", label: "Sep" },
  { key: "2026-10", label: "Oct" }, { key: "2026-11", label: "Nov" },
  { key: "2026-12", label: "Dec" }, { key: "2027-02", label: "Feb" },
  { key: "2027-03", label: "Mar" }, { key: "2027-06", label: "Jun" },
  { key: "2027-07", label: "Jul" },
];

export default function SearchFilters({
  state,
  bounds,
  onClose,
  isMobile,
  resultCount,
}: {
  state: FilterState;
  bounds: { min: number; max: number };
  onClose?: () => void;
  isMobile?: boolean;
  resultCount: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [draftMax, setDraftMax] = useState(state.max);

  const push = useCallback(
    (mutate: (q: URLSearchParams) => void) => {
      const q = new URLSearchParams(params.toString());
      mutate(q);
      startTransition(() => {
        router.replace(`/search?${q.toString()}`, { scroll: false });
      });
    },
    [params, router]
  );

  const setCsv = (key: string, values: string[]) =>
    push((q) => (values.length ? q.set(key, values.join(",")) : q.delete(key)));

  const toggleIn = (key: string, list: string[], value: string) =>
    setCsv(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const active =
    state.durations.length + state.difficulties.length + state.inclusions.length +
    state.groupSizes.length + (state.minRating ? 1 : 0) + (state.month ? 1 : 0) +
    (state.max < bounds.max ? 1 : 0);

  const clearAll = () =>
    push((q) => {
      ["min", "max", "dur", "diff", "inc", "grp", "rating", "month"].forEach((k) => q.delete(k));
    });

  const pct = ((draftMax - bounds.min) / (bounds.max - bounds.min)) * 100;

  return (
    <div
      className={cn(
        "bg-map-card",
        isMobile ? "p-5" : "rounded-2xl border border-map-border p-5 shadow-card",
        pending && "opacity-60 transition-opacity"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-map-text" strokeWidth={2.5} />
          <span className="font-bold text-map-text text-[15px] font-display">Filters</span>
          {active > 0 && (
            <span className="bg-compass-blue text-white text-[10px] font-bold w-4.5 h-4.5 px-1.5 rounded-full flex items-center justify-center">
              {active}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {active > 0 && (
            <button
              onClick={clearAll}
              className="text-compass-blue text-[13px] font-semibold hover:text-compass-hover underline underline-offset-2 font-body"
            >
              Clear all
            </button>
          )}
          {isMobile && onClose && (
            <button onClick={onClose} aria-label="Close filters" className="text-map-muted hover:text-map-text ml-1">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <Group label="Maximum price">
        <div className="flex justify-between text-[12px] text-map-muted font-body mb-1.5 tnum">
          <span>{formatPrice(bounds.min)}</span>
          <span className="font-bold text-map-text">{formatPrice(draftMax)}</span>
        </div>
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={500}
          value={draftMax}
          aria-label="Maximum price"
          onChange={(e) => setDraftMax(Number(e.target.value))}
          onPointerUp={() =>
            push((q) => (draftMax >= bounds.max ? q.delete("max") : q.set("max", String(draftMax))))
          }
          onKeyUp={() =>
            push((q) => (draftMax >= bounds.max ? q.delete("max") : q.set("max", String(draftMax))))
          }
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right,#FF5A5F 0%,#FF5A5F ${pct}%,#E2E8F0 ${pct}%,#E2E8F0 100%)`,
          }}
        />
      </Group>

      <Group label="Departure month">
        <Pills
          options={MONTHS}
          selected={state.month ? [state.month] : []}
          onToggle={(key) => push((q) => (state.month === key ? q.delete("month") : q.set("month", key)))}
        />
      </Group>

      <Group label="Trip duration">
        <Pills
          options={DURATIONS}
          selected={state.durations}
          onToggle={(key) => toggleIn("dur", state.durations, key)}
        />
      </Group>

      <Group label="Operator rating">
        <Pills
          options={RATINGS.map((r) => ({ key: String(r), label: `${r}+` }))}
          selected={state.minRating ? [String(state.minRating)] : []}
          onToggle={(key) =>
            push((q) => (String(state.minRating) === key ? q.delete("rating") : q.set("rating", key)))
          }
        />
      </Group>

      <Group label="Group size">
        <Pills
          options={GROUPS}
          selected={state.groupSizes}
          onToggle={(key) => toggleIn("grp", state.groupSizes, key)}
        />
      </Group>

      <Group label="Difficulty">
        <Pills
          options={DIFFICULTIES.map((d) => ({ key: d, label: d }))}
          selected={state.difficulties}
          onToggle={(key) => toggleIn("diff", state.difficulties, key)}
        />
      </Group>

      <Group label="Must include" last>
        <div className="flex flex-col gap-2">
          {INCLUSIONS.map((inc) => {
            const checked = state.inclusions.includes(inc.key);
            return (
              <label key={inc.key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleIn("inc", state.inclusions, inc.key)}
                  className="sr-only peer"
                />
                <span
                  className={cn(
                    "w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-compass-blue/40",
                    checked ? "bg-compass-blue border-compass-blue" : "border-map-border group-hover:border-compass-blue bg-white"
                  )}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                      <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={cn("text-[13px] font-body", checked ? "text-map-text font-medium" : "text-map-muted")}>
                  {inc.label}
                </span>
              </label>
            );
          })}
        </div>
      </Group>

      {isMobile && onClose && (
        <button onClick={onClose} className="btn-primary w-full mt-5 text-sm">
          Show {resultCount} result{resultCount === 1 ? "" : "s"}
        </button>
      )}
    </div>
  );
}

function Group({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn("py-3", !last && "border-b border-map-border")}>
      <h4 className="text-[12.5px] font-bold text-map-text mb-2 font-display">{label}</h4>
      {children}
    </div>
  );
}

function Pills({
  options, selected, onToggle,
}: {
  options: { key: string; label: string }[];
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o.key);
        return (
          <button
            key={o.key}
            onClick={() => onToggle(o.key)}
            aria-pressed={on}
            className={cn(
              "text-[11.5px] px-2.5 py-1 rounded-full border font-medium transition-all font-body",
              on
                ? "bg-compass-blue text-white border-compass-blue"
                : "bg-white text-map-muted border-map-border hover:border-compass-blue hover:text-compass-blue"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
