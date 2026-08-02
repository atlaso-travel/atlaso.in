import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Every destination and hero photograph on the site goes through here.
 *
 * Three problems it exists to solve, all of them "the grid looks assembled
 * rather than designed":
 *
 *   1. Temperature. The photos come from different photographers with
 *      different white balance, so a coral-into-orange wash at 8% pulls them
 *      onto one grade. Subtle enough that nobody reads it as a filter, strong
 *      enough that six photos in a row look like one brand.
 *   2. Aspect ratio. Ratios are picked from a fixed set rather than typed as
 *      arbitrary heights per call site, so card grids line up.
 *   3. Focal point. Landscape photography almost never wants `center` —
 *      horizons sit high and the interesting third is usually above centre.
 *      `focus` is a named choice, not a magic percentage.
 *
 * Alt text is required and has no default. It should come from the
 * `generateDestinationAlt` / `generateOperatorAlt` helpers in
 * `src/lib/seo/altText.ts` wherever the subject is a catalogue entity.
 */

/** The sanctioned ratios. Anything not in this list needs a design decision,
 *  not a new number. */
const RATIOS = {
  /** Destination and operator cards. */
  card: "4 / 3",
  /** Wide editorial panels and banners. */
  panel: "16 / 9",
  /** Hero and full-bleed CTA crops. */
  hero: "21 / 9",
  /** Caller controls the box; the image fills it. */
  fill: null,
} as const;

const FOCUS = {
  /** Horizon high in frame — the default for mountain and valley shots. */
  landscape: "center 55%",
  center: "center",
  top: "center 25%",
  bottom: "center 75%",
} as const;

export type GradedImageRatio = keyof typeof RATIOS;
export type GradedImageFocus = keyof typeof FOCUS;

interface GradedImageProps {
  src: string;
  /** Required. Use the altText.ts helpers for catalogue entities. */
  alt: string;
  sizes: string;
  ratio?: GradedImageRatio;
  focus?: GradedImageFocus;
  priority?: boolean;
  /** Applied to the wrapper — use for rounding, borders and overflow. */
  className?: string;
  /** Extra classes on the <img> itself, e.g. a group-hover scale. */
  imageClassName?: string;
  /** Turn off the warm grade. Only for images that are not photography. */
  grade?: boolean;
  /** Rendered above the grade — scrims, captions, badges. */
  children?: React.ReactNode;
}

export default function GradedImage({
  src,
  alt,
  sizes,
  ratio = "card",
  focus = "landscape",
  priority = false,
  className,
  imageClassName,
  grade = true,
  children,
}: GradedImageProps) {
  const aspect = RATIOS[ratio];

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imageClassName)}
        style={{ objectPosition: FOCUS[focus] }}
      />

      {/* The grade. Sits directly on the photo, below any scrim the caller
          adds, so section-specific darkening still reads correctly. */}
      {grade && (
        <div className="photo-grade absolute inset-0 pointer-events-none" aria-hidden />
      )}

      {children}
    </div>
  );
}
