import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { formatPrice } from "@/lib/utils";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import TourSchema from "@/components/schema/TourSchema";
import FaqSchema from "@/components/schema/FaqSchema";
import RelatedDestinations from "@/components/RelatedDestinations";

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
  const n = dest.operatorCount;

  const title = `${dest.name} Tour Operators — Compare ${n} Packages from ₹${minPrice.toLocaleString("en-IN")}`;
  const description = `Compare ${n} verified ${dest.name} tour operators. Packages from ₹${minPrice.toLocaleString("en-IN")}. Compare prices, inclusions, and cancellation policy side by side on Atlaso.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/destinations/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: dest.heroImage,
          width: 1600,
          height: 900,
          alt: `${dest.name}, ${dest.region}, India`,
        },
      ],
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

  const totalReviews = destPackages.reduce((sum, p) => sum + p.operatorReviews, 0);
  const avgRating =
    destPackages.length > 0
      ? destPackages.reduce((sum, p) => sum + p.operatorRating, 0) / destPackages.length
      : 4.5;

  const topPackage = destPackages[0];
  const itinerarySteps: string[] = topPackage
    ? topPackage.itinerary.map((step: { title: string }) => step.title)
    : dest.highlights;

  const faqs = [
    {
      question: `What is the best time to visit ${dest.name}?`,
      answer: `The best time to visit ${dest.name} is ${dest.bestTime}. During this period, the weather is most favourable for sightseeing and outdoor activities.`,
    },
    {
      question: `How much does a ${dest.name} tour cost?`,
      answer: `${dest.name} tour packages on Atlaso start from ₹${minPrice.toLocaleString("en-IN")}. Prices vary depending on duration, inclusions, hotel type, and group size.`,
    },
    {
      question: `How do I reach ${dest.name}?`,
      answer: `${dest.name} is located in ${dest.region}, India. The most common routes include flight to the nearest airport followed by road transfer. Compare operators on Atlaso to find packages with transport included.`,
    },
  ];

  return (
    <>
      <Navbar />

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
        reviewCount={totalReviews || 50}
        image={dest.heroImage}
        url={`https://www.atlaso.in/destinations/${slug}`}
        itinerary={itinerarySteps}
      />
      <FaqSchema items={faqs} />

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <Image
          src={dest.heroImage}
          alt={`${dest.highlights[0] ?? dest.tagline} in ${dest.name}, ${dest.region}, India`}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-10 w-full">
          <nav aria-label="Breadcrumb" className="text-white/60 text-sm mb-3 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link>
            <span>/</span>
            <span className="text-white">{dest.name}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white font-display">
            {dest.name} Tour Operators
          </h1>
          <p className="text-white/75 mt-2 text-lg font-body">
            {dest.tagline} · {dest.region}, India
          </p>
        </div>
      </div>

      <main className="bg-map-white">
        {/* Info strip */}
        <div className="border-b border-map-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-6 text-sm">
            <span className="flex items-center gap-1.5 text-map-muted">
              <TrendingUp size={14} />
              <strong className="text-map-text">{dest.operatorCount}</strong>&nbsp;Verified Operators
            </span>
            <span className="flex items-center gap-1.5 text-map-muted">
              From&nbsp;<strong className="text-compass-blue">{formatPrice(minPrice)}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-map-muted">
              <Clock size={14} />
              {dest.avgDuration}
            </span>
            <span className="flex items-center gap-1.5 text-map-muted">
              <MapPin size={14} />
              Best time:&nbsp;<strong className="text-map-text">{dest.bestTime}</strong>
            </span>
          </div>
        </div>

        {/* Packages grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold text-map-text font-display mb-6">
            Available Packages
          </h2>
          {destPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destPackages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/packages/${pkg.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={pkg.images[0]}
                      alt={`${pkg.title} — ${dest.name} package by ${pkg.operatorName}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-map-text font-display mb-1">{pkg.title}</h3>
                    <p className="text-sm text-map-muted mb-3">
                      {pkg.operatorName} · {pkg.duration}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-compass-blue font-display">
                        {formatPrice(pkg.price)}
                      </span>
                      <span className="text-xs text-map-muted">
                        ★ {pkg.operatorRating} ({pkg.operatorReviews} reviews)
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-map-muted">
              No packages listed yet.{" "}
              <Link
                href={`/search?destination=${encodeURIComponent(dest.name)}`}
                className="text-compass-blue underline"
              >
                Search all operators for {dest.name}
              </Link>
            </p>
          )}
        </div>

        {/* FAQ */}
        <div className="border-t border-map-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="text-2xl font-bold text-map-text font-display mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6 max-w-3xl">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="font-semibold text-map-text mb-2">{faq.question}</h3>
                  <p className="text-map-muted font-body leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related destinations */}
        <RelatedDestinations related={destinations} currentSlug={slug} />
      </main>

      <Footer />
    </>
  );
}
