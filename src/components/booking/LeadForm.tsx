"use client";

import { useState } from "react";
import { CheckCircle2, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Request a callback" — the non-instant path.
 *
 * Plenty of Indian travel buyers want to speak to someone before paying,
 * especially at these ticket sizes. Forcing everyone through checkout loses them.
 */

const BUDGETS = ["Under ₹10,000", "₹10,000 – ₹20,000", "₹20,000 – ₹35,000", "₹35,000+"];

export default function LeadForm({
  packageId,
  packageTitle,
  destinationId,
  source = "package-page",
  onClose,
}: {
  packageId?: string;
  packageTitle?: string;
  destinationId?: string;
  source?: string;
  onClose?: () => void;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setState("sending");

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          destinationId,
          source,
          company: form.get("company"),
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          travelDate: form.get("travelDate"),
          travellerCount: form.get("travellerCount"),
          budgetRange: form.get("budgetRange"),
          message: form.get("message"),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setState("idle");
        return;
      }
      setReference(data.reference);
      setState("done");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="text-center px-2 py-6">
        <div className="w-12 h-12 rounded-full bg-summit-light flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={24} className="text-summit-green" />
        </div>
        <h3 className="font-display font-bold text-lg text-map-text">We&apos;ll call you</h3>
        <p className="text-[13.5px] text-map-muted font-body mt-1.5 leading-relaxed">
          Someone from the team will be in touch within one working day.
          {reference && (
            <>
              {" "}Your reference is <b className="text-map-text">{reference}</b>.
            </>
          )}
        </p>
        {onClose && (
          <button onClick={onClose} className="btn-outline mt-5 text-sm py-2.5">
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-[17px] text-map-text">
            Request a callback
          </h3>
          <p className="text-[13px] text-map-muted font-body mt-0.5">
            {packageTitle
              ? `Questions about ${packageTitle}? We'll call you.`
              : "Tell us what you're planning and we'll call you."}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-map-muted hover:text-map-text flex-shrink-0"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute w-px h-px -left-[9999px] opacity-0"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Your name" name="name" required placeholder="Priya Sharma" />
        <Field
          label="Mobile"
          name="phone"
          required
          type="tel"
          inputMode="numeric"
          placeholder="98765 43210"
        />
      </div>

      <Field label="Email" name="email" required type="email" placeholder="you@example.com" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Rough travel date" name="travelDate" type="date" />
        <Field
          label="Travellers"
          name="travellerCount"
          type="number"
          min={1}
          max={30}
          placeholder="2"
        />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[12.5px] font-semibold text-map-text font-body">
          Budget per person <span className="text-map-muted font-normal">(optional)</span>
        </span>
        <select name="budgetRange" className="input-field cursor-pointer" defaultValue="">
          <option value="">No preference</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[12.5px] font-semibold text-map-text font-body">
          Anything we should know? <span className="text-map-muted font-normal">(optional)</span>
        </span>
        <textarea
          name="message"
          rows={3}
          placeholder="Flexible on dates, travelling with parents, need vegetarian meals…"
          className="input-field resize-y min-h-[76px]"
        />
      </label>

      {error && (
        <p role="alert" className="text-[13px] text-rose-600 bg-rose-50 rounded-lg px-3 py-2 font-body">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className={cn("btn-primary w-full text-sm mt-1", state === "sending" && "opacity-60")}
      >
        <Phone size={15} />
        {state === "sending" ? "Sending…" : "Request a callback"}
      </button>

      <p className="text-[11.5px] text-map-muted font-body text-center">
        No payment now. We&apos;ll call to talk through options first.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  ...rest
}: {
  label: string;
  name: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[12.5px] font-semibold text-map-text font-body">
        {label}
        {!required && <span className="text-map-muted font-normal"> (optional)</span>}
      </span>
      <input name={name} required={required} className="input-field" {...rest} />
    </label>
  );
}
