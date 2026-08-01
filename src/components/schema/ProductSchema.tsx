import { absoluteUrl } from "@/lib/seo/meta";

/**
 * A bookable package, as both a TouristTrip and a Product with a concrete Offer.
 *
 * The existing TourSchema emits an AggregateOffer with a low/high range, which is
 * right for a destination page listing many operators. A single package has one
 * price, and it is the `Offer` — not `AggregateOffer` — that Google uses for the
 * price shown in results, and that AI shopping and comparison features read. So
 * this emits both types on one node rather than replacing TourSchema, which is
 * still used at destination level.
 */

export interface ProductSchemaProps {
  name: string;
  description: string;
  slug: string;
  images: string[];
  /** The price a customer actually pays through Atlaso. */
  price: number;
  /** The operator's own direct price, emitted as a strikethrough reference. */
  retailPrice: number;
  availability: "InStock" | "SoldOut" | "PreOrder";
  operatorName: string;
  operatorSlug: string;
  destinationName: string;
  durationDays: number;
  rating: number;
  reviewCount: number;
  itinerary: string[];
  /** ISO date the offer is valid until — the last scheduled departure. */
  validThrough: string | null;
  reviews?: { author: string; rating: number; body: string; date: string }[];
}

export default function ProductSchema({
  name,
  description,
  slug,
  images,
  price,
  retailPrice,
  availability,
  operatorName,
  operatorSlug,
  destinationName,
  durationDays,
  rating,
  reviewCount,
  itinerary,
  validThrough,
  reviews = [],
}: ProductSchemaProps) {
  const url = absoluteUrl(`/packages/${slug}`);

  const offer = {
    "@type": "Offer",
    url,
    price,
    priceCurrency: "INR",
    availability: `https://schema.org/${availability}`,
    ...(validThrough ? { priceValidUntil: validThrough } : {}),
    seller: {
      "@type": "Organization",
      name: "Atlaso",
      url: absoluteUrl("/"),
    },
    itemCondition: "https://schema.org/NewCondition",
    // Declaring the operator's direct price makes the saving machine-readable
    // rather than something a crawler has to infer from page copy.
    priceSpecification: {
      "@type": "PriceSpecification",
      price: retailPrice,
      priceCurrency: "INR",
      valueAddedTaxIncluded: true,
      description: `${operatorName} direct price`,
    },
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": ["Product", "TouristTrip"],
    name,
    description,
    url,
    image: images,
    sku: slug,
    brand: {
      "@type": "Organization",
      name: operatorName,
      url: absoluteUrl(`/operators/${operatorSlug}`),
    },
    provider: {
      "@type": "TravelAgency",
      name: operatorName,
      url: absoluteUrl(`/operators/${operatorSlug}`),
    },
    duration: `P${durationDays}D`,
    touristType: "Adventure Travelers",
    offers: offer,
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
    ...(reviews.length > 0
      ? {
          review: reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.date,
            reviewBody: r.body,
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : {}),
    itinerary: {
      "@type": "ItemList",
      numberOfItems: itinerary.length,
      itemListElement: itinerary.map((step, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: step,
      })),
    },
    touristDestination: {
      "@type": "TouristDestination",
      name: destinationName,
      containedInPlace: { "@type": "Country", name: "India" },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
