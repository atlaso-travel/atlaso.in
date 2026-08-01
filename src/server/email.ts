/**
 * Transactional email via Resend. SERVER ONLY.
 *
 * Uses the REST API directly — three templates do not justify a dependency.
 *
 * When RESEND_API_KEY is absent every send becomes a no-op that logs what it
 * would have sent. That keeps the booking flow fully testable before the email
 * domain is verified: a booking still confirms, it just does not email anyone.
 * Sends are never allowed to fail a booking — a payment that succeeded must not
 * be lost because an inbox was unreachable.
 */

import type { Booking, Lead } from "./bookings";

const FROM = process.env.EMAIL_FROM ?? "Atlaso <bookings@atlaso.in>";
const OPS_INBOX = process.env.OPS_EMAIL ?? "ops@atlaso.in";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

const formatDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

async function send(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(
      `[email] RESEND_API_KEY not set — would have sent "${params.subject}" to ${params.to}`
    );
    return;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });
    if (!response.ok) {
      console.error(`[email] send failed ${response.status}: ${await response.text()}`);
    }
  } catch (error) {
    // Never propagate: the payment already succeeded.
    console.error("[email] send threw:", error);
  }
}

const shell = (heading: string, body: string) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F5F7FA;padding:28px 0">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden">
    <div style="background:#0A1628;padding:20px 24px">
      <span style="color:#fff;font-size:18px;font-weight:800;letter-spacing:-0.02em">Atlaso</span>
    </div>
    <div style="padding:24px">
      <h1 style="margin:0 0 14px;font-size:19px;color:#0F172A">${heading}</h1>
      ${body}
    </div>
    <div style="padding:16px 24px;border-top:1px solid #E2E8F0;color:#64748B;font-size:12px">
      Atlaso — compare verified Indian tour operators.
    </div>
  </div>
</div>`;

const row = (label: string, value: string) => `
<tr>
  <td style="padding:7px 0;color:#64748B;font-size:13px">${label}</td>
  <td style="padding:7px 0;color:#0F172A;font-size:13px;font-weight:600;text-align:right">${value}</td>
</tr>`;

export async function sendCustomerConfirmation(booking: Booking): Promise<void> {
  const body = `
<p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6">
  Your trip is confirmed. ${booking.operatorName} has your booking and will be in touch
  with joining instructions before departure.
</p>
<div style="background:#F0FDF4;border-radius:12px;padding:14px 16px;margin-bottom:16px">
  <span style="color:#16A34A;font-size:14px;font-weight:700">
    You paid ${inr(booking.customerSavings)} less than ${booking.operatorName}'s direct price.
  </span>
</div>
<table style="width:100%;border-collapse:collapse">
  ${row("Booking reference", booking.reference)}
  ${row("Trip", booking.packageTitle)}
  ${row("Operator", booking.operatorName)}
  ${row("Departure", formatDate(booking.startDate))}
  ${row("Travellers", String(booking.travellerCount))}
  ${row("Price per person", inr(booking.snapshotPlatformPrice))}
  ${row("<b>Total paid</b>", `<b>${inr(booking.totalAmount)}</b>`)}
</table>
<p style="margin:16px 0 0;color:#64748B;font-size:12px;line-height:1.6">
  Quote reference ${booking.reference} in any correspondence.
</p>`;
  await send({
    to: booking.contactEmail,
    subject: `Booking confirmed — ${booking.packageTitle} (${booking.reference})`,
    html: shell("Your trip is confirmed", body),
  });
}

/**
 * The operator sees their own B2B rate — what we owe them — and never the
 * platform price or our margin.
 */
export async function sendOperatorNotification(
  booking: Booking,
  operatorEmail: string
): Promise<void> {
  const travellers = booking.travellers
    .map((t) => `<li style="color:#0F172A;font-size:13px">${t.fullName} — ${t.age}</li>`)
    .join("");

  const body = `
<p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6">
  You have a new confirmed booking through Atlaso. Payment has cleared; the payout
  is scheduled at your agreed rate.
</p>
<table style="width:100%;border-collapse:collapse">
  ${row("Reference", booking.reference)}
  ${row("Trip", booking.packageTitle)}
  ${row("Departure", formatDate(booking.startDate))}
  ${row("Travellers", String(booking.travellerCount))}
  ${row("Your rate per person", inr(booking.snapshotB2bCost))}
  ${row("<b>Total payable to you</b>", `<b>${inr(booking.operatorPayable)}</b>`)}
</table>
<h2 style="font-size:14px;color:#0F172A;margin:20px 0 6px">Travellers</h2>
<ul style="margin:0;padding-left:18px">${travellers}</ul>
<h2 style="font-size:14px;color:#0F172A;margin:20px 0 6px">Lead contact</h2>
<p style="margin:0;color:#334155;font-size:13px">
  ${booking.contactName} · ${booking.contactPhone} · ${booking.contactEmail}
</p>
${
  booking.notes
    ? `<p style="margin:14px 0 0;color:#334155;font-size:13px"><b>Notes:</b> ${booking.notes}</p>`
    : ""
}`;

  await send({
    to: operatorEmail,
    subject: `New booking — ${booking.reference} · ${booking.travellerCount} traveller(s)`,
    html: shell("New confirmed booking", body),
    replyTo: booking.contactEmail,
  });
}

export async function sendLeadAlert(lead: Lead): Promise<void> {
  const body = `
<table style="width:100%;border-collapse:collapse">
  ${row("Reference", lead.reference)}
  ${row("Name", lead.name)}
  ${row("Phone", lead.phone)}
  ${row("Email", lead.email)}
  ${lead.packageTitle ? row("Interested in", lead.packageTitle) : ""}
  ${lead.travelDate ? row("Travel date", lead.travelDate) : ""}
  ${lead.travellerCount ? row("Travellers", String(lead.travellerCount)) : ""}
  ${lead.budgetRange ? row("Budget", lead.budgetRange) : ""}
</table>
${
  lead.message
    ? `<p style="margin:16px 0 0;color:#334155;font-size:13px"><b>Message:</b> ${lead.message}</p>`
    : ""
}`;
  await send({
    to: OPS_INBOX,
    subject: `Callback request — ${lead.name} (${lead.reference})`,
    html: shell("New callback request", body),
    replyTo: lead.email,
  });
}

export async function sendLeadAcknowledgement(lead: Lead): Promise<void> {
  const body = `
<p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6">
  Thanks ${lead.name} — we have your request and someone will call you on
  ${lead.phone} within one working day.
</p>
${
  lead.packageTitle
    ? `<p style="margin:0;color:#334155;font-size:14px">You asked about <b>${lead.packageTitle}</b>.</p>`
    : ""
}
<p style="margin:16px 0 0;color:#64748B;font-size:12px">Reference ${lead.reference}.</p>`;
  await send({
    to: lead.email,
    subject: "We'll call you shortly — Atlaso",
    html: shell("Request received", body),
  });
}
