import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PackageHero from "@/components/package/PackageHero";
import PackageTabs from "@/components/package/PackageTabs";
import EnquiryCard, { MobilePriceBar } from "@/components/package/EnquiryCard";
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
      <Navbar overlay />

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

      <main className="min-h-screen bg-peach-wash pb-28 lg:pb-16">
        <PackageHero pkg={pkg} />

        {/* Crumbs sit under the hero rather than above it: the hero runs to the
            top of the viewport behind the overlay navbar, so there is no room
            for a strip of grey links up there. */}
        <div className="bg-white border-b border-warm-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 text-[13px] text-map-muted font-body overflow-x-auto scrollbar-hide whitespace-nowrap">
            <Link href="/" className="hover:text-compass-blue transition-colors">Home</Link>
            <span>›</span>
            <Link href="/destinations" className="hover:text-compass-blue transition-colors">
              Destinations
            </Link>
            <span>›</span>
            <Link
              href={`/destinations/${pkg.destinationId}`}
              className="hover:text-compass-blue transition-colors"
            >
              {destinationLabel}
            </Link>
            <span>›</span>
            <span className="text-map-text font-medium">{pkg.title}</span>
          </div>
        </div>

        <PackageTabs
          pkg={pkg}
          sidebar={<EnquiryCard pkg={pkg} paymentsEnabled={paymentsEnabled} />}
          insight={
            insight ? (
              <FactBlock
                heading={`${pkg.title} at a glance`}
                fact={insight.fact}
                supporting={insight.supporting}
              />
            ) : null
          }
        />

        {/* The sibling links stay outside the tabs — every visit should see them,
            and they should not sit behind a tab a crawler has to click. The FAQs
            themselves are no longer rendered here; they still ship to search via
            the FaqSchema JSON-LD above. */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          <RelatedPackages
            current={pkg}
            siblings={siblings}
            destinationId={pkg.destinationId}
            destinationName={destinationLabel}
          />
        </div>
      </main>

      <MobilePriceBar pkg={pkg} />

      <Footer />
    </>
  );
}
