/**
 * Placeholder pricing engine.
 *
 * This mirrors the `MarginRule` + `PackagePricing` tables described in PLAN.md so
 * that migrating to Postgres is a data move, not a rewrite. Field names and shapes
 * here are the ones the Prisma models will use.
 *
 * MONEY UNITS
 * -----------
 * Everything in `src/data/*` is in **whole rupees** (INR), matching the existing
 * `price` field and `formatPrice()` in src/lib/utils.ts. The database will store
 * **paise** (integer, ×100) to keep GST and partial refunds exact. The seed script
 * does that multiplication; do not mix units inside this folder.
 *
 * Margin is never hardcoded per package. Every platform price on every package is
 * produced by `computePricing()` at module load, resolving against `marginRules`
 * below — the same resolution order the admin panel will edit later.
 */

export type MarginStrategy =
  /** Cost-plus: margin is a percentage of b2bCost. Ignores retail. */
  | "PERCENT"
  /** Cost-plus: a fixed rupee margin. Ignores retail. */
  | "FLAT"
  /** Cost-plus: the smaller of the percent and the flat amount. Ignores retail. */
  | "MIN_OF_PERCENT_AND_FLAT"
  /**
   * Discount-split: take `splitBps` of the gap between b2bCost and retailPrice,
   * capped at `flatAmount` and floored at `minMargin`. Unlike the cost-plus
   * strategies this is aware of retail, so the customer's saving scales with how
   * good a deal the operator actually gave us. This is the model the brief's own
   * worked example describes (₹8,000 cost, ₹10,000 retail, ₹9,000 platform = an
   * even split of the ₹2,000 discount).
   */
  | "SPLIT_DISCOUNT"
  /** An absolute platform price set by hand from admin. */
  | "MANUAL_OVERRIDE";

export type MarginRuleScope =
  | "GLOBAL"
  | "DESTINATION"
  | "OPERATOR"
  | "OPERATOR_DESTINATION"
  | "PACKAGE";

export interface MarginRule {
  id: string;
  scope: MarginRuleScope;
  operatorId: string | null;
  destinationId: string | null;
  packageId: string | null;
  strategy: MarginStrategy;
  /** Basis points of b2bCost. 2000 = 20.00%. Null unless strategy uses percent. */
  percentBps: number | null;
  /**
   * Basis points of the (retailPrice − b2bCost) discount that Atlaso keeps.
   * 5000 = an even split with the customer. Only used by SPLIT_DISCOUNT.
   */
  splitBps: number | null;
  /**
   * For FLAT: the margin in rupees.
   * For MIN_OF_PERCENT_AND_FLAT / SPLIT_DISCOUNT: the margin cap in rupees.
   * For MANUAL_OVERRIDE: the absolute platform price in rupees.
   */
  flatAmount: number | null;
  /** Hard floor on margin, in rupees. Below this the package is flagged. */
  minMargin: number;
  /** Higher wins when two rules share the same scope. */
  priority: number;
  active: boolean;
  note: string;
}

/**
 * Seeded rules.
 *
 * NOTE ON THE DEFAULT — the brief suggested `min(20% of b2b_cost, ₹1,500)` as a
 * starting default, but also gave a worked example (₹8,000 cost → ₹9,000 platform
 * → ₹10,000 retail) that the formula does not reproduce: min(20% × 8,000, 1,500)
 * = ₹1,500, giving ₹9,500, not ₹9,000.
 *
 * The two describe different models. The formula is cost-plus and ignores retail,
 * so on low-ticket packages it swallows almost the whole operator discount — with
 * it enabled, the cheapest Coorg package showed a saving of ₹100 on ₹7,999, which
 * makes the headline "you save ₹X" proposition worthless exactly where volume is
 * highest. The worked example is a discount split and behaves sensibly at every
 * price point.
 *
 * The GLOBAL default below therefore implements the worked example: an even split
 * of the operator discount, floored at ₹500 and capped at ₹1,500. To revert to the
 * literal formula, set strategy back to MIN_OF_PERCENT_AND_FLAT with percentBps
 * 2000 — the engine still supports it and two rules below still use cost-plus.
 * This is a business decision and belongs in the admin panel, not in code.
 */
