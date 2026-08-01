/**
 * Booking + lead store. SERVER ONLY.
 *
 * ⚠ IN-MEMORY. Bookings and leads live in the Node process and are lost on
 * restart or redeploy. This is the one part of Phase 3 that genuinely needs the
 * database, so the storage is isolated behind this module: when DATABASE_URL
 * arrives, replace the four `store.*` maps with Prisma calls and nothing else in
 * the app changes. Every function is already async for that reason.
 *
 * The price snapshot is the important part and is NOT provisional. At the moment
 * a booking is created we freeze retail, B2B cost, platform price and margin onto
 * the booking row. Historic bookings are never recomputed, so changing a margin
 * rule later cannot alter what a customer was charged or what an operator is owed.
 */

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { packageById } from "@/data/packages";
import { operatorById } from "@/data/operators";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
export type PayoutStatus = "PENDING" | "SCHEDULED" | "PAID";
export type LeadStatus = "NEW" | "CONTACTED" | "QUOTED" | "CONVERTED" | "LOST";

export interface Traveller {
  fullName: string;
  age: number;
}

export interface Booking {
  id: string;
  reference: string;

  packageId: string;
  packageTitle: string;
  operatorId: string;
  operatorName: string;
  destinationId: string;
  departureId: string | null;
  startDate: string;

  travellerCount: number;
  travellers: Traveller[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;

  /* ── Frozen at creation. Never recomputed. ── */
  snapshotRetailPrice: number;
  snapshotB2bCost: number;
  snapshotPlatformPrice: number;
  snapshotMarginPerTraveller: number;
  snapshotMarginRuleId: string;
  /** platformPrice × travellerCount */
  totalAmount: number;
  /** What the operator is owed: b2bCost × travellerCount */
  operatorPayable: number;
  /** What Atlaso keeps. */
  platformMargin: number;
  /** retailPrice × travellerCount − totalAmount */
  customerSavings: number;
  currency: "INR";

  status: BookingStatus;
  paymentStatus: PaymentStatus;
  payoutStatus: PayoutStatus;

  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;

  createdAt: string;
  confirmedAt: string | null;
}

export interface Lead {
  id: string;
  reference: string;
  packageId: string | null;
  packageTitle: string | null;
  destinationId: string | null;
  name: string;
  phone: string;
  email: string;
  travelDate: string | null;
  travellerCount: number | null;
  budgetRange: string | null;
  message: string;
  status: LeadStatus;
  source: string;
  createdAt: string;
}

/* HMR-safe singleton — Next reloads modules in dev and would otherwise drop
   every booking between requests. */
const globalStore = globalThis as unknown as {
  __atlasoStore?: {
    bookings: Map<string, Booking>;
    byReference: Map<string, string>;
    byOrderId: Map<string, string>;
    leads: Map<string, Lead>;
  };
};

const store =
  globalStore.__atlasoStore ??
  (globalStore.__atlasoStore = {
    bookings: new Map(),
    byReference: new Map(),
    byOrderId: new Map(),
    leads: new Map(),
  });

/** ATL-XXXXXX — short enough to read down a phone line. */
function makeReference(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = randomUUID().replace(/-/g, "");
  for (let i = 0; i < 6; i++) {
    out += alphabet[parseInt(bytes.slice(i * 2, i * 2 + 2), 16) % alphabet.length];
  }
  return `${prefix}-${out}`;
}

export interface CreateBookingInput {
  packageId: string;
  departureId: string | null;
  startDate: string;
  travellerCount: number;
  travellers: Traveller[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes?: string;
}

export class BookingError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
  }
}

export async function createPendingBooking(input: CreateBookingInput): Promise<Booking> {
  const pkg = packageById[input.packageId];
  if (!pkg) throw new BookingError("That package does not exist.", "PACKAGE_NOT_FOUND");

  if (pkg.status !== "ACTIVE") {
    throw new BookingError("That package is not currently on sale.", "PACKAGE_INACTIVE");
  }

  const validation = pkg.pricing.validationStatus;
  if (validation === "ABOVE_RETAIL" || validation === "INVERTED") {
    throw new BookingError(
      "This package is being repriced and cannot be booked right now.",
      "PRICING_INVALID"
    );
  }

  if (input.travellerCount < 1 || input.travellerCount > pkg.groupSizeMax) {
    throw new BookingError(
      `This trip takes between 1 and ${pkg.groupSizeMax} travellers.`,
      "INVALID_TRAVELLER_COUNT"
    );
  }

  const departure = input.departureId
    ? pkg.departures.find((d) => d.id === input.departureId)
    : null;

  if (input.departureId && !departure) {
    throw new BookingError("That departure date is no longer listed.", "DEPARTURE_NOT_FOUND");
  }

  if (departure) {
    const seatsLeft = departure.seatsTotal - departure.seatsBooked;
    if (seatsLeft < input.travellerCount) {
      throw new BookingError(
        seatsLeft === 0
          ? "That departure is now full."
          : `Only ${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left on that departure.`,
        "INSUFFICIENT_SEATS"
      );
    }
  }

  const operator = operatorById[pkg.operatorId];
  const p = pkg.pricing;
  const count = input.travellerCount;

  const booking: Booking = {
    id: randomUUID(),
    reference: makeReference("ATL"),

    packageId: pkg.id,
    packageTitle: pkg.title,
    operatorId: pkg.operatorId,
    operatorName: operator?.name ?? pkg.operatorName,
    destinationId: pkg.destinationId,
    departureId: departure?.id ?? null,
    startDate: departure?.startDate ?? input.startDate,

    travellerCount: count,
    travellers: input.travellers,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    notes: input.notes ?? "",

    snapshotRetailPrice: p.retailPrice,
    snapshotB2bCost: p.b2bCost,
    snapshotPlatformPrice: p.platformPrice,
    snapshotMarginPerTraveller: p.marginAmount,
    snapshotMarginRuleId: p.appliedMarginRuleId,
    totalAmount: p.platformPrice * count,
    operatorPayable: p.b2bCost * count,
    platformMargin: p.marginAmount * count,
    customerSavings: p.savings * count,
    currency: "INR",

    status: "PENDING",
    paymentStatus: "UNPAID",
    payoutStatus: "PENDING",

    razorpayOrderId: null,
    razorpayPaymentId: null,

    createdAt: new Date().toISOString(),
    confirmedAt: null,
  };

  store.bookings.set(booking.id, booking);
  store.byReference.set(booking.reference, booking.id);
  return booking;
}

