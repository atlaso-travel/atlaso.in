/**
 * Read models for the operator portal and the admin panel. SERVER ONLY.
 *
 * Two different views of the same money, and the split matters:
 *
 *   Operators see their own B2B rate, their booking count and what they are owed.
 *   They never see the platform price a customer paid or our margin.
 *
 *   Admin sees everything — GMV, margin, take rate, and the pricing-violation
 *   queue.
 *
 * Analytics are computed from booking snapshots, not from current prices, so the
 * numbers stay correct after a margin rule changes.
 */

import { listBookings, listBookingsForOperator, listLeadsForOperator, type Booking } from "./bookings";
import { getLivePackages, getLiveOperators, getLiveMarginRules } from "./overrides";
import { destinationById } from "@/data/destinations";
import type { Package } from "@/data/packages";

/* ── Operator ─────────────────────────────────────────────────────────────── */

export interface OperatorPackageRow {
  id: string;
  slug: string;
  title: string;
  destinationName: string;
  status: Package["status"];
  duration: string;
  image: string;
  retailPrice: number;
  b2bCost: number;
  /** Percentage of retail the operator is discounting to Atlaso. */
  discountPct: number;
  validationStatus: string;
  validationNote: string | null;
  departures: number;
  seatsLeft: number;
  seatsTotal: number;
}

export interface OperatorDashboard {
  operatorId: string;
  operatorName: string;
  verificationStatus: string;
  verified: boolean;
  packages: OperatorPackageRow[];
  bookings: Booking[];
  leads: Awaited<ReturnType<typeof listLeadsForOperator>>;
  totals: {
    liveListings: number;
    confirmedBookings: number;
    travellers: number;
    /** Sum of B2B cost across confirmed bookings — what the operator earns. */
    earned: number;
    awaitingPayout: number;
    paidOut: number;
  };
}

function toRow(pkg: Package): OperatorPackageRow {
  const seatsLeft = pkg.departures.reduce(
    (sum, d) => sum + Math.max(0, d.seatsTotal - d.seatsBooked),
    0
  );
  const seatsTotal = pkg.departures.reduce((sum, d) => sum + d.seatsTotal, 0);
  return {
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    destinationName: destinationById[pkg.destinationId]?.name ?? pkg.destinationId,
    status: pkg.status,
    duration: pkg.duration,
    image: pkg.images[0],
    retailPrice: pkg.pricing.retailPrice,
    b2bCost: pkg.pricing.b2bCost,
    discountPct: Math.round(
      ((pkg.pricing.retailPrice - pkg.pricing.b2bCost) / pkg.pricing.retailPrice) * 100
    ),
    validationStatus: pkg.pricing.validationStatus,
    validationNote: pkg.pricing.validationNote,
    departures: pkg.departures.length,
    seatsLeft,
    seatsTotal,
  };
}

export async function getOperatorDashboard(operatorId: string): Promise<OperatorDashboard | null> {
  const operator = getLiveOperators().find((o) => o.id === operatorId);
  if (!operator) return null;

  const packages = getLivePackages().filter((p) => p.operatorId === operatorId);
  const bookings = await listBookingsForOperator(operatorId);
  const leads = await listLeadsForOperator(operatorId);
  const confirmed = bookings.filter((b) => b.paymentStatus === "PAID");

  return {
    operatorId,
    operatorName: operator.name,
    verificationStatus: operator.verificationStatus,
    verified: operator.verified,
    packages: packages.map(toRow),
    bookings,
    leads,
    totals: {
      liveListings: packages.filter((p) => p.status === "ACTIVE").length,
      confirmedBookings: confirmed.length,
      travellers: confirmed.reduce((s, b) => s + b.travellerCount, 0),
      earned: confirmed.reduce((s, b) => s + b.operatorPayable, 0),
      awaitingPayout: confirmed
        .filter((b) => b.payoutStatus !== "PAID")
        .reduce((s, b) => s + b.operatorPayable, 0),
      paidOut: confirmed
        .filter((b) => b.payoutStatus === "PAID")
        .reduce((s, b) => s + b.operatorPayable, 0),
    },
  };
}

/* ── Admin ────────────────────────────────────────────────────────────────── */

export interface PricingViolation {
  packageId: string;
  slug: string;
  title: string;
  operatorId: string;
  operatorName: string;
  status: string;
  retailPrice: number;
  b2bCost: number;
  platformPrice: number;
  marginAmount: number;
  validationStatus: string;
  validationNote: string | null;
  appliedMarginRuleId: string;
  /** True when the package is still visible to customers despite the flag. */
  stillSellable: boolean;
}

