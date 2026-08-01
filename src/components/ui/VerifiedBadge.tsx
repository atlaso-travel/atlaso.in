import { ShieldCheck, Clock, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/data/operators";

/**
 * Operator verification, as a first-class element rather than a 12px green tick.
 *
 * Indigo, not green — green is reserved for savings. The in-progress state is
 * deliberately quiet: several seeded operators are unverified, and they need to
 * look incomplete without looking dangerous.
 */

type Variant = "verified" | "pending" | "flagged";

const STYLES: Record<Variant, string> = {
  verified: "bg-indigo-tint text-indigo border-transparent",
  pending: "bg-transparent text-map-muted border-map-border font-semibold",
  flagged: "bg-rust-tint text-rust border-transparent",
};

const ICONS: Record<Variant, typeof ShieldCheck> = {
  verified: ShieldCheck,
  pending: Clock,
  flagged: TriangleAlert,
};

const LABELS: Record<Variant, string> = {
  verified: "Verified operator",
  pending: "Verification in progress",
  flagged: "Pricing flagged",
};

export function variantForStatus(status: VerificationStatus): Variant {
  return status === "VERIFIED" ? "verified" : "pending";
}

export default function VerifiedBadge({
  variant = "verified",
  compact = false,
  label,
  className,
}: {
  variant?: Variant;
  /** Shorter label and tighter padding, for use inside a card header. */
  compact?: boolean;
  label?: string;
  className?: string;
}) {
  const Icon = ICONS[variant];
  const text =
    label ?? (compact && variant === "verified" ? "Verified" : LABELS[variant]);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-body font-bold whitespace-nowrap",
        compact ? "gap-1 pl-1.5 pr-2 py-0.5 text-[10.5px]" : "gap-1.5 pl-2 pr-2.5 py-1 text-[12.5px]",
        STYLES[variant],
        className
      )}
    >
      <Icon size={compact ? 11 : 13} strokeWidth={2.5} className="flex-shrink-0" />
      {text}
    </span>
  );
}
