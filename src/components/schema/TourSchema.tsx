interface TourSchemaProps {
  name: string;
  description: string;
  destination: string;
  minPrice: number;
  maxPrice: number;
  durationDays: number;
  operatorName: string;
  rating: number;
  reviewCount: number;
  image: string;
  url: string;
  itinerary: string[];
}

export default function TourSchema({
  name,
  description,
  destination,
  minPrice,
  maxPrice,
  durationDays,
  operatorName,
  rating,
  reviewCount,
  image,
  url,
  itinerary,
}: TourSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description,
    image,
    url,
    touristType: "Adventure Travelers",
    itinerary: {
      "@type": "ItemList",
      itemListElement: itinerary.map((step, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: step,
      })),
    },
    provider: {
      "@type": "TouristInformationCenter",
      name: operatorName,
    },
    duration: `P${durationDays}D`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: minPrice,
      highPrice: maxPrice,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
    },
    touristDestination: {
      "@type": "TouristDestination",
      name: destination,
      containedInPlace: {
        "@type": "Country",
        name: "India",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
