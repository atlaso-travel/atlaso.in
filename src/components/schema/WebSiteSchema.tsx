import { absoluteUrl } from "@/lib/seo/meta";

/**
 * Site-level WebSite node with a SearchAction, which is what lets Google offer a
 * sitelinks search box and tells AI crawlers how to query the catalogue directly
 * rather than guessing at URL shapes.
 *
 * Emitted once, on the homepage only — repeating it on every page adds nothing
 * and risks conflicting `potentialAction` declarations.
 */
export default function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Atlaso",
    alternateName: "Atlaso Travel",
    url: absoluteUrl("/"),
    description:
      "Compare tour packages from verified Indian tour operators side by side. Every price on Atlaso is below the operator's own direct rate.",
    inLanguage: "en-IN",
    publisher: { "@type": "Organization", name: "Atlaso", url: absoluteUrl("/") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/search")}?destination={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
