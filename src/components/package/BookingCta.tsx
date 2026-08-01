"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Phone, ShieldCheck } from "lucide-react";
import PriceBlock from "@/components/ui/PriceBlock";
import LeadForm from "@/components/booking/LeadForm";
import { formatPrice } from "@/lib/utils";
import type { PackageDetail } from "@/server/catalogue";

/**
 * Price + the two ways forward: book now, or ask for a callback.
 *
 * Renders as a sticky sidebar card on desktop and a fixed bottom bar on mobile,
 * because most of this traffic is on a phone and the price must stay reachable
 * without scrolling back up.
 */
export default function BookingCta({
  pkg,
  paymentsEnabled,
}: {
  pkg: PackageDetail;
  paymentsEnabled: boolean;
}) {
  const [leadOpen, setLeadOpen] = useState(false);

  const nextOpen = pkg.departures.find((d) => !d.soldOut) ?? null;
  const seatsTight = nextOpen != null && nextOpen.seatsLeft <= 3;

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block sticky top-24 w-[330px] flex-shrink-0">
        <div className="rounded-2xl border border-map-border bg-map-card shadow-card p-5">
          <PriceBlock price={pkg.price} size="hero" />

          <div className="mt-4 pt-4 border-t border-map-border flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[13px] text-map-muted font-body">
              <CalendarDays size={14} className="flex-shrink-0" />
              {nextOpen ? (
                <span>
                  Next departure{" "}
                  <b className="text-map-text">
                    {new Date(`${nextOpen.startDate}T00:00:00Z`).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
                    })}
                  </b>
                </span>
              ) : (
                <span>No dates currently open</span>
              )}
            </div>
            {seatsTight && (
              <p className="text-[12.5px] font-bold text-compass-blue font-body">
                Only {nextOpen!.seatsLeft} seat{nextOpen!.seatsLeft === 1 ? "" : "s"} left
              </p>
            )}
            <div className="flex items-center gap-2 text-[13px] text-map-muted font-body">
              <ShieldCheck size={14} className="flex-shrink-0" />
              {pkg.cancellationPolicy}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {nextOpen ? (
              <Link href={`/book/${pkg.slug}`} className="btn-primary w-full text-sm">
                Book this trip
              </Link>
            ) : (
              <button disabled className="btn-primary w-full text-sm">
                Sold out
              </button>
            )}
            <button
              onClick={() => setLeadOpen(true)}
              className="btn-outline w-full text-sm py-2.5"
            >
              <Phone size={14} /> Request a callback
            </button>
          </div>

          {!paymentsEnabled && (
            <p className="text-[11.5px] text-map-muted font-body mt-3 text-center leading-snug">
              Card payments are in test mode. Use the callback option to talk to us.
            </p>
          )}

          <p className="text-[11.5px] text-map-muted font-body mt-3 text-center">
            {pkg.trust.bookingsLast30d} people booked this in the last 30 days
          </p>
        </div>
      </aside>

      {/* ── Mobile sticky bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[9998] bg-map-card border-t border-map-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="price-hero text-[20px] text-map-text">
                {formatPrice(pkg.price.platformPrice)}
              </span>
              <span className="tnum text-[12px] text-strike line-through">
                {formatPrice(pkg.price.retailPrice)}
              </span>
            </div>
            {pkg.price.savings > 0 && (
              <span className="tnum text-[11.5px] font-bold text-summit-green">
                Save {formatPrice(pkg.price.savings)} per person
              </span>
            )}
          </div>
          <button
            onClick={() => setLeadOpen(true)}
            aria-label="Request a callback"
            className="w-11 h-11 rounded-xl border-2 border-compass-blue text-compass-blue flex items-center justify-center flex-shrink-0"
          >
            <Phone size={17} />
          </button>
          {nextOpen ? (
            <Link
              href={`/book/${pkg.slug}`}
              className="btn-primary text-[14px] px-5 py-3 flex-shrink-0"
            >
              Book
            </Link>
          ) : (
            <button disabled className="btn-primary text-[14px] px-5 py-3 flex-shrink-0">
              Sold out
            </button>
          )}
        </div>
      </div>

      {/* ── Callback modal ── */}
      {leadOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/55"
            onClick={() => setLeadOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Request a callback"
            className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-map-card rounded-t-3xl sm:rounded-2xl border border-map-border p-5 sm:p-6"
          >
            <LeadForm
              packageId={pkg.id}
              packageTitle={pkg.title}
              destinationId={pkg.destinationId}
              onClose={() => setLeadOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