export const marginRules: MarginRule[] = [
  {
    id: "rule-global-default",
    scope: "GLOBAL",
    operatorId: null,
    destinationId: null,
    packageId: null,
    strategy: "SPLIT_DISCOUNT",
    percentBps: null,
    splitBps: 5000,
    flatAmount: 1500,
    minMargin: 500,
    priority: 0,
    active: true,
    note:
      "Platform default: keep half the operator discount, min ₹500, max ₹1,500. " +
      "Reproduces the worked example — ₹8,000 cost against ₹10,000 retail prices at ₹8,999.",
  },
  {
    id: "rule-dest-rishikesh",
    scope: "DESTINATION",
    operatorId: null,
    destinationId: "rishikesh",
    packageId: null,
    strategy: "SPLIT_DISCOUNT",
    percentBps: null,
    splitBps: 4000,
    flatAmount: 900,
    minMargin: 300,
    priority: 10,
    active: true,
    note: "Short high-volume weekend trips — take less of the discount to stay price-competitive.",
  },
  {
    id: "rule-dest-jaisalmer",
    scope: "DESTINATION",
    operatorId: null,
    destinationId: "jaisalmer",
    packageId: null,
    strategy: "SPLIT_DISCOUNT",
    percentBps: null,
    splitBps: 4500,
    flatAmount: 1200,
    minMargin: 400,
    priority: 10,
    active: true,
    note: "New destination — reduced margin while building supply.",
  },
  {
    id: "rule-op-zenith",
    scope: "OPERATOR",
    operatorId: "zenith-expeditions",
    destinationId: null,
    packageId: null,
    strategy: "FLAT",
    percentBps: null,
    splitBps: null,
    flatAmount: 2200,
    minMargin: 1000,
    priority: 20,
    active: true,
    note: "Premium operator, high ticket size — negotiated flat ₹2,200 per booking.",
  },
  {
    id: "rule-op-dest-journey-masters-leh",
    scope: "OPERATOR_DESTINATION",
    operatorId: "journey-masters",
    destinationId: "leh-ladakh",
    packageId: null,
    strategy: "MIN_OF_PERCENT_AND_FLAT",
    percentBps: 2500,
    splitBps: null,
    flatAmount: 2000,
    minMargin: 800,
    priority: 30,
    active: true,
    note: "Strong conversion on this pairing — cost-plus markup agreed with the operator.",
  },
  {
    id: "rule-pkg-trailblazers-rishikesh-promo",
    scope: "PACKAGE",
    operatorId: "trailblazers",
    destinationId: "rishikesh",
    packageId: "trailblazers-rishikesh-3d",
    strategy: "MANUAL_OVERRIDE",
    percentBps: null,
    splitBps: null,
    flatAmount: 5399,
    minMargin: 500,
    priority: 40,
    active: true,
    note:
      "Manual promo price for the student segment. Deliberately breaches the ₹500 " +
      "margin floor so the validation path and the admin flag queue have a real case.",
  },
];

export type PricingValidationStatus =
  | "OK"
  | "BELOW_MIN_MARGIN"
  | "ABOVE_RETAIL"
  | "INVERTED";

export interface PackagePricing {
  currency: "INR";
  /** What the operator charges a walk-in customer directly. */
  retailPrice: number;
  /** What the operator charges Atlaso. Never exposed to a customer surface. */
  b2bCost: number;
  /** Server-computed. The only price a customer may ever be shown. */
  platformPrice: number;
  /** platformPrice − b2bCost. Never exposed to a customer surface. */
  marginAmount: number;
  /** Margin as a percentage of b2bCost, 1dp. Internal. */
  marginPct: number;
  /** retailPrice − platformPrice. This is the "you save ₹X" number. */
  savings: number;
  /** Savings as a percentage of retailPrice, rounded. */
  savingsPct: number;
  appliedMarginRuleId: string;
  validationStatus: PricingValidationStatus;
  validationNote: string | null;
}

const SCOPE_SPECIFICITY: Record<MarginRuleScope, number> = {
  PACKAGE: 5,
  OPERATOR_DESTINATION: 4,
  OPERATOR: 3,
  DESTINATION: 2,
  GLOBAL: 1,
};

export interface PricingSubject {
  packageId: string;
  operatorId: string;
  destinationId: string;
}

function ruleMatches(rule: MarginRule, subject: PricingSubject): boolean {
  if (!rule.active) return false;
  if (rule.packageId && rule.packageId !== subject.packageId) return false;
  if (rule.operatorId && rule.operatorId !== subject.operatorId) return false;
  if (rule.destinationId && rule.destinationId !== subject.destinationId) return false;
  return true;
}

/**
 * Most specific rule wins: PACKAGE → OPERATOR_DESTINATION → OPERATOR → DESTINATION
 * → GLOBAL, with `priority` breaking ties inside a scope.
 */
