export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "TravelAgency"],
    name: "Atlaso",
    url: "https://www.atlaso.in",
    description: "India's first travel operator comparison platform.",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    foundingDate: "2024",
    // TODO: Replace with actual verified social media URLs
    sameAs: [
      "https://www.instagram.com/atlaso.in",
      "https://twitter.com/atlasoin",
      "https://www.linkedin.com/company/atlaso",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
