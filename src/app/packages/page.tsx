import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FactBlock from "@/components/seo/FactBlock";
import PriceBlock from "@/components/ui/PriceBlock";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import ItemListSchema from "@/components/schema/ItemListSchema";
import { buildMetadata, clamp, inr } from "@/lib/seo/meta";
import { getAllSummaries } from "@/server/catalogue";
import { getPlatformInsight } from "@/server/insights";

/** Shared social preview image for pages without an entity photo of their own. */
const OG_IMAGE =
  "https://images.unsplash.com/photo-1653844573020-71f77a0ccb8c?w=1200&q=80";

/**
 * New route. There was no crawlable index of packages at all — /search is
 * parameterised and noindex, so individual package pages had no hub linking to
 * them beyond the sitemap. This is that hub, grouped by destination so the
 * internal linking is meaningful rather than one flat list of 27 links.
 */

export async function generateMetadata(): Promise<Metadata> {
  const insight = await getPlatformInsight();

  return buildMetadata({
    title: clamp(
      `All ${insight.packages} Tour Packages in India — Compare ${insight.operators} Operators`,
      70
    ),
    description: clamp(
      `Every package on Atlaso: ${insight.packages} trips from ${insight.operators} operators across ` +
        `${insight.destinations} destinations, ${inr(insight.priceFrom)}–${inr(insight.priceTo)} per person. ` +
        `Average saving ${inr(insight.averageSaving)} versus booking direct.`,
      158
    ),
    path: "/packages",
    image: OG_IMAGE,
    imageAlt: "Tour packages listed on Atlaso",
  });
}

export default async function PackagesIndexPage() {
  const [packages, insight] = await Promise.all([getAllSummaries(), getPlatformInsight()]);

  const byDestination = insight.byDestination.map((d) => ({
    insight: d,
    packages: packages
      .filter((p) => p.destinationId === d.destinationId)
      .sort((a, b) => a.price.platformPrice - b.price.platformPrice),
  }));

  return (
    <>
      <Navbar />

      <BreadcrumbSchema
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Packages", href: "/packages" },
        ]}
      />
      <ItemListSchema
        name="All tour packages on Atlaso"
        description={insight.fact}
        items={packages.map((p) => ({
          name: p.title,
          path: `/packages/${p.slug}`,
          image: p.image,
          price: p.price.platformPrice,
          description: p.summary,
        }))}
      />

      <main className="min-h-screen bg-map-white">
        <div className="bg-atlas-night">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="font-display font-black text-[28px] sm:text-[36px] text-white tracking-tight leading-tight">
              Every package on Atlaso
            </h1>
            <p className="text-white/70 text-[14.5px] font-body mt-2 max-w-2xl leading-relaxed">
              {insight.packages} trips from {insight.operators} operators across{" "}
              {insight.destinations} destinations. Prices shown are what you pay through Atlaso —
              always below the operator&apos;s own direct rate.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-9">
          <FactBlock
            heading="Packages and pricing on Atlaso"
            fact={insight.fact}
            supporting={[
              `Cheapest package: ${inr(insight.priceFrom)} per person. Most expensive: ${inr(insight.priceTo)}.`,
              `${insight.verifiedOperators} of ${insight.operators} operators are verified by Atlaso.`,
              `${insight.departures} departures are currently scheduled across all packages.`,
            ]}
          />

          {byDestination.map(({ insight: d, packages: list }) => (
            <section key={d.destinationId}>
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                <h2 className="font-display font-extrabold text-[21px] text-map-text">
                  <Link
                    href={`/destinations/${d.destinationId}`}
                    className="hover:text-compass-blue transition-colors"
                  >
                    {d.name}
                  </Link>
                </h2>
                <Link
                  href={`/compare/${d.destinationId}`}
                  className="text-[13px] font-semibold text-compass-blue hover:underline"
                >
                  Compare all {d.operatorCount} operators →
                </Link>
              </div>
              <p className="text-[13.5px] text-map-muted font-body mb-4">
                {d.packageCount} packages, {inr(d.priceFrom)}–{inr(d.priceTo)} per person.
                Average saving {inr(d.averageSaving)}.
              </p>

              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {list.map((pkg) => (
                  <li key={pkg.id}>
                    <Link
                      href={`/packages/${pkg.slug}`}
                      className="flex gap-3 h-full rounded-2xl border border-map-border bg-map-card p-3 hover:border-map-border-blue hover:shadow-card-hover transition-all"
                    >
                      <div className="relative w-[104px] h-[104px] flex-shrink-0 rounded-xl overflow-hidden">
                        <Image
                          src={pkg.image}
                          alt={pkg.title}
                          fill
                          sizes="104px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[12px] font-semibold text-map-text font-body">
                            {pkg.operatorName}
                          </span>
                          {pkg.operatorVerified && <VerifiedBadge compact />}
                        </div>
                        <h3 className="font-display font-bold text-[14.5px] text-map-text leading-snug mt-0.5">
                          {pkg.title}
                        </h3>
                        <p className="flex items-center gap-2.5 text-[11.5px] text-map-muted font-body mt-1">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={10} /> {pkg.duration}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users size={10} /> {pkg.groupSize}
                          </span>
                        </p>
                        <div className="mt-auto pt-2">
                          <PriceBlock price={pkg.price} size="inline" />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <h2 className="font-display font-extrabold text-[20px] text-map-text mb-3">
              Browse by destination
            </h2>
            <ul className="flex flex-wrap gap-2">
              {insight.byDestination.map((d) => (
                <li key={d.destinationId}>
                  <Link
                    href={`/destinations/${d.destinationId}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-compass-blue bg-compass-light rounded-full px-4 py-2 hover:bg-compass-blue hover:text-white transition-colors"
                  >
                    <MapPin size={12} />
                    {d.name} — from {inr(d.priceFrom)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
