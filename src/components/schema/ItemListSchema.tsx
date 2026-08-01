import { absoluteUrl } from "@/lib/seo/meta";

/**
 * An ordered list of things — used on listing pages (/packages, /destinations)
 * and on comparison pages, where it tells a crawler exactly which entities are
 * being compared and in what order.
 *
 * Prices are included where known, so a comparison page is machine-readable as a
 * price comparison rather than as an undifferentiated list of links.
 */

export interface ItemListEntry {
  name: string;
  path: string;
  image?: string;
  price?: number;
  description?: string;
}

export default function ItemListSchema({
  name,
  description,
  items,
}: {
  name: string;
  description?: string;
  items: ItemListEntry[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    ...(description ? { description } : {}),
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
      ...(item.image || item.price != null || item.description
        ? {
            item: {
              "@type": "Product",
              name: item.name,
              url: absoluteUrl(item.path),
              ...(item.image ? { image: item.image } : {}),
              ...(item.description ? { description: item.description } : {}),
              ...(item.price != null
                ? {
                    offers: {
                      "@type": "Offer",
                      price: item.price,
                      priceCurrency: "INR",
                      availability: "https://schema.org/InStock",
                      url: absoluteUrl(item.path),
                    },
                  }
                : {}),
            },
          }
        : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
