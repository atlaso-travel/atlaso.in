/**
 * Razorpay, test mode. SERVER ONLY.
 *
 * Talks to the REST API directly rather than pulling in the `razorpay` SDK —
 * we need exactly two calls, and this keeps the dependency list unchanged.
 *
 * Amounts cross this boundary in PAISE. Everything in src/data is in rupees, so
 * the conversion happens here and only here.
 *
 * Do not put live keys in the environment until there is real inventory to sell.
 * `RAZORPAY_KEY_ID` beginning `rzp_live_` is rejected below as a safety catch.
 */

const API = "https://api.razorpay.com/v1";

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string | null;
}

export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return {
    keyId,
    keySecret,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? null,
  };
}

export function isLiveKey(keyId: string): boolean {
  return keyId.startsWith("rzp_live_");
}

/** True when checkout can run. Surfaced in the UI so the flow degrades honestly. */
export function isPaymentsConfigured(): boolean {
  const config = getRazorpayConfig();
  return Boolean(config) && !isLiveKey(config!.keyId);
}

export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export async function createRazorpayOrder(params: {
  amountRupees: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  const config = getRazorpayConfig();
  if (!config) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }
  if (isLiveKey(config.keyId)) {
    throw new Error(
      "Refusing to create an order with a live Razorpay key. Phase 3 is test-mode only."
    );
  }

  const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");

  const response = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: rupeesToPaise(params.amountRupees),
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
      payment_capture: 1,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Razorpay order creation failed (${response.status}): ${detail}`);
  }

  return (await response.json()) as RazorpayOrder;
}
