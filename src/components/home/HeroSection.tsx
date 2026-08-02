"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import DestinationInput from "./DestinationInput";
import DatePicker from "./DatePicker";
import TravelersInput from "./TravelersInput";
import { destinations } from "@/data/destinations";
import { EASE_SETTLE, useMotionProfile } from "@/components/motion/Reveal";

/* Warm tonal avatars drawn from the coral/orange family. Deeper than the
   accents themselves because these carry white initials at 11px — the brand
   coral and sunset orange are fills, not text grounds. */
const AVATARS = [
  { initial: "R", bg: "#E0474C" },
  { initial: "M", bg: "#C2632A" },
  { initial: "P", bg: "#CC3A40" },
  { initial: "A", bg: "#A05A16" },
  { initial: "S", bg: "#8A3D42" },
];

/* ── Hero frames ──
   All three are sunset or first-light mountain frames whose sky sits in the
   same coral-into-amber range as the signature gradient, so the photograph and
   the brand agree instead of competing. Each also has a quieter left third,
   which is where the copy lands.

   Index 0 is the frame the server renders and the browser preloads — it is the
   LCP element, so it is never chosen at random. The others are swapped in on
   the client so a returning visitor doesn't meet the identical poster every
   time. Two-thirds of loads therefore fetch one extra image; delete the tail
   of this array to turn that off. */
const HERO_FRAMES = [
  {
    src: "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=2000&q=80",
    alt: "Layered mountain ridges receding into a coral and amber sunset, a lone trekker standing on the near ridgeline",
    position: "center 58%",
  },
  {
    src: "https://images.unsplash.com/photo-1490682143684-14369e18dce8?w=2000&q=80",
    alt: "Sunrise breaking over a misty forested valley, the ridges lit amber and gold",
    position: "center 45%",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80",
    alt: "Snow peaks above a sea of cloud, the sky behind them turning coral at first light",
    position: "center 55%",
  },
];

/* The trailhead readout uses the real coordinates of the first destination in
   the catalogue rather than decorative numbers, so it stays truthful if the
   data changes. This is also the destination the search falls back to. */
const TRAILHEAD = destinations[0];

/* The rotation has to produce a different answer on the client than the server
   baked into the HTML, which is the one thing a value read during render must
   never do. useSyncExternalStore is the sanctioned way out: React takes the
   server snapshot through hydration and only then asks for the live one, so
   the swap happens as a deliberate re-render rather than a mismatch. The pick
   is memoised per store, so re-renders keep the frame they started with. */
function createFrameStore() {
  let picked: number | null = null;

  return {
    subscribe: () => () => {},
    getSnapshot: () =>
      (picked ??= Math.floor(Math.random() * HERO_FRAMES.length)),
    getServerSnapshot: () => 0,
  };
}

