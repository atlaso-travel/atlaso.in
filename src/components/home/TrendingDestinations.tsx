"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Plane,
  Mountain,
  CalendarRange,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { destinations, type Destination } from "@/data/destinations";
import { formatPrice } from "@/lib/utils";
import ContourField from "@/components/ui/ContourField";
import GradedImage from "@/components/ui/GradedImage";
import { generateDestinationAlt } from "@/lib/seo/altText";
import {
  boxOf,
  fitView,
  formatCoord,
  groupByProximity,
  INDIA_BOX,
  INDIA_POINTS,
  niceStep,
  padBox,
  ringPath,
  scaleOf,
  toLng,
  toMapX,
  toMapY,
  type SafeArea,
  type ViewRect,
} from "@/lib/map/india";
import {
  EASE_SETTLE,
  Reveal,
  Stagger,
  StaggerItem,
  useMotionProfile,
} from "@/components/motion/Reveal";

/* ── Chart constants ──
   Waypoints closer together than PIN_MERGE_PX collapse into one counted pin;
   a pin only earns a text label if the nearest other pin is LABEL_ROOM_PX
   away. Both are in screen pixels rather than degrees on purpose — what makes
   a map unreadable is overlap at the size it is actually drawn, so the rule
   has to be expressed at that size and re-evaluated on every zoom. */
const PIN_MERGE_PX = 30;
const LABEL_ROOM_PX = 86;
/** Ceiling on cluster zoom, as a multiple of the all-India scale. Past this
    the outline is off-frame in every direction and the chart stops reading as
    a map of anywhere. */
const MAX_ZOOM = 14;

/** One value, because the container is capped at max-w-5xl — a viewport-based
    `xl:` width would widen the card past the gutter the chart reserved for it. */
const CARD_W_LG = 344;

/** Matches Tailwind's `lg:` so the reserved card gutter and the CSS that
    actually floats the card can never disagree. */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

/** Live pixel size of the chart surface. Everything downstream is computed in
    real pixels, so the geometry is right at any container width without a
    fixed viewBox pretending otherwise. */
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

/**
 * Eases the whole window rather than transforming a rendered layer.
 *
 * The alternative — one CSS transform over an SVG group — cannot carry the
 * HTML waypoint buttons with it, and counter-scaling them to keep the pins a
 * fixed size is more moving parts than re-projecting a hundred points per
 * frame. Everything is derived from one window, so the outline, the graticule
 * and the pins are incapable of drifting out of register.
 */
function useTweenedView(target: ViewRect | null, instant: boolean) {
  const [view, setView] = useState<ViewRect | null>(target);
  const currentRef = useRef<ViewRect | null>(target);

  useEffect(() => {
    if (!target) return;

    const from = currentRef.current;
    if (!from || instant) {
      currentRef.current = target;
      setView(target);
      return;
    }
    if (from.x === target.x && from.y === target.y && from.w === target.w) return;

    let raf = 0;
    const start = performance.now();
    const DURATION = 780;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 4);
      const next = {
        x: from.x + (target.x - from.x) * eased,
        y: from.y + (target.y - from.y) * eased,
        w: from.w + (target.w - from.w) * eased,
        h: from.h + (target.h - from.h) * eased,
      };
      currentRef.current = next;
      setView(next);
      if (t < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, instant]);

  return view;
}

