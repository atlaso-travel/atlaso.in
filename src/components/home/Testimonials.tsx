"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, ShieldCheck, Star } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  type Variants,
} from "framer-motion";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import {
  EASE_OVERSHOOT,
  EASE_SETTLE,
  Reveal,
  Stagger,
  StaggerItem,
  useMotionProfile,
} from "@/components/motion/Reveal";

interface Review {
  headline: string;
  text: string;
  name: string;
  init: string;
  dest: string;
  rating: number;
}

/* Six reviews, one at a time, in a single full-width card.

   Two earlier shapes were wrong for this. A six-card wall gave every quote the
   same 13px grey prose and no reason to read any of them. Splitting it into a
   bare quote on the left and a column of six cards on the right was worse: all
   the visual weight sat in the right-hand list, and pinning the quote column to
   the height of the longest review left a hand-sized hole under the short ones.

   One card carries the quote across the full measure, so the text fills the
   space it is given and the card is the same height whichever review is up. The
   selector is a row of name pills underneath, which stays readable and needs no
   scrolling on a phone. */
const REVIEWS: Review[] = [
  {
    headline: "Finally, total clarity.",
    text: "I compared four operators on one page and booked with complete confidence. Cancellation terms, what was excluded, who the guide actually was — all of it before paying. I'm never going back to chasing quotes over WhatsApp.",
    name: "Rahul Sharma", init: "RS", dest: "Spiti Valley", rating: 5,
  },
  {
    headline: "Saved me ₹8,000.",
    text: "The table showed Summit Squad had everything Peak Pathways offered, at a noticeably lower price. Same itinerary, same inclusions — the difference was sitting there in one column.",
    name: "Priya Menon", init: "PM", dest: "Leh Ladakh", rating: 5,
  },
  {
    headline: "No surprises. At all.",
    text: "Cancellation policy, hidden costs, what's excluded — I saw all of it before paying a rupee. This is how booking travel should work, and it is the first time it has.",
    name: "Kavya Rao", init: "KR", dest: "Coorg", rating: 5,
  },
  {
    headline: "Verified means verified.",
    text: "The badge actually stands for something here. Our guide from Alpine Treks was professional, punctual and genuinely knew the valley we spent the week walking through.",
    name: "Ananya Singh", init: "AS", dest: "Spiti Valley", rating: 5,
  },
  {
    headline: "A group of eight, no stress.",
    text: "Found an operator who could handle our group size with custom pricing. What would have been a week of back-and-forth coordination took a single evening.",
    name: "Vikram Patel", init: "VP", dest: "Leh Ladakh", rating: 4,
  },
  {
    headline: "The Northeast, finally easy.",
    text: "Northeast India is badly under-served online. Atlaso's operator list proved otherwise — Nomad Tribe was spectacular from start to finish.",
    name: "Divya Pillai", init: "DP", dest: "Meghalaya", rating: 5,
  },
];

/** How long each review holds the spotlight, in ms. */
const DWELL = 4000;

/** Warm tonal avatar grounds, cycled — no rainbow. */
const AVATAR_TONES = [
  { bg: "#FFE9E7", fg: "#CC3A40" },
  { bg: "#FFF0DF", fg: "#A05A16" },
  { bg: "#EEF1F5", fg: "#55606F" },
];

function toneFor(index: number) {
  return AVATAR_TONES[index % AVATAR_TONES.length];
}

/* ── Stars ──
   `animated` pops each star in on a slight overshoot when the spotlight
   changes. Everywhere else they render flat. */
function StarRow({
  rating,
  size = 12,
  animated = false,
}: {
  rating: number;
  size?: number;
  animated?: boolean;
}) {
  const { reduced } = useMotionProfile();
  const pop = animated && !reduced;

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          className="inline-flex"
          initial={pop ? { opacity: 0, scale: 0.4 } : false}
          animate={pop ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.42, delay: 0.18 + 0.06 * i, ease: EASE_OVERSHOOT }}
        >
          <Star
            size={size}
            className={i < rating ? "fill-star text-star" : "fill-warm-line text-warm-line"}
          />
        </motion.span>
      ))}
    </div>
  );
}

