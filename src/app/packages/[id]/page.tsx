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
import ProductSchema from "@/components/schema/ProductSchema";
import FaqSchema from "@/components/schema/FaqSchema";
import FactBlock from "@/components/seo/FactBlock";
import RelatedPackages from "@/components/package/RelatedPackages";
import {
  getPackageDetail,
  getAllPackageSlugs,
  getComparisonCandidates,
} from "@/server/catalogue";
import { getPackageInsight } from "@/server/insights";
import { isPaymentsConfigured } from "@/server/razorpay";
import { buildMetadata, clamp, inr } from "@/lib/seo/meta";

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

  return buildMetadata({
    title: clamp(`${pkg.title} — ${pkg.duration} from ${inr(pkg.price.platformPrice)}`, 70),
    description: clamp(
      pkg.price.savings > 0
        ? `${pkg.summary} ${inr(pkg.price.platformPrice)} per person on Atlaso — ${inr(pkg.price.savings)} below ${pkg.operatorName}'s direct price.`
        : pkg.summary,
      158
    ),
    path: `/packages/${pkg.slug}`,
    image: pkg.images[0],
    imageAlt: `${pkg.title} — ${pkg.destinationName}`,
  });
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

  const [insight, siblings] = await Promise.all([
    getPackageInsight(pkg.id),
    getComparisonCandidates(pkg.destinationId, [pkg.id]),
  ]);

  const openDepartures = pkg.departures.filter((d) => !d.soldOut);
  const lastDeparture = pkg.departures.at(-1)?.startDate ?? null;

  const faqs = [
    {
      question: `How much does ${pkg.title} cost?`,
      answer:
        pkg.price.savings > 0
          ? `${inr(pkg.price.platformPrice)} per person through Atlaso. ${pkg.operatorName} sells the same trip directly for ${inr(pkg.price.retailPrice)}, so you save ${inr(pkg.price.savings)} — ${pkg.price.savingsPct}%.`
          : `${inr(pkg.price.platformPrice)} per person.`,
    },
    {
      question: `What is included in ${pkg.title}?`,
      answer: `${pkg.inclusions.slice(0, 6).join("; ")}.${
        pkg.exclusions.length ? ` Not included: ${pkg.exclusions.slice(0, 4).join("; ")}.` : ""
      }`,
    },
    {
      question: `Can I cancel ${pkg.title}?`,
      answer: `${pkg.cancellationPolicy}. ${pkg.cancellationDescription}`,
    },
    ...(openDepartures.length
      ? [
          {
            question: `When does ${pkg.title} depart?`,
            answer: `${openDepartures.length} departures currently have seats, the next on ${new Date(
              `${openDepartures[0].startDate}T00:00:00Z`
            ).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
            })}. The trip runs ${pkg.duration} starting from ${pkg.pickupPoint}.`,
          },
        ]
      : []),
  ];

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
      {/* Product + TouristTrip with a concrete Offer. TourSchema's AggregateOffer
          is right for a destination listing many operators; a single bookable
          package needs an Offer, which is what drives price display in results
          and what AI shopping features read. */}
      <ProductSchema
        name={pkg.title}
        description={pkg.summary}
        slug={pkg.slug}
        images={pkg.images}
        price={pkg.price.platformPrice}
        retailPrice={pkg.price.retailPrice}
        availability={openDepartures.length > 0 ? "InStock" : "SoldOut"}
        operatorName={pkg.operatorName}
        operatorSlug={pkg.operatorSlug}
        destinationName={destinationLabel}
        durationDays={pkg.durationDays}
        rating={pkg.packageReviewCount > 0 ? pkg.packageRating : pkg.trust.rating}
        reviewCount={pkg.packageReviewCount > 0 ? pkg.packageReviewCount : pkg.trust.reviewCount}
        itinerary={pkg.itinerary.map((d) => d.title)}
        validThrough={lastDeparture}
        reviews={pkg.reviews.map((r) => ({
          author: r.name,
          rating: r.rating,
          body: r.text,
          date: r.date,
        }))}
      />
      <FaqSchema items={faqs} />

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

            {insight && (
              <div className="mt-6">
                <FactBlock
                  heading={`${pkg.title} at a glance`}
                  fact={insight.fact}
                  supporting={insight.supporting}
                />
              </div>
            )}

            <div className="mt-7">
              <PackageTabs pkg={pkg} />
            </div>

            {/* Questions people ask, in the DOM rather than only in JSON-LD —
                an answer engine should be able to read them without parsing
                structured data. */}
            <section className="mt-8">
              <h2 className="font-display font-extrabold text-[20px] text-map-text mb-3">
                Questions about this trip
              </h2>
              <dl className="flex flex-col gap-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-xl border border-map-border bg-map-card px-4 py-3.5"
                  >
                    <dt className="font-display font-bold text-[14px] text-map-text">
                      {faq.question}
                    </dt>
                    <dd className="text-[13.5px] text-map-muted font-body leading-relaxed mt-1">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <RelatedPackages
              current={pkg}
              siblings={siblings}
              destinationId={pkg.destinationId}
              destinationName={destinationLabel}
            />
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
