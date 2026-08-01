/**
 * Programmatic, indexable comparison pages. SERVER ONLY.
 *
 * "Operator A vs Operator B for Spiti Valley" is both the product's core value
 * and its strongest organic query shape. The interactive /compare?ids= tool
 * cannot serve those queries: it is parameterised, noindex, and its content
 * depends on a selection the crawler never makes.
 *
 * So these are separate routes with the comparison rendered into the server HTML
 * as a real <table>. Pairs are ordered alphabetically by slug and only that
 * ordering is generated, so "a-vs-b" and "b-vs-a" cannot both exist as
 * duplicate content.
 *
 * Uniqueness matters here: a page whose only difference is two swapped names is
 * thin content. Each page therefore carries a computed verdict, a price delta,
 * an inclusion diff and a written summary derived from the two specific
 * packages — not a template with names substituted in.
 */

import { getLivePackages, getLiveOperators } from "./overrides";
import { destinationById } from "@/data/destinations";
import { cancellationPolicyById } from "@/data/cancellationPolicies";
import { toPublicPrice, type PublicPrice } from "@/data/pricing";
import { inr } from "@/lib/seo/meta";

function sellable() {
  return getLivePackages().filter(
    (p) =>
      p.status === "ACTIVE" &&
      p.pricing.validationStatus !== "ABOVE_RETAIL" &&
      p.pricing.validationStatus !== "INVERTED"
  );
}

/** Cheapest package per operator per destination — one row per operator. */
function bestPerOperator(destinationId: string) {
  const byOperator = new Map<string, ReturnType<typeof sellable>[number]>();
  for (const pkg of sellable().filter((p) => p.destinationId === destinationId)) {
    const current = byOperator.get(pkg.operatorId);
    if (!current || pkg.pricing.platformPrice < current.pricing.platformPrice) {
      byOperator.set(pkg.operatorId, pkg);
    }
  }
  return [...byOperator.values()].sort(
    (a, b) => a.pricing.platformPrice - b.pricing.platformPrice
  );
}

export interface ComparisonRow {
  label: string;
  a: string;
  b: string;
  /** Which column wins on this row, where "winning" is meaningful. */
  better: "a" | "b" | "tie" | null;
}

export interface ComparisonSide {
  operatorId: string;
  operatorSlug: string;
  operatorName: string;
  verified: boolean;
  packageSlug: string;
  packageTitle: string;
  image: string;
  summary: string;
  price: PublicPrice;
  durationDays: number;
  rating: number;
  reviewCount: number;
  city: string;
  foundedYear: number;
}

export interface PairComparison {
  destinationId: string;
  destinationName: string;
  destinationRegion: string;
  a: ComparisonSide;
  b: ComparisonSide;
  rows: ComparisonRow[];
  priceDifference: number;
  cheaper: "a" | "b" | "tie";
  /** Answer-shaped summary an engine can quote wholesale. */
  fact: string;
  supporting: string[];
  verdict: string;
}

function toSide(pkg: ReturnType<typeof sellable>[number]): ComparisonSide {
  const operator = getLiveOperators().find((o) => o.id === pkg.operatorId);
  return {
    operatorId: pkg.operatorId,
    operatorSlug: operator?.slug ?? pkg.operatorId,
    operatorName: pkg.operatorName,
    verified: pkg.operatorVerified,
    packageSlug: pkg.slug,
    packageTitle: pkg.title,
    image: pkg.images[0],
    summary: pkg.summary,
    price: toPublicPrice(pkg.pricing),
    durationDays: pkg.durationDays,
    rating: pkg.operatorRating,
    reviewCount: pkg.operatorReviews,
    city: operator?.city ?? "",
    foundedYear: operator?.foundedYear ?? 0,
  };
}

export function pairSlug(slugA: string, slugB: string): string {
  return [slugA, slugB].sort().join("-vs-");
}

/** Every destination + operator-pair combination worth a page. */
export function listComparisonPairs(): { destination: string; pair: string }[] {
  const out: { destination: string; pair: string }[] = [];

  for (const destinationId of new Set(sellable().map((p) => p.destinationId))) {
    const operators = bestPerOperator(destinationId);
    const slugs = operators
      .map((p) => getLiveOperators().find((o) => o.id === p.operatorId)?.slug)
      .filter((s): s is string => Boolean(s))
      .sort();

    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        out.push({ destination: destinationId, pair: `${slugs[i]}-vs-${slugs[j]}` });
      }
    }
  }
  return out;
}

