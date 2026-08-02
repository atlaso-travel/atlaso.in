"use client";

import { cloneElement, useActionState, useState, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, type LucideProps } from "lucide-react";
import type { ActionState } from "@/app/operator/actions";
import { EASE_SETTLE, useMotionProfile } from "@/components/motion/Reveal";

/* Same first-light peaks used on the homepage hero — one photo family so the
   portals read as the same brand at the door, not a different, plainer
   product behind it. Chosen over the sunset frames because its cooler light
   sits better behind two roles that are internal tooling, not the sell. */
const PHOTO_SRC =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80";
const PHOTO_ALT =
  "Snow peaks above a sea of cloud, lit by first light";

export default function LoginCard({
  title,
  subtitle,
  action,
  icon,
  badge,
  features,
  emailLabel,
  emailPlaceholder,
}: {
  title: string;
  subtitle: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  /** Role icon element, e.g. `<ShieldCheck />` — sized per spot via cloneElement. */
  icon: ReactElement<LucideProps>;
  /** Short eyebrow label, e.g. "Admin access". */
  badge: string;
  /** A few short lines describing what's behind this login. */
  features: string[];
  emailLabel: string;
  emailPlaceholder: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const { reduced } = useMotionProfile();

  const step = (i: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0.25 : 0.7, delay: i * 0.1, ease: EASE_SETTLE },
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-atlas-night flex items-center justify-center px-4 py-14 sm:px-8 lg:px-16">
      {/* ── Full-bleed photo ground — the same first-light peaks family as
          the homepage hero, so the portals feel like the front door of the
          same house rather than a plainer product behind it. ── */}
      <div className="absolute inset-0">
        <Image
          src={PHOTO_SRC}
          alt={PHOTO_ALT}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "center 60%" }}
        />
        <div className="photo-grade absolute inset-0" aria-hidden />
        {/* Weighted to the copy column, released toward the card — same
            scrim recipe as the hero so the two premium surfaces agree. */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(96deg, rgba(10,16,26,0.90) 0%, rgba(10,16,26,0.76) 26%, rgba(10,16,26,0.42) 48%, rgba(10,16,26,0.12) 72%, rgba(10,16,26,0) 90%)",
          }}
        />
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(178deg, rgba(10,16,26,0.62) 0%, rgba(10,16,26,0.72) 40%, rgba(10,16,26,0.82) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
        {/* ── Brand copy — sits directly on the photo, no boxed chrome, so
            the headline is the one thing said once per breakpoint. ── */}
        <motion.div {...step(0)} className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <Link
            href="/"
            className="font-display font-extrabold text-[22px] tracking-tight text-white"
          >
            Atlaso
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 backdrop-blur-sm px-3.5 py-1.5">
            {cloneElement(icon, { size: 13, className: "text-sunset-orange" })}
            <span className="mono-chart text-[10px] uppercase tracking-wider text-white/75">
              {badge}
            </span>
          </div>

          <h1 className="mt-5 font-display font-black text-[32px] sm:text-[38px] lg:text-[42px] leading-[1.1] tracking-display text-white">
            {title}
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70 font-body">
            {subtitle}
          </p>

          <ul className="mt-9 hidden sm:flex flex-col gap-5 max-w-sm">
            {features.map((feature, i) => (
              <li key={feature} className="flex items-start gap-3.5 text-left">
                <span
                  className="mono-chart flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-[10px] text-white/80"
                  style={{ backgroundImage: "var(--gradient-signature)" }}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-0.5 text-[13.5px] leading-relaxed text-white/70 font-body">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── Sign-in card — floats on the same photo, no headline of its
            own so the copy column stays the only place the title lives. ── */}
        <motion.div {...step(1)} className="w-full max-w-sm">
          <div className="rounded-2xl bg-map-card border border-white/60 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.55)] p-7 sm:p-8">
            <div
              className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundImage: "var(--gradient-signature)" }}
            >
              {cloneElement(icon, { size: 19, className: "text-white" })}
            </div>

            <h2 className="font-display font-extrabold text-[21px] text-espresso">Welcome back</h2>
            <p className="text-[13px] text-warm-taupe font-body mt-1.5 mb-6">
              Sign in to continue to your account.
            </p>

            <form action={formAction} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold text-espresso font-body">
                  {emailLabel}
                </span>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-taupe"
                    aria-hidden
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    placeholder={emailPlaceholder}
                    className="input-field pl-10"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold text-espresso font-body">
                  Password
                </span>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-taupe"
                    aria-hidden
                  />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-taupe hover:text-espresso transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              {state.error && (
                <p
                  role="alert"
                  className="text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 font-body"
                >
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="btn-primary w-full text-sm mt-2 group"
              >
                {pending ? "Signing in…" : "Sign in"}
                {!pending && (
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>

            <Link
              href="/"
              className="mt-5 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-warm-taupe hover:text-coral-ink transition-colors border-t border-warm-line pt-4"
            >
              ← Back to Atlaso
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
