"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, loginOperator, logout } from "@/server/auth";
import {
  updatePackagePricing,
  setPackageStatus,
  addOperatorPackage,
  getLivePackageById,
} from "@/server/overrides";
import { computePricing } from "@/data/pricing";
import { getLiveMarginRules } from "@/server/overrides";
import { operatorById } from "@/data/operators";
import type { Package } from "@/data/packages";

export interface ActionState {
  error?: string;
  success?: string;
  warning?: string;
}

/* ── Auth ─────────────────────────────────────────────────────────────────── */

export async function operatorLoginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await loginOperator(email, password);
  if (!result.ok) return { error: result.error };
  redirect("/operator");
}

export async function operatorLogoutAction(): Promise<void> {
  await logout();
  redirect("/operator/login");
}

/* ── Guard ────────────────────────────────────────────────────────────────── */

async function requireOperator(): Promise<string> {
  const session = await getSession();
  if (!session || session.role !== "operator") redirect("/operator/login");
  return session.subject;
}

/* ── Pricing ──────────────────────────────────────────────────────────────── */

/**
 * Both numbers are required. The retail price is what the operator charges a
 * walk-in; the Atlaso rate is what they charge us. The platform price the
 * customer sees is derived from the second by the margin engine — operators
 * never set it, and never see it here.
 */
export async function updatePricingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const operatorId = await requireOperator();
  const packageId = String(formData.get("packageId") ?? "");

  const pkg = getLivePackageById(packageId);
  if (!pkg || pkg.operatorId !== operatorId) {
    return { error: "That package is not yours to edit." };
  }

  const result = updatePackagePricing(
    packageId,
    Number(formData.get("retailPrice")),
    Number(formData.get("b2bCost")),
    operatorId
  );

  if (!result.ok) return { error: result.error };

  revalidatePath("/operator/packages");
  revalidatePath(`/packages/${pkg.slug}`);
  revalidatePath("/search");

  return result.warning
    ? { success: "Pricing saved.", warning: result.warning }
    : { success: "Pricing saved. Your listing is updated." };
}

export async function togglePackageStatusAction(formData: FormData): Promise<void> {
  const operatorId = await requireOperator();
  const packageId = String(formData.get("packageId") ?? "");
  const pkg = getLivePackageById(packageId);
  if (!pkg || pkg.operatorId !== operatorId) return;

  setPackageStatus(packageId, pkg.status === "ACTIVE" ? "PAUSED" : "ACTIVE");
  revalidatePath("/operator/packages");
  revalidatePath("/search");
}

/* ── New package ──────────────────────────────────────────────────────────── */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createPackageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const operatorId = await requireOperator();
  const operator = operatorById[operatorId];
  if (!operator) return { error: "Operator not found." };

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const destinationId = String(formData.get("destinationId") ?? "");
  const durationDays = Number(formData.get("durationDays"));
  const groupSizeMax = Number(formData.get("groupSizeMax"));
  const retailPrice = Number(formData.get("retailPrice"));
  const b2bCost = Number(formData.get("b2bCost"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (title.length < 6) return { error: "Give the trip a descriptive title." };
  if (summary.length < 20) return { error: "Write a one-line summary of at least 20 characters." };
  if (!destinationId) return { error: "Choose a destination." };
  if (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 30) {
    return { error: "Duration must be between 1 and 30 days." };
  }
  if (!Number.isFinite(groupSizeMax) || groupSizeMax < 1 || groupSizeMax > 60) {
    return { error: "Maximum group size must be between 1 and 60." };
  }
  if (!Number.isFinite(retailPrice) || retailPrice <= 0) {
    return { error: "Enter your normal direct price." };
  }
  if (!Number.isFinite(b2bCost) || b2bCost <= 0) {
    return { error: "Enter the rate you are offering Atlaso." };
  }
  if (b2bCost >= retailPrice) {
    return {
      error:
        "Your Atlaso rate must be below your direct price — otherwise there is no saving to offer a customer.",
    };
  }
  if (imageUrl && !/^https:\/\/images\.unsplash\.com\//.test(imageUrl)) {
    return { error: "Image must be an https://images.unsplash.com/ URL for now." };
  }

  const id = `${operatorId}-${slugify(title)}`;
  if (getLivePackageById(id)) {
    return { error: "You already have a package with that name." };
  }

  const pricing = computePricing(
    { packageId: id, operatorId, destinationId },
    Math.round(retailPrice),
    Math.round(b2bCost),
    getLiveMarginRules()
  );

  const fallbackImage =
    "https://images.unsplash.com/photo-1653844573020-71f77a0ccb8c?w=800&q=80";

  const pkg: Package = {
    id,
    slug: id,
    isDemoData: false,
    // Operator submissions are not published until Atlaso reviews them.
    status: "PENDING_REVIEW",
    publishedAt: new Date().toISOString().slice(0, 10),

    operatorId,
    operatorName: operator.name,
    operatorVerified: operator.verified,
    operatorRating: operator.rating,
    operatorReviews: operator.reviewCount,
    destinationId,

    title,
    summary,
    highlights: [],
    tags: [],
    images: [imageUrl || fallbackImage],
    inclusions: String(formData.get("inclusions") ?? "")
      .split("\n").map((s) => s.trim()).filter(Boolean),
    exclusions: String(formData.get("exclusions") ?? "")
      .split("\n").map((s) => s.trim()).filter(Boolean),
    itinerary: [],

    duration: `${durationDays} Days / ${Math.max(durationDays - 1, 0)} Nights`,
    durationDays,
    nights: Math.max(durationDays - 1, 0),
    groupSize: `Max ${groupSizeMax}`,
    groupSizeMin: 1,
    groupSizeMax,
    difficulty: String(formData.get("difficulty") ?? "Moderate"),
    minAge: 12,
    hotelType: String(formData.get("hotelType") ?? "").trim() || "Not specified",
    mealsIncluded: formData.get("mealsIncluded") === "on",
    guideIncluded: formData.get("guideIncluded") === "on",
    transportIncluded: formData.get("transportIncluded") === "on",
    pickupPoint: String(formData.get("pickupPoint") ?? "").trim() || "To be confirmed",
    dropPoint: String(formData.get("dropPoint") ?? "").trim() || "To be confirmed",
    cancellationPolicy: "Free cancellation until 7 days before",
    cancellationPolicyId: "flexible-7d",

    price: Math.round(retailPrice),
    pricing,

    reviews: [],
    packageRating: operator.rating,
    packageReviewCount: 0,
    bookingsLast30d: 0,
    departures: [],
  };

  addOperatorPackage(pkg);
  revalidatePath("/operator/packages");
  redirect("/operator/packages?created=1");
}
