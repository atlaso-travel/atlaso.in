import { MetadataRoute } from "next";
import { getLivePackages, getLiveOperators } from "@/server/overrides";
import { destinations } from "@/data/destinations";
import { listComparisonPairs, listComparisonDestinations } from "@/server/comparePages";
import { SITE_URL } from "@/lib/seo/meta";

/**
 * Every indexable URL.
 *
 * Excluded on purpose: /search and /compare?ids= (parameterised, no stable
 * content), /book and /booking (transactional), /saved and /comparisons
 * (per-device), /operator and /admin (internal). All are disallowed in
 * robots.ts too.
 *
 * `lastModified` uses each package's publishedAt where we have one. Once the
 * database lands it becomes the row's updatedAt, which is the honest value —
 * stamping everything with `new Date()` on each build tells crawlers the whole
 * site changed every deploy, which trains them to ignore the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/packages`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/destinations`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/insights`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/operators`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    const packages = getLivePackages().filter((p) => p.status === "ACTIVE");
    const operators = getLiveOperators();

    const destinationRoutes: MetadataRoute.Sitemap = destinations.map((d) => ({
      url: `${SITE_URL}/destinations/${d.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    const packageRoutes: MetadataRoute.Sitemap = packages.map((p) => ({
      url: `${SITE_URL}/packages/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const operatorRoutes: MetadataRoute.Sitemap = operators.map((o) => ({
      url: `${SITE_URL}/operators/${o.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    // Comparison hubs rank for "compare X operators" and carry high internal
    // link weight, so they sit above the individual head-to-head pages.
    const comparisonHubs: MetadataRoute.Sitemap = listComparisonDestinations().map((id) => ({
      url: `${SITE_URL}/compare/${id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    const comparisonPairs: MetadataRoute.Sitemap = listComparisonPairs().map(
      ({ destination, pair }) => ({
        url: `${SITE_URL}/compare/${destination}/${pair}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })
    );

    return [
      ...staticRoutes,
      ...destinationRoutes,
      ...comparisonHubs,
      ...packageRoutes,
      ...operatorRoutes,
      ...comparisonPairs,
    ];
  } catch {
    // A sitemap that renders the static routes beats a build failure.
    return staticRoutes;
  }
}
