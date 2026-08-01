import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, MapPin, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import PriceBlock from "@/components/ui/PriceBlock";
import FactBlock from "@/components/seo/FactBlock";
import OperatorSchema from "@/components/schema/OperatorSchema";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import ItemListSchema from "@/components/schema/ItemListSchema";
import FaqSchema from "@/components/schema/FaqSchema";
import { buildMetadata, inr } from "@/lib/seo/meta";
import { getLiveOperators, getLivePackages } from "@/server/overrides";
import { destinationById } from "@/data/destinations";
import { toPublicPrice } from "@/data/pricing";

/** Public operator profile. New route — nothing linked to individual operators before. */

function loadOperator(slug: string) {
  const operator = getLiveOperators().find((o) => o.slug === slug);
  if (!operator) return null;

  const own = getLivePackages().filter(
    (p) =>
      p.operatorId === operator.id &&
      p.status === "ACTIVE" &&
      p.pricing.validationStatus !== "ABOVE_RETAIL" &&
      p.pricing.validationStatus !== "INVERTED"
  );

  const destinations = [
    ...new Set(own.map((p) => destinationById[p.destinationId]?.name ?? p.destinationId)),
  ];

  return {
    operator,
    packages: own.sort((a, b) => a.pricing.platformPrice - b.pricing.platformPrice),
    destinations,
    priceFrom: own.length ? Math.min(...own.map((p) => p.pricing.platformPrice)) : null,
    averageSaving: own.length
      ? Math.round(own.reduce((s, p) => s + p.pricing.savings, 0) / own.length)
      : 0,
  };
}

export function generateStaticParams() {
  return getLiveOperators().map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = loadOperator(slug);
  if (!data) return {};

  const { operator, packages, priceFrom, destinations } = data;

  const title = `${operator.name} — Reviews, Packages & Prices${
    destinations.length ? ` for ${destinations.slice(0, 2).join(" & ")}` : ""
  }`;

  const description =
    `${operator.name} is a tour operator based in ${operator.city}, ${operator.state}, ` +
    `operating since ${operator.foundedYear}. Rated ${operator.rating}/5 from ` +
    `${operator.reviewCount} reviews` +
    (packages.length
      ? `, with ${packages.length} package${packages.length === 1 ? "" : "s"} on Atlaso from ${inr(priceFrom!)} per person.`
      : ".");

  return buildMetadata({
    title,
    description,
    path: `/operators/${slug}`,
    image: packages[0]?.images[0],
    imageAlt: `${operator.name} tour packages`,
  });
}

