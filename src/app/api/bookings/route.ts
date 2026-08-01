import { NextResponse } from "next/server";
import {
  createPendingBooking,
  attachRazorpayOrder,
  BookingError,
  type Traveller,
} from "@/server/bookings";
import {
  createRazorpayOrder,
  getRazorpayConfig,
  isPaymentsConfigured,
} from "@/server/razorpay";

export const runtime = "nodejs";

/**
 * Creates a PENDING booking with a frozen price snapshot, then opens a Razorpay
 * order for it.
 *
 * The amount sent to Razorpay is derived server-side from the snapshot — the
 * client sends a package id and a traveller count, never a price. A tampered
 * request cannot change what is charged.
 */

interface Body {
  packageId?: unknown;
  departureId?: unknown;
  startDate?: unknown;
  travellerCount?: unknown;
  travellers?: unknown;
  contactName?: unknown;
  contactEmail?: unknown;
  contactPhone?: unknown;
  notes?: unknown;
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

function parseTravellers(value: unknown, expected: number): Traveller[] | null {
  if (!Array.isArray(value) || value.length !== expected) return null;
  const out: Traveller[] = [];
  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) return null;
    const t = raw as Record<string, unknown>;
    const fullName = str(t.fullName);
    const age = Number(t.age);
    if (fullName.length < 2 || !Number.isFinite(age) || age < 1 || age > 110) return null;
    out.push({ fullName, age: Math.floor(age) });
  }
  return out;
}

export async function POST(request: Request) {
  if (!isPaymentsConfigured()) {
    return NextResponse.json(
      {
        error:
          "Payments are not configured yet. Add Razorpay test keys to enable checkout.",
        code: "PAYMENTS_UNCONFIGURED",
      },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const packageId = str(body.packageId);
  const contactName = str(body.contactName);
  const contactEmail = str(body.contactEmail);
  const contactPhone = str(body.contactPhone);
  const travellerCount = Number(body.travellerCount);

  if (!packageId) {
    return NextResponse.json({ error: "Pick a package first." }, { status: 400 });
  }
  if (contactName.length < 2) {
    return NextResponse.json({ error: "Enter the lead traveller's name." }, { status: 400 });
  }
  if (!EMAIL.test(contactEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!PHONE.test(contactPhone.replace(/\s/g, ""))) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 }
    );
  }
  if (!Number.isInteger(travellerCount) || travellerCount < 1) {
    return NextResponse.json({ error: "Choose how many people are travelling." }, { status: 400 });
  }

  const travellers = parseTravellers(body.travellers, travellerCount);
  if (!travellers) {
    return NextResponse.json(
      { error: "Enter a name and age for every traveller." },
      { status: 400 }
    );
  }

  try {
    const booking = await createPendingBooking({
      packageId,
      departureId: str(body.departureId) || null,
      startDate: str(body.startDate),
      travellerCount,
      travellers,
      contactName,
      contactEmail,
      contactPhone,
      notes: str(body.notes),
    });

    const order = await createRazorpayOrder({
      amountRupees: booking.totalAmount,
      receipt: booking.reference,
      notes: {
        bookingReference: booking.reference,
        packageId: booking.packageId,
        operatorId: booking.operatorId,
      },
    });

    await attachRazorpayOrder(booking.id, order.id);

    const config = getRazorpayConfig()!;
    return NextResponse.json({
      reference: booking.reference,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.keyId,
      packageTitle: booking.packageTitle,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
    });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    console.error("[bookings] create failed:", error);
    return NextResponse.json(
      { error: "We could not start this booking. Nothing has been charged." },
      { status: 500 }
    );
  }
}
