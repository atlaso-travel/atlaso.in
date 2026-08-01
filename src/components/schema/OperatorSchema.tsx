import { absoluteUrl } from "@/lib/seo/meta";

/**
 * An individual tour operator profile.
 *
 * TravelAgency + LocalBusiness, because these are real businesses with a
 * registered address and a service area. AggregateRating is emitted only when
 * there are genuine reviews behind it — an aggregateRating with reviewCount 0 is
 * a structured-data error and Google will flag it.
 */

export interface OperatorSchemaProps {
  name: string;
  legalName: string;
  slug: string;
  description: string;
  city: string;
  state: string;
  foundedYear: number;
  languages: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  packageCount: number;
  priceFrom: number | null;
  destinationNames: string[];
}

export default function OperatorSchema({
  name,
  legalName,
  slug,
  description,
  city,
  state,
  foundedYear,
  languages,
  rating,
  reviewCount,
  verified,
  packageCount,
  priceFrom,
  destinationNames,
}: OperatorSchemaProps) {
  const url = absoluteUrl(`/operators/${slug}`);

  const schema = {
    "@context": "https://schema.org",
    "@type": ["TravelAgency", "LocalBusiness"],
    name,
    legalName,
    url,
    description,
    foundingDate: String(foundedYear),
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: state,
      addressCountry: "IN",
    },
    areaServed: destinationNames.map((n) => ({ "@type": "Place", name: n })),
    availableLanguage: languages,
    ...(priceFrom != null ? { priceRange: `From ₹${priceFrom.toLocaleString("en-IN")}` } : {}),
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    makesOffer: {
      "@type": "OfferCatalog",
      name: `${name} tour packages`,
      numberOfItems: packageCount,
    },
    // Verification is our own assertion about the operator, so it is published as
    // a self-issued credential rather than dressed up as a third-party award.
    ...(verified
      ? {
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: "Verification",
            name: "Atlaso Verified Operator",
            recognizedBy: { "@type": "Organization", name: "Atlaso", url: absoluteUrl("/") },
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
