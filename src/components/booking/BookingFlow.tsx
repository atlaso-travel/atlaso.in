"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Banknote, BadgeCheck, Building2, CalendarDays, CreditCard, Landmark,
  Lock, Minus, Plus, ShieldCheck, Smartphone, Star, TriangleAlert, Wallet,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import BookingSteps from "@/components/booking/BookingSteps";
import LeadForm from "@/components/booking/LeadForm";
import type { PackageDetail } from "@/server/catalogue";

/**
 * summary → travellers → payment, then the confirmation page.
 *
 * Prices displayed here are the server-computed values carried on the package;
 * the running total is a multiplication of a server price by a traveller count,
 * and the amount actually charged is recomputed server-side from the frozen
 * snapshot. The browser never decides what anything costs.
 */

type Step = 1 | 2 | 3;

const GENDERS = ["Female", "Male", "Other", "Prefer not to say"] as const;
const RELATIONSHIPS = ["Parent", "Spouse", "Sibling", "Child", "Friend", "Other"] as const;

const METHODS = [
  { id: "upi", label: "UPI", hint: "Pay using any UPI app", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", hint: "All major banks supported", icon: Landmark },
  { id: "wallet", label: "Wallets", hint: "Paytm, PhonePe, Amazon Pay", icon: Wallet },
  { id: "emi", label: "EMI", hint: "Available on cards, subject to your bank", icon: Building2 },
] as const;

type MethodId = (typeof METHODS)[number]["id"];

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
  prefill: { name: string; email: string; contact: string; method?: string };
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
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

type TravellerInput = { fullName: string; age: string; gender: string };
const EMPTY_TRAVELLER: TravellerInput = { fullName: "", age: "", gender: "" };

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
  const [travellerInput, setTravellerInput] = useState<Record<number, TravellerInput>>({});
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [emergency, setEmergency] = useState({ fullName: "", relationship: "", phone: "" });
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<MethodId>("upi");
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
    (_, i) => travellerInput[i] ?? EMPTY_TRAVELLER
  );

  const setTraveller = (index: number, patch: Partial<TravellerInput>) =>
    setTravellerInput((prev) => ({
      ...prev,
      [index]: { ...(prev[index] ?? EMPTY_TRAVELLER), ...patch },
    }));

  const total = pkg.price.platformPrice * count;
  const retailTotal = pkg.price.retailPrice * count;
  const saved = retailTotal - total;

  const rating = pkg.packageReviewCount > 0 ? pkg.packageRating : pkg.trust.rating;
  const reviewCount =
    pkg.packageReviewCount > 0 ? pkg.packageReviewCount : pkg.trust.reviewCount;

  const step1Valid = Boolean(departure) && count >= 1;
  const step2Valid =
    travellers.every(
      (t) => t.fullName.trim().length >= 2 && Number(t.age) >= 1 && t.gender !== ""
    ) &&
    EMAIL.test(contact.email) &&
    PHONE.test(contact.phone.replace(/\s/g, "")) &&
    emergency.fullName.trim().length >= 2 &&
    emergency.relationship !== "" &&
    PHONE.test(emergency.phone.replace(/\s/g, ""));

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
            gender: t.gender,
          })),
          contactName: travellers[0].fullName.trim(),
          contactEmail: contact.email.trim(),
          contactPhone: contact.phone.trim(),
          emergencyContact: {
            fullName: emergency.fullName.trim(),
            relationship: emergency.relationship,
            phone: emergency.phone.trim(),
          },
          notes: notes.trim(),
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
          /* Opens Razorpay on the method chosen here; every other method stays
             available inside the window. */
          method,
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
      <div className="rounded-2xl border border-warm-line bg-map-card p-8 text-center">
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
    <div className="flex flex-col gap-5">
      <BookingSteps current={step} />

      {/* ── Step 1 — booking summary ── */}
      {step === 1 && (
        <>
          {/* Trip banner */}
          <div className="relative rounded-2xl overflow-hidden min-h-[168px] flex flex-col justify-end">
            <Image
              src={pkg.images[0]}
              alt={pkg.title}
              fill
              sizes="(max-width:1024px) 100vw, 900px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/92 via-[#0A1628]/55 to-[#0A1628]/30" />
            <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-body">
              <Star size={12} className="fill-star text-star" />
              <b className="tnum font-bold text-map-text">{rating}</b>
              <span className="text-map-muted tnum">({reviewCount} reviews)</span>
            </span>
            <div className="relative z-10 p-5">
              <p className="text-[12px] text-white/70 font-body">
                {pkg.destinationName}
                {pkg.destinationRegion &&
                  !pkg.destinationName.includes(pkg.destinationRegion) &&
                  `, ${pkg.destinationRegion}`}
              </p>
              <h2 className="font-display font-extrabold text-[22px] sm:text-[26px] text-white leading-tight mt-1">
                {pkg.title}
              </h2>
              <p className="text-[12.5px] text-white/80 font-body mt-1.5">
                {pkg.duration} · {pkg.difficulty} · from {pkg.pickupPoint}
              </p>
            </div>
          </div>

          {/* Operator */}
          <div className="rounded-2xl border border-warm-line bg-map-card p-4 flex items-center gap-3">
            <Image
              src={pkg.images[1] ?? pkg.images[0]}
              alt={pkg.operatorName}
              width={96}
              height={96}
              className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <Link
                href={`/operators/${pkg.operatorSlug}`}
                className="font-display font-bold text-[14.5px] text-map-text hover:text-compass-blue transition-colors"
              >
                {pkg.operatorName}
              </Link>
              <p
                className={cn(
                  "flex items-center gap-1.5 text-[12px] font-body mt-0.5",
                  pkg.operatorVerified ? "text-summit-green" : "text-map-muted"
                )}
              >
                <BadgeCheck size={13} className="flex-shrink-0" />
                {pkg.operatorVerified ? "Verified operator" : "Verification in progress"}
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-[12.5px] font-body flex-shrink-0">
              <Star size={12} className="fill-star text-star" />
              <b className="tnum font-bold text-map-text">{pkg.trust.rating}</b>
              <span className="text-map-muted tnum hidden sm:inline">
                ({pkg.trust.reviewCount} reviews)
              </span>
            </span>
          </div>

          {/* Trip details — the two things that are still choices sit in the grid
              as controls rather than being pushed onto a separate screen. */}
          <Card title="Trip details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <Well label="Departure date">
                <select
                  value={departureId}
                  onChange={(e) => setDepartureId(e.target.value)}
                  aria-label="Departure date"
                  className="w-full bg-transparent font-display font-bold text-[13.5px] text-map-text outline-none cursor-pointer"
                >
                  {open.map((d) => (
                    <option key={d.id} value={d.id}>
                      {formatDate(d.startDate)} · {d.seatsLeft} left
                    </option>
                  ))}
                </select>
              </Well>
              <Well label="Return date">
                <span className="font-display font-bold text-[13.5px] text-map-text">
                  {departure ? formatDate(departure.endDate) : "—"}
                </span>
              </Well>
              <Well label="Travellers">
                <div className="flex items-center gap-2 -my-1">
                  <button
                    onClick={() => setRequestedCount(Math.max(1, count - 1))}
                    disabled={count <= 1}
                    aria-label="Fewer travellers"
                    className="w-6 h-6 rounded-md border border-warm-line flex items-center justify-center text-map-text bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-display font-bold text-[13.5px] text-map-text tnum w-14 text-center">
                    {count} {count === 1 ? "Adult" : "Adults"}
                  </span>
                  <button
                    onClick={() => setRequestedCount(Math.min(maxSeats, count + 1))}
                    disabled={count >= maxSeats}
                    aria-label="More travellers"
                    className="w-6 h-6 rounded-md border border-warm-line flex items-center justify-center text-map-text bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </Well>
              <Well label="Trip type">
                <span className="font-display font-bold text-[13.5px] text-map-text">
                  Group trip · max {pkg.groupSizeMax}
                </span>
              </Well>
            </div>
            <p className="flex items-center gap-1.5 text-[12px] text-map-muted font-body mt-3">
              <CalendarDays size={13} className="flex-shrink-0" />
              {maxSeats} seat{maxSeats === 1 ? "" : "s"} left on the date selected.
            </p>
          </Card>

          <PriceBreakdown
            pkg={pkg}
            count={count}
            total={total}
            retailTotal={retailTotal}
            saved={saved}
          />

          <Actions>
            <Link
              href={`/packages/${pkg.slug}`}
              className="btn-outline flex items-center justify-center gap-2 text-sm py-2.5 px-5"
            >
              <ArrowLeft size={14} /> Trip details
            </Link>
            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="btn-primary text-sm px-8 sm:min-w-[180px]"
            >
              Continue
            </button>
          </Actions>
        </>
      )}

      {/* ── Step 2 — traveller details ── */}
      {step === 2 && (
        <>
          {travellers.map((t, i) => (
            <Card
              key={i}
              title={`Traveller ${i + 1}`}
              note={i === 0 ? "(Primary contact)" : undefined}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Full name"
                  required
                  className="sm:col-span-2"
                  value={t.fullName}
                  onChange={(v) => setTraveller(i, { fullName: v })}
                  placeholder="As on government ID"
                />
                {i === 0 && (
                  <>
                    <Field
                      label="Phone number"
                      required
                      type="tel"
                      inputMode="numeric"
                      value={contact.phone}
                      onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
                      placeholder="98765 43210"
                    />
                    <Field
                      label="Email address"
                      required
                      type="email"
                      value={contact.email}
                      onChange={(v) => setContact((c) => ({ ...c, email: v }))}
                      placeholder="you@example.com"
                    />
                  </>
                )}
                <Field
                  label="Age"
                  required
                  type="number"
                  inputMode="numeric"
                  value={t.age}
                  onChange={(v) => setTraveller(i, { age: v })}
                  placeholder="Enter your age"
                />
                <Select
                  label="Gender"
                  required
                  value={t.gender}
                  onChange={(v) => setTraveller(i, { gender: v })}
                  placeholder="Select gender"
                  options={[...GENDERS]}
                />
              </div>
            </Card>
          ))}

          <Card title="Emergency contact">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label="Full name"
                required
                className="sm:col-span-2"
                value={emergency.fullName}
                onChange={(v) => setEmergency((c) => ({ ...c, fullName: v }))}
                placeholder="Who should we call"
              />
              <Select
                label="Relationship"
                required
                value={emergency.relationship}
                onChange={(v) => setEmergency((c) => ({ ...c, relationship: v }))}
                placeholder="Select relationship"
                options={[...RELATIONSHIPS]}
              />
              <Field
                label="Phone number"
                required
                type="tel"
                inputMode="numeric"
                value={emergency.phone}
                onChange={(v) => setEmergency((c) => ({ ...c, phone: v }))}
                placeholder="98765 43210"
              />
            </div>
            <p className="text-[12px] text-map-muted font-body mt-3 leading-relaxed">
              Shared with {pkg.operatorName} only, and only used if something happens on the
              trip.
            </p>
          </Card>

          {/* The one field the removed add-ons step was worth keeping: the
              operator still needs somewhere to be told about dietary or medical
              requirements before the trip. */}
          <Card title="Anything the operator should know?" note="(optional)">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dietary needs, medical conditions, pickup preference…"
              className="input-field bg-peach-wash resize-y min-h-[76px]"
              aria-label="Anything the operator should know"
            />
            <p className="text-[12px] text-map-muted font-body mt-2.5">
              Passed on with your booking. {pkg.operatorName} will confirm what they can do
              before you travel.
            </p>
          </Card>

          <Actions>
            <button onClick={() => setStep(1)} className="btn-outline text-sm py-2.5 px-6">
              Go back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!step2Valid}
              className="btn-primary text-sm px-8 sm:min-w-[180px]"
            >
              Continue
            </button>
          </Actions>
        </>
      )}

      {/* ── Step 3 — payment ── */}
      {step === 3 && (
        <>
          <PriceBreakdown
            pkg={pkg}
            count={count}
            total={total}
            retailTotal={retailTotal}
            saved={saved}
          />

          <Card title="Choose your preferred payment method">
            <div className="flex flex-col gap-2">
              {METHODS.map((m) => {
                const on = method === m.id;
                const Icon = m.icon;
                return (
                  <label
                    key={m.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                      on
                        ? "border-rose-pink bg-rose-light/50"
                        : "border-warm-line bg-map-card hover:border-rose-pink/40"
                    )}
                  >
                    <span
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        on ? "bg-white" : "bg-peach-wash"
                      )}
                    >
                      <Icon size={15} className="text-rose-pink" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-display font-bold text-[13.5px] text-map-text">
                        {m.label}
                      </span>
                      <span className="block text-[12px] text-map-muted font-body">
                        {m.hint}
                      </span>
                    </span>
                    <input
                      type="radio"
                      name="payment-method"
                      checked={on}
                      onChange={() => setMethod(m.id)}
                      aria-label={m.label}
                      className="w-4 h-4 accent-[#FF5A5F] cursor-pointer flex-shrink-0"
                    />
                  </label>
                );
              })}
            </div>
            <p className="flex items-center gap-1.5 text-[12px] text-map-muted font-body mt-3">
              <Banknote size={13} className="flex-shrink-0" />
              Razorpay opens on the method you pick; you can switch inside their window.
            </p>
          </Card>

          {!paymentsEnabled && (
            <div className="flex gap-2.5 rounded-2xl bg-rust-tint border border-rust/25 px-4 py-3.5">
              <TriangleAlert size={16} className="text-rust flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-rust font-body">
                  Card payment is not switched on yet
                </p>
                <p className="text-[12.5px] text-rust/85 font-body mt-0.5 leading-snug">
                  Razorpay test keys have not been added to this environment. You can still
                  request a callback and we will take the booking manually.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="text-[13px] text-rust bg-rust-tint border border-rust/25 rounded-2xl px-4 py-3 font-body"
            >
              {error}
            </p>
          )}

          <Actions>
            <button onClick={() => setStep(2)} className="btn-outline text-sm py-2.5 px-6">
              Go back
            </button>
            <button
              onClick={pay}
              disabled={busy || !paymentsEnabled}
              className="btn-primary text-sm px-8 sm:min-w-[220px]"
            >
              <Lock size={14} />
              {busy ? "Opening payment…" : `Pay ${formatPrice(total)} securely`}
            </button>
          </Actions>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setLeadOpen(true)}
              className="text-[13px] text-compass-blue font-semibold hover:underline font-body cursor-pointer"
            >
              Not ready? Ask us to call you instead
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-map-muted font-body">
              <ShieldCheck size={12} />
              Payments handled by Razorpay. {pkg.cancellationPolicy}.
            </p>
          </div>
        </>
      )}

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