export default function TrendingDestinations() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPicked, setUserPicked] = useState(false);
  /** Ids the chart is currently framed on. Null is the whole country. */
  const [focusIds, setFocusIds] = useState<string[] | null>(null);
  const { reduced } = useMotionProfile();

  const [chartRef, size] = useElementSize<HTMLDivElement>();
  const isWide = useMediaQuery("(min-width: 1024px)");

  const active = destinations[activeIndex];

  /* Slow auto-advance so the chart demonstrates that it is interactive, and a
     hard stop the moment someone picks for themselves — an auto-rotating
     selector that keeps overriding the user is worse than a static one. It
     only ever moves the selection, never the framing; a viewport that pans on
     its own is disorienting rather than alive. */
  useEffect(() => {
    if (reduced || userPicked) return;
    const timer = setInterval(
      () => setActiveIndex((prev) => (prev + 1) % destinations.length),
      6000
    );
    return () => clearInterval(timer);
  }, [reduced, userPicked]);

  /* ── Framing ── */

  const safe: SafeArea | null = useMemo(() => {
    if (!size) return null;
    if (!isWide) {
      return { x: 28, y: 34, w: Math.max(120, size.w - 56), h: Math.max(120, size.h - 68) };
    }
    /* 24px card inset + 40px of breathing room, so a label on the rightmost
       waypoint still has somewhere to sit before it slides under the card. */
    return {
      x: 24,
      y: 40,
      w: Math.max(160, size.w - 24 - (CARD_W_LG + 64)),
      h: Math.max(160, size.h - 80),
    };
  }, [size, isWide]);

  const anchor = useMemo(() => ({ x: isWide ? 0.42 : 0.5, y: 0.5 }), [isWide]);

  const baseView = useMemo(
    () => (size && safe ? fitView(padBox(INDIA_BOX, 0.04, 0.3), size, safe, Infinity, anchor) : null),
    [size, safe, anchor]
  );

  const targetView = useMemo(() => {
    if (!size || !safe || !baseView) return null;
    if (!focusIds?.length) return baseView;

    const focused = destinations.filter((d) => focusIds.includes(d.id));
    if (!focused.length) return baseView;

    const box = padBox(
      boxOf(focused.map((d) => ({ x: toMapX(d.longitude), y: toMapY(d.latitude) }))),
      0.45,
      0.55
    );
    return fitView(box, size, safe, scaleOf(baseView, size.w) * MAX_ZOOM, anchor);
  }, [size, safe, baseView, focusIds, anchor]);

  const view = useTweenedView(targetView, reduced);
  const scale = view && size ? scaleOf(view, size.w) : 0;

  /* ── Waypoints ── */

  const projected = useMemo(() => {
    if (!view) return [];
    return destinations.map((dest) => ({
      item: dest,
      x: (toMapX(dest.longitude) - view.x) * scale,
      y: (toMapY(dest.latitude) - view.y) * scale,
    }));
  }, [view, scale]);

  const groups = useMemo(() => groupByProximity(projected, PIN_MERGE_PX), [projected]);

  const activePoint = projected.find((p) => p.item.id === active.id);

  const zoomTo = useCallback((items: Destination[]) => {
    setFocusIds(items.map((d) => d.id));
  }, []);

  /** Picking from the chip row only re-frames when the waypoint has no pin of
      its own to look at — otherwise selecting from the list would keep
      yanking the viewport around for no gain. */
  const pick = useCallback(
    (dest: Destination) => {
      setUserPicked(true);
      setActiveIndex(destinations.findIndex((d) => d.id === dest.id));

      const merged = groups.find(
        (g) => g.items.length > 1 && g.items.some((d) => d.id === dest.id)
      );
      if (merged) zoomTo(merged.items);
    },
    [groups, zoomTo]
  );

  /** A pin click either selects, or — if it stands for several waypoints —
      re-frames on them so they separate, and selects the first. */
  const openGroup = useCallback(
    (items: Destination[]) => {
      setUserPicked(true);
      setActiveIndex(destinations.findIndex((d) => d.id === items[0].id));
      if (items.length > 1) zoomTo(items);
    },
    [zoomTo]
  );

  /* ── Graticule, redrawn at whatever interval suits the current zoom ── */

  const graticule = useMemo(() => {
    if (!view || !size || !scale) return { meridians: [], parallels: [] };

    const latStep = niceStep(view.h, 6);
    const lngStep = niceStep(toLng(view.w), 6);

    const latTop = -view.y;
    const latBottom = -(view.y + view.h);
    const parallels: { lat: number; y: number }[] = [];
    for (
      let lat = Math.ceil(latBottom / latStep) * latStep;
      lat <= latTop;
      lat += latStep
    ) {
      parallels.push({ lat, y: (toMapY(lat) - view.y) * scale });
    }

    const lngLeft = toLng(view.x);
    const lngRight = toLng(view.x + view.w);
    const meridians: { lng: number; x: number }[] = [];
    for (
      let lng = Math.ceil(lngLeft / lngStep) * lngStep;
      lng <= lngRight;
      lng += lngStep
    ) {
      meridians.push({ lng, x: (toMapX(lng) - view.x) * scale });
    }

    return { meridians, parallels };
  }, [view, size, scale]);

  /* Chips list what is currently in frame, which is the same thing the pins
     show. A flat row of every destination stops working long before the map
     does. */
  const inFrame = focusIds?.length
    ? destinations.filter((d) => focusIds.includes(d.id))
    : destinations;

  const META = [
    { Icon: Mountain,      label: "Terrain",  value: active.category      },
    { Icon: CalendarRange, label: "Season",   value: active.bestTime      },
    { Icon: Clock,         label: "Duration", value: active.avgDuration   },
    { Icon: Plane,         label: "Fly into", value: active.nearestAirport },
  ];

  return (
      <section className="relative overflow-hidden bg-section-warm ">
        <div className="absolute inset-0 wash-top-right pointer-events-none" />

        <div className="relative max-w-5xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <Stagger className="mb-10 max-w-2xl" gap={0.07}>
            <StaggerItem as="p" className="eyebrow mb-3">
              The Catalogue
            </StaggerItem>
            <StaggerItem
              as="h2"
              className="text-[2.5rem] sm:text-[3.25rem] font-black text-espresso leading-[1.05] font-display tracking-display mb-4"
            >
              Every region.
              <br />
              <span className="text-signature">Plotted, not listed.</span>
            </StaggerItem>
            <StaggerItem as="p" className="text-warm-taupe font-body leading-relaxed text-[0.9375rem]">
              Every destination we cover, at its real position on the map. Pick a
              waypoint to see what it costs, when to go, and how many operators
              run it — waypoints that sit close together open up as you go in.
            </StaggerItem>
          </Stagger>

          <Reveal distance={28}>
            <div className="relative">

              {/* ── The chart ── */}
              <div
                ref={chartRef}
                className="relative h-[400px] sm:h-[500px] lg:h-[620px] rounded-[28px] border border-warm-line bg-white/55 overflow-hidden"
              >
                <ContourField
                  seed={4.7}
                  stroke="204,58,64"
                  opacity={0.16}
                  scale={70}
                  className="absolute inset-0 h-full w-full"
                />

                {size && view && (
                  <svg
                    viewBox={`0 0 ${size.w} ${size.h}`}
                    className="absolute inset-0 h-full w-full"
                    aria-hidden="true"
                  >
                    {/* Graticule */}
                    {graticule.meridians.map(({ lng, x }) => (
                      <line
                        key={`m${lng}`}
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={size.h}
                        stroke="var(--color-coral-ink)"
                        strokeOpacity={0.09}
                        strokeWidth={0.75}
                      />
                    ))}
                    {graticule.parallels.map(({ lat, y }) => (
                      <line
                        key={`p${lat}`}
                        x1={0}
                        y1={y}
                        x2={size.w}
                        y2={y}
                        stroke="var(--color-coral-ink)"
                        strokeOpacity={0.09}
                        strokeWidth={0.75}
                      />
                    ))}

                    {/* Everything outside the border knocked back, so the
                        contour texture reads as land and the silhouette
                        emerges without an opaque fill flattening it. */}
                    <path
                      d={`M0 0H${size.w}V${size.h}H0Z${ringPath(INDIA_POINTS, view, scale)}`}
                      fillRule="evenodd"
                      fill="var(--color-warm-ivory)"
                      fillOpacity={0.66}
                    />

                    <path
                      d={ringPath(INDIA_POINTS, view, scale)}
                      fill="#FFFFFF"
                      fillOpacity={0.4}
                      stroke="var(--color-coral-ink)"
                      strokeOpacity={0.4}
                      strokeWidth={1.25}
                      strokeLinejoin="round"
                    />

                    {/* Graticule labels ride the left margin like a chart key */}
                    {graticule.parallels.map(({ lat, y }) => (
                      <text
                        key={`pl${lat}`}
                        x={10}
                        y={y - 5}
                        className="mono-chart"
                        fontSize={9}
                        fill="var(--color-warm-taupe)"
                        fillOpacity={0.55}
                      >
                        {lat.toFixed(lat % 1 ? 1 : 0)}°N
                      </text>
                    ))}

                    {/* Crosshair on the active waypoint */}
                    {activePoint && (
                      <g>
                        <line
                          x1={0}
                          x2={size.w}
                          y1={activePoint.y}
                          y2={activePoint.y}
                          stroke="var(--color-muted-coral)"
                          strokeOpacity={0.32}
                          strokeWidth={0.75}
                          strokeDasharray="3 5"
                        />
                        <line
                          y1={0}
                          y2={size.h}
                          x1={activePoint.x}
                          x2={activePoint.x}
                          stroke="var(--color-muted-coral)"
                          strokeOpacity={0.32}
                          strokeWidth={0.75}
                          strokeDasharray="3 5"
                        />
                        <circle
                          cx={activePoint.x}
                          cy={activePoint.y}
                          r={18}
                          fill="none"
                          stroke="var(--color-muted-coral)"
                          strokeOpacity={0.4}
                          strokeWidth={1}
                        />
                      </g>
                    )}
                  </svg>
                )}

                {/* Waypoints are real buttons layered over the chart rather
                    than SVG circles, so they are keyboard reachable and give a
                    32px tap target on touch. */}
                {size &&
                  groups.map((group) => {
                    const lead = group.items[0];
                    const count = group.items.length;
                    const holdsActive = group.items.some((d) => d.id === active.id);
                    const offscreen =
                      group.x < -40 || group.x > size.w + 40 ||
                      group.y < -40 || group.y > size.h + 40;
                    if (offscreen) return null;

                    /* Flip the label inboard near the right edge so it never
                       runs under the floating card. */
                    const flip = safe ? group.x > safe.x + safe.w * 0.68 : false;
                    const labelled = holdsActive || count > 1 || group.nearest > LABEL_ROOM_PX;

                    const label =
                      count > 1
                        ? group.items.every((d) => d.region === lead.region)
                          ? lead.region
                          : `${count} destinations`
                        : lead.name;

                    return (
                      <button
                        key={group.items.map((d) => d.id).join("+")}
                        onClick={() => openGroup(group.items)}
                        aria-label={
                          count > 1
                            ? `${count} destinations near ${lead.name} — zoom in`
                            : `${lead.name}, ${lead.region}`
                        }
                        aria-pressed={holdsActive}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-coral group/wp"
                        style={{ left: group.x, top: group.y }}
                      >
                        {count > 1 ? (
                          <span
                            className={`mono-chart flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-semibold border transition-all duration-500 ${
                              holdsActive
                                ? "bg-espresso text-white border-espresso ring-4 ring-espresso/12"
                                : "bg-white text-coral-ink border-blush-tint group-hover/wp:border-muted-coral group-hover/wp:text-espresso"
                            }`}
                          >
                            {count}
                          </span>
                        ) : (
                          <span
                            className={`rounded-full transition-all duration-500 ${
                              holdsActive
                                ? "w-3 h-3 bg-muted-coral ring-4 ring-muted-coral/20"
                                : "w-2 h-2 bg-warm-taupe/45 group-hover/wp:bg-coral-ink group-hover/wp:w-2.5 group-hover/wp:h-2.5"
                            }`}
                          />
                        )}

                        {labelled && (
                          <span
                            className={`mono-chart absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] uppercase tracking-wider transition-colors duration-500 ${
                              flip ? "right-full mr-2.5" : "left-full ml-2.5"
                            } ${
                              holdsActive
                                ? "text-espresso font-semibold"
                                : "text-warm-taupe/80 group-hover/wp:text-coral-ink"
                            }`}
                          >
                            {label}
                          </span>
                        )}
                      </button>
                    );
                  })}

                {/* Compass — the brand mark is a compass, and a north arrow is
                    the one map convention worth stating outright. */}
                <div className="absolute top-5 right-5 flex flex-col items-center text-coral-ink/70 pointer-events-none">
                  <span className="mono-chart text-[10px] font-semibold">N</span>
                  <span className="w-px h-5 bg-coral-ink/35" />
                </div>

                {/* Zoom-out control, only once the chart is off the full country */}
                <AnimatePresence>
                  {focusIds?.length ? (
                    <motion.button
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: reduced ? 0 : 0.3, ease: EASE_SETTLE }}
                      onClick={() => setFocusIds(null)}
                      className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full border border-warm-line bg-white/85 backdrop-blur-sm px-3 py-1.5 text-[11px] font-semibold text-espresso hover:border-blush-tint transition-colors"
                    >
                      <ChevronLeft size={13} className="text-coral-ink" />
                      All of India
                    </motion.button>
                  ) : null}
                </AnimatePresence>

                {/* Margin readout */}
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 pointer-events-none">
                  <span className="mono-chart text-[10px] sm:text-[11px] text-warm-taupe uppercase truncate">
                    {formatCoord(active.latitude, "N", "S")}{" "}
                    {formatCoord(active.longitude, "E", "W")}
                  </span>
                  <span className="mono-chart text-[10px] text-coral-ink uppercase whitespace-nowrap">
                    {String(activeIndex + 1).padStart(2, "0")} /{" "}
                    {String(destinations.length).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* ── Waypoint picker ── */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {focusIds?.length ? (
                  <button
                    onClick={() => setFocusIds(null)}
                    className="text-xs font-medium rounded-full px-3 py-1.5 border border-warm-line bg-white/70 text-warm-taupe hover:border-blush-tint hover:text-coral-ink transition-all duration-300"
                  >
                    ← All {destinations.length}
                  </button>
                ) : null}

                {inFrame.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => pick(dest)}
                    aria-pressed={dest.id === active.id}
                    className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-all duration-300 ${
                      dest.id === active.id
                        ? "bg-espresso text-white border-espresso"
                        : "bg-white/70 text-warm-taupe border-warm-line hover:border-blush-tint hover:text-coral-ink"
                    }`}
                  >
                    {dest.name}
                  </button>
                ))}
              </div>

              {/* ── Detail card ──
                  In flow below the chart on narrow viewports; floated over the
                  chart's right margin from lg up, which is the width the chart
                  was framed against. */}
              <div className="mt-5 lg:mt-0 lg:absolute lg:top-8 lg:right-6 lg:w-[344px] lg:z-20">
                <div className="rounded-3xl overflow-hidden border border-warm-line lg:border-white/70 bg-white lg:bg-white/85 lg:backdrop-blur-xl shadow-card lg:shadow-[0_28px_70px_-24px_rgba(28,31,38,0.4)]">
                  {/* Fixed 16:9 panel, so the crop is identical whichever
                      destination is selected and the card never jumps height. */}
                  <div className="relative aspect-[16/9]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active.id}
                        initial={{ opacity: 0, scale: reduced ? 1 : 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0.2 : 0.7, ease: EASE_SETTLE }}
                        className="absolute inset-0"
                      >
                        <GradedImage
                          src={active.image}
                          alt={generateDestinationAlt({
                            subject: active.tagline,
                            destination: active.name,
                            region: active.region,
                            season: active.bestTime,
                          })}
                          sizes="(max-width:1024px) 100vw, 400px"
                          ratio="fill"
                          focus="landscape"
                          className="h-full w-full"
                        />
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A100D]/90 via-[#1A100D]/25 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="mono-chart text-[10px] uppercase text-white/55 mb-1">
                        {active.region}
                      </p>
                      <h3 className="font-display font-black text-[1.75rem] text-white leading-none tracking-display mb-1.5">
                        {active.name}
                      </h3>
                      <p className="text-white/70 text-[13px] font-body">{active.tagline}</p>
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-warm-taupe text-xs font-body leading-relaxed mb-3 line-clamp-3">
                      {active.description}
                    </p>

                    {/* Real catalogue fields, laid out as a spec block rather
                        than four identical stat tiles. */}
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 pb-2 border-b border-warm-line">
                      {META.map(({ Icon, label, value }) => (
                        <div key={label}>
                          <dt className="flex items-center gap-1.5 mb-1">
                            <Icon size={12} className="text-sand-ink flex-shrink-0" />
                            <span className="label-util">{label}</span>
                          </dt>
                          <dd className="text-espresso text-xs font-semibold font-body leading-snug">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="pt-3 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="label-util mb-1">From, per person</p>
                        <span className="price-hero text-2xl text-espresso">
                          {formatPrice(active.priceFrom)}
                        </span>
                        <p className="text-warm-taupe text-xs font-body mt-1">
                          {active.operatorCount} operators · {active.packageCount} packages ·{" "}
                          {active.tripCount} departures
                        </p>
                      </div>

                      <motion.span
                        className="inline-block"
                        whileHover={
                          reduced
                            ? undefined
                            : { y: -2, boxShadow: "0 12px 30px rgba(255,90,95,0.28)" }
                        }
                        whileTap={reduced ? undefined : { scale: 0.985 }}
                        transition={{ duration: 0.32, ease: EASE_SETTLE }}
                        style={{ borderRadius: 9999 }}
                      >
                        <Link
                          href={`/compare/${active.slug}`}
                          className="bg-cta-gradient inline-flex items-center gap-1.5 text-white font-semibold text-[13px] px-4 py-2.5 rounded-full"
                        >
                          Compare
                          <ArrowUpRight size={15} />
                        </Link>
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
  );
}
