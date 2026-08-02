import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { type Destination } from "@/data/destinations";
import { formatPrice } from "@/lib/utils";

interface RelatedDestinationsProps {
  related: Destination[];
  currentSlug: string;
}

export default function RelatedDestinations({
  related,
  currentSlug,
}: RelatedDestinationsProps) {
  const shown = related.filter((d) => d.id !== currentSlug).slice(0, 3);

  if (shown.length === 0) return null;

  return (
    <section className="py-12 bg-map-white border-t border-map-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-map-text font-display mb-6">
          Explore More Destinations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((dest) => (
            <Link
              key={dest.id}
              href={`/destinations/${dest.id}`}
              className="group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={`${dest.highlights[0] ?? dest.tagline} in ${dest.name}, ${dest.region}, India`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-map-text font-display mb-1">
                  {dest.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-map-muted mb-3">
                  <MapPin size={11} />
                  <span>{dest.region}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-map-muted">{dest.avgDuration}</span>
                  <span className="font-bold text-compass-blue font-display text-sm">
                    From {formatPrice(dest.avgPrice)}
                  </span>
                </div>
                <span className="text-sm font-medium text-trail-orange group-hover:translate-x-1 transition-transform inline-block">
                  Explore {dest.name} Packages →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
