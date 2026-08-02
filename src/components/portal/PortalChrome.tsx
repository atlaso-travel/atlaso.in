import Link from "next/link";
import { Clock, Inbox, LogOut, TrendingUp } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import PortalNav from "./PortalNav";

/** Shared chrome for the operator portal and admin panel. */

export function PortalShell({
  title,
  subtitle,
  badge,
  icon,
  nav,
  logoutAction,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  /** Sized icon element, e.g. `<ShieldCheck size={18} />`, shown in a gradient chip. */
  icon?: React.ReactNode;
  nav: { href: string; label: string; exact?: boolean }[];
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-map-white flex flex-col">
      <header className="relative overflow-hidden bg-atlas-night">
        <div className="wash-dark absolute inset-0 pointer-events-none" aria-hidden />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between gap-4">
          <div className="min-w-0 flex items-center gap-1.5">
            <Link
              href="/"
              className="text-white font-display font-extrabold text-[15px] tracking-tight hover:text-white/80 transition-colors"
            >
              Atlaso
            </Link>
            <span className="text-white/30" aria-hidden>
              /
            </span>
            <span className="text-white/60 font-body text-[13px]">{title}</span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-[12.5px] font-body border border-white/15 hover:border-white/35 hover:bg-white/5 rounded-lg px-3 py-1.5 transition-colors"
            >
              <LogOut size={12.5} /> Sign out
            </button>
          </form>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-5">
          <div className="flex items-center gap-3 flex-wrap">
            {icon && (
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-[0_8px_20px_-6px_rgba(255,90,95,0.55)]"
                style={{ backgroundImage: "var(--gradient-signature)" }}
                aria-hidden
              >
                {icon}
              </span>
            )}
            <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
              <h1 className="text-white font-display font-black text-[21px] sm:text-[25px] tracking-tight leading-none">
                {subtitle}
              </h1>
              {badge}
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/[0.06]">
          <PortalNav items={nav} />
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn";
  /** Sized icon element, e.g. `<Wallet size={12} />`. Falls back to a tone default when omitted. */
  icon?: React.ReactNode;
}) {
  const shownIcon =
    icon ?? (tone === "good" ? <TrendingUp size={12} /> : tone === "warn" ? <Clock size={12} /> : null);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-map-card px-4 py-3.5 min-w-0 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover",
        tone === "good"
          ? "border-summit-green/25 hover:border-summit-green/45"
          : tone === "warn"
          ? "border-marigold/30 hover:border-marigold/50"
          : "border-map-border hover:border-blush-tint"
      )}
    >
      {tone !== "default" && (
        <span
          className={cn(
            "absolute -right-5 -top-5 h-16 w-16 rounded-full opacity-[0.07]",
            tone === "good" ? "bg-summit-green" : "bg-marigold"
          )}
          aria-hidden
        />
      )}

      <div className="relative flex items-start justify-between gap-2">
        <span className="label-util block truncate">{label}</span>
        {shownIcon && (
          <span
            className={cn(
              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
              tone === "good"
                ? "bg-summit-light text-summit-green"
                : tone === "warn"
                ? "bg-marigold/15 text-coral-ink"
                : "bg-[#F6F1EE] text-warm-taupe"
            )}
            aria-hidden
          >
            {shownIcon}
          </span>
        )}
      </div>

      <span
        className={cn(
          "relative block font-display font-extrabold text-[21px] tnum mt-1.5 tracking-tight",
          tone === "good" ? "text-summit-green" : tone === "warn" ? "text-coral-ink" : "text-map-text"
        )}
      >
        {value}
      </span>
      {hint && (
        <span className="relative block text-[11.5px] text-map-muted font-body mt-1 leading-snug">
          {hint}
        </span>
      )}
    </div>
  );
}

export function Money({ amount }: { amount: number }) {
  return <span className="tnum">{formatPrice(amount)}</span>;
}

export function Panel({
  title,
  action,
  children,
  description,
}: {
  /** Usually a string, but accepts a node — e.g. a leading avatar next to the title. */
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-map-border bg-map-card shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-map-border bg-gradient-to-b from-[#FFFDFC] to-map-card flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="font-display font-bold text-[15px] text-map-text tracking-tight">{title}</h2>
          {description && (
            <p className="text-[12.5px] text-map-muted font-body mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-5 py-12 text-center">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F1EE] text-warm-taupe"
        aria-hidden
      >
        <Inbox size={16} />
      </span>
      <p className="text-[13.5px] text-map-muted font-body max-w-sm leading-relaxed">{children}</p>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-summit-light text-summit-green",
  VERIFIED: "bg-summit-light text-summit-green",
  PAID: "bg-summit-light text-summit-green",
  CONFIRMED: "bg-summit-light text-summit-green",
  OK: "bg-summit-light text-summit-green",
  PENDING: "bg-compass-light text-compass-blue",
  PENDING_REVIEW: "bg-compass-light text-compass-blue",
  SCHEDULED: "bg-compass-light text-compass-blue",
  UNPAID: "bg-compass-light text-compass-blue",
  PAUSED: "bg-[#F1F5F9] text-map-muted",
  DRAFT: "bg-[#F1F5F9] text-map-muted",
  SUSPENDED: "bg-rose-50 text-rose-600",
  REJECTED: "bg-rose-50 text-rose-600",
  FAILED: "bg-rose-50 text-rose-600",
  PRICING_VIOLATION: "bg-rose-50 text-rose-600",
  BELOW_MIN_MARGIN: "bg-rose-50 text-rose-600",
  ABOVE_RETAIL: "bg-rose-50 text-rose-600",
  INVERTED: "bg-rose-50 text-rose-600",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full font-body whitespace-nowrap",
        STATUS_STYLES[status] ?? "bg-[#F1F5F9] text-map-muted"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

/**
 * Margin-rule scope, not a status — a distinct component so each scope reads as
 * its own colour rather than falling through StatusPill's "unknown" grey.
 * Most-specific scope (package) reads as the "warmest" colour, global as neutral.
 */
const SCOPE_STYLES: Record<string, string> = {
  GLOBAL: "bg-[#F1F5F9] text-map-muted",
  DESTINATION: "bg-indigo-tint text-indigo-soft",
  OPERATOR: "bg-trail-light text-trail-orange",
  OPERATOR_DESTINATION: "bg-compass-light text-compass-blue",
  PACKAGE: "bg-summit-light text-summit-green",
};

export function ScopeBadge({ scope }: { scope: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full font-body whitespace-nowrap",
        SCOPE_STYLES[scope] ?? "bg-[#F1F5F9] text-map-muted"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {scope.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
