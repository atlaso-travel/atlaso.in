/**
 * Server-side data access.
 *
 * SERVER ONLY. Nothing in here may be imported from a "use client" module.
 * Every function is async even though the current implementation is synchronous,
 * so that swapping the bodies for Prisma queries changes nothing at the call
 * sites — the static arrays in src/data are the only thing that goes away.
 *
 * The important boundary is pricing. These functions return `PublicPrice`, which
 * carries platformPrice / retailPrice / savings and deliberately omits b2bCost,
 * marginAmount and marginPct. Cost and margin never leave the server, so a
 * client bug cannot leak what we pay operators, and no customer-facing price is
 * ever arithmetic done in a browser.
 */

import { type Package } from "@/data/packages";
import { destinations, destinationById } from "@/data/destinations";
import { cancellationPolicyById, type CancellationFlexibility } from "@/data/cancellationPolicies";
import { toPublicPrice, type PublicPrice } from "@/data/pricing";
import { getLivePackages, getLiveOperators } from "./overrides";
import type { TrustSignals } from "@/components/ui/TrustRow";

/**
 * Reads go through the override layer, not the raw seed arrays, so a margin rule
 * an admin edits or a price an operator updates is reflected on the public site
 * on the next request. `packages` and `operatorById` below are functions rather
 * than module constants for that reason — caching them would reintroduce the
 * staleness the override layer exists to avoid.
 */
const packages = (): Package[] => getLivePackages();
const operatorFor = (id: string) => getLiveOperators().find((o) => o.id === id) ?? null;

/* ── Public shapes ───────────────────────────────────────────────────────── */

export interface PackageSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: string;
  tags: string[];

  destinationId: string;
  destinationName: string;

  operatorId: string;
  operatorName: string;
  operatorVerified: boolean;

  duration: string;
  durationDays: number;
  groupSize: string;
  groupSizeMax: number;
  difficulty: string;
  hotelType: string;
  mealsIncluded: boolean;
  guideIncluded: boolean;
  transportIncluded: boolean;

  cancellationPolicy: string;
  cancellationFlexibility: CancellationFlexibility;

  price: PublicPrice;
  trust: TrustSignals;

  nextDepartureDate: string | null;
  seatsLeftOnNext: number | null;
  departureCount: number;

  /** True when pricing rules are violated in a way admin must look at. */
  needsPricingReview: boolean;
}

export interface ComparablePackage extends PackageSummary {
  images: string[];
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  itinerary: Package["itinerary"];
  nights: number;
  minAge: number;
  pickupPoint: string;
  dropPoint: string;
  cancellationDescription: string;
  operatorFoundedYear: number;
  operatorCompletedTrips: number;
  operatorLanguages: string[];
}

export interface PackageDetail extends ComparablePackage {
  reviews: Package["reviews"];
  packageRating: number;
  packageReviewCount: number;
  departures: {
    id: string;
    startDate: string;
    endDate: string;
    seatsLeft: number;
    seatsTotal: number;
    soldOut: boolean;
  }[];
  destinationRegion: string;
  operatorSlug: string;
  operatorVerificationStatus: string;
}

export type SortOption = "best-match" | "price-asc" | "price-desc" | "rating" | "duration" | "savings";

export interface SearchQuery {
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Bucket keys: "1-3", "4-6", "7-9", "10+" */
  durations?: string[];
  difficulties?: string[];
  /** Any of: "meals" | "transport" | "guide" */
  inclusions?: string[];
  /** Bucket keys: "small" | "medium" | "large" */
  groupSizes?: string[];
  minRating?: number;
  /** "YYYY-MM" — matches packages with a departure starting that month. */
  month?: string;
  sort?: SortOption;
}

export interface SearchResult {
  packages: PackageSummary[];
  total: number;
  /** Total before filters, for "showing X of Y" and empty-state copy. */
  totalInCatalogue: number;
  /** Cheapest platform price across the unfiltered destination set. */
  cheapestAvailable: number | null;
  appliedDestination: { id: string; name: string; heroImage: string; region: string } | null;
}

/* ── Internal mapping ────────────────────────────────────────────────────── */

/**
 * A package is withheld from customers when showing it would be wrong or
 * actively misleading: platform price at or above retail (no saving to claim),
 * or operator data inverted. BELOW_MIN_MARGIN is a margin problem for us, not a
 * correctness problem for the customer, so those still sell but are flagged for
 * admin review.
 */
function isSellable(pkg: Package): boolean {
  const s = pkg.pricing.validationStatus;
  return pkg.status === "ACTIVE" && s !== "ABOVE_RETAIL" && s !== "INVERTED";
}