export function listComparisonDestinations(): string[] {
  return [...new Set(sellable().map((p) => p.destinationId))];
}

export interface DestinationComparison {
  destinationId: string;
  destinationName: string;
  destinationRegion: string;
  heroImage: string;
  rows: ComparisonSide[];
  pairs: { slug: string; a: string; b: string }[];
}

export async function getDestinationComparison(
  destinationId: string
): Promise<DestinationComparison | null> {
  const destination = destinationById[destinationId];
  const best = bestPerOperator(destinationId);
  if (!destination || best.length === 0) return null;

  const sides = best.map(toSide);
  const pairs: { slug: string; a: string; b: string }[] = [];
  const sorted = [...sides].sort((x, y) => x.operatorSlug.localeCompare(y.operatorSlug));

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      pairs.push({
        slug: `${sorted[i].operatorSlug}-vs-${sorted[j].operatorSlug}`,
        a: sorted[i].operatorName,
        b: sorted[j].operatorName,
      });
    }
  }

  return {
    destinationId,
    destinationName: destination.name,
    destinationRegion: destination.region,
    heroImage: destination.heroImage,
    rows: sides,
    pairs,
  };
}

export async function getPairComparison(
  destinationId: string,
  pair: string
): Promise<PairComparison | null> {
  const destination = destinationById[destinationId];
  if (!destination) return null;

  const [slugA, slugB] = pair.split("-vs-");
  if (!slugA || !slugB || slugA === slugB) return null;

  const best = bestPerOperator(destinationId);
  const operators = getLiveOperators();

  const find = (slug: string) => {
    const operator = operators.find((o) => o.slug === slug);
    if (!operator) return null;
    return best.find((p) => p.operatorId === operator.id) ?? null;
  };

  const pkgA = find(slugA);
  const pkgB = find(slugB);
  if (!pkgA || !pkgB) return null;

  const a = toSide(pkgA);
  const b = toSide(pkgB);

  const policyA = cancellationPolicyById[pkgA.cancellationPolicyId];
  const policyB = cancellationPolicyById[pkgB.cancellationPolicyId];
  const flexRank = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

  const cmp = (x: number, y: number, higherWins = true): "a" | "b" | "tie" =>
    x === y ? "tie" : (x > y) === higherWins ? "a" : "b";

  const yesNo = (v: boolean) => (v ? "Yes" : "No");
  const boolBetter = (x: boolean, y: boolean): "a" | "b" | "tie" | null =>
    x === y ? "tie" : x ? "a" : "b";

  const rows: ComparisonRow[] = [
    {
      label: "Price per person on Atlaso",
      a: inr(a.price.platformPrice),
      b: inr(b.price.platformPrice),
      better: cmp(a.price.platformPrice, b.price.platformPrice, false),
    },
    {
      label: "Operator's direct price",
      a: inr(a.price.retailPrice),
      b: inr(b.price.retailPrice),
      better: null,
    },
    {
      label: "You save",
      a: inr(a.price.savings),
      b: inr(b.price.savings),
      better: cmp(a.price.savings, b.price.savings),
    },
    {
      label: "Trip length",
      a: pkgA.duration,
      b: pkgB.duration,
      better: null,
    },
    {
      label: "Price per day",
      a: inr(Math.round(a.price.platformPrice / a.durationDays)),
      b: inr(Math.round(b.price.platformPrice / b.durationDays)),
      better: cmp(
        a.price.platformPrice / a.durationDays,
        b.price.platformPrice / b.durationDays,
        false
      ),
    },
    {
      label: "Operator rating",
      a: `${a.rating} (${a.reviewCount} reviews)`,
      b: `${b.rating} (${b.reviewCount} reviews)`,
      better: cmp(a.rating, b.rating),
    },
    {
      label: "Verified by Atlaso",
      a: yesNo(a.verified),
      b: yesNo(b.verified),
      better: boolBetter(a.verified, b.verified),
    },
    {
      label: "Maximum group size",
      a: String(pkgA.groupSizeMax),
      b: String(pkgB.groupSizeMax),
      better: cmp(pkgA.groupSizeMax, pkgB.groupSizeMax, false),
    },
    { label: "Accommodation", a: pkgA.hotelType, b: pkgB.hotelType, better: null },
    {
      label: "Meals included",
      a: yesNo(pkgA.mealsIncluded),
      b: yesNo(pkgB.mealsIncluded),
      better: boolBetter(pkgA.mealsIncluded, pkgB.mealsIncluded),
    },
    {
      label: "Transport included",
      a: yesNo(pkgA.transportIncluded),
      b: yesNo(pkgB.transportIncluded),
      better: boolBetter(pkgA.transportIncluded, pkgB.transportIncluded),
    },
    {
      label: "Guide included",
      a: yesNo(pkgA.guideIncluded),
      b: yesNo(pkgB.guideIncluded),
      better: boolBetter(pkgA.guideIncluded, pkgB.guideIncluded),
    },
    {
      label: "Cancellation policy",
      a: pkgA.cancellationPolicy,
      b: pkgB.cancellationPolicy,
      better: cmp(
        flexRank[policyA?.flexibility ?? "MEDIUM"],
        flexRank[policyB?.flexibility ?? "MEDIUM"]
      ),
    },
    { label: "Starts from", a: pkgA.pickupPoint, b: pkgB.pickupPoint, better: null },
    {
      label: "Departures scheduled",
      a: String(pkgA.departures.length),
      b: String(pkgB.departures.length),
      better: cmp(pkgA.departures.length, pkgB.departures.length),
    },
  ];

  const priceDifference = Math.abs(a.price.platformPrice - b.price.platformPrice);
  const cheaper: "a" | "b" | "tie" =
    a.price.platformPrice === b.price.platformPrice
      ? "tie"
      : a.price.platformPrice < b.price.platformPrice
      ? "a"
      : "b";

  const cheaperSide = cheaper === "b" ? b : a;
  const dearerSide = cheaper === "b" ? a : b;

  const fact =
    cheaper === "tie"
      ? `${a.operatorName} and ${b.operatorName} both price their ${destination.name} trip at ` +
        `${inr(a.price.platformPrice)} per person on Atlaso. ${a.operatorName} runs ` +
        `${a.durationDays} days and is rated ${a.rating}/5; ${b.operatorName} runs ` +
        `${b.durationDays} days and is rated ${b.rating}/5.`
      : `For ${destination.name}, ${cheaperSide.operatorName} is ${inr(priceDifference)} cheaper ` +
        `than ${dearerSide.operatorName} on Atlaso — ${inr(cheaperSide.price.platformPrice)} ` +
        `versus ${inr(dearerSide.price.platformPrice)} per person. ` +
        `${cheaperSide.operatorName}'s trip runs ${cheaperSide.durationDays} days and the ` +
        `operator is rated ${cheaperSide.rating}/5 from ${cheaperSide.reviewCount} reviews; ` +
        `${dearerSide.operatorName}'s runs ${dearerSide.durationDays} days at ` +
        `${dearerSide.rating}/5 from ${dearerSide.reviewCount} reviews.`;

  const differing = rows.filter((r) => r.better === "a" || r.better === "b");
  const aWins = differing.filter((r) => r.better === "a").length;
  const bWins = differing.filter((r) => r.better === "b").length;

  const verdict =
    aWins === bWins
      ? `The two are evenly matched on measurable criteria (${aWins} each). The deciding factor ` +
        `is usually trip length: ${a.operatorName} runs ${a.durationDays} days against ` +
        `${b.operatorName}'s ${b.durationDays}.`
      : `${aWins > bWins ? a.operatorName : b.operatorName} comes out ahead on ` +
        `${Math.max(aWins, bWins)} of ${differing.length} measurable criteria, including ` +
        `${differing
          .filter((r) => r.better === (aWins > bWins ? "a" : "b"))
          .slice(0, 3)
          .map((r) => r.label.toLowerCase())
          .join(", ")}.`;

  const supporting = [
    `Per day, ${a.operatorName} works out at ` +
      `${inr(Math.round(a.price.platformPrice / a.durationDays))} and ${b.operatorName} at ` +
      `${inr(Math.round(b.price.platformPrice / b.durationDays))}.`,
    `Booking through Atlaso saves ${inr(a.price.savings)} on ${a.operatorName} and ` +
      `${inr(b.price.savings)} on ${b.operatorName}, against each operator's own direct price.`,
    `Cancellation: ${a.operatorName} offers "${pkgA.cancellationPolicy}", ` +
      `${b.operatorName} offers "${pkgB.cancellationPolicy}".`,
  ];

  return {
    destinationId,
    destinationName: destination.name,
    destinationRegion: destination.region,
    a,
    b,
    rows,
    priceDifference,
    cheaper,
    fact,
    supporting,
    verdict,
  };
}
