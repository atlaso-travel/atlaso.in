import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FactBlock from "@/components/seo/FactBlock";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import FaqSchema from "@/components/schema/FaqSchema";
import { buildMetadata, clamp, inr } from "@/lib/seo/meta";
import { getPlatformInsight } from "@/server/insights";
import { getLiveMarginRules } from "@/server/overrides";

/** Shared social preview image for pages without an entity photo of their own. */
const OG_IMAGE =
  "https://images.unsplash.com/photo-1653844573020-71f77a0ccb8c?w=1200&q=80";

/**
 * Original aggregate data — the citation magnet.
 *
 * Generic advice ("10 tips for visiting Spiti") exists on ten thousand blogs and
 * gets cited by nobody. A number that only we can compute — the actual spread
 * between what operators charge directly and what the same trip costs through a
 * B2B channel — is the kind of thing both Google and answer engines quote,
 * because there is no other source for it.
 *
 * Everything is derived live and dated, so it stays quotable rather than going
 * stale as a hardcoded blog post would.
 */

export async function generateMetadata(): Promise<Metadata> {
  const insight = await getPlatformInsight();

  return buildMetadata({
    title: clamp(
      `India Tour Package Pricing Data — Average Savings by Destination`,
      70
    ),
    description: clamp(
      `Original pricing data from ${insight.packages} packages and ${insight.operators} Indian tour ` +
        `operators: average saving ${inr(insight.averageSaving)} (${insight.averageSavingPct}%) versus ` +
        `booking direct, broken down by destination.`,
      158
    ),
    path: "/insights",
    image: OG_IMAGE,
    imageAlt: "Average savings on Indian tour packages by destination",
    type: "article",
  });
}

