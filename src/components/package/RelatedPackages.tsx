import Link from "next/link";
import Image from "next/image";
import PriceBlock from "@/components/ui/PriceBlock";
import { inr } from "@/lib/seo/meta";
import type { PackageDetail, PackageSummary } from "@/server/catalogue";

/**
 * "Customers also compared" — internal linking with a reason attached.
 *
 * Each link carries the actual price difference against the package being
 * viewed, so the anchor context tells a crawler what the relationship is rather
 * than just that two pages exist. It also links up to the destination guide and
 * across to the head-to-head comparison pages, which is what stops those
 * programmatic pages from being orphans reachable only via the sitemap.
 */
export default function RelatedPackages({
  current,
  siblings,
  destinationId,
  destinationName,
}: {
  current: PackageDetail;
  siblings: PackageSummary[];
  destinationId: string;
  destinationName: string;
}) {
  const others = siblings.slice(0, 3);
  if (others.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="font-display font-extrabold text-[20px] text-map-text mb-1">
        Customers also compared
      </h2>
      <p className="text-[13.5px] text-map-muted font-body mb-4">
        Other operators running {destinationName}, with the price difference against this trip.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {others.map((pkg) => {
          const delta = pkg.price.platformPrice - current.price.platformPrice;
          return (
            <li key={pkg.id}>
              <Link
                href={`/packages/${pkg.slug}`}
                className="flex flex-col h-full rounded-2xl border border-map-border bg-map-card overflow-hidden hover:border-map-border-blue hover:shadow-card-hover transition-all"
              >
                <div className="relative h-[96px]">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    sizes="(max-width:640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className="text-[11.5px] font-semibold text-map-muted font-body">
                    {pkg.operatorName}
                  </span>
                  <h3 className="font-display font-bold text-[13.5px] text-map-text leading-snug mt-0.5">
                    {pkg.title}
                  </h3>
                  <span className="text-[11.5px] text-map-muted font-body mt-1">
                    {pkg.duration}
                  </span>
                  <div className="mt-auto pt-2">
                    <PriceBlock price={pkg.price} size="inline" />
                    <span
                      className={`block text-[11.5px] font-semibold tnum mt-1 ${
                        delta < 0 ? "text-summit-green" : "text-map-muted"
                      }`}
                    >
                      {delta === 0
                        ? "Same price as this trip"
                        : delta < 0
                        ? `${inr(Math.abs(delta))} cheaper than this trip`
                        : `${inr(delta)} more than this trip`}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="text-[13.5px] text-map-muted font-body mt-4">
        <Link
          href={`/compare/${destinationId}`}
          className="text-compass-blue font-semibold hover:underline"
        >
          Compare every {destinationName} operator side by side
        </Link>
        {" · "}
        <Link
          href={`/destinations/${destinationId}`}
          className="text-compass-blue font-semibold hover:underline"
        >
          {destinationName} travel guide
        </Link>
        {" · "}
        <Link
          href={`/operators/${current.operatorSlug}`}
          className="text-compass-blue font-semibold hover:underline"
        >
          More from {current.operatorName}
        </Link>
      </p>
    </section>
  );
}