export interface AdminOverview {
  gmv: number;
  operatorCost: number;
  margin: number;
  takeRatePct: number;
  customerSavings: number;
  confirmedBookings: number;
  pendingBookings: number;
  travellers: number;
  averageOrderValue: number;
  awaitingPayout: number;
  activeListings: number;
  totalListings: number;
  operatorsVerified: number;
  operatorsPending: number;
  violations: PricingViolation[];
  marginRuleCount: number;
  recentBookings: Booking[];
  byDestination: {
    destinationId: string;
    name: string;
    listings: number;
    bookings: number;
    gmv: number;
    margin: number;
  }[];
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const packages = getLivePackages();
  const operators = getLiveOperators();
  const bookings = await listBookings();
  const confirmed = bookings.filter((b) => b.paymentStatus === "PAID");

  const gmv = confirmed.reduce((s, b) => s + b.totalAmount, 0);
  const operatorCost = confirmed.reduce((s, b) => s + b.operatorPayable, 0);
  const margin = confirmed.reduce((s, b) => s + b.platformMargin, 0);

  const violations: PricingViolation[] = packages
    .filter((p) => p.pricing.validationStatus !== "OK")
    .map((p) => ({
      packageId: p.id,
      slug: p.slug,
      title: p.title,
      operatorId: p.operatorId,
      operatorName: p.operatorName,
      status: p.status,
      retailPrice: p.pricing.retailPrice,
      b2bCost: p.pricing.b2bCost,
      platformPrice: p.pricing.platformPrice,
      marginAmount: p.pricing.marginAmount,
      validationStatus: p.pricing.validationStatus,
      validationNote: p.pricing.validationNote,
      appliedMarginRuleId: p.pricing.appliedMarginRuleId,
      stillSellable:
        p.status === "ACTIVE" &&
        p.pricing.validationStatus !== "ABOVE_RETAIL" &&
        p.pricing.validationStatus !== "INVERTED",
    }));

  const destinationIds = [...new Set(packages.map((p) => p.destinationId))];
  const byDestination = destinationIds
    .map((destinationId) => {
      const destBookings = confirmed.filter((b) => b.destinationId === destinationId);
      return {
        destinationId,
        name: destinationById[destinationId]?.name ?? destinationId,
        listings: packages.filter((p) => p.destinationId === destinationId).length,
        bookings: destBookings.length,
        gmv: destBookings.reduce((s, b) => s + b.totalAmount, 0),
        margin: destBookings.reduce((s, b) => s + b.platformMargin, 0),
      };
    })
    .sort((a, b) => b.gmv - a.gmv || b.listings - a.listings);

  return {
    gmv,
    operatorCost,
    margin,
    takeRatePct: gmv > 0 ? Math.round((margin / gmv) * 1000) / 10 : 0,
    customerSavings: confirmed.reduce((s, b) => s + b.customerSavings, 0),
    confirmedBookings: confirmed.length,
    pendingBookings: bookings.filter((b) => b.paymentStatus === "UNPAID").length,
    travellers: confirmed.reduce((s, b) => s + b.travellerCount, 0),
    averageOrderValue: confirmed.length ? Math.round(gmv / confirmed.length) : 0,
    awaitingPayout: confirmed
      .filter((b) => b.payoutStatus !== "PAID")
      .reduce((s, b) => s + b.operatorPayable, 0),
    activeListings: packages.filter((p) => p.status === "ACTIVE").length,
    totalListings: packages.length,
    operatorsVerified: operators.filter((o) => o.verified).length,
    operatorsPending: operators.filter((o) => o.verificationStatus === "PENDING").length,
    violations,
    marginRuleCount: getLiveMarginRules().filter((r) => r.active).length,
    recentBookings: bookings.slice(0, 8),
    byDestination,
  };
}

export async function getVerificationQueue() {
  return getLiveOperators()
    .map((o) => ({
      id: o.id,
      name: o.name,
      legalName: o.legalName,
      city: o.city,
      state: o.state,
      gstin: o.gstin,
      panMasked: o.panMasked,
      contactName: o.contactName,
      contactEmail: o.contactEmail,
      contactPhone: o.contactPhone,
      verificationStatus: o.verificationStatus,
      documents: o.documents,
      payoutVerified: o.payoutAccount?.verified ?? false,
      packageCount: getLivePackages().filter((p) => p.operatorId === o.id).length,
      rating: o.rating,
      reviewCount: o.reviewCount,
      foundedYear: o.foundedYear,
    }))
    .sort((a, b) => {
      const order = { PENDING: 0, REJECTED: 1, SUSPENDED: 2, VERIFIED: 3 } as const;
      return order[a.verificationStatus] - order[b.verificationStatus];
    });
}
