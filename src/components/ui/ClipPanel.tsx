"use client";

/**
 * The house media panel — one surface for "show, don't tell" moments.
 *
 * It has two modes and the same chrome in both, so the real film can be
 * dropped in later without the section around it moving a pixel:
 *
 *   - no `videoSrc`  → a reel of stills that cross-fades on a slow Ken Burns
 *                      push. Reads as motion, costs one already-optimised
 *                      Next/Image per frame, and needs no asset pipeline.
 *   - with `videoSrc`→ the same box plays the film, muted and looping, with
 *                      play/pause and sound controls in the corner.
 *
 * Both modes stop when the panel leaves the viewport — an off-screen loop is
 * battery spend with nobody watching — and collapse to a single still under
 * prefers-reduced-motion, where a 7-second auto-advance is exactly the kind of
 * unrequested movement the setting exists to switch off.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import GradedImage from "./GradedImage";
import { EASE_SETTLE, useMotionProfile } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export interface ClipFrame {
  src: string;
  /** Required — these are content images, not decoration. */
  alt: string;
  /** Shown in the margin readout while the frame is on screen. */
  caption: string;
}

interface ClipPanelProps {
  frames: ClipFrame[];
  /**
   * Path to the real film, e.g. `/atlaso-tour.mp4`. Leave unset and the panel
   * runs the stills reel instead — that is the intended placeholder state, not
   * a broken one.
   */
  videoSrc?: string;
  /** First paint for the video before it buffers. Defaults to `frames[0]`. */
  poster?: string;
  eyebrow: string;
  /** Runtime badge, e.g. "0:45". Purely a label — nothing reads it back. */
  runtime?: string;
  title: string;
  body: string;
  /** Passed straight to the images. */
  sizes: string;
  /** Wrapper classes — rounding, borders, shadow. */
  className?: string;
  /** Aspect utility for the media box. */
  aspect?: string;
  /** Seconds each still holds before the reel advances. */
  holdMs?: number;
  priority?: boolean;
}

export default function ClipPanel({
  frames,
  videoSrc,
  poster,
  eyebrow,
  runtime,
  title,
  body,
  sizes,
  className,
  aspect = "aspect-[16/10]",
  holdMs = 5200,
  priority = false,
}: ClipPanelProps) {
  const { reduced } = useMotionProfile();
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(wrapRef, { amount: 0.3 });

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const running = playing && inView && !reduced;
  const frame = frames[Math.min(index, frames.length - 1)];

  /* ── Stills reel ── */
  useEffect(() => {
    if (videoSrc || !running || frames.length < 2) return;
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % frames.length),
      holdMs
    );
    return () => clearInterval(timer);
  }, [videoSrc, running, frames.length, holdMs, index]);

  /* ── Film ──
     Autoplay is only legal muted, and only worth attempting while the panel is
     actually on screen; the promise is caught because a browser refusing to
     play is a normal outcome here, not an error worth surfacing. */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (running) void el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [running]);

  /* Nothing to show and nothing to play — render nothing rather than an empty
     black box. Only reachable if a caller passes an empty catalogue slice. */
  if (!videoSrc && !frame) return null;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-warm-line bg-espresso-deep shadow-card",
        className
      )}
    >
      <div className={cn("relative", aspect)}>
        {videoSrc ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src={videoSrc}
              poster={poster ?? frames[0]?.src}
              muted={muted}
              loop
              playsInline
              preload="metadata"
              aria-label={title}
            />
            <div className="photo-grade absolute inset-0 pointer-events-none" aria-hidden />
          </>
        ) : (
          <AnimatePresence mode="sync">
            <motion.div
              key={frame.src}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.2 : 1.1, ease: EASE_SETTLE }}
            >
              {/* The push is on an inner layer so the cross-fade and the Ken
                  Burns never fight over the same transform. */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: reduced ? 1 : 1.001 }}
                animate={{ scale: reduced ? 1 : 1.085 }}
                transition={{ duration: reduced ? 0 : (holdMs / 1000) * 1.6, ease: "linear" }}
              >
                <GradedImage
                  src={frame.src}
                  alt={frame.alt}
                  sizes={sizes}
                  ratio="fill"
                  focus="landscape"
                  priority={priority && index === 0}
                  className="h-full w-full"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Scrim. Heavier at the foot than a card scrim usually is, because
            display type sits on it rather than a caption. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#120C0B] via-[#120C0B]/45 to-[#120C0B]/10 pointer-events-none"
          aria-hidden
        />

        {/* ── Top rail ── */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
          <span className="mono-chart inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 backdrop-blur-md px-3 py-1.5 text-[10px] uppercase text-white/85">
            <span className="relative flex h-1.5 w-1.5">
              {!reduced && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-coral opacity-70" />
              )}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-coral" />
            </span>
            {eyebrow}
          </span>

          {runtime && (
            <span className="mono-chart rounded-full border border-white/15 bg-black/25 backdrop-blur-md px-2.5 py-1.5 text-[10px] text-white/70">
              {runtime}
            </span>
          )}
        </div>

        {/* ── Foot ── */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-display font-black text-white text-xl sm:text-[26px] leading-tight tracking-display">
                {title}
              </h3>
              <p className="mt-1.5 text-white/70 text-[13px] font-body leading-relaxed max-w-md">
                {body}
              </p>
            </div>

            {/* Transport controls. Rendered in both modes so the placeholder
                and the finished film have the same affordances. */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause" : "Play"}
                className="w-10 h-10 rounded-full border border-white/20 bg-white/12 backdrop-blur-md text-white flex items-center justify-center transition-colors hover:bg-white/22 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                {playing && !reduced ? (
                  <Pause size={15} className="fill-white" />
                ) : (
                  <Play size={15} className="fill-white translate-x-[1px]" />
                )}
              </button>

              {videoSrc && (
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="w-10 h-10 rounded-full border border-white/20 bg-white/12 backdrop-blur-md text-white flex items-center justify-center transition-colors hover:bg-white/22 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              )}
            </div>
          </div>

          {/* ── Chapter rail ──
              Doubles as the reel's progress bar and its picker, so the panel
              reads as something you can steer rather than a banner that moves
              on its own. Suppressed once a real film is in, where the video's
              own timeline is the truth. */}
          {!videoSrc && frames.length > 1 && (
            <div className="mt-5 flex items-center gap-3">
              <div className="flex flex-1 items-center gap-1.5">
                {frames.map((f, i) => (
                  <button
                    key={f.src}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${f.caption}`}
                    aria-current={i === index}
                    className="group/tick relative h-4 flex-1 flex items-center focus:outline-none"
                  >
                    <span className="h-[3px] w-full rounded-full bg-white/25 overflow-hidden">
                      {i === index && (
                        <motion.span
                          key={`${index}-${running}`}
                          className="block h-full w-full origin-left rounded-full bg-white"
                          initial={{ scaleX: reduced || !running ? 1 : 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: reduced || !running ? 0 : holdMs / 1000,
                            ease: "linear",
                          }}
                        />
                      )}
                      {i < index && <span className="block h-full w-full bg-white/55" />}
                    </span>
                  </button>
                ))}
              </div>

              <span className="mono-chart text-[10px] uppercase text-white/55 whitespace-nowrap hidden sm:block">
                {frame.caption}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
