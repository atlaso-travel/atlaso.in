"use client";

/**
 * The house motion language.
 *
 * Everything on the page reveals the same way: a short rise into place on a
 * long-decelerating curve, children offset by ~60ms so a row of cards reads
 * left-to-right instead of flashing in as a block. Defining it once here is
 * the point — a section that hand-rolls its own timing is what makes a page
 * feel assembled rather than designed.
 *
 * Two things bend the defaults automatically:
 *   - prefers-reduced-motion  → travel drops to zero, opacity only
 *   - viewports under 640px   → travel is halved and the stagger tightened,
 *                               because the same 28px rise that reads as
 *                               poised on a desktop reads as jank on a phone
 */

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/** Long decelerate, soft landing. The default for anything entering. */
export const EASE_SETTLE: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Travels slightly past rest before settling. For things that should feel physical. */
export const EASE_OVERSHOOT: [number, number, number, number] = [0.34, 1.32, 0.64, 1];

/** Interval between staggered children. */
const STAGGER_GAP = 0.06;
const STAGGER_GAP_COMPACT = 0.04;

/** Default rise distance, in px. */
const TRAVEL = 26;

/** Shared viewport trigger — fires a little before the element is fully in. */
export const VIEWPORT = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -80px 0px",
} as const;

/** True below the `sm` breakpoint. Drives the reduced-travel variants. */
export function useCompactViewport() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return compact;
}

/**
 * Resolved motion settings for the current user and viewport. Sections that
 * need bespoke motion should read from this rather than inventing values.
 */
export function useMotionProfile() {
  const reduced = useReducedMotion();
  const compact = useCompactViewport();

  return {
    reduced: !!reduced,
    compact,
    /** Rise distance to use, already adjusted. */
    travel: reduced ? 0 : compact ? TRAVEL * 0.5 : TRAVEL,
    stagger: reduced ? 0 : compact ? STAGGER_GAP_COMPACT : STAGGER_GAP,
    duration: reduced ? 0.25 : 0.62,
  };
}

type Direction = "up" | "down" | "left" | "right" | "none";

function offsetFor(direction: Direction, travel: number) {
  switch (direction) {
    case "up":    return { y: travel,  x: 0 };
    case "down":  return { y: -travel, x: 0 };
    case "left":  return { y: 0, x: travel };
    case "right": return { y: 0, x: -travel };
    default:      return { y: 0, x: 0 };
  }
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Which way the element travels in from. Defaults to rising. */
  direction?: Direction;
  /** Seconds to hold before starting. Use sparingly — prefer <Stagger>. */
  delay?: number;
  /** Override the travel distance in px. */
  distance?: number;
  /** Fraction of the element that must be visible to trigger. */
  amount?: number;
  as?: "div" | "section" | "span" | "li" | "p" | "h2" | "h3";
}

/**
 * A single element that reveals when scrolled into view. For groups of
 * siblings use <Stagger> + <StaggerItem> so they sequence rather than
 * arriving together.
 */
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  distance,
  amount,
  as = "div",
}: RevealProps) {
  const { travel, duration, reduced } = useMotionProfile();
  const dist = reduced ? 0 : distance ?? travel;
  const from = offsetFor(direction, dist);

  const Tag = motion[as] as ElementType;

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={amount != null ? { ...VIEWPORT, amount } : VIEWPORT}
      transition={{ duration, delay, ease: EASE_SETTLE }}
    >
      {children}
    </Tag>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds before the first child starts. */
  delay?: number;
  /** Override the gap between children. */
  gap?: number;
  amount?: number;
  as?: "div" | "section" | "ul" | "ol";
}

/**
 * Parent for a sequenced group. Children must be <StaggerItem> (or any
 * motion element declaring the `hidden`/`shown` variants) — the parent only
 * orchestrates timing and renders nothing itself.
 */
export function Stagger({
  children,
  className,
  delay = 0,
  gap,
  amount,
  as = "div",
}: StaggerProps) {
  const { stagger } = useMotionProfile();
  const Tag = motion[as] as ElementType;

  const variants: Variants = {
    hidden: {},
    shown: {
      transition: {
        staggerChildren: gap ?? stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="shown"
      viewport={amount != null ? { ...VIEWPORT, amount } : VIEWPORT}
    >
      {children}
    </Tag>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
  as?: "div" | "li" | "span" | "p" | "h2" | "h3" | "a";
  style?: CSSProperties;
}

/** A child of <Stagger>. Inherits its timing from the parent. */
export function StaggerItem({
  children,
  className,
  direction = "up",
  distance,
  as = "div",
  style,
}: StaggerItemProps) {
  const { travel, duration, reduced } = useMotionProfile();
  const dist = reduced ? 0 : distance ?? travel;
  const from = offsetFor(direction, dist);

  const Tag = motion[as] as ElementType;

  const variants: Variants = {
    hidden: { opacity: 0, ...from },
    shown: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration, ease: EASE_SETTLE },
    },
  };

  return (
    <Tag className={className} variants={variants} style={style}>
      {children}
    </Tag>
  );
}
