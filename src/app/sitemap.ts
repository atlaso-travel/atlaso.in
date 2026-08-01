import { MetadataRoute } from "next";
import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";

const BASE_URL = "https://www.atlaso.in";

/**
 * Package pages are included now that they are server-rendered and statically
 * generated. While the detail page was a client component it had no SSR content
 * for a crawler to read, so listing it would have been pointless.
 *
 * `/search`, `/compare`, `/book` and `/booking` are deliberately absent — they
 * are parameterised or private and are excluded in robots.ts too.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    {
      url: `${BASE_URL}/destinations`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/operators`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  let destinationRoutes: MetadataRoute.Sitemap = [];
  let packageRoutes: MetadataRoute.Sitemap = [];

  try {
    destinationRoutes = destinations.map((dest) => ({
      url: `${BASE_URL}/destinations/${dest.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    packageRoutes = packages
      .filter((pkg) => pkg.status === "ACTIVE")
      .map((pkg) => ({
        url: `${BASE_URL}/packages/${pkg.slug}`,
        lastModified: new Date(pkg.publishedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch {
    destinationRoutes = [];
    packageRoutes = [];
  }

  return [...staticRoutes, ...destinationRoutes, ...packageRoutes];
}
