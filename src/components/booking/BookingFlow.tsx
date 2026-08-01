"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, CalendarDays, Check, Lock, Minus, Plus, ShieldCheck, TriangleAlert,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import LeadForm from "@/components/booking/LeadForm";
import type { PackageDetail } from "@/server/catalogue";

/**
 * package → dates → travellers → details → pay.
 *
 * Prices displayed here are the server-computed values carried on the package;
 * the running total is a multiplication of a server price by a traveller count,
 * and the amount actually charged is recomputed server-side from the frozen
 * snapshot. The browser never decides what anything costs.
 */

type Step = 1 | 2 | 3;

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  notes: Record<string, string>;
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const el = document.createElement("script");
    el.src = SCRIPT;
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });

export default function BookingFlow({
  pkg,
  paymentsEnabled,
}: {
  pkg: PackageDetail;
  paymentsEnabled: boolean;
}) {
  const router = useRouter();
  const open = useMemo(() => pkg.departures.filter((d) => !d.soldOut), [pkg.departures]);

  const [step, setStep] = useState<Step>(1);
  const [departureId, setDepartureId] = useState<string>(open[0]?.id ?? "");
  const [requestedCount, setRequestedCount] = useState(1);
  const [travellerInput, setTravellerInput] = useState<
    Record<number, { fullName: string; age: string }>
  >({});
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);

  const departure = open.find((d) => d.id === departureId) ?? null;
  const maxSeats = Math.min(departure?.seatsLeft ?? pkg.groupSizeMax, pkg.groupSizeMax);

  /* Both of these are derived, not synchronised state. Clamping the count on read
     and building the traveller rows during render means switching to a departure
     with fewer seats cannot leave a stale count or an orphaned traveller row —
     and it keeps what people have already typed if they change their mind. */
  const count = Math.min(Math.max(requestedCount, 1), Math.max(maxSeats, 1));
  const travellers = Array.from(
    { length: count },
    (_, i) => travellerInput[i] ?? { fullName: "", age: "" }
  );

  const setTraveller = (index: number, patch: Partial<{ fullName: string; age: string }>) =>
    setTravellerInput((prev) => ({
      ...prev,
      [index]: { ...(prev[index] ?? { fullName: "", age: "" }), ...patch },
    }));

  const total = pkg.price.platformPrice * count;
  const retailTotal = pkg.price.retailPrice * count;
  const saved = retailTotal - total;

  const step1Valid = Boolean(departure) && count >= 1;
  const step2Valid =
    travellers.every((t) => t.fullName.trim().length >= 2 && Number(t.age) >= 1) &&
    contact.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email) &&
    /^(\+91[\s-]?)?[6-9]\d{9}$/.test(contact.phone.replace(/\s/g, ""));

  const pay = async () => {
    setError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          departureId,
          startDate: departure?.startDate,
          travellerCount: count,
          travellers: travellers.map((t) => ({
            fullName: t.fullName.trim(),
            age: Number(t.age),
          })),
          contactName: contact.name.trim(),
          contactEmail: contact.email.trim(),
          contactPhone: contact.phone.trim(),
          notes: contact.notes.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "We could not start this booking.");
        setBusy(false);
        return;
      }

      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        setError(
          "Could not load the payment window. Check your connection, or request a callback instead."
        );
        setBusy(false);
        return;
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Atlaso",
        description: data.packageTitle,
        order_id: data.orderId,
        prefill: {
          name: data.contactName,
          email: data.contactEmail,
          contact: data.contactPhone,
        },
        notes: { bookingReference: data.reference },
        theme: { color: "#FF5A5F" },
        handler: async (payment) => {
          try {
            const verify = await fetch("/api/bookings/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment),
            });
            if (verify.ok) {
              router.push(`/booking/${data.reference}`);
              return;
            }
            const detail = await verify.json();
            setError(detail.error ?? "We could not verify that payment.");
          } catch {
            // Payment likely succeeded; the webhook is authoritative.
            router.push(`/booking/${data.reference}`);
          }
          setBusy(false);
        },
        modal: { ondismiss: () => setBusy(false) },
      });

      checkout.open();
    } catch {
      setError("Something went wrong. Nothing has been charged.");
      setBusy(false);
    }
  };

  if (open.length === 0) {
    return (
      <div className="rounded-2xl border border-map-border bg-map-card p-8 text-center">
        <h2 className="font-display font-bold text-lg text-map-text">
          No dates open for this trip
        </h2>
        <p className="text-[13.5px] text-map-muted font-body mt-2">
          Every scheduled departure is full. Ask us to let you know when new dates open.
        </p>
        <button onClick={() => setLeadOpen(true)} className="btn-primary inline-flex mt-5 text-sm">
          Request a callback
        </button>
        {leadOpen && (
          <Modal onClose={() => setLeadOpen(false)}>
            <LeadForm
              packageId={pkg.id}
              packageTitle={pkg.title}
              destinationId={pkg.destinationId}
              source="sold-out"
              onClose={() => setLeadOpen(false)}
            />
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex-1 min-w-0 w-full">
        <Steps step={step} />

        {/* ── Step 1 — dates and party size ── */}
        {step === 1 && (
          <Card title="Choose your departure">
            <div className="flex flex-col gap-2">
              {open.map((d) => {
                const selected = d.id === departureId;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDepartureId(d.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                      selected
                        ? "border-compass-blue bg-compass-light"
                        : "border-map-border bg-map-card hover:border-map-border-blue"
                    )}
                  >
                    <CalendarDays
                      size={16}
                      className={selected ? "text-compass-blue" : "text-map-muted"}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block font-display font-bold text-[13.5px] text-map-text">
                        {formatDate(d.startDate)}
                      </span>
                      <span className="block text-[12px] text-map-muted font-body">
                        returns {formatDate(d.endDate)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "text-[11.5px] font-bold px-2 py-0.5 rounded-full font-body tnum flex-shrink-0",
                        d.seatsLeft <= 3
                          ? "bg-compass-light text-compass-blue"
                          : "bg-summit-light text-summit-green"
                      )}
                    >
                      {d.seatsLeft} left
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-5 border-t border-map-border">
              <span className="label-util">Travellers</span>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-3 rounded-xl border border-map-border px-2 py-1.5">
                  <button
                    onClick={() => setRequestedCount(Math.max(1, count - 1))}
                    disabled={count <= 1}
                    aria-label="Fewer travellers"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-map-text disabled:text-map-border hover:bg-map-white"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="font-display font-extrabold text-[17px] text-map-text tnum w-6 text-center">
                    {count}
                  </span>
                  <button
                    onClick={() => setRequestedCount(Math.min(maxSeats, count + 1))}
                    disabled={count >= maxSeats}
                    aria-label="More travellers"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-map-text disabled:text-map-border hover:bg-map-white"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <span className="text-[12.5px] text-map-muted font-body">
                  {maxSeats} seat{maxSeats === 1 ? "" : "s"} available on this date
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="btn-primary w-full mt-6 text-sm"
            >
              Continue
            </button>
          </Card>
        )}

        {/* ── Step 2 — who's going ── */}
        {step === 2 && (
          <Card title="Who's travelling?">
            <div className="flex flex-col gap-4">
              {travellers.map((t, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_110px] gap-3">
                  <Input
                    label={i === 0 ? "Lead traveller — full name" : `Traveller ${i + 1} — full name`}
                    value={t.fullName}
                    onChange={(v) => setTraveller(i, { fullName: v })}
                    placeholder="As on government ID"
                  />
                  <Input
                    label="Age"
                    type="number"
                    inputMode="numeric"
                    value={t.age}
                    onChange={(v) => setTraveller(i, { age: v })}
                    placeholder="28"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-map-border flex flex-col gap-3">
              <span className="label-util">Contact for this booking</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Name"
                  value={contact.name}
                  onChange={(v) => setContact((c) => ({ ...c, name: v }))}
                  placeholder="Priya Sharma"
                />
                <Input
                  label="Mobile"
                  type="tel"
                  inputMode="numeric"
                  value={contact.phone}
                  onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
                  placeholder="98765 43210"
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={contact.email}
                onChange={(v) => setContact((c) => ({ ...c, email: v }))}
                placeholder="you@example.com"
              />
              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold text-map-text font-body">
                  Anything the operator should know?{" "}
                  <span className="text-map-muted font-normal">(optional)</span>
                </span>
                <textarea
                  rows={2}
                  value={contact.notes}
                  onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))}
                  placeholder="Dietary needs, medical conditions, pickup preference…"
                  className="input-field resize-y min-h-[64px]"
                />
              </label>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setStep(1)} className="btn-outline text-sm py-2.5 px-5">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className="btn-primary flex-1 text-sm"
              >
                Continue to payment
              </button>
            </div>
          </Card>
        )}

        {/* ── Step 3 — review and pay ── */}
        {step === 3 && (
          <Card title="Review and pay">
            <dl className="flex flex-col gap-2.5">
              <Line k="Trip" v={pkg.title} />
              <Line k="Operator" v={pkg.operatorName} />
              <Line k="Departure" v={departure ? formatDate(departure.startDate) : "—"} />
              <Line k="Travellers" v={travellers.map((t) => t.fullName).join(", ")} />
              <Line k="Contact" v={`${contact.name} · ${contact.phone}`} />
              <Line k="Cancellation" v={pkg.cancellationPolicy} />
            </dl>

            {!paymentsEnabled && (
              <div className="mt-5 flex gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
                <TriangleAlert size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-rose-700 font-body">
                    Card payment is not switched on yet
                  </p>
                  <p className="text-[12.5px] text-rose-700/85 font-body mt-0.5 leading-snug">
                    Razorpay test keys have not been added to this environment. You can still
                    request a callback and we will take the booking manually.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mt-5 text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 font-body"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
              <button
                onClick={() => setStep(2)}
                className="btn-outline text-sm py-2.5 px-5 sm:w-auto"
              >
                Back
              </button>
              <button
                onClick={pay}
                disabled={busy || !paymentsEnabled}
                className="btn-primary flex-1 text-sm"
              >
                <Lock size={14} />
                {busy ? "Opening payment…" : `Pay ${formatPrice(total)}`}
              </button>
            </div>

            <button
              onClick={() => setLeadOpen(true)}
              className="w-full text-center text-[13px] text-compass-blue font-semibold mt-3.5 hover:underline font-body"
            >
              Not ready? Ask us to call you instead
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-map-muted font-body mt-3">
              <ShieldCheck size={12} />
              Payments handled by Razorpay. UPI, cards and netbanking.
            </p>
          </Card>
        )}
      </div>

      {/* ── Summary ── */}
      <aside className="w-full lg:w-[330px] lg:sticky lg:top-24 flex-shrink-0">
        <div className="rounded-2xl border border-map-border bg-map-card shadow-card overflow-hidden">
          <div className="flex gap-3 p-4 border-b border-map-border">
            <Image
              src={pkg.images[0]}
              alt={pkg.title}
              width={140}
              height={140}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="font-display font-bold text-[13.5px] text-map-text leading-snug line-clamp-2">
                {pkg.title}
              </p>
              <p className="text-[12px] text-map-muted font-body mt-0.5">{pkg.operatorName}</p>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <Row
              k={`${formatPrice(pkg.price.platformPrice)} × ${count}`}
              v={formatPrice(total)}
            />
            <Row
              k={`${pkg.operatorName}'s direct price`}
              v={formatPrice(retailTotal)}
              strike
            />
            <div className="border-t border-map-border pt-2.5 mt-1 flex items-center justify-between">
              <span className="font-display font-bold text-[14px] text-map-text">Total</span>
              <span className="price-hero text-[22px] text-map-text">{formatPrice(total)}</span>
            </div>
            {saved > 0 && (
              <div className="rounded-xl bg-summit-light px-3 py-2 mt-1">
                <span className="tnum text-[13px] font-bold text-summit-green">
                  You save {formatPrice(saved)}
                </span>
                <span className="block text-[11.5px] text-summit-green/85 font-body">
                  versus booking direct with {pkg.operatorName}
                </span>
              </div>
            )}
          </div>
        </div>

        <Link
          href={`/packages/${pkg.slug}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-map-muted hover:text-compass-blue mt-3 font-body transition-colors"
        >
          <ArrowLeft size={13} /> Back to trip details
        </Link>
      </aside>

      {leadOpen && (
        <Modal onClose={() => setLeadOpen(false)}>
          <LeadForm
            packageId={pkg.id}
            packageTitle={pkg.title}
            destinationId={pkg.destinationId}
            source="checkout"
            onClose={() => setLeadOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

/* ── Bits ─────────────────────────────────────────────────────────────────── */

function Steps({ step }: { step: Step }) {
  const labels = ["Dates", "Travellers", "Payment"];
  return (
    <ol className="flex items-center gap-2 mb-5">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const done = step > n;
        const active = step === n;
        return (
          <li key={label} className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 font-body",
                done
                  ? "bg-summit-green text-white"
                  : active
                  ? "bg-compass-blue text-white"
                  : "bg-map-border text-map-muted"
              )}
            >
              {done ? <Check size={12} strokeWidth={3} /> : n}
            </span>
            <span
              className={cn(
                "text-[12.5px] font-body whitespace-nowrap",
                active ? "text-map-text font-bold" : "text-map-muted"
              )}
            >
              {label}
            </span>
            {i < labels.length - 1 && (
              <span className="w-4 sm:w-8 h-px bg-map-border flex-shrink-0" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-map-border bg-map-card p-5 sm:p-6">
      <h2 className="font-display font-extrabold text-[18px] text-map-text mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[12.5px] font-semibold text-map-text font-body">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
        {...rest}
      />
    </label>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[13px] text-map-muted font-body flex-shrink-0">{k}</dt>
      <dd className="text-[13px] text-map-text font-body font-semibold text-right min-w-0">
        {v}
      </dd>
    </div>
  );
}

function Row({ k, v, strike }: { k: string; v: string; strike?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12.5px] text-map-muted font-body min-w-0 truncate">{k}</span>
      <span
        className={cn(
          "text-[13px] tnum flex-shrink-0",
          strike ? "text-strike line-through" : "text-map-text font-semibold"
        )}
      >
        {v}
      </span>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-map-card rounded-t-3xl sm:rounded-2xl border border-map-border p-5 sm:p-6"
      >
        {children}
      </div>
    </div>
  );
}
