import type { Metadata } from "next";

/**
 * Shared metadata builder.
 *
 * The destination page's generateMetadata was the only complete example in the
 * repo; this generalises that shape so every route produces the same set of tags
 * rather than each page hand-rolling its own. `metadataBase` is already set in
 * layout.tsx, so relative canonicals resolve correctly.
 */

export const SITE_URL = "https://www.atlaso.in";
export const SITE_NAME = "Atlaso";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface PageMetaInput {
  title: string;
  description: string;
  /** Path only, e.g. "/destinations/spiti-valley". Becomes the canonical. */
  path: string;
  image?: string;
  imageAlt?: string;
  /** Set false for parameterised or private routes. */
  index?: boolean;
  type?: "website" | "article";
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  index = true,
  type = "website",
}: PageMetaInput): Metadata {
  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: imageAlt ?? title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      type,
      locale: "en_IN",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
      : { index: false, follow: true },
  };
}

/** ₹12,499 — used inside titles and descriptions, so it must not carry markup. */
export function inr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Titles are truncated by search engines around 60 characters and descriptions
 * around 155. Going long is not penalised, but the tail is invisible, so this
 * keeps the useful part first and trims cleanly on a word boundary.
 */
export function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