function toSummary(pkg: Package): PackageSummary {
  const operator = operatorFor(pkg.operatorId);
  const destination = destinationById[pkg.destinationId];
  const policy = cancellationPolicyById[pkg.cancellationPolicyId];

  const upcoming = [...pkg.departures]
    .filter((d) => d.seatsBooked < d.seatsTotal)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const next = upcoming[0] ?? null;

  return {
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    summary: pkg.summary,
    image: pkg.images[0],
    tags: pkg.tags,

    destinationId: pkg.destinationId,
    destinationName: destination?.name ?? pkg.destinationId,

    operatorId: pkg.operatorId,
    operatorName: pkg.operatorName,
    operatorVerified: pkg.operatorVerified,

    duration: pkg.duration,
    durationDays: pkg.durationDays,
    groupSize: pkg.groupSize,
    groupSizeMax: pkg.groupSizeMax,
    difficulty: pkg.difficulty,
    hotelType: pkg.hotelType,
    mealsIncluded: pkg.mealsIncluded,
    guideIncluded: pkg.guideIncluded,
    transportIncluded: pkg.transportIncluded,

    cancellationPolicy: pkg.cancellationPolicy,
    cancellationFlexibility: policy?.flexibility ?? "MEDIUM",

    price: toPublicPrice(pkg.pricing),
    trust: {
      rating: pkg.operatorRating,
      reviewCount: pkg.operatorReviews,
      bookingsLast30d: pkg.bookingsLast30d,
      cancellation: {
        label: pkg.cancellationPolicy,
        flexibility: policy?.flexibility ?? "MEDIUM",
      },
      responseMinutes: operator?.avgResponseMinutes ?? 120,
    },

    nextDepartureDate: next?.startDate ?? null,
    seatsLeftOnNext: next ? next.seatsTotal - next.seatsBooked : null,
    departureCount: pkg.departures.length,

    needsPricingReview: pkg.pricing.validationStatus !== "OK",
  };
}

function toComparable(pkg: Package): ComparablePackage {
  const operator = operatorFor(pkg.operatorId);
  const policy = cancellationPolicyById[pkg.cancellationPolicyId];
  return {
    ...toSummary(pkg),
    images: pkg.images,
    inclusions: pkg.inclusions,
    exclusions: pkg.exclusions,
    highlights: pkg.highlights,
    itinerary: pkg.itinerary,
    nights: pkg.nights,
    minAge: pkg.minAge,
    pickupPoint: pkg.pickupPoint,
    dropPoint: pkg.dropPoint,
    cancellationDescription: policy?.description ?? pkg.cancellationPolicy,
    operatorFoundedYear: operator?.foundedYear ?? 0,
    operatorCompletedTrips: operator?.completedTrips ?? 0,
    operatorLanguages: operator?.languages ?? [],
  };
}

/* ── Filters ─────────────────────────────────────────────────────────────── */

function matchesDuration(days: number, buckets: string[]): boolean {
  return buckets.some((b) => {
    if (b === "1-3") return days <= 3;
    if (b === "4-6") return days >= 4 && days <= 6;
    if (b === "7-9") return days >= 7 && days <= 9;
    if (b === "10+") return days >= 10;
    return false;
  });
}

function matchesGroupSize(max: number, buckets: string[]): boolean {
  return buckets.some((b) => {
    if (b === "small") return max <= 8;
    if (b === "medium") return max > 8 && max <= 14;
    if (b === "large") return max > 14;
    return false;
  });
}

function matchesDestination(pkg: Package, term: string): boolean {
  const q = term.trim().toLowerCase();
  if (!q || q === "all destinations") return true;
  const destination = destinationById[pkg.destinationId];
  return (
    pkg.destinationId === q ||
    pkg.destinationId.replace(/-/g, " ") === q ||
    (destination?.name.toLowerCase().includes(q) ?? false) ||
    (destination?.region.toLowerCase().includes(q) ?? false) ||
    pkg.title.toLowerCase().includes(q) ||
    pkg.operatorName.toLowerCase().includes(q) ||
    pkg.tags.some((t) => t.toLowerCase() === q)
  );
}

/* ── Queries ─────────────────────────────────────────────────────────────── */

