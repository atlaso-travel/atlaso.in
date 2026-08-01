/**
 * Placeholder for the `CancellationPolicy` table in PLAN.md.
 *
 * The comparison view currently infers flexibility by string-matching the free-text
 * `cancellationPolicy` field ("free" → High, "no refund" → Low). That breaks on any
 * wording an operator invents. These structured policies give the compare table a
 * real value to rank on.
 *
 * Packages keep their own verbatim `cancellationPolicy` string as well as a
 * `cancellationPolicyId` pointing here, so nothing that renders the free text today
 * changes wording. The structured record is what compare/checkout will rank and
 * enforce on once this moves to the database.
 */

export type CancellationFlexibility = "HIGH" | "MEDIUM" | "LOW";

export interface RefundTier {
  /** Cancel at least this many days before departure… */
  daysBefore: number;
  /** …and this percentage of the amount paid is refunded. */
  refundPct: number;
}

export interface CancellationPolicy {
  id: string;
  label: string;
  flexibility: CancellationFlexibility;
  description: string;
  /** Ordered most-generous first. */
  refundTiers: RefundTier[];
  isDemoData: boolean;
}

export const cancellationPolicies: CancellationPolicy[] = [
  {
    id: "flexible-14d",
    label: "Free cancellation until 14 days before",
    flexibility: "HIGH",
    description:
      "Full refund 14 or more days before departure, 50% up to 7 days before. Nothing inside 7 days.",
    refundTiers: [
      { daysBefore: 14, refundPct: 100 },
      { daysBefore: 7, refundPct: 50 },
      { daysBefore: 0, refundPct: 0 },
    ],
    isDemoData: true,
  },
  {
    id: "flexible-10d",
    label: "Free cancellation until 10 days before",
    flexibility: "HIGH",
    description:
      "Full refund 10 or more days before departure, 50% up to 5 days before. Nothing inside 5 days.",
    refundTiers: [
      { daysBefore: 10, refundPct: 100 },
      { daysBefore: 5, refundPct: 50 },
      { daysBefore: 0, refundPct: 0 },
    ],
    isDemoData: true,
  },
  {
    id: "flexible-7d",
    label: "Free cancellation until 7 days before",
    flexibility: "HIGH",
    description:
      "Full refund 7 or more days before departure, 50% up to 3 days before. Nothing inside 72 hours.",
    refundTiers: [
      { daysBefore: 7, refundPct: 100 },
      { daysBefore: 3, refundPct: 50 },
      { daysBefore: 0, refundPct: 0 },
    ],
    isDemoData: true,
  },
  {
    id: "flexible-5d",
    label: "Free cancellation until 5 days before",
    flexibility: "HIGH",
    description:
      "Full refund 5 or more days before departure, 50% up to 2 days before. Nothing inside 48 hours.",
    refundTiers: [
      { daysBefore: 5, refundPct: 100 },
      { daysBefore: 2, refundPct: 50 },
      { daysBefore: 0, refundPct: 0 },
    ],
    isDemoData: true,
  },
  {
    id: "flexible-3d",
    label: "Free cancellation until 3 days before",
    flexibility: "HIGH",
    description:
      "Full refund 3 or more days before departure. Nothing inside 72 hours.",
    refundTiers: [
      { daysBefore: 3, refundPct: 100 },
      { daysBefore: 0, refundPct: 0 },
    ],
    isDemoData: true,
  },
  {
    id: "moderate-10d",
    label: "60% refund until 10 days before",
    flexibility: "MEDIUM",
    description:
      "60% refund 10 or more days before departure, 30% up to 5 days before. Nothing inside 5 days.",
    refundTiers: [
      { daysBefore: 10, refundPct: 60 },
      { daysBefore: 5, refundPct: 30 },
      { daysBefore: 0, refundPct: 0 },
    ],
    isDemoData: true,
  },
  {
    id: "moderate-7d",
    label: "60% refund until 7 days before",
    flexibility: "MEDIUM",
    description:
      "60% refund 7 or more days before departure, 30% up to 3 days before. Nothing inside 72 hours.",
    refundTiers: [
      { daysBefore: 7, refundPct: 60 },
      { daysBefore: 3, refundPct: 30 },
      { daysBefore: 0, refundPct: 0 },
    ],
    isDemoData: true,
  },
  {
    id: "moderate-5d",
    label: "50% refund until 5 days before",
    flexibility: "MEDIUM",
    description:
      "50% refund 5 or more days before departure. Nothing inside 5 days.",
    refundTiers: [
      { daysBefore: 5, refundPct: 50 },
      { daysBefore: 0, refundPct: 0 },
    ],
    isDemoData: true,
  },
  {
    id: "moderate-3d",
    label: "50% refund until 3 days before",
    flexibility: "MEDIUM",
    description:
      "50% refund 3 or more days before departure. Nothing inside 72 hours.",
    refundTiers: [
      { daysBefore: 3, refundPct: 50 },
      { daysBefore: 0, refundPct: 0 },
    ],
    isDemoData: true,
  },
  {
    id: "non-refundable",
    label: "No refund after booking",
    flexibility: "LOW",
    description:
      "This rate is non-refundable. Dates may be shifted once, subject to availability, up to 10 days before departure.",
    refundTiers: [{ daysBefore: 0, refundPct: 0 }],
    isDemoData: true,
  },
];

export const cancellationPolicyById: Record<string, CancellationPolicy> =
  Object.fromEntries(cancellationPolicies.map((p) => [p.id, p]));
