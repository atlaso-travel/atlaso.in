import type { Metadata } from "next";
import DestinationsBrowser from "@/components/destination/DestinationsBrowser";
import ItemListSchema from "@/components/schema/ItemListSchema";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import { buildMetadata, inr } from "@/lib/seo/meta";
import { getPlatformInsight } from "@/server/insights";
import { destinationById } from "@/data/destinations";

/**
 * Server wrapper. The browser UI is a client component (sort, pagination, saved
 * state), which is exactly why this route previously had no metadata — a
 * "use client" module cannot export one.
 */

export async function generateMetadata(): Promise<Metadata> {
  const insight = await getPlatformInsight();

  return buildMetadata({
    title: `${insight.destinations} Adventure Destinations in India — Compare Operators & Prices`,
    description:
      `Compare tour packages across ${insight.destinations} Indian destinations from ` +
      `${insight.operators} operators. Prices from ${inr(insight.priceFrom)} per person, ` +
      `averaging ${inr(insight.averageSaving)} below booking direct.`,
    path: "/destinations",
    image: destinationById["spiti-valley"]?.heroImage,
    imageAlt: "Adventure travel destinations across India",
  });
}

export default async function DestinationsPage() {
  const insight = await getPlatformInsight();

  return (
    <>
      <BreadcrumbSchema
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Destinations", href: "/destinations" },
        ]}
      />
      <ItemListSchema
        name="Adventure travel destinations in India"
        description={insight.fact}
        items={insight.byDestination.map((d) => ({
          name: d.name,
          path: `/destinations/${d.destinationId}`,
          image: destinationById[d.destinationId]?.image,
          price: d.priceFrom,
          description:
            `${d.packageCount} packages from ${d.operatorCount} operators, ` +
            `${inr(d.priceFrom)}–${inr(d.priceTo)} per person.`,
        }))}
      />
      <DestinationsBrowser />
    </>
  );
}