export async function attachRazorpayOrder(bookingId: string, orderId: string): Promise<void> {
  const booking = store.bookings.get(bookingId);
  if (!booking) return;
  booking.razorpayOrderId = orderId;
  store.byOrderId.set(orderId, bookingId);
}

export async function getBookingByReference(reference: string): Promise<Booking | null> {
  const id = store.byReference.get(reference);
  return id ? store.bookings.get(id) ?? null : null;
}

export async function getBookingByOrderId(orderId: string): Promise<Booking | null> {
  const id = store.byOrderId.get(orderId);
  return id ? store.bookings.get(id) ?? null : null;
}

/**
 * Idempotent — Razorpay retries webhooks, and the browser callback and the
 * webhook race each other. Whichever arrives first wins; the second is a no-op.
 */
export async function markBookingPaid(
  orderId: string,
  paymentId: string
): Promise<Booking | null> {
  const booking = await getBookingByOrderId(orderId);
  if (!booking) return null;
  if (booking.paymentStatus === "PAID") return booking;

  booking.paymentStatus = "PAID";
  booking.status = "CONFIRMED";
  booking.payoutStatus = "SCHEDULED";
  booking.razorpayPaymentId = paymentId;
  booking.confirmedAt = new Date().toISOString();
  return booking;
}

export async function markBookingFailed(orderId: string): Promise<Booking | null> {
  const booking = await getBookingByOrderId(orderId);
  if (!booking) return null;
  if (booking.paymentStatus === "PAID") return booking;
  booking.paymentStatus = "FAILED";
  return booking;
}

export async function listBookings(): Promise<Booking[]> {
  return [...store.bookings.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function listBookingsForOperator(operatorId: string): Promise<Booking[]> {
  return (await listBookings()).filter((b) => b.operatorId === operatorId);
}

export async function listLeads(): Promise<Lead[]> {
  return [...store.leads.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listLeadsForOperator(operatorId: string): Promise<Lead[]> {
  const packageIds = new Set(
    Object.values(packageById)
      .filter((p) => p.operatorId === operatorId)
      .map((p) => p.id)
  );
  return (await listLeads()).filter((l) => l.packageId && packageIds.has(l.packageId));
}

/** Marks a confirmed booking's payout as settled. Admin action. */
export async function markPayoutPaid(reference: string): Promise<Booking | null> {
  const booking = await getBookingByReference(reference);
  if (!booking || booking.paymentStatus !== "PAID") return null;
  booking.payoutStatus = "PAID";
  return booking;
}

/* ── Leads ────────────────────────────────────────────────────────────────── */

export interface CreateLeadInput {
  packageId?: string | null;
  destinationId?: string | null;
  name: string;
  phone: string;
  email: string;
  travelDate?: string | null;
  travellerCount?: number | null;
  budgetRange?: string | null;
  message?: string;
  source?: string;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const pkg = input.packageId ? packageById[input.packageId] : null;
  const lead: Lead = {
    id: randomUUID(),
    reference: makeReference("LEAD"),
    packageId: pkg?.id ?? null,
    packageTitle: pkg?.title ?? null,
    destinationId: input.destinationId ?? pkg?.destinationId ?? null,
    name: input.name,
    phone: input.phone,
    email: input.email,
    travelDate: input.travelDate ?? null,
    travellerCount: input.travellerCount ?? null,
    budgetRange: input.budgetRange ?? null,
    message: input.message ?? "",
    status: "NEW",
    source: input.source ?? "package-page",
    createdAt: new Date().toISOString(),
  };
  store.leads.set(lead.id, lead);
  return lead;
}

/* ── Signature helpers ────────────────────────────────────────────────────── */

/** Constant-time compare so a signature check cannot be timed. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Razorpay checkout callback: HMAC-SHA256 of "orderId|paymentId" with the key secret. */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  const expected = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqual(expected, signature);
}

/** Webhook: HMAC-SHA256 of the RAW request body with the webhook secret. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
