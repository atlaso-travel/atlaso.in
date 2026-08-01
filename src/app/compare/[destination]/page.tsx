import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FactBlock from "@/components/seo/FactBlock";
import PriceBlock from "@/components/ui/PriceBlock";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import ItemListSchema from "@/components/schema/ItemListSchema";
import { buildMetadata, clamp, inr } from "@/lib/seo/meta";
import {
  getDestinationComparison,
  listComparisonDestinations,
} from "@/server/comparePages";
import { getDestinationInsight } from "@/server/insights";

/**
 * Every operator for one destination in a single server-rendered table — the hub
 * that the head-to-head pages hang off, and the page that answers
 * "cheapest X package" queries directly.
 */

export function generateStaticParams() {
  return listComparisonDestinations().map((destination) => ({ destination }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ destination: string }>;
}): Promise<Metadata> {
  const { destination } = await params;
  const [data, insight] = await Promise.all([
    getDestinationComparison(destination),
    getDestinationInsight(destination),
  ]);
  if (!data || !insight) return {};

  return buildMetadata({
    title: clamp(
      `Compare ${insight.operatorCount} ${data.destinationName} Tour Operators — Prices from ${inr(insight.priceFrom)}`,
      70
    ),
    description: clamp(
      `${data.destinationName} packages from ${insight.operatorCount} operators compared side by side: ` +
        `${inr(insight.priceFrom)}–${inr(insight.priceTo)} per person, average saving ${inr(insight.averageSaving)} ` +
        `versus booking direct.`,
      158
    ),
    path: `/compare/${destination}`,
    image: data.heroImage,
    imageAlt: `${data.destinationName} tour operators compared`,
  });
}