function Avatar({ review, index, size = 36 }: { review: Review; index: number; size?: number }) {
  const tone = toneFor(index);

  return (
    <span
      aria-hidden
      className="rounded-full flex-shrink-0 flex items-center justify-center font-display font-bold"
      style={{
        width: size,
        height: size,
        background: tone.bg,
        color: tone.fg,
        fontSize: size <= 28 ? 10 : size <= 40 ? 12 : 16,
      }}
    >
      {review.init}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   The spotlight card
   ──────────────────────────────────────────────────────────────────────────── */

/** Slides in from the side the reader is travelling towards. No blur tween — a
    filter on a block this large is what drops frames on a mid-range phone. */
const PANEL: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

function Headline({ text, animate }: { text: string; animate: boolean }) {
  const className =
    "font-display font-black text-espresso text-[1.5rem] sm:text-[1.875rem] leading-[1.2] tracking-display mb-4";

  if (!animate) return <p className={className}>{text}</p>;

  /* Word-level rise. The clip wrapper is what makes it read as type lifting
     into place rather than words fading in. */
  return (
    <p className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.26em]">
          <motion.span
            aria-hidden
            className="inline-block"
            initial={{ y: "108%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.06 + i * 0.05, ease: EASE_SETTLE }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </p>
  );
}

/** The person, set on a tinted panel down the left edge. Fixed content, so it
    is what holds the card to a constant height as the quotes change length. */
function Profile({ review, index }: { review: Review; index: number }) {
  const { reduced } = useMotionProfile();

  return (
    <figcaption className="flex items-center gap-4 md:flex-col md:items-start md:justify-center md:gap-0 p-5 sm:p-6 md:p-8">
      <motion.span
        className="inline-flex"
        initial={reduced ? false : { scale: 0.6, opacity: 0 }}
        animate={reduced ? undefined : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: EASE_OVERSHOOT }}
      >
        <Avatar review={review} index={index} size={52} />
      </motion.span>

      <div className="min-w-0 md:mt-5">
        <p className="font-display font-bold text-[15px] text-espresso truncate">
          {review.name}
        </p>
        <span className="mono-chart flex items-center gap-1 text-[10px] uppercase text-warm-taupe/85 mt-1">
          <MapPin size={9} className="flex-shrink-0" />
          {review.dest}
        </span>
      </div>

      <div className="ml-auto md:ml-0 md:mt-6 flex flex-col items-end md:items-start gap-2">
        <StarRow rating={review.rating} size={13} animated />
        <span className="flex items-center gap-1.5 text-summit-green text-[10.5px] font-medium whitespace-nowrap">
          <ShieldCheck size={12} className="flex-shrink-0" />
          Verified traveller
        </span>
      </div>
    </figcaption>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   The selector
   ──────────────────────────────────────────────────────────────────────────── */

function Pill({
  review,
  index,
  active,
  onSelect,
}: {
  review: Review;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const { reduced } = useMotionProfile();

  return (
    <motion.button
      type="button"
      data-index-row=""
      aria-current={active ? "true" : undefined}
      aria-label={`Read ${review.name}'s review — ${review.headline}`}
      onClick={onSelect}
      className={`relative flex items-center gap-2 rounded-full border pl-1 pr-3.5 py-1 cursor-pointer ${
        active
          ? "border-transparent"
          : "border-warm-line bg-white/60 hover:bg-white hover:border-blush-tint"
      }`}
      whileHover={reduced || active ? undefined : { y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.26, ease: EASE_SETTLE }}
    >
      {/* One surface that slides between pills rather than six that flick on
          and off — the movement is what ties the selector to the card. */}
      {active && (
        <motion.span
          layoutId="testimonial-pill"
          aria-hidden
          className="absolute inset-0 rounded-full bg-white border border-blush-tint"
          style={{ boxShadow: "0 6px 18px rgba(28,31,38,0.10)" }}
          transition={{ duration: 0.44, ease: EASE_SETTLE }}
        />
      )}

      <span className="relative">
        <Avatar review={review} index={index} size={26} />
      </span>
      <span
        className={`relative text-[12px] font-semibold font-display whitespace-nowrap ${
          active ? "text-espresso" : "text-warm-taupe"
        }`}
      >
        {review.name}
      </span>
    </motion.button>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Section
   ──────────────────────────────────────────────────────────────────────────── */

export default function Testimonials() {
  const { reduced } = useMotionProfile();

  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [held, setHeld] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.35 });

  /* Mirrored into a ref because the rAF loop below reads it every frame: if
     pausing were a dependency the timer would tear down and restart, handing
     the reader a fresh dwell instead of the remaining one. */
  const paused = held || !inView;
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const progress = useMotionValue(0);

  const go = useCallback((delta: number) => {
    setDir(delta >= 0 ? 1 : -1);
    setActive((current) => (current + delta + REVIEWS.length) % REVIEWS.length);
  }, []);

  const select = useCallback(
    (next: number) => {
      if (next === active) return;
      setDir(next > active ? 1 : -1);
      setActive(next);
    },
    [active]
  );

  useEffect(() => {
    progress.set(0);
    if (reduced) {
      progress.set(1);
      return;
    }

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const elapsed = now - last;
      last = now;

      if (!pausedRef.current) {
        const next = progress.get() + elapsed / DWELL;
        if (next >= 1) {
          progress.set(1);
          go(1);
          return;
        }
        progress.set(next);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, reduced, progress, go]);

  const review = REVIEWS[active];

  return (
    <section className="relative py-12 sm:py-16 bg-section-warm overflow-hidden">
      <div className="absolute inset-0 wash-top-left pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <Stagger className="mb-8 sm:mb-10" gap={0.07}>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-warm-line pb-7">
            <div>
              <StaggerItem as="p" className="eyebrow mb-3">
                What Travellers Say
              </StaggerItem>
              <StaggerItem
                as="h2"
                className="font-display font-black text-4xl md:text-5xl text-espresso leading-[1.05] tracking-display"
              >
                Loved by <span className="text-signature">adventurers</span>
              </StaggerItem>
            </div>

            <StaggerItem className="flex items-center gap-3 pb-1">
              <StarRow rating={5} size={14} />
              <span className="mono-chart text-[11px] uppercase text-warm-taupe">
                4.9 / 5.0 ·{" "}
                <AnimatedNumber target={2400} suffix="+" duration={1600} /> verified reviews
              </span>
            </StaggerItem>
          </div>
        </Stagger>

        {/* ── Stage ── */}
        <div
          ref={stageRef}
          role="group"
          aria-roledescription="carousel"
          aria-label="Traveller reviews"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={() => setHeld(false)}
        >
          <Reveal distance={28}>
            {/* Dragging the card sideways advances it, which is how anyone on a
                phone will actually move through these. */}
            <motion.div
              className="relative rounded-3xl bg-white border border-warm-line overflow-hidden"
              style={{
                boxShadow: "0 1px 2px rgba(28,31,38,0.04), 0 18px 50px rgba(28,31,38,0.07)",
              }}
              drag={reduced ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (info.offset.x < -64) go(1);
                else if (info.offset.x > 64) go(-1);
              }}
            >
              {/* The signature gradient as a hairline along the top edge — the
                  card's one piece of brand colour. Needs the z-index: the
                  panels below it are opaque and paint over the first 3px,
                  which otherwise clips the line to the quote half of the card. */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[3px] bg-cta-gradient z-10"
              />

              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.figure
                  key={review.name}
                  custom={dir}
                  variants={reduced ? undefined : PANEL}
                  initial={reduced ? { opacity: 0 } : "enter"}
                  animate={reduced ? { opacity: 1 } : "center"}
                  exit={reduced ? { opacity: 0 } : "exit"}
                  transition={{ duration: reduced ? 0.22 : 0.48, ease: EASE_SETTLE }}
                  /* Floored at the tallest of the six so the transport row and
                     the pills below it hold still as the rotation moves on.
                     Two values because the stacked layout below `md` lets the
                     quote length drive the height (measured 279–330px), while
                     the two-column one barely moves (238–260px). */
                  className="grid grid-cols-1 md:grid-cols-[15rem_1fr] min-h-[21rem] md:min-h-[16.5rem]"
                >
                  <div className="relative bg-blush-wash border-b md:border-b-0 md:border-r border-warm-line">
                    <Profile review={review} index={active} />
                  </div>

                  {/* Centred rather than top-aligned: the profile panel sets the
                      card height, so a two-line quote would otherwise sit up
                      against the top edge with a band of white beneath it. */}
                  <blockquote className="relative flex flex-col justify-center p-5 sm:p-7 md:p-9">
                    {/* Watermark, set in the corner rather than in the flow so
                        it decorates the panel instead of pushing the quote
                        down and stealing a line of vertical space. */}
                    <span
                      aria-hidden
                      className="absolute top-3 right-6 font-display font-black text-[5rem] leading-none text-muted-coral/[0.09] select-none pointer-events-none"
                    >
                      &rdquo;
                    </span>

                    <div className="relative">
                      <Headline text={review.headline} animate={!reduced} />
                      <motion.p
                        className="text-warm-taupe text-[14.5px] sm:text-[15.5px] font-body leading-[1.75] max-w-2xl"
                        initial={reduced ? false : { opacity: 0, y: 12 }}
                        animate={reduced ? undefined : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.16, ease: EASE_SETTLE }}
                      >
                        {review.text}
                      </motion.p>
                    </div>
                  </blockquote>
                </motion.figure>
              </AnimatePresence>

              {/* ── Transport ── */}
              <div className="flex items-center gap-4 border-t border-warm-line px-5 sm:px-7 md:px-9 py-3.5">
                <span className="mono-chart text-[10px] uppercase text-warm-taupe/80 tabular-nums">
                  {String(active + 1).padStart(2, "0")} / {String(REVIEWS.length).padStart(2, "0")}
                </span>

                <span className="relative flex-1 h-[3px] rounded-full bg-warm-line overflow-hidden">
                  <motion.span
                    className="absolute inset-0 bg-cta-gradient"
                    style={{ scaleX: progress, originX: 0 }}
                  />
                </span>

                <div className="flex items-center gap-2">
                  {([-1, 1] as const).map((delta) => (
                    <motion.button
                      key={delta}
                      type="button"
                      onClick={() => go(delta)}
                      aria-label={delta < 0 ? "Previous review" : "Next review"}
                      className="w-8 h-8 rounded-full border border-warm-line bg-white text-warm-taupe flex items-center justify-center cursor-pointer hover:text-coral-ink hover:border-blush-tint"
                      whileHover={reduced ? undefined : { y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ duration: 0.24, ease: EASE_SETTLE }}
                    >
                      {delta < 0 ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </Reveal>

          {/* Selector. Wraps on narrow viewports, so every reviewer stays
              reachable without a scroller. */}
          <Stagger
            className="flex flex-wrap justify-center gap-2 mt-6"
            delay={0.12}
            gap={0.05}
          >
            {REVIEWS.map((item, i) => (
              <StaggerItem key={item.name}>
                <Pill
                  review={item}
                  index={i}
                  active={i === active}
                  onSelect={() => select(i)}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* ── Footing ── */}
        <Reveal className="mt-9 pt-6 border-t border-warm-line" delay={0.05}>
          <p className="flex items-center gap-2 text-[11.5px] text-warm-taupe font-body">
            <ShieldCheck size={13} className="text-summit-green flex-shrink-0" />
            Every review comes from a completed, paid booking with a verified operator.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
