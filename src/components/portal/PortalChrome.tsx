import Link from "next/link";
import { LogOut } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import PortalNav from "./PortalNav";

/** Shared chrome for the operator portal and admin panel. */

export function PortalShell({
  title,
  subtitle,
  badge,
  nav,
  logoutAction,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  nav: { href: string; label: string; exact?: boolean }[];
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-map-white flex flex-col">
      <header className="bg-atlas-night">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Link href="/" className="text-white font-display font-extrabold text-[17px] tracking-tight">
              Atlaso
            </Link>
            <span className="text-white/40 mx-2">/</span>
            <span className="text-white/75 font-body text-[14px]">{title}</span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-[13px] font-body border border-white/20 hover:border-white/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              <LogOut size={13} /> Sign out
            </button>
          </form>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-white font-display font-black text-[22px] sm:text-[26px] tracking-tight">
              {subtitle}
            </h1>
            {badge}
          </div>
        </div>

        <PortalNav items={nav} />
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
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-map-card px-4 py-3.5 min-w-0",
        tone === "good"
          ? "border-summit-green/30"
          : tone === "warn"
          ? "border-compass-blue/35"
          : "border-map-border"
      )}
    >
      <span className="label-util block truncate">{label}</span>
      <span
        className={cn(
          "block font-display font-extrabold text-[21px] tnum mt-1 tracking-tight",
          tone === "good" ? "text-summit-green" : tone === "warn" ? "text-compass-blue" : "text-map-text"
        )}
      >
        {value}
      </span>
      {hint && (
        <span className="block text-[11.5px] text-map-muted font-body mt-0.5 leading-snug">
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
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-map-border bg-map-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-map-border flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="font-display font-bold text-[15px] text-map-text">{title}</h2>
          {description && (
            <p className="text-[12.5px] text-map-muted font-body mt-0.5">{description}</p>
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
    <p className="px-5 py-10 text-center text-[13.5px] text-map-muted font-body">
      {children}
    </p>
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
        "inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-full font-body whitespace-nowrap",
        STATUS_STYLES[status] ?? "bg-[#F1F5F9] text-map-muted"
      )}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