const coord = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(4)}°${value >= 0 ? positive : negative}`;

export default function HeroSection() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState("");

  const sectionRef = useRef<HTMLElement>(null);
  const { reduced } = useMotionProfile();

  /* Frame rotation. Frame 0 stays painted underneath until the alternate has
     actually decoded, so the change is a dissolve rather than a gap where the
     hero used to be. */
  const [frameStore] = useState(createFrameStore);
  const frame = useSyncExternalStore(
    frameStore.subscribe,
    frameStore.getSnapshot,
    frameStore.getServerSnapshot
  );
  const [alternateReady, setAlternateReady] = useState(false);

  /* Parallax: the background drifts at ~82% of scroll speed. Small enough
     that nobody consciously notices it, large enough that the hero feels
     like it has depth rather than being a flat photo. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentFade = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);

  const handleSearch = () => {
    const params = new URLSearchParams({
      destination: destination || TRAILHEAD.name,
      dates,
      people: travelers,
    });
    router.push(`/search?${params.toString()}`);
  };

  /* One timeline for the whole hero: readout, heading, sub, widget, proof.
     Each step is 110ms behind the last, so the eye is led down to the search
     box rather than everything arriving at once. */
  const step = (i: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0.3 : 0.75, delay: i * 0.11, ease: EASE_SETTLE },
  });

  return (
    <section
      ref={sectionRef}
      data-hero
      /* The navbar floats over this section rather than sitting above it in
         the flow, so the photograph runs to the very top of the window. The
         top padding carries the nav's own height plus the spacing the copy
         had before. */
      className="relative z-10 w-full pt-32 sm:pt-40 pb-16 sm:pb-24 "
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: reduced ? 0 : bgY }}>
          {/* Ken Burns. 28s from 1.0 to 1.05 — around a pixel and a half of
              drift per second at this size, which is below the threshold most
              people register as motion but reads as "alive" peripherally. */}
          <motion.div
            className="absolute -inset-[3%]"
            initial={{ scale: 1 }}
            animate={{ scale: reduced ? 1 : 1.05 }}
            transition={{
              duration: 28,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Image
              src={HERO_FRAMES[0].src}
              /* Once an alternate is on top, frame 0 is no longer what the
                 page is showing — it hands the description over rather than
                 leaving two competing ones in the tree. */
              alt={frame === 0 ? HERO_FRAMES[0].alt : ""}
              aria-hidden={frame !== 0}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: HERO_FRAMES[0].position }}
              priority
            />

            {frame !== 0 && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: alternateReady ? 1 : 0 }}
                transition={{ duration: reduced ? 0.2 : 1.2, ease: "easeOut" }}
              >
                <Image
                  src={HERO_FRAMES[frame].src}
                  alt={HERO_FRAMES[frame].alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: HERO_FRAMES[frame].position }}
                  onLoad={() => setAlternateReady(true)}
                />
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* The shared photo grade first, so the hero sits on the same
            temperature as every destination image. Scrims stack above it. */}
        <div className="photo-grade absolute inset-0" aria-hidden />

        {/* ── Readability scrim ──
            One layer, not three. It is weighted hard to the left where the
            copy sits and released to nothing before the right edge, so the
            sunset keeps its own brightness and colour separation instead of
            being flattened under a full-frame wash. The tint is warm rather
            than neutral black — a grey wash over an orange sky is exactly
            what made the old hero read as mud. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(96deg, rgba(16,10,8,0.88) 0%, rgba(16,10,8,0.74) 26%, rgba(16,10,8,0.40) 48%, rgba(16,10,8,0.10) 72%, rgba(16,10,8,0) 90%)",
          }}
        />

        {/* On a phone the copy runs the full width, so the scrim has to as
            well. Still lighter than the stack it replaces. */}
        <div
          aria-hidden
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(178deg, rgba(16,10,8,0.60) 0%, rgba(16,10,8,0.70) 45%, rgba(16,10,8,0.80) 100%)",
          }}
        />

        {/* Just enough weight at the foot of the frame to seat the search bar
            and the proof row on the bright side of the photograph. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/5 hidden md:block"
          style={{
            background:
              "linear-gradient(to top, rgba(16,10,8,0.52) 0%, rgba(16,10,8,0) 100%)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <motion.div
        className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8"
        style={{ opacity: reduced ? 1 : contentFade }}
      >
        <h1 className="sr-only">Compare Travel Operators in India — Atlaso</h1>

        {/* ── Trailhead readout ──
            Instrumentation rather than marketing copy. Expedition outfitters
            and survey charts both label their starting point; it signals
            "we know the terrain" far better than another benefits strapline. */}
        <motion.div
          {...step(0)}
          className="flex items-center gap-2.5 mb-6 text-white/45 mono-chart text-[10px] sm:text-[11px] uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-muted-coral flex-shrink-0" />
          <span className="text-white/60">Trailhead</span>
          <span className="hidden sm:inline text-white/25">/</span>
          <span className="hidden sm:inline">
            {coord(TRAILHEAD.latitude, "N", "S")} {coord(TRAILHEAD.longitude, "E", "W")}
          </span>
          <span className="text-white/25">/</span>
          <span>{TRAILHEAD.name}</span>
        </motion.div>

        {/* ── Heading ── */}
        <motion.div {...step(1)} className="mb-6">
          <p className="text-[2.6rem] md:text-[3.2rem] lg:text-[3.6rem] font-bold text-white leading-[1.15] font-display tracking-display mb-1">
            Your Map to the
          </p>

          {/* The signature gradient as text — the one sanctioned exception to
              keeping headline type solid, because it sits directly over the
              sunset photograph whose colours it borrows. A solid fallback
              colour is set underneath in case background-clip is unsupported. */}
          <span className="relative inline-block">
            <p className="text-signature text-[3.2rem] md:text-[4rem] lg:text-[4.8rem] font-black leading-[1.1] font-display tracking-display">
              RIGHT OPERATOR
            </p>
            <motion.span
              aria-hidden
              className="absolute left-0 w-full rounded-full bg-brand-coral/45 origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: reduced ? 0.3 : 1.05,
                delay: reduced ? 0 : 0.55,
                ease: EASE_SETTLE,
              }}
            />
          </span>
        </motion.div>

        {/* ── Subtext ── */}
        <motion.p
          {...step(2)}
          className="text-white/70 text-[1rem] md:text-[1.0625rem] font-body leading-[1.7] mb-10 max-w-xl"
        >
          Discover destinations, compare verified tour operators side-by-side,
          and book trips transparently —{" "}
          <span className="text-white font-semibold">all in one place!</span>
        </motion.p>

        {/* ── Search widget ── */}
        <motion.div {...step(3)} className="mb-8 relative z-10 max-w-4xl">
          <div
            className="glass-dark rounded-2xl"
            style={{ padding: "8px", boxShadow: "0 20px 60px rgba(20,12,10,0.35)" }}
          >
            <div className="flex flex-col md:flex-row md:items-stretch gap-1.5">
              <div className="flex-1 min-w-0 md:border-r md:border-white/10 md:pr-1.5">
                <DestinationInput value={destination} onChange={setDestination} />
              </div>
              <div className="flex-1 min-w-0 md:border-r md:border-white/10 md:pr-1.5">
                <DatePicker value={dates} onChange={setDates} />
              </div>
              <div className="md:w-44 min-w-0">
                <TravelersInput value={travelers} onChange={setTravelers} />
              </div>
              <div className="flex-shrink-0">
                <motion.button
                  onClick={handleSearch}
                  whileHover={
                    reduced
                      ? undefined
                      : { y: -2, boxShadow: "0 12px 30px rgba(255,90,95,0.42)" }
                  }
                  whileTap={reduced ? undefined : { scale: 0.985 }}
                  transition={{ duration: 0.32, ease: EASE_SETTLE }}
                  className="bg-cta-gradient w-full md:w-auto md:h-full px-5 py-3.5 md:py-0 text-white font-semibold text-sm rounded-2xl md:rounded-xl flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search size={16} />
                  Compare Operators
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Social proof ── */}
        <motion.div
          {...step(4)}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-w-4xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {AVATARS.map(({ initial, bg }) => (
                <div
                  key={initial}
                  className="w-9 h-9 rounded-full border-2 border-white/50 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                  style={{ background: bg }}
                >
                  {initial}
                </div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-white/50 bg-muted-coral flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                +
              </div>
            </div>
            <span className="text-white/70 text-sm font-body leading-snug">
              Trusted by <span className="text-white font-semibold">250k+</span>{" "}
              Travellers throughout India
            </span>
          </div>

          <div className="hidden sm:block w-px h-8 bg-white/15" />

          <div className="flex items-center gap-1.5">
            <span className="text-star text-lg leading-none">★</span>
            <span className="text-white font-bold text-sm">4.2/5</span>
            <span className="text-white/55 text-sm font-body">
              from 14,000+ Travellers
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
