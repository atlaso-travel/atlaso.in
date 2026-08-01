import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CancellationFlexibility } from "@/data/cancellationPolicies";

/**
 * The four attributes an Indian travel buyer actually asks about, given equal
 * structural weight instead of being scattered as grey captions.
 *
 * All four already exist in the data: operator rating + review count, bookings
 * in the last 30 days, structured cancellation flexibility, and the operator's
 * average response time. Collapses to 2x2 on a phone.
 */

export interface TrustSignals {
  rating: number;
  reviewCount: number;
  bookingsLast30d: number;
  cancellation: { label: string; flexibility: CancellationFlexibility };
  responseMinutes: number;
}

function formatResponse(minutes: number): { value: string; unit: string } {
  if (minutes < 60) return { value: String(minutes), unit: "min" };
  const hours = Math.round(minutes / 60);
  if (hours < 24) return { value: String(hours), unit: hours === 1 ? "hr" : "hrs" };
  return { value: String(Math.round(hours / 24)), unit: "days" };
}

/** Short form for the cancellation cell — the full label is on the detail page. */
function shortCancellation(label: string, flex: CancellationFlexibility): string {
  const days = label.match(/(\d+)\s*days?/i)?.[1];
  if (/no refund/i.test(label)) return "None";
  if (/free/i.test(label)) return days ? `Free · ${days}d` : "Free";
  const pct = label.match(/(\d+)%/)?.[1];
  if (pct && days) return `${pct}% · ${days}d`;
  return flex === "HIGH" ? "Flexible" : flex === "MEDIUM" ? "Partial" : "Strict";
}

function Cell({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="bg-map-card px-3 py-2.5 flex flex-col gap-0.5 min-w-0">
      <span className="label-util truncate">{k}</span>
      <span className="font-display text-[14px] font-bold text-map-text tnum flex items-center gap-1 min-w-0">
        {children}
      </span>
    </div>
  );
}

export default function TrustRow({
  signals,
  className,
}: {
  signals: TrustSignals;
  className?: string;
}) {
  const response = formatResponse(signals.responseMinutes);

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-4 gap-px bg-map-border border border-map-border rounded-xl overflow-hidden w-full",
        className
      )}
    >
      <Cell k="Rating">
        <Star size={12} className="fill-star text-star flex-shrink-0" />
        {signals.rating}
        <small className="font-body font-medium text-map-muted text-[12px]">
          · {signals.reviewCount}
        </small>
      </Cell>
      <Cell k="Booked · 30d">
        {signals.bookingsLast30d}
        <small className="font-body font-medium text-map-muted text-[12px]">people</small>
      </Cell>
      <Cell k="Cancellation">
        <span className="text-[13px] truncate">
          {shortCancellation(signals.cancellation.label, signals.cancellation.flexibility)}
        </span>
      </Cell>
      <Cell k="Replies in">
        {response.value}
        <small className="font-body font-medium text-map-muted text-[12px]">
          {response.unit}
        </small>
      </Cell>
    </div>
  );
}
