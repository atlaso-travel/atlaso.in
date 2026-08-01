import { NextResponse } from "next/server";
import {
  markBookingPaid,
  markBookingFailed,
  verifyWebhookSignature,
  getBookingByOrderId,
} from "@/server/bookings";
import { getRazorpayConfig } from "@/server/razorpay";
import { sendCustomerConfirmation, sendOperatorNotification } from "@/server/email";
import { operatorById } from "@/data/operators";

export const runtime = "nodejs";
/** Razorpay signs the raw bytes — the body must never be parsed before verifying. */
export const dynamic = "force-dynamic";

/**
 * The authoritative confirmation path.
 *
 * The browser callback can be closed, blocked or spoofed; this cannot. A booking
 * is only truly confirmed once Razorpay tells us server-to-server. Always returns
 * 200 on a signature-valid event, even for unknown orders, so Razorpay does not
 * retry forever on something we will never recognise.
 */
export async function POST(request: Request) {
  const config = getRazorpayConfig();
  if (!config?.webhookSecret) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not set — rejecting.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature, config.webhookSecret)) {
    console.warn("[webhook] signature mismatch — dropping event.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  const orderId = entity?.order_id;
  const paymentId = entity?.id;

  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  switch (event.event) {
    case "payment.captured":
    case "order.paid": {
      const existing = await getBookingByOrderId(orderId);
      const alreadyPaid = existing?.paymentStatus === "PAID";
      const booking = await markBookingPaid(orderId, paymentId ?? "");

      if (booking && !alreadyPaid) {
        const operatorEmail = operatorById[booking.operatorId]?.contactEmail;
        await Promise.all([
          sendCustomerConfirmation(booking),
          operatorEmail
            ? sendOperatorNotification(booking, operatorEmail)
            : Promise.resolve(),
        ]);
      }
      break;
    }
    case "payment.failed":
      await markBookingFailed(orderId);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
