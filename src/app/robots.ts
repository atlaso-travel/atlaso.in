import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/_next/",
          // Parameterised or private customer surfaces.
          "/search?",
          "/compare",
          "/book/",
          "/booking/",
          "/saved",
          "/comparisons",
          // Internal — operator portal and admin panel.
          "/operator",
          "/admin",
        ],
      },
    ],
    sitemap: "https://www.atlaso.in/sitemap.xml",
    host: "https://www.atlaso.in",
  };
}
