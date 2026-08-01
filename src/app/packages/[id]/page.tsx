import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, Users, Mountain, Hotel, Baby } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PackageTabs from "@/components/package/PackageTabs";
import BookingCta from "@/components/package/BookingCta";
import TrustRow from "@/components/ui/TrustRow";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import TourSchema from "@/components/schema/TourSchema";
import { getPackageDetail, getAllPackageSlugs } from "@/server/catalogue";
import { isPaymentsConfigured } from "@/server/razorpay";
import { formatPrice } from "@/lib/utils";

/**
 * Server component. Previously this page was "use client" with useParams, which
 * meant no SSR, no metadata, no JSON-LD — invisible to search — and the price was
 * assembled in the browser. Both are fixed here.
 */

export async function generateStaticParams() {
  const slugs = await getAllPackageSlugs();
  return slugs.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pkg = await getPackageDetail(id);
  if (!pkg) return {};

  const title = `${pkg.title} — ${pkg.duration} with ${pkg.operatorName}`;
  const description =
    pkg.price.savings > 0
      ? `${pkg.summary} Book through Atlaso for ${formatPrice(pkg.price.platformPrice)} per person — ${formatPrice(pkg.price.savings)} below ${pkg.operatorName}'s direct price.`
      : pkg.summary;

  return {
    title,
    description,
    alternates: { canonical: `/packages/${pkg.slug}` },
    openGraph: {
      title,
      description,
      images: [{ url: pkg.images[0], width: 1200, height: 630, alt: pkg.title }],
    },
  };
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getPackageDetail(id);
  if (!pkg) notFound();

  const paymentsEnabled = isPaymentsConfigured();
  const destinationLabel = pkg.destinationName;

  return (
    <>
      <Navbar />

      <BreadcrumbSchema
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Destinations", href: "/destinations" },
          { label: destinationLabel, href: `/destinations/${pkg.destinationId}` },
          { label: pkg.title, href: `/packages/${pkg.slug}` },
        ]}
      />
      <TourSchema
        name={pkg.title}
        description={pkg.summary}
        destination={destinationLabel}
        minPrice={pkg.price.platformPrice}
        maxPrice={pkg.price.platformPrice}
        durationDays={pkg.durationDays}
        operatorName={pkg.operatorName}
        rating={pkg.trust.rating}
        reviewCount={pkg.trust.reviewCount}
        image={pkg.images[0]}
        url={`https://www.atlaso.in/packages/${pkg.slug}`}
        itinerary={pkg.itinerary.map((d) => d.title)}
      />

      <main className="min-h-screen bg-map-white pb-28 lg:pb-16">
        {/* Breadcrumb */}
        <div className="border-b border-map-border bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 text-[13px] text-map-muted font-body overflow-x-auto scrollbar-hide whitespace-nowrap">
            <Link href="/" className="hover:text-compass-blue transition-colors">Home</Link>
            <span>›</span>
            <Link
              href={`/destinations/${pkg.destinationId}`}
              className="hover:text-compass-blue transition-colors"
            >
              {destinationLabel}
            </Link>
            <span>›</span>
            <span className="text-map-text font-medium">{pkg.operatorName}</span>
          </div>
        </div>

        {/* Gallery */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[220px] sm:h-[340px] rounded-2xl overflow-hidden">
            <div className="col-span-4 sm:col-span-2 row-span-2 relative">
              <Image
                src={pkg.images[0]}
                alt={`${pkg.title} — ${destinationLabel}`}
                fill
                sizes="(max-width:640px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            {pkg.images.slice(1, 3).map((src, i) => (
              <div key={src} className="hidden sm:block col-span-2 row-span-1 relative">
                <Image
                  src={src}
                  alt={`${pkg.title} — view ${i + 2}`}
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-8 items-start">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-display font-bold text-[14px] text-map-text">
                {pkg.operatorName}
              </span>
              {pkg.operatorVerified ? (
                <VerifiedBadge compact />
              ) : (
                <VerifiedBadge compact variant="pending" label="Unverified" />
              )}
              <span className="inline-flex items-center gap-1 text-[12.5px] text-map-muted font-body">
                <MapPin size={12} /> {destinationLabel}, {pkg.destinationRegion}
              </span>
            </div>

            <h1 className="font-display text-[24px] sm:text-[32px] font-extrabold text-map-text leading-tight tracking-tight">
              {pkg.title}
            </h1>
            <p className="text-[14px] text-map-muted font-body leading-relaxed mt-2">
              {pkg.summary}
            </p>

            {/* Quick facts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5">
              <Fact icon={Clock} label="Duration" value={pkg.duration} />
              <Fact icon={Users} label="Group size" value={pkg.groupSize} />
              <Fact icon={Mountain} label="Difficulty" value={pkg.difficulty} />
              <Fact icon={Hotel} label="Stay" value={pkg.hotelType} />
              <Fact icon={Baby} label="Minimum age" value={`${pkg.minAge} years`} />
              <Fact icon={MapPin} label="Starts / ends" value={`${pkg.pickupPoint} → ${pkg.dropPoint}`} />
            </div>

            <div className="mt-5">
              <TrustRow signals={pkg.trust} />
            </div>

            {/* Highlights */}
            {pkg.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {pkg.highlights.map((h) => (
                  <span
                    key={h}
                    className="text-[12px] font-medium text-compass-blue bg-compass-light rounded-full px-3 py-1 font-body"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-7">
              <PackageTabs pkg={pkg} />
            </div>
          </div>

          <BookingCta pkg={pkg} paymentsEnabled={paymentsEnabled} />
        </div>
      </main>

      <Footer />
    </>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-map-border bg-map-card px-3 py-2.5 min-w-0">
      <span className="label-util flex items-center gap-1.5">
        <Icon size={11} /> {label}
      </span>
      <span className="block font-display font-bold text-[13px] text-map-text mt-0.5 truncate">
        {value}
      </span>
    </div>
  );
}
