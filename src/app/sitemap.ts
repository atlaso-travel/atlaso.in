import { MetadataRoute } from "next";
import { destinations } from "@/data/destinations";

const BASE_URL = "https://www.atlaso.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/destinations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/operators`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  let destinationRoutes: MetadataRoute.Sitemap = [];
  try {
    destinationRoutes = destinations.map((dest) => ({
      url: `${BASE_URL}/destinations/${dest.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch {
    destinationRoutes = [];
  }

  return [...staticRoutes, ...destinationRoutes];
}
