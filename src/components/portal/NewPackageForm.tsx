"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createPackageAction, type ActionState } from "@/app/operator/actions";
import { formatPrice } from "@/lib/utils";

export default function NewPackageForm({
  destinations,
}: {
  destinations: { id: string; name: string; region: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createPackageAction,
    {}
  );
  const [retail, setRetail] = useState("");
  const [b2b, setB2b] = useState("");

  const r = Number(retail);
  const c = Number(b2b);
  const showDiscount = Number.isFinite(r) && Number.isFinite(c) && r > 0 && c > 0 && c < r;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Section title="The trip">
        <Field label="Title" name="title" required placeholder="Spiti Winter Expedition" />
        <Field
          label="One-line summary"
          name="summary"
          required
          placeholder="Seven days across frozen Spiti with homestays in Kaza and Langza."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-map-text font-body">Destination</span>
            <select name="destinationId" required defaultValue="" className="input-field cursor-pointer">
              <option value="" disabled>Choose…</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.region}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-map-text font-body">Difficulty</span>
            <select name="difficulty" defaultValue="Moderate" className="input-field cursor-pointer">
              <option>Easy</option>
              <option>Moderate</option>
              <option>Challenging</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration (days)" name="durationDays" type="number" min={1} max={30} required placeholder="7" />
          <Field label="Max group size" name="groupSizeMax" type="number" min={1} max={60} required placeholder="12" />
        </div>
      </Section>

      <Section
        title="Pricing"
        note="Both numbers are required. We set the customer price between them — you never pay us a fee."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-map-text font-body">
              Your direct price (₹ per person)
            </span>
            <input
              name="retailPrice" type="number" min={1} required value={retail}
              onChange={(e) => setRetail(e.target.value)}
              placeholder="14999" className="input-field tnum"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-map-text font-body">
              Your Atlaso rate (₹ per person)
            </span>
            <input
              name="b2bCost" type="number" min={1} required value={b2b}
              onChange={(e) => setB2b(e.target.value)}
              placeholder="11849" className="input-field tnum"
            />
          </label>
        </div>
        {showDiscount && (
          <p className="text-[12.5px] text-map-muted font-body bg-map-white border border-map-border rounded-xl px-3 py-2">
            You are offering <b className="text-map-text tnum">{formatPrice(r - c)}</b> off —{" "}
            <b className="text-map-text tnum">{Math.round(((r - c) / r) * 100)}%</b>.
          </p>
        )}
      </Section>

      <Section title="Logistics">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Starts at" name="pickupPoint" placeholder="Shimla (Old Bus Stand)" />
          <Field label="Ends at" name="dropPoint" placeholder="Manali (Mall Road)" />
        </div>
        <Field label="Accommodation type" name="hotelType" placeholder="Homestays + camping" />
        <div className="flex flex-wrap gap-4 pt-1">
          <Check name="mealsIncluded" label="Meals included" />
          <Check name="transportIncluded" label="Transport included" />
          <Check name="guideIncluded" label="Guide included" />
        </div>
      </Section>

      <Section title="Inclusions" note="One per line.">
        <textarea
          name="inclusions" rows={4} className="input-field resize-y"
          placeholder={"All meals\nLicensed local guide\nInner line permits"}
        />
        <span className="text-[12.5px] font-semibold text-map-text font-body mt-1">
          Exclusions
        </span>
        <textarea
          name="exclusions" rows={3} className="input-field resize-y"
          placeholder={"Flights\nTravel insurance\nPersonal expenses"}
        />
      </Section>

      <Section title="Photo" note="Unsplash URLs only for now — direct uploads arrive with Supabase Storage.">
        <Field
          label="Image URL"
          name="imageUrl"
          type="url"
          placeholder="https://images.unsplash.com/photo-…"
        />
      </Section>

      {state.error && (
        <p role="alert" className="text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 font-body">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary text-sm w-fit">
        <Plus size={15} />
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}

function Section({
  title, note, children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-map-border bg-map-card p-5 flex flex-col gap-3">
      <div>
        <h3 className="font-display font-bold text-[14.5px] text-map-text">{title}</h3>
        {note && (
          <p className="text-[12px] text-map-muted font-body mt-0.5 leading-snug">{note}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label, name, ...rest
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[12.5px] font-semibold text-map-text font-body">{label}</span>
      <input name={name} className="input-field" {...rest} />
    </label>
  );
}

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" name={name} className="w-4 h-4 accent-[#FF5A5F] cursor-pointer" />
      <span className="text-[13px] text-map-text font-body">{label}</span>
    </label>
  );
}
