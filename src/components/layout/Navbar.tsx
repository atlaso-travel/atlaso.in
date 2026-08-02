"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Compass, Heart, Menu, Scale, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ContourField from "@/components/ui/ContourField";

const EASE_SETTLE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* The compass mark. The needle and ring are separate groups so the needle can
   turn on hover — the brand is an atlas, and a compass that responds to the
   cursor is the smallest possible way to say so. */
function AtlasoIcon({ size = 36, spin = false }: { size?: number; spin?: boolean }) {
  const reduced = useReducedMotion();

  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="#FF5A5F" />
      <circle
        cx="18"
        cy="18"
        r="8"
        stroke="white"
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />

      {/* Needle — rotates about the centre of the mark */}
      <motion.g
        style={{ originX: "18px", originY: "18px" }}
        animate={{ rotate: spin && !reduced ? 45 : 0 }}
        transition={{ duration: 0.9, ease: EASE_SETTLE }}
      >
        <path d="M18 10 Q22 15 18 26 Q14 15 18 10Z" fill="white" opacity="0.55" />
        <path d="M10 18 Q15 14 26 18 Q15 22 10 18Z" fill="white" opacity="0.55" />
      </motion.g>

      <line x1="18" y1="10" x2="18" y2="26" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="18" x2="26" y2="18" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <circle cx="18" cy="18" r="2" fill="white" />
    </svg>
  );
}

function AtlasoWordmark({ size = 20, onDark = true }: { size?: number; onDark?: boolean }) {
  const ink = onDark ? "text-white" : "text-espresso";

  return (
    <span
      className="font-display font-bold tracking-[-0.5px] leading-none"
      style={{ fontSize: size }}
    >
      <span className={ink}>Atl</span>
      <span style={{ color: "#FF5A5F" }}>a</span>
      <span className={ink}>so</span>
    </span>
  );
}

const NAV_LINKS = [
  { href: "/destinations", label: "Destinations", icon: Compass },
  { href: "/saved", label: "Saved Trips", icon: Heart },
  { href: "/comparisons", label: "My Comparisons", icon: Scale },
  { href: "/operators", label: "For Operators", icon: Building2 },
];

/* A link whose underline draws in from the left rather than fading on. The
   difference is small and it is the whole point — a rule that grows reads as
   deliberate, a rule that appears reads as a CSS default. The route you are
   already on keeps that underline drawn. */
function NavLink({
  href,
  label,
  floating,
  active,
}: {
  href: string;
  label: string;
  /* Sitting on the photograph rather than on the solid bar. Over the sunset the
     type is white; on the bar it is the page's own ink, because a white bar
     with white type on it is not a state. */
  floating?: boolean;
  active?: boolean;
}) {
  const rest = floating
    ? active
      ? "text-white"
      : "text-white/85"
    : active
      ? "text-espresso"
      : "text-warm-taupe";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative ${rest} ${
        floating ? "hover:text-white" : "hover:text-espresso"
      } text-sm font-medium transition-colors duration-200 py-1`}
    >
      {label}
      <span
        aria-hidden
        className={`bg-cta-gradient absolute left-0 -bottom-0.5 h-[1.5px] w-full origin-left rounded-full transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </Link>
  );
}

interface NavbarProps {
  /* Float the bar over a full-bleed hero instead of sitting above it. Only
     routes that actually open on a dark photograph should pass this — the
     transparent state has no background of its own to keep white text
     legible, and over a light page it would be unreadable. Off by default so
     every existing route keeps the solid bar it was designed against. */
  overlay?: boolean;
}

/* Two independent thresholds, because they answer different questions.

   SOLID_AT is about legibility and is deliberately tiny. The bar used to stay
   transparent for the whole height of the hero, which meant the headline
   scrolled up *through* it — the bar has no background of its own to hide
   behind, so for several hundred pixels the nav links sat on top of moving
   display type. A transparent bar is only safe while nothing is passing under
   it, which is to say at rest at the very top.

   CONDENSE_AT is about proportion, and can afford to wait — shrinking the bar
   the instant a wheel moves reads as a twitch. */
const SOLID_AT = 12;
const CONDENSE_AT = 150;

