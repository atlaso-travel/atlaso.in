import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import OperatorPartnerPage from "@/components/operators/OperatorPartnerPage";
import ItemListSchema from "@/components/schema/ItemListSchema";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import { buildMetadata, inr } from "@/lib/seo/meta";
import { getLiveOperators, getLivePackages } from "@/server/overrides";
import { destinationById } from "@/data/destinations";

/** Shared social preview image for pages without an entity photo of their own. */
const OG_IMAGE =
  "https://images.unsplash.com/photo-1653844573020-71f77a0ccb8c?w=1200&q=80";

/**
 * This route is the operator-acquisition landing page ("list your packages"),
 * and it keeps that URL because it may already have traction.
 *
 * The directory of listed operators is appended below it rather than given a new
 * URL. The profiles at /operators/[slug] need a crawlable hub, and inventing
 * /operators/directory to sit beside an existing /operators would split link
 * equity between two near-identical paths for no reader benefit. The tradeoff is
 * a page serving two intents; the heading hierarchy keeps them separate.
 */

export async function generateMetadata(): Promise<Metadata> {
  const operators = getLiveOperators();
  const verified = operators.filter((o) => o.verified).length;

  return buildMetadata({
    title: "Tour Operators on Atlaso — List Your Packages & Browse Verified Operators",
    description:
      `Atlaso lists ${operators.length} Indian tour operators, ${verified} of them verified. ` +
      `Browse operator profiles, ratings and packages — or list your own packages and reach ` +
      `travellers already comparing trips.`,
    path: "/operators",
    image: OG_IMAGE,
    imageAlt: "Tour operators listed on Atlaso",
  });
}

export default async function OperatorsPage() {
  const operators = getLiveOperators();
  const packages = getLivePackages().filter((p) => p.status === "ACTIVE");

  const rows = operators
    .map((operator) => {
      const own = packages.filter((p) => p.operatorId === operator.id);
      return {
        operator,
        packageCount: own.length,
        priceFrom: own.length ? Math.min(...own.map((p) => p.pricing.platformPrice)) : null,
        destinations: [
          ...new Set(own.map((p) => destinationById[p.destinationId]?.name ?? p.destinationId)),
        ],
      };
    })
    .sort(
      (a, b) =>
        Number(b.operator.verified) - Number(a.operator.verified) ||
        b.operator.rating - a.operator.rating
    );

  return (
    <>
      <BreadcrumbSchema
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Operators", href: "/operators" },
        ]}
      />
      <ItemListSchema
        name="Tour operators listed on Atlaso"
        items={rows.map((r) => ({
          name: r.operator.name,
          path: `/operators/${r.operator.slug}`,
          description: r.operator.description,
          ...(r.priceFrom != null ? { price: r.priceFrom } : {}),
        }))}
      />

      <OperatorPartnerPage />

      {/* ── Directory: the crawlable hub for operator profiles ── */}
      <section className="bg-map-white border-t border-map-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-display font-black text-[26px] sm:text-[32px] text-map-text tracking-tight">
            Operators listed on Atlaso
          </h2>
          <p className="text-[14px] text-map-muted font-body mt-2 max-w-2xl leading-relaxed">
            {operators.length} operators, {operators.filter((o) => o.verified).length} verified.
            Verification means we have checked the operator&apos;s registration, tourism licence
            and insurance documents.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-7">
            {rows.map(({ operator, packageCount, priceFrom, destinations }) => (
              <li key={operator.id}>
                <Link
                  href={`/operators/${operator.slug}`}
                  className="flex flex-col h-full rounded-2xl border border-map-border bg-map-card p-4 hover:border-map-border-blue hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-[15px] text-map-text leading-snug">
                      {operator.name}
                    </h3>
                    {operator.verified && (
                      <ShieldCheck
                        size={15}
                        className="text-summit-green flex-shrink-0 mt-0.5"
                        aria-label="Verified operator"
                      />
                    )}
                  </div>

                  <p className="flex items-center gap-1 text-[12.5px] text-map-muted font-body mt-1">
                    <Star size={12} className="fill-star text-star" />
                    <span className="tnum font-semibold text-map-text">{operator.rating}</span>
                    <span className="tnum">({operator.reviewCount})</span>
                    <span className="mx-1">·</span>
                    {operator.city}
                  </p>

                  <p className="text-[12.5px] text-map-muted font-body leading-relaxed mt-2 flex-1">
                    {operator.description}
                  </p>

                  <p className="text-[12.5px] text-map-muted font-body mt-3 pt-3 border-t border-map-border">
                    {packageCount} package{packageCount === 1 ? "" : "s"}
                    {destinations.length > 0 && ` · ${destinations.join(", ")}`}
                    {priceFrom != null && (
                      <>
                        {" · from "}
                        <span className="tnum font-bold text-map-text">{inr(priceFrom)}</span>
                      </>
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
