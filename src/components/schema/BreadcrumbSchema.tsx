interface Crumb {
  label: string;
  href: string;
}

interface BreadcrumbSchemaProps {
  crumbs: Crumb[];
}

export default function BreadcrumbSchema({ crumbs }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: `https://www.atlaso.in${crumb.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
