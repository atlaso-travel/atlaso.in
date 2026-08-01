/**
 * Comparison derivation. SERVER ONLY.
 *
 * Everything the compare view needs is computed here, including the per-column
 * verdict badges and the inclusion matrix. Two reasons this is not in the
 * component:
 *
 *  1. No price arithmetic may happen in a browser. Price-per-day and the
 *     cheapest/biggest-saving verdicts are derived from prices, so they belong
 *     on the server with everything else.
 *  2. The previous compare view invented its numbers — "Base Price" was
 *     `price * 0.68` and "Tax & Fees" was `price * 0.18`, computed client-side
 *     and displayed as if they were real. There is no substitute for those,
 *     because operators do not give us a cost breakdown, so the price section
 *     now shows only figures we actually hold.
 */

import { getComparablePackages, type ComparablePackage } from "./catalogue";

export type VerdictKey =
  | "cheapest"
  | "biggest-saving"
  | "best-rated"
  | "most-flexible"
  | "longest"
  | "smallest-group";

export interface Verdict {
  key: VerdictKey;
  label: string;
}

export interface FeatureRow {
  label: string;
  /** One entry per package, in column order. */
  values: boolean[];
  /** True when the columns disagree — the only rows worth reading closely. */
  differs: boolean;
}

export interface ComparisonColumn {
  pkg: ComparablePackage;
  verdicts: Verdict[];
  pricePerDay: number;
  /** Inclusions this package has that no other column has. */
  uniqueInclusions: string[];
}

export interface Comparison {
  columns: ComparisonColumn[];
  features: FeatureRow[];
  /** Longest itinerary across the set, so day rows can align. */
  maxDays: number;
  destinationId: string | null;
  /** Cheapest platform price in the set, for the savings headline. */
  spread: { lowest: number; highest: number; gap: number } | null;
}

/**
 * Canonical inclusion features. Operators write inclusions as free text, so a
 * literal string diff is useless ("All meals (breakfast, lunch, dinner)" vs
 * "All meals included"). These matchers reduce that to a comparable matrix.
 *
 * Once operators submit packages through the portal this becomes a set of
 * checkboxes on their side and the keyword matching goes away.
 */
const FEATURES: { label: string; test: (p: ComparablePackage) => boolean }[] = [
  { label: "All meals", test: (p) => p.mealsIncluded },
  { label: "Transport included", test: (p) => p.transportIncluded },
  { label: "Guide included", test: (p) => p.guideIncluded },
  {
    label: "Permits & fees",
    test: (p) => p.inclusions.some((i) => /permit|entry fee/i.test(i)),
  },
  {
    label: "Travel insurance",
    test: (p) => p.inclusions.some((i) => /insurance/i.test(i)),
  },
  {
    label: "Emergency support",
    test: (p) =>
      p.inclusions.some((i) => /first aid|emergency|satellite|oxygen|medical/i.test(i)),
  },
  {
    label: "Camping / tents",
    test: (p) =>
      /camp|tent/i.test(p.hotelType) || p.inclusions.some((i) => /camp|tent/i.test(i)),
  },
  {
    label: "Airport / station transfer",
    test: (p) =>
      p.inclusions.some((i) => /airport|transfer|pickup|station/i.test(i)) ||
      /airport|railway|station/i.test(p.pickupPoint),
  },
];

function normaliseInclusion(text: string): string {
  return text.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
}

export async function buildComparison(ids: string[]): Promise<Comparison> {
  const packages = await getComparablePackages(ids);

  if (packages.length === 0) {
    return { columns: [], features: [], maxDays: 0, destinationId: null, spread: null };
  }

  const prices = packages.map((p) => p.price.platformPrice);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);

  const bestSaving = Math.max(...packages.map((p) => p.price.savings));
  const bestRating = Math.max(...packages.map((p) => p.trust.rating));
  const longest = Math.max(...packages.map((p) => p.durationDays));
  const smallestGroup = Math.min(...packages.map((p) => p.groupSizeMax));
  const flexRank = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
  const bestFlex = Math.max(...packages.map((p) => flexRank[p.cancellationFlexibility]));

  const inclusionSets = packages.map(
    (p) => new Set(p.inclusions.map(normaliseInclusion))
  );

  const columns: ComparisonColumn[] = packages.map((pkg, i) => {
    const verdicts: Verdict[] = [];
    if (pkg.price.platformPrice === lowest && packages.length > 1)
      verdicts.push({ key: "cheapest", label: "Lowest price" });
    if (pkg.price.savings === bestSaving && bestSaving > 0)
      verdicts.push({ key: "biggest-saving", label: "Biggest saving" });
    if (pkg.trust.rating === bestRating)
      verdicts.push({ key: "best-rated", label: "Best rated" });
    if (flexRank[pkg.cancellationFlexibility] === bestFlex && bestFlex === 3)
      verdicts.push({ key: "most-flexible", label: "Most flexible" });
    if (pkg.durationDays === longest && packages.length > 1)
      verdicts.push({ key: "longest", label: "Longest trip" });
    if (pkg.groupSizeMax === smallestGroup && packages.length > 1)
      verdicts.push({ key: "smallest-group", label: "Smallest group" });

    const others = inclusionSets.filter((_, j) => j !== i);
    const uniqueInclusions = pkg.inclusions.filter((inc) => {
      const key = normaliseInclusion(inc);
      return !others.some((set) => set.has(key));
    });

    return {
      pkg,
      verdicts: verdicts.slice(0, 2),
      pricePerDay: Math.round(pkg.price.platformPrice / pkg.durationDays),
      uniqueInclusions,
    };
  });

  const features: FeatureRow[] = FEATURES.map((f) => {
    const values = packages.map((p) => f.test(p));
    return { label: f.label, values, differs: new Set(values).size > 1 };
  });

  return {
    columns,
    features,
    maxDays: Math.max(...packages.map((p) => p.itinerary.length)),
    destinationId: packages[0].destinationId,
    spread: { lowest, highest, gap: highest - lowest },
  };
}
