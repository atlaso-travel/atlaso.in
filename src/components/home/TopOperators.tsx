import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { operators } from "@/data/operators";
import { formatPrice } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";

export default function TopOperators() {
  const featured = operators.filter((op) => op.verified).slice(0, 3);

  return (
    <section className="py-20 bg-map-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3 text-map-text font-display">
            Top Rated Operators
          </h2>
          <p className="text-map-muted font-body">
            Every operator verified by our team before listing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((op) => (
            <div
              key={op.id}
              className="rounded-2xl p-6 border border-map-border bg-white hover:shadow-lg transition-all duration-300"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-map-text font-display">
                      {op.name}
                    </h3>
                    {op.verified && (
                      <ShieldCheck size={16} className="text-summit-green flex-shrink-0" />
                    )}
                  </div>
                  {op.verified && (
                    <span className="text-xs font-semibold text-summit-green">
                      Verified
                    </span>
                  )}
                  {op.badge && (
                    <div className="mt-1">
                      <Badge variant="accent">{op.badge}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <StarRating
                rating={op.rating}
                showNumber
                reviewCount={op.reviewCount}
                className="mb-4"
              />

              {/* Description */}
              <p className="text-sm mb-4 leading-relaxed text-map-muted font-body">
                {op.description}
              </p>

              {/* Destinations */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {op.destinations.map((d) => (
                  <Badge key={d} variant="primary">
                    {d.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                ))}
              </div>

              {/* Price */}
              <div className="mb-5">
                <span className="text-3xl font-black text-compass-blue font-display">
                  {formatPrice(op.startingPrice)}
                </span>
                <span className="text-sm ml-1 text-map-muted">/person</span>
              </div>

              {/* CTA */}
              <Link
                href={`/search?destination=${op.destinations[0]}`}
                className="block w-full font-semibold rounded-xl py-2.5 text-center transition-all duration-200 text-sm hover:opacity-90 bg-compass-light text-compass-blue"
              >
                View Packages →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
