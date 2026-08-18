"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays, CheckCircle2, Phone, Plus, ShieldCheck, Star,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { PackageDetail } from "@/server/catalogue";

/**
 * The commercial column: price, then the two ways forward — a short enquiry
 * (no payment, the path most of this traffic takes) or straight to checkout.
 *
 * The enquiry posts to the same /api/leads endpoint as the full callback form,
 * with the same honeypot field, so there is one lead path rather than two.
 */
export default function EnquiryCard({
  pkg,
  paymentsEnabled,
}: {
  pkg: PackageDetail;
  paymentsEnabled: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const nextOpen = pkg.departures.find((d) => !d.soldOut) ?? null;
  const seatsTight = nextOpen != null && nextOpen.seatsLeft <= 3;
  const rating = pkg.packageReviewCount > 0 ? pkg.packageRating : pkg.trust.rating;
  const reviewCount =
    pkg.packageReviewCount > 0 ? pkg.packageReviewCount : pkg.trust.reviewCount;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setState("sending");

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          destinationId: pkg.destinationId,
          source: "package-page",
          company: form.get("company"),
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          travelDate: form.get("travelDate"),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setState("idle");
        return;
      }
      setReference(data.reference);
      setState("done");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setState("idle");
    }
  };

  return (
    <div className="rounded-2xl border border-warm-line bg-map-card shadow-card p-5">
      {/* Price */}
      <span className="text-[12px] text-map-muted font-body">Starting from</span>
      <div className="flex items-end gap-2 flex-wrap mt-0.5">
        <span className="price-hero text-[32px] text-map-text leading-none">
          {formatPrice(pkg.price.platformPrice)}
        </span>
        {pkg.price.savings > 0 && (
          <span className="tnum text-[13px] text-strike line-through decoration-[1.5px] pb-0.5">
            {formatPrice(pkg.price.retailPrice)}
          </span>
        )}
      </div>
      <p className="text-[12px] text-map-muted font-body mt-1">per person</p>

      {pkg.price.savings > 0 && (
        <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-fern-tint px-2.5 py-1 text-fern">
          <span className="tnum text-[12.5px] font-bold">
            Save {formatPrice(pkg.price.savings)}
          </span>
          <span className="text-[11.5px] font-semibold opacity-75 tnum">
            {pkg.price.savingsPct}% below direct
          </span>
        </p>
      )}

      <div className="flex items-center gap-1.5 mt-3 text-[12.5px] font-body">
        <Star size={13} className="fill-star text-star" />
        <b className="font-display font-bold text-map-text tnum">{rating}</b>
        <span className="text-map-muted tnum">({reviewCount} reviews)</span>
      </div>

      {/* Enquiry */}
      <div className="mt-4 pt-4 border-t border-warm-line">
        {state === "done" ? (
          <div className="text-center py-3">
            <div className="w-11 h-11 rounded-full bg-fern-tint flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={22} className="text-fern" />
            </div>
            <p className="font-display font-bold text-[15px] text-map-text">
              Enquiry received
            </p>
            <p className="text-[12.5px] text-map-muted font-body mt-1 leading-relaxed">
              Someone from the team will call you within one working day.
              {reference && (
                <>
                  {" "}Reference <b className="text-map-text">{reference}</b>.
                </>
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-2.5">
            {/* Honeypot */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute w-px h-px -left-[9999px] opacity-0"
            />
            <input
              name="name"
              required
              placeholder="Your name"
              aria-label="Your name"
              className="input-field"
            />
            <input
              name="phone"
              required
              type="tel"
              inputMode="numeric"
              placeholder="Phone number"
              aria-label="Phone number"
              className="input-field"
            />
            <input
              name="email"
              required
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              className="input-field"
            />
            <label className="flex flex-col gap-1">
              <span className="text-[11.5px] text-map-muted font-body">
                Rough travel date (optional)
              </span>
              <input name="travelDate" type="date" className="input-field" />
            </label>

            {error && (
              <p role="alert" className="text-[12.5px] text-rust bg-rust-tint rounded-lg px-3 py-2 font-body">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={state === "sending"}
              className={cn("btn-primary w-full text-sm", state === "sending" && "opacity-60")}
            >
              {state === "sending" ? "Sending…" : "Send enquiry"}
            </button>
          </form>
        )}

        {/* btn-outline is not a flex container, so an icon inside it needs the
            layout stated here. */}
        <Link
          href={`/compare?ids=${pkg.id}`}
          className="btn-outline flex items-center justify-center gap-2 w-full text-sm py-2.5 mt-2.5"
        >
          <Plus size={14} /> Add to compare
        </Link>
      </div>

      {/* Departure + booking */}
      <div className="mt-4 pt-4 border-t border-warm-line flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[12.5px] text-map-muted font-body">
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
          <p className="text-[12px] font-bold text-compass-blue font-body">
            Only {nextOpen!.seatsLeft} seat{nextOpen!.seatsLeft === 1 ? "" : "s"} left
          </p>
        )}
        {nextOpen ? (
          <Link
            href={`/book/${pkg.slug}`}
            className="text-[13px] font-bold text-compass-blue hover:text-compass-hover transition-colors font-body"
          >
            Or book this trip now →
          </Link>
        ) : (
          <span className="text-[12.5px] text-map-muted font-body">
            Send an enquiry and we&apos;ll tell you when new dates open.
          </span>
        )}
        {!paymentsEnabled && (
          <p className="text-[11.5px] text-map-muted font-body leading-snug">
            Card payments are in test mode — the enquiry above reaches us either way.
          </p>
        )}
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-fern font-body mt-4">
        <ShieldCheck size={13} className="flex-shrink-0" />
        No payment now. Free enquiry.
      </p>
    </div>
  );
}

/**
 * Phone-only price bar. The sidebar scrolls away on a narrow screen and most of
 * this traffic is on a phone, so price and the callback stay pinned.
 */
export function MobilePriceBar({ pkg }: { pkg: PackageDetail }) {
  const nextOpen = pkg.departures.find((d) => !d.soldOut) ?? null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[9998] bg-map-card border-t border-warm-line shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
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
            <span className="tnum text-[11.5px] font-bold text-fern">
              Save {formatPrice(pkg.price.savings)} per person
            </span>
          )}
        </div>
        <a
          href="#enquiry"
          aria-label="Send an enquiry"
          className="w-11 h-11 rounded-xl border-2 border-compass-blue text-compass-blue flex items-center justify-center flex-shrink-0"
        >
          <Phone size={17} />
        </a>
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
  );
}
