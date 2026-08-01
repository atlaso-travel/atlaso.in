"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, loginAdmin, logout } from "@/server/auth";
import {
  setOperatorVerification,
  setPackageStatus,
  upsertMarginRule,
  deleteMarginRule,
  setMarginRuleActive,
  getLiveMarginRules,
} from "@/server/overrides";
import { markPayoutPaid } from "@/server/bookings";
import type { MarginRule, MarginRuleScope, MarginStrategy } from "@/data/pricing";
import type { VerificationStatus } from "@/data/operators";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function adminLoginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = await loginAdmin(
    String(formData.get("email") ?? ""),
    String(formData.get("password") ?? "")
  );
  if (!result.ok) return { error: result.error };
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await logout();
  redirect("/admin/login");
}

async function requireAdmin(): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");
}

/* ── Operator verification ────────────────────────────────────────────────── */

export async function setVerificationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const operatorId = String(formData.get("operatorId") ?? "");
  const status = String(formData.get("status") ?? "") as VerificationStatus;
  if (!["PENDING", "VERIFIED", "SUSPENDED", "REJECTED"].includes(status)) return;

  setOperatorVerification(operatorId, status);
  revalidatePath("/admin/operators");
  revalidatePath("/search");
  revalidatePath("/");
}

/* ── Pricing violations ───────────────────────────────────────────────────── */

/** Pull a flagged package off the public site until its pricing is fixed. */
export async function pausePackageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const packageId = String(formData.get("packageId") ?? "");
  const next = String(formData.get("next") ?? "PAUSED");
  setPackageStatus(packageId, next === "ACTIVE" ? "ACTIVE" : "PAUSED");
  revalidatePath("/admin");
  revalidatePath("/search");
}

/* ── Payouts ──────────────────────────────────────────────────────────────── */

export async function markPayoutPaidAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await markPayoutPaid(String(formData.get("reference") ?? ""));
  revalidatePath("/admin");
}

/* ── Margin rules ─────────────────────────────────────────────────────────── */

const SCOPES: MarginRuleScope[] = [
  "GLOBAL", "DESTINATION", "OPERATOR", "OPERATOR_DESTINATION", "PACKAGE",
];
const STRATEGIES: MarginStrategy[] = [
  "PERCENT", "FLAT", "MIN_OF_PERCENT_AND_FLAT", "SPLIT_DISCOUNT", "MANUAL_OVERRIDE",
];

/**
 * The whole point of the rule table: margin strategy is a business decision that
 * changes as the business learns, so it is edited here rather than in code.
 * Saving a rule re-prices every affected package on the next request.
 */
export async function saveMarginRuleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const scope = String(formData.get("scope") ?? "") as MarginRuleScope;
  const strategy = String(formData.get("strategy") ?? "") as MarginStrategy;

  if (!id || !/^[a-z0-9-]+$/.test(id)) {
    return { error: "Rule id must be lowercase letters, numbers and hyphens." };
  }
  if (!SCOPES.includes(scope)) return { error: "Pick a scope." };
  if (!STRATEGIES.includes(strategy)) return { error: "Pick a strategy." };

  const operatorId = String(formData.get("operatorId") ?? "").trim() || null;
  const destinationId = String(formData.get("destinationId") ?? "").trim() || null;
  const packageId = String(formData.get("packageId") ?? "").trim() || null;

  if ((scope === "OPERATOR" || scope === "OPERATOR_DESTINATION") && !operatorId) {
    return { error: "That scope needs an operator." };
  }
  if ((scope === "DESTINATION" || scope === "OPERATOR_DESTINATION") && !destinationId) {
    return { error: "That scope needs a destination." };
  }
  if (scope === "PACKAGE" && !packageId) {
    return { error: "That scope needs a package id." };
  }

  const num = (key: string): number | null => {
    const raw = String(formData.get(key) ?? "").trim();
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  };

  const percentBps = num("percentBps");
  const splitBps = num("splitBps");
  const flatAmount = num("flatAmount");
  const minMargin = num("minMargin") ?? 0;

  if (strategy === "PERCENT" && percentBps == null) {
    return { error: "A percent rule needs a basis-point value (2000 = 20%)." };
  }
  if (strategy === "SPLIT_DISCOUNT" && splitBps == null) {
    return { error: "A split rule needs a split in basis points (5000 = half)." };
  }
  if ((strategy === "FLAT" || strategy === "MANUAL_OVERRIDE") && flatAmount == null) {
    return { error: "That strategy needs a rupee amount." };
  }
  if (strategy === "MIN_OF_PERCENT_AND_FLAT" && (percentBps == null || flatAmount == null)) {
    return { error: "That strategy needs both a percentage and a cap." };
  }
  if (minMargin < 0) return { error: "The margin floor cannot be negative." };

  const rule: MarginRule = {
    id,
    scope,
    operatorId: scope === "GLOBAL" || scope === "DESTINATION" ? null : operatorId,
    destinationId: scope === "GLOBAL" || scope === "OPERATOR" ? null : destinationId,
    packageId: scope === "PACKAGE" ? packageId : null,
    strategy,
    percentBps,
    splitBps,
    flatAmount,
    minMargin,
    priority: num("priority") ?? 0,
    active: formData.get("active") === "on",
    note: String(formData.get("note") ?? "").trim() || "Set from admin.",
  };

  upsertMarginRule(rule);
  revalidatePath("/admin/margins");
  revalidatePath("/admin");
  revalidatePath("/search");
  return { success: `Rule "${id}" saved. Affected packages are already repriced.` };
}

export async function toggleMarginRuleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const current = getLiveMarginRules().find((r) => r.id === id);
  if (!current) return;
  setMarginRuleActive(id, !current.active);
  revalidatePath("/admin/margins");
  revalidatePath("/search");
}

export async function deleteMarginRuleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === "rule-global-default") return; // A GLOBAL fallback must always exist.
  deleteMarginRule(id);
  revalidatePath("/admin/margins");
  revalidatePath("/search");
}
