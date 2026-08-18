import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The stops of a booking, shown identically on the checkout screens and on the
 * confirmation page — so arriving at the confirmation reads as the end of the
 * same journey rather than a different page.
 *
 * `current` is 1-indexed; pass BOOKING_STEPS.length on the confirmation page.
 */
export const BOOKING_STEPS = [
  "Booking Summary",
  "Traveller Details",
  "Payment",
  "Confirmation",
] as const;

export default function BookingSteps({ current }: { current: number }) {
  return (
    <ol className="flex rounded-2xl border border-warm-line bg-map-card px-2 sm:px-5 py-4 shadow-card">
      {BOOKING_STEPS.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;

        return (
          <li key={label} className="relative flex-1 flex flex-col items-center min-w-0">
            {/* The rail spans centre-to-centre: half of the previous column plus
                half of this one. */}
            {i > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-[8px] left-[-50%] right-1/2 h-[2px]",
                  current > i ? "bg-summit-green" : "bg-rose-pink/20"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2",
                done
                  ? "bg-summit-green border-summit-green text-white"
                  : active
                  ? "border-rose-pink bg-white"
                  : "border-rose-pink/25 bg-white"
              )}
            >
              {done ? (
                <Check size={10} strokeWidth={3.5} />
              ) : (
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    active ? "bg-rose-pink" : "bg-rose-pink/30"
                  )}
                />
              )}
            </span>
            <span
              className={cn(
                "mt-2 text-[10.5px] sm:text-[11.5px] font-body text-center leading-tight px-1",
                done
                  ? "text-summit-green font-semibold"
                  : active
                  ? "text-map-text font-bold"
                  : "text-map-muted"
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
