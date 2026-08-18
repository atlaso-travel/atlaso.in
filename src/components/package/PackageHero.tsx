import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Star, Users } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import type { PackageDetail } from "@/server/catalogue";

/**
 * Dark image band carrying the identity of the trip: where it is, what it is
 * called, and the four numbers a buyer scans first. Everything commercial lives
 * in the enquiry card, so this stays informational.
 *
 * Sits under the overlay navbar, hence the top padding — the crumb row must
 * clear the fixed bar rather than sit behind it.
 */
export default function PackageHero({ pkg }: { pkg: PackageDetail }) {
  const rating = pkg.packageReviewCount > 0 ? pkg.packageRating : pkg.trust.rating;
  const reviewCount =
    pkg.packageReviewCount > 0 ? pkg.packageReviewCount : pkg.trust.reviewCount;

  return (
    <div className="relative min-h-[300px] sm:min-h-[340px] flex flex-col justify-end overflow-hidden">
      <Image
        src={pkg.images[0]}
        alt={`${pkg.title} — ${pkg.destinationName}`}
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/90 via-[#0A1628]/45 to-[#0A1628]/25" />

      <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-7">
        <div className="flex items-center gap-1.5 text-white/70 text-[13px] font-body mb-2">
          <MapPin size={13} className="flex-shrink-0" />
          <span>
            <Link
              href={`/destinations/${pkg.destinationId}`}
              className="hover:text-white transition-colors"
            >
              {pkg.destinationName}
            </Link>
            {/* Several destinations carry their own name as the region; printing
                both reads as "Leh Ladakh, Ladakh". */}
            {pkg.destinationRegion &&
              !pkg.destinationName.includes(pkg.destinationRegion) &&
              `, ${pkg.destinationRegion}`}
          </span>
        </div>

        <h1 className="font-display text-[26px] sm:text-[34px] font-extrabold text-white leading-tight tracking-tight">
          {pkg.title}
        </h1>

        <div className="flex items-center gap-x-4 gap-y-2 flex-wrap mt-3 text-[13px] text-white font-body">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="text-white/60" />
            {pkg.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={13} className="text-white/60" />
            {pkg.groupSize}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star size={13} className="fill-star text-star" />
            <b className="tnum font-bold">{rating}</b>
            <span className="text-white/60 tnum">({reviewCount} reviews)</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Link
              href={`/operators/${pkg.operatorSlug}`}
              className="text-white/70 hover:text-white transition-colors"
            >
              by {pkg.operatorName}
            </Link>
            {pkg.operatorVerified ? (
              <VerifiedBadge compact />
            ) : (
              /* The pending badge is slate-on-transparent, which disappears on
                 the dark band — lifted to white here only. */
              <VerifiedBadge
                compact
                variant="pending"
                label="Unverified"
                className="!text-white/85 !border-white/35"
              />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
