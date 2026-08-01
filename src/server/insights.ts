/**
 * Computed statistics and the plainly-worded sentences built from them.
 * SERVER ONLY.
 *
 * Why this exists as its own layer rather than being written into each page:
 *
 * Answer engines cite specific, attributable numbers far more readily than
 * marketing prose. A sentence like "Spiti Valley packages on Atlaso range from
 * ₹9,099 to ₹17,099 across 6 operators, averaging ₹1,433 below booking direct"
 * is liftable as-is; "discover unforgettable Himalayan journeys" is not.
 *
 * Every figure here is derived from live data, so the sentences stay true when
 * an operator changes a price or admin edits a margin rule. Nothing is hardcoded
 * and nothing is rounded into vagueness.
 */

import { getLivePackages } from "./overrides";
import { destinations, destinationById } from "@/data/destinations";
import { getLiveOperators } from "./overrides";
import { inr } from "@/lib/seo/meta";

function sellable() {
  return getLivePackages().filter(
    (p) =>
      p.status === "ACTIVE" &&
      p.pricing.validationStatus !== "ABOVE_RETAIL" &&
      p.pricing.validationStatus !== "INVERTED"
  );
}

const mean = (values: number[]) =>
  values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

export interface DestinationInsight {
  destinationId: string;
  name: string;
  region: string;
  packageCount: number;
  operatorCount: number;
  priceFrom: number;
  priceTo: number;
  retailFrom: number;
  averageSaving: number;
  averageSavingPct: number;
  bestSaving: number;
  bestSavingOperator: string | null;
  cheapestOperator: string | null;
  shortestDays: number;
  longestDays: number;
  verifiedOperatorCount: number;
  departureCount: number;
  /** One self-contained factual sentence, safe to quote out of context. */
  fact: string;
  /** Two or three supporting facts, same rules. */
  supporting: string[];
}

export async function getDestinationInsight(
  destinationId: string
): Promise<DestinationInsight | null> {
  const destination = destinationById[destinationId];
  if (!destination) return null;

  const here = sellable().filter((p) => p.destinationId === destinationId);
  if (here.length === 0) return null;

  const platform = here.map((p) => p.pricing.platformPrice);
  const savings = here.map((p) => p.pricing.savings);
  const operatorIds = [...new Set(here.map((p) => p.operatorId))];
  const operators = getLiveOperators();

  const cheapest = here.reduce((a, b) =>
    a.pricing.platformPrice <= b.pricing.platformPrice ? a : b
  );
  const bestSaver = here.reduce((a, b) => (a.pricing.savings >= b.pricing.savings ? a : b));

  const averageSaving = mean(savings);
  const averageSavingPct = mean(here.map((p) => p.pricing.savingsPct));
  const verifiedOperatorCount = operatorIds.filter(
    (id) => operators.find((o) => o.id === id)?.verified
  ).length;

  const fact =
    `${destination.name} packages on Atlaso range from ${inr(Math.min(...platform))} to ` +
    `${inr(Math.max(...platform))} per person across ${operatorIds.length} ` +
    `operator${operatorIds.length === 1 ? "" : "s"} and ${here.length} ` +
    `package${here.length === 1 ? "" : "s"}, averaging ${inr(averageSaving)} ` +
    `(${averageSavingPct}%) below each operator's own direct price.`;

  const supporting = [
    `The cheapest ${destination.name} package is ${inr(cheapest.pricing.platformPrice)} ` +
      `per person with ${cheapest.operatorName} (${cheapest.duration}).`,
    `The largest saving is ${inr(bestSaver.pricing.savings)} per person on ` +
      `${bestSaver.operatorName}'s ${bestSaver.title}, which the operator sells directly for ` +
      `${inr(bestSaver.pricing.retailPrice)}.`,
    `${verifiedOperatorCount} of ${operatorIds.length} operators running ${destination.name} ` +
      `trips are verified by Atlaso, and trips run ${Math.min(...here.map((p) => p.durationDays))}` +
      `–${Math.max(...here.map((p) => p.durationDays))} days.`,
  ];

  return {
    destinationId,
    name: destination.name,
    region: destination.region,
    packageCount: here.length,
    operatorCount: operatorIds.length,
    priceFrom: Math.min(...platform),
    priceTo: Math.max(...platform),
    retailFrom: Math.min(...here.map((p) => p.pricing.retailPrice)),
    averageSaving,
    averageSavingPct,
    bestSaving: bestSaver.pricing.savings,
    bestSavingOperator: bestSaver.operatorName,
    cheapestOperator: cheapest.operatorName,
    shortestDays: Math.min(...here.map((p) => p.durationDays)),
    longestDays: Math.max(...here.map((p) => p.durationDays)),
    verifiedOperatorCount,
    departureCount: here.reduce((s, p) => s + p.departures.length, 0),
    fact,
    supporting,
  };
}

