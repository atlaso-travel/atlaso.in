import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, Mail, Phone } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingSteps, { BOOKING_STEPS } from "@/components/booking/BookingSteps";
import { getBookingByReference } from "@/server/bookings";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Booking confirmation",
  robots: { index: false, follow: false },
};

/** Bookings live in memory until the database lands, so this must not be cached. */
export const dynamic = "force-dynamic";

const formatDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata",
  });

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const booking = await getBookingByReference(reference);
  if (!booking) notFound();

  const paid = booking.paymentStatus === "PAID";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-peach-wash">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-5">
          {/* The same stops as checkout, all behind them now. */}
          <BookingSteps current={BOOKING_STEPS.length} />

          {/* Outcome */}
          <div className="relative rounded-2xl border border-warm-line bg-map-card overflow-hidden">
            <Confetti />
            <div className="relative px-6 py-9 text-center">
              <span
                className={
                  paid
                    ? "w-14 h-14 rounded-2xl bg-summit-green flex items-center justify-center mx-auto mb-4"
                    : "w-14 h-14 rounded-2xl bg-rose-pink flex items-center justify-center mx-auto mb-4"
                }
              >
                {paid ? (
                  <Check size={26} className="text-white" strokeWidth={3} />
                ) : (
                  <Clock size={26} className="text-white" />
                )}
              </span>
              <h1 className="font-display text-[22px] font-extrabold text-map-text">
                {paid ? "Booking confirmed!" : "Payment is still processing"}
              </h1>
              <p className="text-[13.5px] text-map-muted font-body mt-1.5 max-w-md mx-auto leading-relaxed">
                {paid ? (
                  <>
                    Your <b className="text-map-text">{booking.packageTitle}</b> is all set with{" "}
                    {booking.operatorName}.
                  </>
                ) : (
                  <>
                    We are waiting on confirmation from the payment gateway. This page updates
                    once it clears — no need to pay again.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Details */}
          <section className="rounded-2xl border border-warm-line bg-map-card p-4 sm:p-5">
            <h2 className="font-display font-bold text-[15px] text-map-text mb-4">
              Booking details
            </h2>
            <dl className="rounded-xl bg-rose-light/40 border border-rose-pink/10 px-4 py-3.5 flex flex-col gap-2.5">
              <Row k="Booking ID" v={booking.reference} mono />
              <Row k="Booking date" v={formatDateTime(booking.createdAt)} />
              <Row k="Trip" v={booking.packageTitle} />
              <Row k="Operator" v={booking.operatorName} />
              <Row k="Departure" v={formatDate(booking.startDate)} />
              <Row k="Travellers" v={String(booking.travellerCount)} />
              <div className="border-t border-rose-pink/20 pt-3 mt-0.5 flex items-baseline justify-between gap-3">
                <span className="font-display font-bold text-[14.5px] text-map-text">
                  {paid ? "Total amount paid" : "Total due"}
                </span>
                <span className="price-hero text-[22px] text-rose-pink">
                  {formatPrice(booking.totalAmount)}
                </span>
              </div>
            </dl>

            {booking.customerSavings > 0 && (
              <p className="text-[12.5px] text-summit-green font-body mt-3">
                <b className="tnum font-bold">
                  You saved {formatPrice(booking.customerSavings)}
                </b>{" "}
                against {booking.operatorName}&apos;s direct price of{" "}
                {formatPrice(booking.snapshotRetailPrice * booking.travellerCount)}.
              </p>
            )}

            <h3 className="font-display font-bold text-[13.5px] text-map-text mt-5 mb-2">
              Travellers
            </h3>
            <ul className="flex flex-col gap-1">
              {booking.travellers.map((t) => (
                <li key={t.fullName} className="text-[13.5px] text-map-text font-body">
                  {t.fullName}
                  <span className="text-map-muted">
                    {" · "}
                    {t.age}
                    {t.gender ? ` · ${t.gender}` : ""}
                  </span>
                </li>
              ))}
            </ul>

            {booking.emergencyContact && (
              <p className="text-[12.5px] text-map-muted font-body mt-3">
                Emergency contact: {booking.emergencyContact.fullName}
                {booking.emergencyContact.relationship
                  ? ` (${booking.emergencyContact.relationship})`
                  : ""}{" "}
                · {booking.emergencyContact.phone}
              </p>
            )}
          </section>

          {/* What happens next */}
          <div className="rounded-2xl bg-summit-light border border-summit-green/20 px-4 py-3.5">
            <p className="font-display font-bold text-[13px] text-summit-green">Note</p>
            <p className="text-[13px] text-map-text font-body mt-1 leading-relaxed">
              A confirmation has been sent to{" "}
              <b>{booking.contactEmail}</b>. {booking.operatorName} will contact{" "}
              {booking.contactName} on {booking.contactPhone} with joining instructions, the
              packing list and pickup timings — quote {booking.reference} in any
              correspondence.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <a
              href={`mailto:support@atlaso.in?subject=Booking ${booking.reference}`}
              className="btn-outline flex items-center justify-center gap-2 text-sm py-2.5 px-6"
            >
              <Mail size={14} /> Contact support
            </a>
            <Link href="/saved" className="btn-primary text-sm px-8 sm:min-w-[180px]">
              View my trips
            </Link>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[12px] text-map-muted font-body">
            <Phone size={12} />
            Something wrong? Call us and quote {booking.reference}.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[13px] text-map-muted font-body flex-shrink-0">{k}</dt>
      <dd
        className={
          mono
            ? "font-display font-extrabold text-[14px] text-map-text tnum text-right"
            : "text-[13px] text-map-text font-body font-semibold text-right"
        }
      >
        {v}
      </dd>
    </div>
  );
}

/**
 * The celebration, drawn rather than imported: a fixed set of coloured ticks
 * placed by hand so the header has some life without shipping an animation
 * library or a raster image for six pixels of confetti.
 */
function Confetti() {
  const bits = [
    [6, 18, -18, "#FF5A5F"], [14, 52, 24, "#C9A0E8"], [23, 12, 8, "#FBBF24"],
    [31, 74, -32, "#3F7D5C"], [38, 30, 14, "#FF5A5F"], [46, 88, -12, "#C9A0E8"],
    [55, 8, 30, "#FBBF24"], [63, 62, -22, "#FF5A5F"], [71, 24, 18, "#3F7D5C"],
    [78, 92, -28, "#C9A0E8"], [86, 44, 10, "#FBBF24"], [92, 70, -16, "#FF5A5F"],
  ] as const;

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden opacity-70">
      {bits.map(([left, top, rotate, color], i) => (
        <span
          key={i}
          className="absolute w-[3px] h-[9px] rounded-full"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            background: color,
            transform: `rotate(${rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