export function resolveMarginRule(
  subject: PricingSubject,
  /** Defaults to the seeded rules. The admin panel passes its live, edited set. */
  rules: MarginRule[] = marginRules
): MarginRule {
  const matches = rules.filter((r) => ruleMatches(r, subject));
  if (matches.length === 0) {
    throw new Error(
      `No margin rule matched package "${subject.packageId}". A GLOBAL rule must always exist.`
    );
  }
  return matches.sort((a, b) => {
    const bySpecificity =
      SCOPE_SPECIFICITY[b.scope] - SCOPE_SPECIFICITY[a.scope];
    return bySpecificity !== 0 ? bySpecificity : b.priority - a.priority;
  })[0];
}

/**
 * Indian travel pricing convention — ₹12,699 rather than ₹12,713. Applied to the
 * platform price only; retail and B2B are whatever the operator states.
 */
function roundToPsychologicalPrice(amount: number): number {
  return Math.round(amount / 100) * 100 - 1;
}

export function computePricing(
  subject: PricingSubject,
  retailPrice: number,
  b2bCost: number,
  rules: MarginRule[] = marginRules
): PackagePricing {
  const rule = resolveMarginRule(subject, rules);

  let platformPrice: number;

  if (rule.strategy === "MANUAL_OVERRIDE") {
    // flatAmount is an absolute price here, not a margin.
    platformPrice = rule.flatAmount ?? b2bCost + rule.minMargin;
  } else {
    const percentMargin =
      rule.percentBps != null ? (b2bCost * rule.percentBps) / 10_000 : Infinity;
    const flatMargin = rule.flatAmount ?? Infinity;

    let targetMargin: number;
    switch (rule.strategy) {
      case "PERCENT":
        targetMargin = percentMargin;
        break;
      case "FLAT":
        targetMargin = flatMargin;
        break;
      case "MIN_OF_PERCENT_AND_FLAT":
        targetMargin = Math.min(percentMargin, flatMargin);
        break;
      case "SPLIT_DISCOUNT": {
        const discount = Math.max(retailPrice - b2bCost, 0);
        const share = (discount * (rule.splitBps ?? 5000)) / 10_000;
        targetMargin = Math.min(share, flatMargin);
        break;
      }
    }

    // The floor applies before rounding so a thin percent never silently
    // undercuts the minimum.
    const margin = Math.max(targetMargin, rule.minMargin);
    platformPrice = roundToPsychologicalPrice(b2bCost + margin);
  }

  const marginAmount = platformPrice - b2bCost;

  let validationStatus: PricingValidationStatus = "OK";
  let validationNote: string | null = null;

  if (b2bCost >= retailPrice) {
    validationStatus = "INVERTED";
    validationNote =
      `B2B cost (₹${b2bCost}) is not below the operator's retail price (₹${retailPrice}). ` +
      `Operator data is wrong — there is no margin to sell into.`;
  } else if (platformPrice >= retailPrice) {
    validationStatus = "ABOVE_RETAIL";
    validationNote =
      `Platform price (₹${platformPrice}) is not below retail (₹${retailPrice}). ` +
      `Showing this would destroy the savings proposition.`;
  } else if (marginAmount < rule.minMargin) {
    validationStatus = "BELOW_MIN_MARGIN";
    validationNote =
      `Margin ₹${marginAmount} is below the ₹${rule.minMargin} floor set by rule "${rule.id}".`;
  }

  return {
    currency: "INR",
    retailPrice,
    b2bCost,
    platformPrice,
    marginAmount,
    marginPct: Math.round((marginAmount / b2bCost) * 1000) / 10,
    savings: retailPrice - platformPrice,
    savingsPct: Math.round(((retailPrice - platformPrice) / retailPrice) * 100),
    appliedMarginRuleId: rule.id,
    validationStatus,
    validationNote,
  };
}

/**
 * A package whose pricing is not `OK` must not reach a customer surface. Search,
 * compare and destination listings will filter on this once they read from the DB.
 */
export function isSellable(pricing: PackagePricing): boolean {
  return pricing.validationStatus === "OK";
}

/**
 * The only pricing shape allowed to cross to the client. `b2bCost`, `marginAmount`
 * and `marginPct` are deliberately absent — margin data must never be sent to a
 * customer's browser.
 */
export interface PublicPrice {
  currency: "INR";
  platformPrice: number;
  retailPrice: number;
  savings: number;
  savingsPct: number;
}

export function toPublicPrice(pricing: PackagePricing): PublicPrice {
  return {
    currency: pricing.currency,
    platformPrice: pricing.platformPrice,
    retailPrice: pricing.retailPrice,
    savings: pricing.savings,
    savingsPct: pricing.savingsPct,
  };
}
