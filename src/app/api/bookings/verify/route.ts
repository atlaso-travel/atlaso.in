import { NextResponse } from "next/server";
import {
  getBookingByOrderId,
  markBookingPaid,
  markBookingFailed,
  verifyPaymentSignature,
} from "@/server/bookings";
import { getRazorpayConfig } from "@/server/razorpay";
import { sendCustomerConfirmation, sendOperatorNotification } from "@/server/email";
import { operatorById } from "@/data/operators";

export const runtime = "nodejs";

/**
 * Called by the browser immediately after Razorpay Checkout succeeds, so the
 * customer sees a confirmed page without waiting on the webhook.
 *
 * This is a convenience path, not the source of truth — the signature is still
 * verified server-side with the key secret, and the webhook independently
 * confirms the same booking. `markBookingPaid` is idempotent, so whichever
 * arrives second does nothing.
 */
export async function POST(request: Request) {
  const config = getRazorpayConfig();
  if (!config) {
    return NextResponse.json({ error: "Payments not configured." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Incomplete payment response." }, { status: 400 });
  }

  const booking = await getBookingByOrderId(orderId);
  if (!booking) {
    return NextResponse.json({ error: "Unknown booking." }, { status: 404 });
  }

  if (!verifyPaymentSignature(orderId, paymentId, signature, config.keySecret)) {
    await markBookingFailed(orderId);
    console.warn(`[payments] signature mismatch for order ${orderId}`);
    return NextResponse.json(
      { error: "We could not verify that payment. Please contact support." },
      { status: 400 }
    );
  }

  const alreadyPaid = booking.paymentStatus === "PAID";
  const confirmed = await markBookingPaid(orderId, paymentId);
  if (!confirmed) {
    return NextResponse.json({ error: "Unknown booking." }, { status: 404 });
  }

  if (!alreadyPaid) {
    const operatorEmail = operatorById[confirmed.operatorId]?.contactEmail;
    await Promise.all([
      sendCustomerConfirmation(confirmed),
      operatorEmail ? sendOperatorNotification(confirmed, operatorEmail) : Promise.resolve(),
    ]);
  }

  return NextResponse.json({ reference: confirmed.reference, status: confirmed.status });
}