function Card({
  title, note, children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-warm-line bg-map-card p-4 sm:p-5">
      <h2 className="font-display font-bold text-[15px] text-map-text mb-4">
        {title}
        {note && <span className="text-map-muted font-normal text-[13px] ml-1.5">{note}</span>}
      </h2>
      {children}
    </section>
  );
}

/** Read-only-looking cell used for the trip-detail grid. */
function Well({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-peach-wash border border-warm-line px-3.5 py-2.5 min-w-0">
      <span className="block text-[11px] text-map-muted font-body mb-1">{label}</span>
      {children}
    </div>
  );
}

/**
 * The money, shown identically on the summary and payment steps.
 *
 * Every line is either a server-computed price or a multiple of one. There is no
 * tax or fee row because Atlaso adds neither: the operator's published price is
 * what is charged.
 */
function PriceBreakdown({
  pkg, count, total, retailTotal, saved,
}: {
  pkg: PackageDetail;
  count: number;
  total: number;
  retailTotal: number;
  saved: number;
}) {
  return (
    <Card title="Price breakdown">
      <div className="rounded-xl bg-rose-light/40 border border-rose-pink/10 px-4 py-3.5 flex flex-col gap-2.5">
        <Row
          k="Trip price"
          note={`${formatPrice(pkg.price.platformPrice)} × ${count}`}
          v={formatPrice(total)}
        />
        {saved > 0 && (
          <>
            <Row
              k={`${pkg.operatorName}'s direct price`}
              note={`${formatPrice(pkg.price.retailPrice)} × ${count}`}
              v={formatPrice(retailTotal)}
              strike
            />
            <Row k="You save" v={`− ${formatPrice(saved)}`} green />
          </>
        )}
        <Row k="Atlaso booking fee" v="FREE" green />

        <div className="border-t border-rose-pink/20 pt-3 mt-0.5 flex items-baseline justify-between gap-3">
          <span className="font-display font-bold text-[14.5px] text-map-text">Total price</span>
          <span className="price-hero text-[22px] text-rose-pink">{formatPrice(total)}</span>
        </div>
        <p className="text-[11.5px] text-map-muted font-body text-right -mt-1">
          For {count} traveller{count === 1 ? "" : "s"} · nothing else is added at payment
        </p>
      </div>
    </Card>
  );
}

