import { NextResponse } from "next/server";
import { createLead } from "@/server/bookings";
import { sendLeadAlert, sendLeadAcknowledgement } from "@/server/email";

export const runtime = "nodejs";

/**
 * The non-instant path. A large share of Indian travel buyers want to talk to
 * someone before paying, and forcing everyone through checkout loses them.
 *
 * Rate limiting is deliberately absent for now — it needs Upstash, which needs
 * credentials. Before this is public, add it here; a public form with an email
 * side effect is an obvious abuse target.
 */

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Honeypot — real users never fill a hidden field.
  if (str(body.company)) {
    return NextResponse.json({ reference: "LEAD-OK" });
  }

  const name = str(body.name);
  const phone = str(body.phone);
  const email = str(body.email);

  if (name.length < 2) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (!PHONE.test(phone.replace(/\s/g, ""))) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 }
    );
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const count = Number(body.travellerCount);

  try {
    const lead = await createLead({
      packageId: str(body.packageId) || null,
      destinationId: str(body.destinationId) || null,
      name,
      phone,
      email,
      travelDate: str(body.travelDate) || null,
      travellerCount: Number.isFinite(count) && count > 0 ? Math.floor(count) : null,
      budgetRange: str(body.budgetRange) || null,
      message: str(body.message),
      source: str(body.source) || "package-page",
    });

    await Promise.all([sendLeadAlert(lead), sendLeadAcknowledgement(lead)]);

    return NextResponse.json({ reference: lead.reference });
  } catch (error) {
    console.error("[leads] create failed:", error);
    return NextResponse.json(
      { error: "We could not send that. Please try again." },
      { status: 500 }
    );
  }
}
