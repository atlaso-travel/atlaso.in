import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingFlow from "@/components/booking/BookingFlow";
import { getPackageDetail } from "@/server/catalogue";
import { isPaymentsConfigured } from "@/server/razorpay";

export const metadata: Metadata = {
  title: "Complete your booking",
  robots: { index: false, follow: false },
};

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = await getPackageDetail(slug);
  if (!pkg) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-map-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9">
          <h1 className="font-display text-[22px] sm:text-[28px] font-extrabold text-map-text tracking-tight mb-1">
            Complete your booking
          </h1>
          <p className="text-[13.5px] text-map-muted font-body mb-6">
            You will not be charged until you confirm on the payment screen.
          </p>
          <BookingFlow pkg={pkg} paymentsEnabled={isPaymentsConfigured()} />
        </div>
      </main>
      <Footer />
    </>
  );
}
