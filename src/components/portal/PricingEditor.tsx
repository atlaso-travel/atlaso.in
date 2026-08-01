"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, Check, Save } from "lucide-react";
import { updatePricingAction, type ActionState } from "@/app/operator/actions";
import { formatPrice, cn } from "@/lib/utils";

/**
 * Operators set two numbers and only two:
 *
 *   retailPrice — what they charge a customer who walks in off the street
 *   b2bCost     — what they charge Atlaso
 *
 * The customer-facing platform price is derived from b2bCost by the margin
 * engine on the server. It is deliberately not shown or editable here: operators
 * do not set our price, and exposing our margin back to them would undercut
 * every future rate negotiation.
 *
 * The live preview below shows only the discount the operator is offering, which
 * is arithmetic on their own two numbers.
 */
export default function PricingEditor({
  packageId,
  retailPrice,
  b2bCost,
  validationStatus,
  validationNote,
}: {
  packageId: string;
  retailPrice: number;
  b2bCost: number;
  validationStatus: string;
  validationNote: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updatePricingAction,
    {}
  );
  const [retail, setRetail] = useState(String(retailPrice));
  const [b2b, setB2b] = useState(String(b2bCost));

  const r = Number(retail);
  const c = Number(b2b);
  const valid = Number.isFinite(r) && Number.isFinite(c) && r > 0 && c > 0 && c < r;
  const discountPct = valid ? Math.round(((r - c) / r) * 100) : null;
  const dirty = String(retailPrice) !== retail || String(b2bCost) !== b2b;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="packageId" value={packageId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-map-text font-body">
            Your direct price
          </span>
          <input
            name="retailPrice"
            type="number"
            min={1}
            step={1}
            required
            value={retail}
            onChange={(e) => setRetail(e.target.value)}
            className="input-field tnum"
          />
          <span className="text-[11.5px] text-map-muted font-body leading-snug">
            What you charge a customer who books with you directly.
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-map-text font-body">
            Your Atlaso rate
          </span>
          <input
            name="b2bCost"
            type="number"
            min={1}
            step={1}
            required
            value={b2b}
            onChange={(e) => setB2b(e.target.value)}
            className="input-field tnum"
          />
          <span className="text-[11.5px] text-map-muted font-body leading-snug">
            What you charge us per traveller. Must be below your direct price.
          </span>
        </label>
      </div>

      <div
        className={cn(
          "rounded-xl px-4 py-2.5 text-[12.5px] font-body",
          valid ? "bg-map-white border border-map-border" : "bg-rose-50 border border-rose-200"
        )}
      >
        {valid ? (
          <span className="text-map-muted">
            You are offering Atlaso{" "}
            <b className="text-map-text tnum">{formatPrice(r - c)}</b> off your direct price —{" "}
            <b className="text-map-text tnum">{discountPct}%</b>. We price between your rate and
            your direct price, so the customer always pays less than {formatPrice(r)}.
          </span>
        ) : (
          <span className="text-rose-700">
            Your Atlaso rate must be a positive number below your direct price.
          </span>
        )}
      </div>

      {validationStatus !== "OK" && !state.success && (
        <p className="flex gap-2 text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 font-body">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          {validationNote ?? "This listing is flagged for pricing review."}
        </p>
      )}

      {state.error && (
        <p role="alert" className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 font-body">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="flex gap-2 text-[12.5px] text-summit-green bg-summit-light rounded-xl px-3 py-2 font-body">
          <Check size={14} className="flex-shrink-0 mt-0.5" />
          <span>
            {state.success}
            {state.warning && (
              <span className="block text-rose-700 mt-1">{state.warning}</span>
            )}
          </span>
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !valid || !dirty}
        className="btn-primary text-[13px] py-2 px-4 w-fit"
      >
        <Save size={14} />
        {pending ? "Saving…" : dirty ? "Save pricing" : "Saved"}
      </button>
    </form>
  );
}