function Row({
  k, v, note, strike, green,
}: {
  k: string;
  v: string;
  note?: string;
  strike?: boolean;
  green?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[13px] text-map-muted font-body min-w-0">
        {k}
        {note && <span className="text-map-muted/75 tnum"> ({note})</span>}
      </span>
      <span
        className={cn(
          "text-[13.5px] tnum flex-shrink-0 font-semibold",
          strike
            ? "text-strike line-through decoration-[1.5px] font-normal"
            : green
            ? "text-summit-green font-bold"
            : "text-map-text"
        )}
      >
        {v}
      </span>
    </div>
  );
}

/** Go-back on the left, continue on the right — same geometry on every step. */
function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3 flex-wrap">{children}</div>;
}

function Field({
  label, value, onChange, required, className, ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className">) {
  return (
    <label className={cn("flex flex-col gap-1.5 min-w-0", className)}>
      <Label label={label} required={required} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field bg-peach-wash"
        {...rest}
      />
    </label>
  );
}

function Select({
  label, value, onChange, options, placeholder, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      <Label label={label} required={required} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("input-field bg-peach-wash cursor-pointer", !value && "text-warm-taupe")}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="text-[12px] font-semibold text-map-text font-body">
      {label}
      {required ? (
        <span className="text-rose-pink"> *</span>
      ) : (
        <span className="text-map-muted font-normal"> (optional)</span>
      )}
    </span>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-map-card rounded-t-3xl sm:rounded-2xl border border-warm-line p-5 sm:p-6"
      >
        {children}
      </div>
    </div>
  );
}
