import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DestinationTabs from "@/components/destination/DestinationTabs";
import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { formatPrice } from "@/lib/utils";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import TourSchema from "@/components/schema/TourSchema";
import FaqSchema from "@/components/schema/FaqSchema";
import FactBlock from "@/components/seo/FactBlock";
import Link from "next/link";
import { getDestinationInsight } from "@/server/insights";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = destinations.find((d) => d.id === slug);
  if (!dest) return {};

  const destPackages = packages.filter((p) => p.destinationId === slug);
  const minPrice = destPackages.length
    ? Math.min(...destPackages.map((p) => p.price))
    : dest.avgPrice;

  const title = `${dest.name} Tour Operators — Compare ${dest.operatorCount} Packages from ${formatPrice(minPrice)}`;
  const description = `Compare ${dest.operatorCount} verified ${dest.name} tour operators. Packages from ${formatPrice(minPrice)}. Compare prices, inclusions, and cancellation policy side by side on Atlaso.`;

  return {
    title,
    description,
    alternates: { canonical: `/destinations/${slug}` },
    openGraph: {
      title,
      description,
      images: [{ url: dest.heroImage, width: 1600, height: 900, alt: `${dest.name}, ${dest.region}` }],
    },
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = destinations.find((d) => d.id === slug);
  if (!dest) notFound();

  const destPackages = packages.filter((p) => p.destinationId === slug);
  const prices = destPackages.map((p) => p.price);
  const minPrice = prices.length ? Math.min(...prices) : dest.avgPrice;
  const maxPrice = prices.length ? Math.max(...prices) : dest.avgPrice;
  const durationDays = parseInt(dest.avgDuration) || 7;

  const totalReviews = destPackages.reduce((sum, p) => sum + p.operatorReviews, 0) || 124;
  const avgRating =
    destPackages.length > 0
      ? destPackages.reduce((sum, p) => sum + p.operatorRating, 0) / destPackages.length
      : 4.8;

  const insight = await getDestinationInsight(slug);
  const topPackage = destPackages[0];
  const itinerarySteps: string[] = topPackage
    ? topPackage.itinerary.map((step: { title: string }) => step.title)
    : dest.highlights;

  return (
    <>
      <Navbar />

      {/* Schema */}
      <BreadcrumbSchema
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Destinations", href: "/destinations" },
          { label: dest.name, href: `/destinations/${slug}` },
        ]}
      />
      <TourSchema
        name={`${dest.name} Tour`}
        description={dest.description}
        destination={dest.name}
        minPrice={minPrice}
        maxPrice={maxPrice}
        durationDays={durationDays}
        operatorName={topPackage?.operatorName ?? "Multiple Operators"}
        rating={parseFloat(avgRating.toFixed(1))}
        reviewCount={totalReviews}
        image={dest.heroImage}
        url={`https://www.atlaso.in/destinations/${slug}`}
        itinerary={itinerarySteps}
      />
      <FaqSchema items={dest.faqs} />

      {/* ── Hero ── */}
      <div className="relative h-[52vh] min-h-[340px] flex flex-col justify-center overflow-hidden">
        <Image
          src={dest.heroImage}
          alt={`${dest.name}, ${dest.region}`}
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 pb-8">
          <div className="flex items-center gap-1.5 text-white/70 text-sm mb-2">
            <MapPin size={13} />
            <span>{dest.region}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-2.5">
            {dest.name}
          </h1>
          <div className="flex items-center gap-3 text-white text-sm flex-wrap">
            <span className="flex items-center gap-1.5">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-white/60">({totalReviews} reviews)</span>
            </span>
            <span className="text-white/30">•</span>
            <span>{dest.tripCount} Trips</span>
            <span className="text-white/30">•</span>
            <span>{dest.operatorCount} Operators</span>
          </div>
        </div>
      </div>

      {/* Answer-shaped summary + the links into comparison and operator pages.
          Sits above the tabbed content because the tabs are a client component
          and only the active tab's text is in the initial HTML. */}
      {/* <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-4">
        {insight && (
          <FactBlock
            heading={`${dest.name} packages and prices`}
            fact={insight.fact}
            supporting={insight.supporting}
          />
        )}
        {insight && (
          <p className="text-[13.5px] text-map-muted font-body">
            <Link
              href={`/compare/${slug}`}
              className="text-compass-blue font-semibold hover:underline"
            >
              Compare all {insight.operatorCount} {dest.name} operators side by side
            </Link>
            {" · "}
            <Link href="/packages" className="text-compass-blue font-semibold hover:underline">
              Browse every package
            </Link>
            {" · "}
            <Link href="/insights" className="text-compass-blue font-semibold hover:underline">
              Pricing data by destination
            </Link>
          </p>
        )}
      </div> */}

      {/* ── Tabs + Content ── */}
      <DestinationTabs
        dest={dest}
        packages={destPackages}
        minPrice={minPrice}
        avgRating={avgRating}
        totalReviews={totalReviews}
      />

      <Footer />
    </>
  );
}