export async function searchPackages(query: SearchQuery): Promise<SearchResult> {
  const sellable = packages().filter(isSellable);
  let result = sellable;

  if (query.destination) {
    result = result.filter((p) => matchesDestination(p, query.destination!));
  }

  const scopedToDestination = result;

  if (query.minPrice != null) {
    result = result.filter((p) => p.pricing.platformPrice >= query.minPrice!);
  }
  if (query.maxPrice != null) {
    result = result.filter((p) => p.pricing.platformPrice <= query.maxPrice!);
  }
  if (query.durations?.length) {
    result = result.filter((p) => matchesDuration(p.durationDays, query.durations!));
  }
  if (query.difficulties?.length) {
    result = result.filter((p) => query.difficulties!.includes(p.difficulty));
  }
  if (query.groupSizes?.length) {
    result = result.filter((p) => matchesGroupSize(p.groupSizeMax, query.groupSizes!));
  }
  if (query.inclusions?.length) {
    result = result.filter((p) =>
      query.inclusions!.every((inc) =>
        inc === "meals" ? p.mealsIncluded
        : inc === "transport" ? p.transportIncluded
        : inc === "guide" ? p.guideIncluded
        : true
      )
    );
  }
  if (query.minRating != null) {
    result = result.filter((p) => p.operatorRating >= query.minRating!);
  }
  if (query.month) {
    result = result.filter((p) =>
      p.departures.some(
        (d) => d.startDate.startsWith(query.month!) && d.seatsBooked < d.seatsTotal
      )
    );
  }

  const sorted = [...result];
  switch (query.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.pricing.platformPrice - b.pricing.platformPrice);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.pricing.platformPrice - a.pricing.platformPrice);
      break;
    case "rating":
      sorted.sort((a, b) => b.operatorRating - a.operatorRating);
      break;
    case "duration":
      sorted.sort((a, b) => a.durationDays - b.durationDays);
      break;
    case "savings":
      sorted.sort((a, b) => b.pricing.savings - a.pricing.savings);
      break;
    default:
      // Best match: verified operators first, then rating, then savings.
      sorted.sort(
        (a, b) =>
          Number(b.operatorVerified) - Number(a.operatorVerified) ||
          b.operatorRating - a.operatorRating ||
          b.pricing.savings - a.pricing.savings
      );
  }

  const destination = query.destination
    ? destinations.find(
        (d) =>
          d.id === query.destination!.toLowerCase().replace(/\s+/g, "-") ||
          d.name.toLowerCase() === query.destination!.toLowerCase()
      ) ?? null
    : null;

  return {
    packages: sorted.map(toSummary),
    total: sorted.length,
    totalInCatalogue: sellable.length,
    cheapestAvailable: scopedToDestination.length
      ? Math.min(...scopedToDestination.map((p) => p.pricing.platformPrice))
      : null,
    appliedDestination: destination
      ? {
          id: destination.id,
          name: destination.name,
          heroImage: destination.heroImage,
          region: destination.region,
        }
      : null,
  };
}

export async function getComparablePackages(ids: string[]): Promise<ComparablePackage[]> {
  const wanted = new Set(ids);
  return packages()
    .filter((p) => wanted.has(p.id) && isSellable(p))
    .sort((a, b) => a.pricing.platformPrice - b.pricing.platformPrice)
    .slice(0, 4)
    .map(toComparable);
}

export async function getPackageDetail(slug: string): Promise<PackageDetail | null> {
  const pkg = packages().find((p) => p.slug === slug);
  if (!pkg) return null;

  const operator = operatorFor(pkg.operatorId);
  const destination = destinationById[pkg.destinationId];

  return {
    ...toComparable(pkg),
    reviews: pkg.reviews,
    packageRating: pkg.packageRating,
    packageReviewCount: pkg.packageReviewCount,
    departures: pkg.departures
      .slice()
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((d) => ({
        id: d.id,
        startDate: d.startDate,
        endDate: d.endDate,
        seatsLeft: d.seatsTotal - d.seatsBooked,
        seatsTotal: d.seatsTotal,
        soldOut: d.seatsBooked >= d.seatsTotal,
      })),
    destinationRegion: destination?.region ?? "",
    operatorSlug: operator?.slug ?? pkg.operatorId,
    operatorVerificationStatus: operator?.verificationStatus ?? "PENDING",
  };
}

export async function getAllPackageSlugs(): Promise<string[]> {
  return packages().map((p) => p.slug);
}

/** Other packages for the same destination, for the "add another operator" slot. */
export async function getComparisonCandidates(
  destinationId: string,
  excludeIds: string[]
): Promise<PackageSummary[]> {
  const exclude = new Set(excludeIds);
  return packages()
    .filter((p) => p.destinationId === destinationId && !exclude.has(p.id) && isSellable(p))
    .sort((a, b) => a.pricing.platformPrice - b.pricing.platformPrice)
    .map(toSummary);
}

export async function getPackageSummaries(ids: string[]): Promise<PackageSummary[]> {
  const wanted = new Set(ids);
  return packages().filter((p) => wanted.has(p.id)).map(toSummary);
}

/**
 * Every sellable package. Used by the saved-trips page, which resolves its ids
 * from localStorage in the browser and so cannot query by id on the server.
 * Once saved lists live on the user account this becomes a scoped query.
 */
export async function getAllSummaries(): Promise<PackageSummary[]> {
  return packages().filter(isSellable).map(toSummary);
}

export async function getDestinationOptions() {
  return destinations.map((d) => ({
    id: d.id,
    name: d.name,
    region: d.region,
    packageCount: d.packageCount,
    priceFrom: d.priceFrom,
  }));
}

/** Bounds for the price filter, so the slider reflects real inventory. */
export async function getPriceBounds(): Promise<{ min: number; max: number }> {
  const prices = packages().filter(isSellable).map((p) => p.pricing.platformPrice);
  return {
    min: Math.floor(Math.min(...prices) / 500) * 500,
    max: Math.ceil(Math.max(...prices) / 500) * 500,
  };
}