export default async function DestinationComparisonPage({
  params,
}: {
  params: Promise<{ destination: string }>;
}) {
  const { destination } = await params;
  const [data, insight] = await Promise.all([
    getDestinationComparison(destination),
    getDestinationInsight(destination),
  ]);
  if (!data || !insight) notFound();

  const cheapest = data.rows[0];

  return (
    <>
      <Navbar />

      <BreadcrumbSchema
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Compare", href: "/compare" },
          { label: data.destinationName, href: `/compare/${destination}` },
        ]}
      />
      <ItemListSchema
        name={`${data.destinationName} tour operators, cheapest first`}
        description={insight.fact}
        items={data.rows.map((row) => ({
          name: `${row.operatorName} — ${row.packageTitle}`,
          path: `/packages/${row.packageSlug}`,
          image: row.image,
          price: row.price.platformPrice,
          description: row.summary,
        }))}
      />

      <main className="min-h-screen bg-map-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10 flex flex-col gap-7">
          <div>
            <nav className="text-[12.5px] text-map-muted font-body mb-3">
              <Link href="/" className="hover:text-compass-blue">Home</Link>
              <span className="mx-1.5">›</span>
              <Link href={`/destinations/${destination}`} className="hover:text-compass-blue">
                {data.destinationName}
              </Link>
            </nav>
            <h1 className="font-display font-black text-[26px] sm:text-[34px] text-map-text tracking-tight leading-tight">
              {data.destinationName} tour operators compared
            </h1>
            <p className="text-[15px] text-map-muted font-body mt-1.5">
              {insight.operatorCount} operators, {insight.packageCount} packages, cheapest first.
              Every price is what you would pay on Atlaso.
            </p>
          </div>

          <FactBlock
            heading={`${data.destinationName} prices at a glance`}
            fact={insight.fact}
            supporting={insight.supporting}
          />

          {/* Real table — the thing crawlers and RAG pipelines can actually parse. */}
          <section>
            <h2 className="font-display font-extrabold text-[20px] text-map-text mb-3">
              All {insight.operatorCount} operators
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-map-border bg-map-card">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <caption className="sr-only">
                  {data.destinationName} tour operators ranked by price, showing Atlaso price,
                  the operator&apos;s direct price, saving, trip length and rating
                </caption>
                <thead>
                  <tr className="border-b border-map-border bg-map-white">
                    <th scope="col" className="label-util px-4 py-3">Operator</th>
                    <th scope="col" className="label-util px-4 py-3">Package</th>
                    <th scope="col" className="label-util px-4 py-3 text-right">Atlaso price</th>
                    <th scope="col" className="label-util px-4 py-3 text-right">Direct price</th>
                    <th scope="col" className="label-util px-4 py-3 text-right">You save</th>
                    <th scope="col" className="label-util px-4 py-3 text-right">Days</th>
                    <th scope="col" className="label-util px-4 py-3 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr
                      key={row.operatorSlug}
                      className={`border-b border-map-border last:border-0 ${i === 0 ? "bg-summit-light/50" : ""}`}
                    >
                      <th scope="row" className="px-4 py-3 align-top">
                        <Link
                          href={`/operators/${row.operatorSlug}`}
                          className="font-display font-bold text-[13.5px] text-map-text hover:text-compass-blue"
                        >
                          {row.operatorName}
                        </Link>
                        {row.verified && (
                          <span className="block mt-1">
                            <VerifiedBadge compact />
                          </span>
                        )}
                      </th>
                      <td className="px-4 py-3 align-top">
                        <Link
                          href={`/packages/${row.packageSlug}`}
                          className="text-[13px] text-map-muted font-body hover:text-compass-blue"
                        >
                          {row.packageTitle}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <span className="tnum font-display font-extrabold text-[14px] text-map-text">
                          {inr(row.price.platformPrice)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right align-top tnum text-[13px] text-strike line-through">
                        {inr(row.price.retailPrice)}
                      </td>
                      <td className="px-4 py-3 text-right align-top tnum text-[13px] font-bold text-summit-green">
                        {inr(row.price.savings)}
                      </td>
                      <td className="px-4 py-3 text-right align-top tnum text-[13px] text-map-muted">
                        {row.durationDays}
                      </td>
                      <td className="px-4 py-3 text-right align-top tnum text-[13px] text-map-muted">
                        {row.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12.5px] text-map-muted font-body mt-2">
              Cheapest: {cheapest.operatorName} at {inr(cheapest.price.platformPrice)} per person.
            </p>
          </section>

          {/* Head-to-head links: internal linking + long-tail query coverage. */}
          {data.pairs.length > 0 && (
            <section>
              <h2 className="font-display font-extrabold text-[20px] text-map-text mb-1">
                Head-to-head comparisons
              </h2>
              <p className="text-[13.5px] text-map-muted font-body mb-3">
                Every pairing of {data.destinationName} operators, compared in detail.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.pairs.map((pair) => (
                  <li key={pair.slug}>
                    <Link
                      href={`/compare/${destination}/${pair.slug}`}
                      className="block rounded-xl border border-map-border bg-map-card px-4 py-2.5 text-[13.5px] text-map-text font-body hover:border-map-border-blue hover:text-compass-blue transition-colors"
                    >
                      {pair.a} <span className="text-map-muted">vs</span> {pair.b}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-display font-extrabold text-[20px] text-map-text mb-3">
              Book any of these
            </h2>
            <ul className="flex flex-col gap-3">
              {data.rows.map((row) => (
                <li
                  key={row.packageSlug}
                  className="flex items-center justify-between gap-4 rounded-xl border border-map-border bg-map-card px-4 py-3 flex-wrap"
                >
                  <div className="min-w-0">
                    <p className="font-display font-bold text-[14px] text-map-text">
                      {row.packageTitle}
                    </p>
                    <p className="text-[12.5px] text-map-muted font-body">{row.operatorName}</p>
                  </div>
                  <PriceBlock price={row.price} size="inline" />
                  <Link
                    href={`/packages/${row.packageSlug}`}
                    className="btn-primary text-[13px] py-2 px-4"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-[13.5px] text-map-muted font-body">
            <Link
              href={`/destinations/${destination}`}
              className="text-compass-blue font-semibold hover:underline"
            >
              Read the full {data.destinationName} guide
            </Link>{" "}
            — best time to visit, permits, and what the trip is actually like.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
