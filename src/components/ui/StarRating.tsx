import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
  showNumber?: boolean;
  reviewCount?: number;
}

export default function StarRating({
  rating,
  size = 14,
  className,
  showNumber = false,
  reviewCount,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < Math.floor(rating)
                ? "fill-trail-orange text-trail-orange"
                : "fill-map-border text-map-border"
            }
          />
        ))}
      {showNumber && (
        <span className="text-sm font-semibold ml-1 text-map-text font-body">
          {rating}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-map-muted font-body">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