/* Scroll position read as an external store rather than mirrored into state
   from an effect.

   Two things fall out of that. React calls the snapshot itself, so the very
   first committed render already agrees with a restored scroll position —
   there is no frame where a reload halfway down the page paints a transparent
   bar over content it should be sitting on. And because the snapshot is a
   boolean, React bails out of re-rendering on every scroll tick that does not
   actually cross the threshold. */
const subscribeToScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};

/** The server has no scroll position; the bar starts at rest. */
const atRest = () => false;

export default function Navbar({ overlay = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const reduced = useReducedMotion();
  const pathname = usePathname();

  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > SOLID_AT,
    atRest
  );
  const condensed = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > CONDENSE_AT,
    atRest
  );

  /* Transparent only at rest over the hero photograph. */
  const floating = overlay && !scrolled;

  /* The resting bar is the page's own white, not the navy it used to be. On a
     white page that navy read as a grey slab bolted to the top; frosted white
     over a warm hairline lets the content scroll under it instead. */
  const chrome = {
    tint: floating ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.82)",
    hairline: floating ? "rgba(239,227,222,0)" : "rgba(239,227,222,1)",
    shadow: scrolled
      ? "0 6px 28px rgba(28,31,38,0.08)"
      : "0 0 0 rgba(0,0,0,0)",
  };

  const settle = { duration: reduced ? 0 : 0.45, ease: EASE_SETTLE };

  // A fixed overlay behind a scrollable body still scrolls the body underneath.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <motion.nav
      className={overlay ? "fixed inset-x-0 top-0 z-50" : "sticky top-0 z-50"}
      animate={{ boxShadow: chrome.shadow }}
      transition={settle}
    >
      {/* ── Legibility scrim ──
          Belongs to the photograph, not to the bar: a short gradient at the
          top edge of the frame that guarantees white type reads even where the
          sunset behind it is at its brightest. Keeping it separate is the
          point — it buys contrast without the bar itself becoming a panel, so
          the hero still reads as one uninterrupted image. It clears out as the
          bar's own background arrives. */}
      {overlay && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[190%] bg-gradient-to-b from-[#0A1628]/70 via-[#0A1628]/26 to-transparent"
          animate={{ opacity: floating ? 1 : 0 }}
          transition={settle}
        />
      )}

      {/* ── Bar chrome ──
          Blur underneath, tint over it. The order matters: an opaque-ish tint
          painted below the blur would be all the blur had left to sample, and
          the frosting would do nothing. Fading the blur layer's opacity rather
          than switching backdrop-filter on and off is what keeps the change
          smooth instead of snapping at the threshold. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(16px) saturate(150%)",
            WebkitBackdropFilter: "blur(16px) saturate(150%)",
          }}
          animate={{ opacity: floating ? 0 : 1 }}
          transition={settle}
        />
        {/* The class carries the resting colour so the bar is already painted
            in the first frame; framer's inline style takes over from there.
            Without it the tint exists only once motion has mounted, which on a
            slow connection means nav type on a bare page. */}
        <motion.div
          className={`absolute inset-0 ${overlay ? "" : "bg-white/85"}`}
          animate={{ backgroundColor: chrome.tint }}
          transition={settle}
        />
      </div>
      <motion.div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        animate={{ backgroundColor: chrome.hairline }}
        transition={settle}
      />

      <motion.div
        /* h-16 is the same 64px the animation rests at. Stating it in CSS too
           means the bar reserves its height before hydration instead of
           collapsing to the logo and shunting the page down when motion
           mounts. */
        className="relative h-16 max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between"
        animate={{ height: condensed && !reduced ? 56 : 64 }}
        transition={settle}
        /* Belt and braces with the scrim: a soft shadow on the glyphs
           themselves, so the wordmark holds its edge against a bright patch of
           sky the gradient alone doesn't cover. */
        style={{
          textShadow: floating ? "0 1px 14px rgba(6,14,26,0.55)" : "none",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0"
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
        >
          <motion.span
            animate={{ scale: condensed && !reduced ? 0.9 : 1 }}
            transition={{ duration: 0.45, ease: EASE_SETTLE }}
            className="flex-shrink-0"
          >
            <AtlasoIcon size={36} spin={logoHover} />
          </motion.span>

          <div className="flex flex-col">
            <AtlasoWordmark size={20} onDark={floating} />
            {/* The strapline is the first thing to go when the bar condenses. */}
            <AnimatePresence initial={false}>
              {!condensed && (
                <motion.span
                  key="tagline"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: EASE_SETTLE }}
                  className={`hidden sm:block overflow-hidden text-[10px] ${
                    floating ? "text-white/60" : "text-warm-taupe"
                  } tracking-[0.02em] font-body`}
                >
                  Your map to the right operator.
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              floating={floating}
              active={pathname === link.href}
            />
          ))}
        </div>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <motion.span
            className="inline-block"
            whileHover={
              reduced ? undefined : { y: -1, boxShadow: "0 8px 22px rgba(255,90,95,0.38)" }
            }
            whileTap={reduced ? undefined : { scale: 0.97 }}
            transition={{ duration: 0.3, ease: EASE_SETTLE }}
            style={{ borderRadius: 9999 }}
          >
            <Link
              href="/operators"
              className="bg-cta-gradient inline-flex text-white rounded-full px-5 py-1.5 text-sm font-semibold"
            >
              List Your Package
            </Link>
          </motion.span>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-2 -mr-2 transition-colors duration-300 ${
            floating ? "text-white" : "text-espresso"
          }`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.div>

      {/* ── Mobile menu ──
          Was an instant show/hide. Now the panel fades and the links arrive on
          a 55ms stagger, which is the same entrance language the homepage
          sections use. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.32, ease: EASE_SETTLE }}
          >
            <div className="absolute inset-0 bg-atlas-night" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,90,95,0.20),transparent_45%),radial-gradient(circle_at_80%_85%,rgba(255,168,92,0.14),transparent_50%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B162A]/40 via-[#0A1628] to-[#07101E]" />
            <ContourField
              className="absolute inset-0 h-full w-full opacity-40"
              opacity={0.4}
              scale={64}
              stroke="255,255,255"
            />

            {/* z-20 — strictly above the z-10 content column below, so the
                empty margin around the centred links (still part of that
                column's full-height box) can never steal this click. */}
            <button
              className="absolute top-4 right-4 z-20 text-white p-2.5 rounded-full bg-white/10 border border-white/15 transition-colors duration-200 hover:bg-white/20 hover:border-white/30"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>

            <motion.div
              className="relative z-10 h-full flex flex-col justify-center px-6"
              initial="hidden"
              animate="shown"
              variants={{
                hidden: {},
                shown: { transition: { staggerChildren: reduced ? 0 : 0.055, delayChildren: 0.08 } },
              }}
            >
              <div className="max-w-sm w-full mx-auto">
                <motion.div
                  className="flex items-center gap-3 mb-9"
                  variants={{
                    hidden: { opacity: 0, y: reduced ? 0 : 12 },
                    shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_SETTLE } },
                  }}
                >
                  <AtlasoIcon size={32} />
                  <div>
                    <AtlasoWordmark size={22} />
                    <p className="text-white/45 text-xs mt-1 font-body">
                      Find the right operator, faster.
                    </p>
                  </div>
                </motion.div>

                <div className="flex flex-col gap-2.5">
                  {NAV_LINKS.map((link) => {
                    const active = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <motion.div
                        key={link.href}
                        variants={{
                          hidden: { opacity: 0, y: reduced ? 0 : 14 },
                          shown: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.5, ease: EASE_SETTLE },
                          },
                        }}
                      >
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-white text-base font-semibold transition-all duration-300 ${
                            active
                              ? "bg-white/[0.12] border-white/25"
                              : "bg-white/[0.05] border-white/10 hover:bg-white/[0.1] hover:border-white/25"
                          }`}
                          onClick={() => setMenuOpen(false)}
                        >
                          <span
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                            style={{ backgroundImage: "var(--gradient-signature)" }}
                          >
                            <Icon size={16} className="text-white" />
                          </span>
                          <span className="flex-1">{link.label}</span>
                          <span className="text-white/35 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/70">
                            →
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  className="mt-8"
                  variants={{
                    hidden: { opacity: 0, y: reduced ? 0 : 14 },
                    shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_SETTLE } },
                  }}
                >
                  <Link
                    href="/operators"
                    className="bg-cta-gradient block w-full text-white text-center text-base font-semibold px-6 py-3.5 rounded-full"
                    onClick={() => setMenuOpen(false)}
                  >
                    List Your Package
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
