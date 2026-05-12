import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/search?", "/_next/"],
      },
    ],
    sitemap: "https://www.atlaso.in/sitemap.xml",
    host: "https://www.atlaso.in",
  };
}
