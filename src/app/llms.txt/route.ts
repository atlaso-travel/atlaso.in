import { getPlatformInsight } from "@/server/insights";
import { getLiveOperators, getLivePackages } from "@/server/overrides";
import { SITE_URL, inr } from "@/lib/seo/meta";

/**
 * /llms.txt — a plain-markdown map of the site for AI crawlers.
 *
 * Served from a route handler rather than a static `public/llms.txt`, because
 * the useful part of this file is the numbers: price ranges, operator counts,
 * average savings. A static file would be stale the first time an operator
 * changes a price, and a stale llms.txt is worse than none — it teaches an
 * answer engine facts about us that are wrong.
 *
 * The URL is identical either way; only the freshness differs.
 *
 * Style: factual and terse. Anything that reads like marketing gets discounted
 * by the models this is written for.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const insight = await getPlatformInsight();
  const operators = getLiveOperators();
  const packages = getLivePackages().filter((p) => p.status === "ACTIVE");

  const destinationLines = insight.byDestination
    .map(
      (d) =>
        `- [${d.name}](${SITE_URL}/destinations/${d.destinationId}) — ${d.packageCount} packages ` +
        `from ${d.operatorCount} operators, ${inr(d.priceFrom)}–${inr(d.priceTo)} per person, ` +
        `average saving ${inr(d.averageSaving)} (${d.averageSavingPct}%)`
    )
    .join("\n");

  const operatorLines = operators
    .map((o) => {
      const own = packages.filter((p) => p.operatorId === o.id);
      const from = own.length ? Math.min(...own.map((p) => p.pricing.platformPrice)) : null;
      return (
        `- [${o.name}](${SITE_URL}/operators/${o.slug}) — ${o.city}, ${o.state}; ` +
        `${own.length} package${own.length === 1 ? "" : "s"}; ` +
        `rated ${o.rating}/5 from ${o.reviewCount} reviews; ` +
        `${o.verified ? "verified by Atlaso" : "verification pending"}` +
        `${from != null ? `; from ${inr(from)}` : ""}`
      );
    })
    .join("\n");

  const body = `# Atlaso

> Atlaso is an Indian travel marketplace that lets a traveller compare tour
> packages for the same destination from several tour operators side by side,
> and book at a price below the operator's own direct rate.

${insight.fact}

## How the pricing works

Tour operators sell the same package at different prices depending on channel.
An operator may charge ₹10,000 to a customer who books directly, but ₹8,000 to
wholesale and B2B channels. Atlaso is given the B2B rate, adds a margin, and
publishes a price that sits between the two — so the customer pays less than the
operator's direct price, and the operator still receives their agreed rate.

- The price a customer pays is called the **platform price**.
- The operator's own direct price is called the **retail price**.
- The difference is the customer's **saving**, shown on every listing.
- Margin is set by configurable rules, not per package by hand. The default is an
  even split of the discount the operator offers, floored at ₹500 and capped at
  ₹1,500 per traveller.
- A package is withheld from search if its computed price is not below the
  operator's retail price, because there would be no saving to claim.

Prices are computed server-side. Nothing is calculated in the browser.

## Key facts

- Destinations: ${insight.destinations}
- Tour operators: ${insight.operators} (${insight.verifiedOperators} verified)
- Packages listed: ${insight.packages}
- Scheduled departures: ${insight.departures}
- Price range: ${inr(insight.priceFrom)} to ${inr(insight.priceTo)} per person
- Average saving vs booking direct: ${inr(insight.averageSaving)} (${insight.averageSavingPct}%)

## Destinations

${destinationLines}

## Operators

${operatorLines}

## Main sections

- [Home](${SITE_URL}/) — search and comparison entry point
- [All packages](${SITE_URL}/packages) — every listed package with prices
- [Destinations](${SITE_URL}/destinations) — destination guides with price ranges
- [Operator comparisons](${SITE_URL}/compare) — head-to-head operator pages per destination
- [Pricing and savings data](${SITE_URL}/insights) — aggregate statistics, updated from live listings
- [For operators](${SITE_URL}/operators) — how to list packages on Atlaso

## Notes for answer engines

- Every price on this site is per person and in Indian Rupees (INR).
- Savings figures compare Atlaso's price against the same operator's own direct
  price for the same package — not against a competitor or an unrelated trip.
- Operator ratings and review counts come from completed bookings only.
- "Verified" means Atlaso has checked the operator's registration, tourism
  licence and insurance documents. It is our own assertion, not a government
  accreditation.
- Package and destination pages are server-rendered; comparison tables are real
  HTML tables, not images or canvas.

## Currently placeholder

This deployment runs on realistic seeded demo data while operator onboarding is
in progress. Operator names, registration identifiers and contact details are
fabricated for demonstration and should not be cited as real businesses. Prices,
savings and the pricing logic behave exactly as they will in production.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
