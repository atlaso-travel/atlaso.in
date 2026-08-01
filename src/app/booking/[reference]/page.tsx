import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Mail, Phone } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
      <main className="min-h-screen bg-map-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="rounded-2xl border border-map-border bg-map-card overflow-hidden">
            <div className={paid ? "bg-summit-light p-6 text-center" : "bg-compass-light p-6 text-center"}>
              {paid ? (
                <>
                  <CheckCircle2 size={40} className="text-summit-green mx-auto mb-3" />
                  <h1 className="font-display text-[22px] font-extrabold text-map-text">
                    Your trip is confirmed
                  </h1>
                  <p className="text-[13.5px] text-map-muted font-body mt-1.5">
                    {booking.operatorName} has your booking. A confirmation is on its way to{" "}
                    {booking.contactEmail}.
                  </p>
                </>
              ) : (
                <>
                  <Clock size={40} className="text-compass-blue mx-auto mb-3" />
                  <h1 className="font-display text-[22px] font-extrabold text-map-text">
                    Payment is still processing
                  </h1>
                  <p className="text-[13.5px] text-map-muted font-body mt-1.5">
                    We are waiting on confirmation from the payment gateway. This page updates
                    once it clears — no need to pay again.
                  </p>
                </>
              )}
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-map-border">
                <span className="label-util">Booking reference</span>
                <span className="font-display font-extrabold text-[17px] text-map-text tnum">
                  {booking.reference}
                </span>
              </div>

              <dl className="flex flex-col gap-3 py-4">
                <Row k="Trip" v={booking.packageTitle} />
                <Row k="Operator" v={booking.operatorName} />
                <Row k="Departure" v={formatDate(booking.startDate)} />
                <Row k="Travellers" v={String(booking.travellerCount)} />
                <Row
                  k="Price per person"
                  v={formatPrice(booking.snapshotPlatformPrice)}
                />
              </dl>

              <div className="flex items-center justify-between gap-3 py-4 border-t border-map-border">
                <span className="font-display font-bold text-[15px] text-map-text">
                  {paid ? "Total paid" : "Total due"}
                </span>
                <span className="price-hero text-[26px] text-map-text">
                  {formatPrice(booking.totalAmount)}
                </span>
              </div>

              {booking.customerSavings > 0 && (
                <div className="rounded-xl bg-summit-light px-4 py-3">
                  <span className="tnum text-[14px] font-bold text-summit-green">
                    You saved {formatPrice(booking.customerSavings)}
                  </span>
                  <span className="block text-[12px] text-summit-green/85 font-body mt-0.5">
                    against {booking.operatorName}&apos;s direct price of{" "}
                    {formatPrice(booking.snapshotRetailPrice * booking.travellerCount)}
                  </span>
                </div>
              )}

              <h2 className="font-display font-bold text-[14px] text-map-text mt-6 mb-2">
                Travellers
              </h2>
              <ul className="flex flex-col gap-1">
                {booking.travellers.map((t) => (
                  <li key={t.fullName} className="text-[13.5px] text-map-text font-body">
                    {t.fullName} <span className="text-map-muted">· {t.age}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-5 border-t border-map-border flex flex-col gap-2">
                <span className="label-util">What happens next</span>
                <p className="text-[13.5px] text-map-muted font-body leading-relaxed">
                  {booking.operatorName} will contact {booking.contactName} on{" "}
                  {booking.contactPhone} with joining instructions, the packing list and
                  pickup timings. Quote {booking.reference} in any correspondence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
                <Link href="/search" className="btn-outline flex-1 text-sm py-2.5">
                  Browse more trips
                </Link>
                <a
                  href={`mailto:support@atlaso.in?subject=Booking ${booking.reference}`}
                  className="btn-primary flex-1 text-sm py-2.5"
                >
                  <Mail size={14} /> Contact support
                </a>
              </div>
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[12px] text-map-muted font-body mt-5 text-center">
            <Phone size={12} />
            Something wrong? Call us and quote {booking.reference}.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[13px] text-map-muted font-body flex-shrink-0">{k}</dt>
      <dd className="text-[13px] text-map-text font-body font-semibold text-right">{v}</dd>
    </div>
  );
}
