"use client";

import { useActionState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import type { ActionState } from "@/app/operator/actions";

export default function LoginCard({
  title,
  subtitle,
  action,
  emailLabel,
  emailPlaceholder,
  hint,
}: {
  title: string;
  subtitle: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  emailLabel: string;
  emailPlaceholder: string;
  hint?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="min-h-screen bg-atlas-night flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-white font-display font-extrabold text-[20px] tracking-tight mb-6"
        >
          Atlaso
        </Link>

        <div className="rounded-2xl bg-map-card border border-map-border p-6">
          <h1 className="font-display font-extrabold text-[19px] text-map-text">{title}</h1>
          <p className="text-[13px] text-map-muted font-body mt-1 mb-5">{subtitle}</p>

          <form action={formAction} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-map-text font-body">
                {emailLabel}
              </span>
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                placeholder={emailPlaceholder}
                className="input-field"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-map-text font-body">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input-field"
              />
            </label>

            {state.error && (
              <p
                role="alert"
                className="text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 font-body"
              >
                {state.error}
              </p>
            )}

            <button type="submit" disabled={pending} className="btn-primary w-full text-sm mt-1">
              <KeyRound size={15} />
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {hint}
        </div>
      </div>
    </div>
  );
}