export default async function InsightsPage() {
  const insight = await getPlatformInsight();
  const globalRule = getLiveMarginRules().find((r) => r.id === "rule-global-default");

  const faqs = [
    {
      question: "Why is a package cheaper on Atlaso than on the operator's own website?",
      answer:
        "Tour operators quote different prices to different channels. The rate they give wholesale and B2B partners is lower than the price they advertise to a walk-in customer, because a bulk channel brings them volume without marketing spend. Atlaso is given that B2B rate, adds a margin, and publishes a price between the two — so the traveller pays less than the operator's own direct price while the operator still receives their agreed rate.",
    },
    {
      question: "How much do travellers actually save?",
      answer: `Across ${insight.packages} packages currently listed, the average saving is ${inr(insight.averageSaving)} per person, or ${insight.averageSavingPct}% off the operator's direct price. Savings are largest on higher-priced trips, where the gap between retail and B2B rates is widest in absolute terms.`,
    },
    {
      question: "Does Atlaso charge travellers a booking fee?",
      answer:
        "No. The price shown is the price paid. Atlaso's margin is the difference between that price and the rate the operator charges us — it is already inside the number, not added at checkout.",
    },
    {
      question: "Is the operator paid less because I booked through Atlaso?",
      answer:
        "The operator receives exactly the B2B rate they set themselves, which they know in advance and can change at any time from their operator portal. They are not discounted retroactively and they do not pay Atlaso a commission on top.",
    },
  ];

  const maxSaving = Math.max(...insight.byDestination.map((d) => d.averageSaving));

  return (
    <>
      <Navbar />

      <BreadcrumbSchema
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Pricing data", href: "/insights" },
        ]}
      />
      <FaqSchema items={faqs} />

      <main className="min-h-screen bg-map-white">
        <div className="bg-atlas-night">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-11">
            <h1 className="font-display font-black text-[28px] sm:text-[38px] text-white tracking-tight leading-tight">
              What Indian tour packages actually cost
            </h1>
            <p className="text-white/70 text-[15px] font-body mt-3 max-w-2xl leading-relaxed">
              Operators sell the same trip at one price direct and a lower price through B2B
              channels. This page publishes the gap, measured across every package listed on
              Atlaso.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
          <FactBlock
            heading="Headline figures"
            fact={insight.fact}
            supporting={[
              `Across all listings, travellers booking through Atlaso instead of direct would pay ${inr(insight.totalPotentialSaving)} less in total.`,
              `${insight.verifiedOperators} of ${insight.operators} operators are verified, and ${insight.departures} departures are scheduled.`,
              globalRule
                ? `The default margin rule takes ${(globalRule.splitBps ?? 0) / 100}% of the discount an operator offers, with a floor of ${inr(globalRule.minMargin)} and a cap of ${inr(globalRule.flatAmount ?? 0)} per traveller.`
                : "",
            ].filter(Boolean)}
          />

          <section>
            <h2 className="font-display font-extrabold text-[21px] text-map-text mb-1">
              Average saving by destination
            </h2>
            <p className="text-[13.5px] text-map-muted font-body mb-4">
              Ranked by the average amount a traveller saves per person against the operator&apos;s
              own direct price.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-map-border bg-map-card">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <caption className="sr-only">
                  Average per-person saving on Atlaso by Indian destination, with price range,
                  operator count and package count
                </caption>
                <thead>
                  <tr className="border-b border-map-border bg-map-white">
                    <th scope="col" className="label-util px-4 py-3">Destination</th>
                    <th scope="col" className="label-util px-4 py-3 text-right">Operators</th>
                    <th scope="col" className="label-util px-4 py-3 text-right">Packages</th>
                    <th scope="col" className="label-util px-4 py-3 text-right">Price range</th>
                    <th scope="col" className="label-util px-4 py-3 text-right">Avg. saving</th>
                    <th scope="col" className="label-util px-4 py-3 text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {insight.byDestination.map((d) => (
                    <tr key={d.destinationId} className="border-b border-map-border last:border-0">
                      <th scope="row" className="px-4 py-3">
                        <Link
                          href={`/compare/${d.destinationId}`}
                          className="font-display font-bold text-[13.5px] text-map-text hover:text-compass-blue"
                        >
                          {d.name}
                        </Link>
                        <span className="block text-[11.5px] text-map-muted font-body">
                          {d.region}
                        </span>
                      </th>
                      <td className="px-4 py-3 text-right tnum text-[13px] text-map-muted">
                        {d.operatorCount}
                      </td>
                      <td className="px-4 py-3 text-right tnum text-[13px] text-map-muted">
                        {d.packageCount}
                      </td>
                      <td className="px-4 py-3 text-right tnum text-[13px] text-map-muted whitespace-nowrap">
                        {inr(d.priceFrom)} – {inr(d.priceTo)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="tnum font-display font-extrabold text-[14px] text-summit-green">
                          {inr(d.averageSaving)}
                        </span>
                        {/* Bar doubles as a visual scale without hiding the number. */}
                        <span
                          aria-hidden="true"
                          className="block h-1 rounded-full bg-summit-green/25 mt-1 ml-auto"
                          style={{ width: `${Math.round((d.averageSaving / maxSaving) * 100)}%` }}
                        />
                      </td>
                      <td className="px-4 py-3 text-right tnum text-[13px] text-map-muted">
                        {d.averageSavingPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display font-extrabold text-[21px] text-map-text mb-3">
              Destination detail
            </h2>
            <div className="flex flex-col gap-3">
              {insight.byDestination.map((d) => (
                <article
                  key={d.destinationId}
                  className="rounded-xl border border-map-border bg-map-card px-4 py-3.5"
                >
                  <h3 className="font-display font-bold text-[14.5px] text-map-text">
                    <Link
                      href={`/destinations/${d.destinationId}`}
                      className="hover:text-compass-blue transition-colors"
                    >
                      {d.name}
                    </Link>
                  </h3>
                  <p className="text-[13.5px] text-map-muted font-body leading-relaxed mt-1">
                    {d.fact}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display font-extrabold text-[21px] text-map-text mb-3">
              How the pricing works
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

          <p className="text-[12.5px] text-map-muted font-body border-t border-map-border pt-4">
            <strong className="text-map-text">Methodology.</strong> Figures are computed from every
            package currently listed and bookable on Atlaso, comparing the price a customer pays
            against the same operator&apos;s own stated direct price for the same trip. Averages are
            unweighted means across packages, not weighted by bookings. Packages whose pricing
            fails validation are excluded. Numbers change as operators update their rates.{" "}
            <Link href="/packages" className="text-compass-blue font-semibold hover:underline">
              See the underlying packages
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
