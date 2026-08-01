/**
 * Mutable state for the operator portal and admin panel. SERVER ONLY.
 *
 * ⚠ IN-MEMORY, like bookings. Everything an operator or admin changes lives in
 * the Node process and is lost on restart. Same containment strategy: this file
 * is the only thing that has to become Prisma writes.
 *
 * The seeded arrays in src/data stay immutable and act as the baseline. Edits are
 * stored here as overrides and layered on top by `getLivePackages()`. That means
 * a margin rule the admin changes takes effect on the public site immediately,
 * which is the whole point of making margin configurable rather than hardcoded.
 *
 * Pricing is recomputed from the live rule set on read rather than cached, so
 * there is no staleness window. Bookings are unaffected by design — they carry a
 * frozen snapshot (see bookings.ts).
 */

import { packages as seedPackages, type Package } from "@/data/packages";
import { operators as seedOperators, type Operator, type VerificationStatus } from "@/data/operators";
import { marginRules as seedMarginRules, computePricing, type MarginRule } from "@/data/pricing";

interface PricingOverride {
  retailPrice: number;
  b2bCost: number;
  updatedAt: string;
  updatedBy: string;
}

const globalStore = globalThis as unknown as {
  __atlasoOverrides?: {
    pricing: Map<string, PricingOverride>;
    packageStatus: Map<string, Package["status"]>;
    verification: Map<string, VerificationStatus>;
    marginRules: Map<string, MarginRule>;
    disabledSeedRules: Set<string>;
    newPackages: Package[];
  };
};

const store =
  globalStore.__atlasoOverrides ??
  (globalStore.__atlasoOverrides = {
    pricing: new Map<string, PricingOverride>(),
    packageStatus: new Map<string, Package["status"]>(),
    verification: new Map<string, VerificationStatus>(),
    marginRules: new Map<string, MarginRule>(),
    disabledSeedRules: new Set<string>(),
    newPackages: [] as Package[],
  });

/* ── Margin rules ─────────────────────────────────────────────────────────── */

export function getLiveMarginRules(): MarginRule[] {
  const base = seedMarginRules
    .filter((r) => !store.disabledSeedRules.has(r.id))
    .map((r) => store.marginRules.get(r.id) ?? r);
  const added = [...store.marginRules.values()].filter(
    (r) => !seedMarginRules.some((s) => s.id === r.id)
  );
  return [...base, ...added];
}

export function upsertMarginRule(rule: MarginRule): void {
  store.marginRules.set(rule.id, rule);
  store.disabledSeedRules.delete(rule.id);
}

export function setMarginRuleActive(id: string, active: boolean): void {
  const existing = getLiveMarginRules().find((r) => r.id === id);
  if (!existing) return;
  store.marginRules.set(id, { ...existing, active });
}

/** Removes an admin-created rule. Seeded rules are deactivated rather than deleted. */
export function deleteMarginRule(id: string): void {
  if (seedMarginRules.some((r) => r.id === id)) {
    store.disabledSeedRules.add(id);
    store.marginRules.delete(id);
  } else {
    store.marginRules.delete(id);
  }
}

/* ── Packages ─────────────────────────────────────────────────────────────── */

/**
 * Seed packages + operator-submitted ones, with pricing and status overrides
 * applied and every price recomputed against the live margin rules.
 */
export function getLivePackages(): Package[] {
  const rules = getLiveMarginRules();

  return [...seedPackages, ...store.newPackages].map((pkg) => {
    const priceOverride = store.pricing.get(pkg.id);
    const status = store.packageStatus.get(pkg.id) ?? pkg.status;

    const retailPrice = priceOverride?.retailPrice ?? pkg.pricing.retailPrice;
    const b2bCost = priceOverride?.b2bCost ?? pkg.pricing.b2bCost;

    const pricing = computePricing(
      { packageId: pkg.id, operatorId: pkg.operatorId, destinationId: pkg.destinationId },
      retailPrice,
      b2bCost,
      rules
    );

    return { ...pkg, status, price: retailPrice, pricing };
  });
}

export function getLivePackageById(id: string): Package | null {
  return getLivePackages().find((p) => p.id === id) ?? null;
}

export interface PricingUpdateResult {
  ok: boolean;
  error?: string;
  warning?: string;
}

/**
 * Operators set both numbers. Both are required for the margin engine to work at
 * all, so neither can be left blank, and B2B must sit below retail or there is
 * nothing to sell into.
 */
export function updatePackagePricing(
  packageId: string,
  retailPrice: number,
  b2bCost: number,
  updatedBy: string
): PricingUpdateResult {
  const pkg = getLivePackageById(packageId);
  if (!pkg) return { ok: false, error: "That package does not exist." };

  if (!Number.isFinite(retailPrice) || retailPrice <= 0) {
    return { ok: false, error: "Enter your normal direct-to-customer price." };
  }
  if (!Number.isFinite(b2bCost) || b2bCost <= 0) {
    return { ok: false, error: "Enter the rate you are offering Atlaso." };
  }
  if (b2bCost >= retailPrice) {
    return {
      ok: false,
      error:
        "Your Atlaso rate must be below your direct price — otherwise there is no saving to offer a customer.",
    };
  }

  store.pricing.set(packageId, {
    retailPrice: Math.round(retailPrice),
    b2bCost: Math.round(b2bCost),
    updatedAt: new Date().toISOString(),
    updatedBy,
  });

  const updated = getLivePackageById(packageId)!;
  if (updated.pricing.validationStatus !== "OK") {
    return { ok: true, warning: updated.pricing.validationNote ?? "Pricing flagged for review." };
  }
  return { ok: true };
}

export function setPackageStatus(packageId: string, status: Package["status"]): void {
  store.packageStatus.set(packageId, status);
}

export function addOperatorPackage(pkg: Package): void {
  store.newPackages.push(pkg);
}

export function getPricingAudit(packageId: string): PricingOverride | null {
  return store.pricing.get(packageId) ?? null;
}

/* ── Operators ────────────────────────────────────────────────────────────── */

export function getLiveOperators(): Operator[] {
  return seedOperators.map((operator) => {
    const status = store.verification.get(operator.id);
    if (!status) return operator;
    return { ...operator, verificationStatus: status, verified: status === "VERIFIED" };
  });
}

export function getLiveOperatorById(id: string): Operator | null {
  return getLiveOperators().find((o) => o.id === id) ?? null;
}

export function setOperatorVerification(id: string, status: VerificationStatus): void {
  store.verification.set(id, status);
}
