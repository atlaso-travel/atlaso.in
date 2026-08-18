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
      <main className="min-h-screen bg-peach-wash">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <BookingFlow pkg={pkg} paymentsEnabled={isPaymentsConfigured()} />
        </div>
      </main>
      <Footer />
    </>
  );
}