export default async function OperatorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = loadOperator(slug);
  if (!data) notFound();

  const { operator, packages, destinations, priceFrom, averageSaving } = data;

  const fact =
    packages.length > 0
      ? `${operator.name} lists ${packages.length} package${packages.length === 1 ? "" : "s"} on ` +
        `Atlaso across ${destinations.length} destination${destinations.length === 1 ? "" : "s"} ` +
        `(${destinations.join(", ")}), priced from ${inr(priceFrom!)} per person — an average of ` +
        `${inr(averageSaving)} below the operator's own direct prices. They are based in ` +
        `${operator.city} and have been operating since ${operator.foundedYear}.`
      : `${operator.name} is a tour operator based in ${operator.city}, ${operator.state}, ` +
        `operating since ${operator.foundedYear}. They have no packages listed on Atlaso ` +
        `at the moment.`;

  const supporting = [
    `Rated ${operator.rating} out of 5 from ${operator.reviewCount} reviews, with ` +
      `${operator.completedTrips.toLocaleString("en-IN")} trips completed.`,
    `${operator.verified ? "Verified by Atlaso" : "Verification in progress"} — we check ` +
      `registration, tourism licence and insurance documents before marking an operator verified.`,
    `Typically replies to enquiries in ${
      operator.avgResponseMinutes < 60
        ? `${operator.avgResponseMinutes} minutes`
        : `${Math.round(operator.avgResponseMinutes / 60)} hours`
    }. Guides speak ${operator.languages.join(", ")}.`,
  ];

  const faqs = [
    {
      question: `Is ${operator.name} a verified operator?`,
      answer: operator.verified
        ? `Yes. Atlaso has checked ${operator.name}'s business registration, tourism licence and insurance documents. They are rated ${operator.rating}/5 from ${operator.reviewCount} reviews.`
        : `Not yet. ${operator.name} has submitted documents and verification is in progress. Their packages are listed and bookable, but carry an "unverified" label until checks complete.`,
    },
    ...(packages.length
      ? [
          {
            question: `How much do ${operator.name} packages cost?`,
            answer: `${operator.name} packages on Atlaso start at ${inr(priceFrom!)} per person and go up to ${inr(Math.max(...packages.map((p) => p.pricing.platformPrice)))}. On average that is ${inr(averageSaving)} less than booking the same trip directly with them.`,
          },
          {
            question: `Where does ${operator.name} run trips?`,
            answer: `${destinations.join(", ")}. You can compare their packages against other operators running the same destination on Atlaso.`,
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
          { label: "Operators", href: "/operators" },
          { label: operator.name, href: `/operators/${slug}` },
        ]}
      />
      <OperatorSchema
        name={operator.name}
        legalName={operator.legalName}
        slug={operator.slug}
        description={operator.description}
        city={operator.city}
        state={operator.state}
        foundedYear={operator.foundedYear}
        languages={operator.languages}
        rating={operator.rating}
        reviewCount={operator.reviewCount}
        verified={operator.verified}
        packageCount={packages.length}
        priceFrom={priceFrom}
        destinationNames={destinations}
      />
      {packages.length > 0 && (
        <ItemListSchema
          name={`${operator.name} packages`}
          items={packages.map((p) => ({
            name: p.title,
            path: `/packages/${p.slug}`,
            image: p.images[0],
            price: p.pricing.platformPrice,
            description: p.summary,
          }))}
        />
      )}
      <FaqSchema items={faqs} />

      <main className="min-h-screen bg-map-white">
        <div className="bg-atlas-night">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <nav className="text-[12.5px] text-white/50 font-body mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-1.5">›</span>
              <Link href="/operators" className="hover:text-white">Operators</Link>
            </nav>

            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <h1 className="font-display font-black text-[28px] sm:text-[36px] text-white tracking-tight leading-tight">
                {operator.name}
              </h1>
              {operator.verified ? (
                <VerifiedBadge />
              ) : (
                <VerifiedBadge variant="pending" />
              )}
            </div>

            <p className="text-white/70 text-[14px] font-body max-w-2xl leading-relaxed">
              {operator.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-[13px] font-body">
              <span className="inline-flex items-center gap-1 text-white/80">
                <Star size={13} className="fill-star text-star" />
                <b className="text-white tnum">{operator.rating}</b>
                <span className="text-white/50 tnum">({operator.reviewCount})</span>
              </span>
              <span className="text-white/25">•</span>
              <span className="inline-flex items-center gap-1 text-white/70">
                <MapPin size={12} /> {operator.city}, {operator.state}
              </span>
              <span className="text-white/25">•</span>
              <span className="text-white/70">Since {operator.foundedYear}</span>
              {priceFrom != null && (
                <>
                  <span className="text-white/25">•</span>
                  <span className="text-white/70">
                    From <b className="text-white tnum">{inr(priceFrom)}</b>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-7">
          <FactBlock
            heading={`About ${operator.name}`}
            fact={fact}
            supporting={supporting}
          />

          <section>
            <h2 className="font-display font-extrabold text-[20px] text-map-text mb-1">
              {operator.name} packages
            </h2>
            <p className="text-[13.5px] text-map-muted font-body mb-4">
              {packages.length
                ? `${packages.length} listed, cheapest first. Every price is below ${operator.name}'s own direct rate.`
                : "No packages listed at the moment."}
            </p>

            <ul className="flex flex-col gap-3">
              {packages.map((pkg) => (
                <li key={pkg.id}>
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-map-border bg-map-card p-4 hover:border-map-border-blue hover:shadow-card-hover transition-all"
                  >
                    <div className="relative w-full sm:w-[150px] h-[120px] sm:h-auto flex-shrink-0 rounded-xl overflow-hidden">
                      <Image
                        src={pkg.images[0]}
                        alt={pkg.title}
                        fill
                        sizes="(max-width:640px) 100vw, 150px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-[16px] text-map-text leading-snug">
                        {pkg.title}
                      </h3>
                      <p className="text-[12.5px] text-map-muted font-body mt-1 line-clamp-2">
                        {pkg.summary}
                      </p>
                      <p className="flex items-center gap-3 text-[12px] text-map-muted font-body mt-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} />
                          {destinationById[pkg.destinationId]?.name}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} /> {pkg.duration}
                        </span>
                      </p>
                    </div>
                    <div className="flex-shrink-0 sm:text-right">
                      <PriceBlock price={toPublicPrice(pkg.pricing)} size="card" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {destinations.length > 0 && (
            <section>
              <h2 className="font-display font-extrabold text-[20px] text-map-text mb-3">
                Compare {operator.name} against other operators
              </h2>
              <ul className="flex flex-wrap gap-2">
                {destinations.map((name) => {
                  const id = packages.find(
                    (p) => destinationById[p.destinationId]?.name === name
                  )?.destinationId;
                  if (!id) return null;
                  return (
                    <li key={id}>
                      <Link
                        href={`/compare/${id}`}
                        className="inline-block text-[13px] font-semibold text-compass-blue bg-compass-light rounded-full px-4 py-2 hover:bg-compass-blue hover:text-white transition-colors"
                      >
                        {name} operators compared →
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-display font-extrabold text-[20px] text-map-text mb-3">
              Common questions
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
        </div>
      </main>

      <Footer />
    </>
  );
}