export interface PackageInsight {
  fact: string;
  supporting: string[];
  rankByPrice: number;
  totalInDestination: number;
  cheaperThanCount: number;
  destinationAverage: number;
}

export async function getPackageInsight(packageId: string): Promise<PackageInsight | null> {
  const all = sellable();
  const pkg = all.find((p) => p.id === packageId);
  if (!pkg) return null;

  const peers = all
    .filter((p) => p.destinationId === pkg.destinationId)
    .sort((a, b) => a.pricing.platformPrice - b.pricing.platformPrice);

  const rank = peers.findIndex((p) => p.id === pkg.id) + 1;
  const destinationName = destinationById[pkg.destinationId]?.name ?? pkg.destinationId;
  const destinationAverage = mean(peers.map((p) => p.pricing.platformPrice));
  const cheaperThanCount = peers.length - rank;

  const fact =
    `${pkg.title} by ${pkg.operatorName} costs ${inr(pkg.pricing.platformPrice)} per person ` +
    `on Atlaso, against ${inr(pkg.pricing.retailPrice)} booking directly with the operator — ` +
    `a saving of ${inr(pkg.pricing.savings)} (${pkg.pricing.savingsPct}%). It is a ` +
    `${pkg.durationDays}-day trip to ${destinationName} with a maximum group size of ` +
    `${pkg.groupSizeMax}.`;

  const supporting = [
    peers.length > 1
      ? `It is the ${ordinal(rank)} cheapest of ${peers.length} ${destinationName} packages ` +
        `listed on Atlaso, where the average is ${inr(destinationAverage)} per person.`
      : `It is currently the only ${destinationName} package listed on Atlaso.`,
    `Cancellation: ${pkg.cancellationPolicy}. Meals ${pkg.mealsIncluded ? "are" : "are not"} ` +
      `included, transport ${pkg.transportIncluded ? "is" : "is not"} included, and a guide ` +
      `${pkg.guideIncluded ? "is" : "is not"} included.`,
    pkg.departures.length > 0
      ? `${pkg.departures.length} departures are scheduled, the next on ` +
        `${formatDate(pkg.departures[0].startDate)}.`
      : `No departures are currently scheduled.`,
  ];

  return {
    fact,
    supporting,
    rankByPrice: rank,
    totalInDestination: peers.length,
    cheaperThanCount,
    destinationAverage,
  };
}

export interface PlatformInsight {
  destinations: number;
  operators: number;
  verifiedOperators: number;
  packages: number;
  departures: number;
  priceFrom: number;
  priceTo: number;
  averageSaving: number;
  averageSavingPct: number;
  totalPotentialSaving: number;
  fact: string;
  byDestination: DestinationInsight[];
}

export async function getPlatformInsight(): Promise<PlatformInsight> {
  const all = sellable();
  const operators = getLiveOperators();
  const platform = all.map((p) => p.pricing.platformPrice);

  const perDestination = (
    await Promise.all(destinations.map((d) => getDestinationInsight(d.id)))
  ).filter((d): d is DestinationInsight => d !== null);

  const averageSaving = mean(all.map((p) => p.pricing.savings));
  const averageSavingPct = mean(all.map((p) => p.pricing.savingsPct));

  const fact =
    `Atlaso lists ${all.length} tour packages from ${operators.length} Indian tour operators ` +
    `across ${perDestination.length} destinations, priced from ${inr(Math.min(...platform))} ` +
    `to ${inr(Math.max(...platform))} per person. On average a package costs ` +
    `${inr(averageSaving)} (${averageSavingPct}%) less than booking the same trip directly ` +
    `with the operator.`;

  return {
    destinations: perDestination.length,
    operators: operators.length,
    verifiedOperators: operators.filter((o) => o.verified).length,
    packages: all.length,
    departures: all.reduce((s, p) => s + p.departures.length, 0),
    priceFrom: Math.min(...platform),
    priceTo: Math.max(...platform),
    averageSaving,
    averageSavingPct,
    totalPotentialSaving: all.reduce((s, p) => s + p.pricing.savings, 0),
    fact,
    byDestination: perDestination.sort((a, b) => b.averageSaving - a.averageSaving),
  };
}

function ordinal(n: number): string {
  const suffix = ["th", "st", "nd", "rd"][(n % 100 > 10 && n % 100 < 14) || n % 10 > 3 ? 0 : n % 10];
  return `${n}${suffix}`;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}
