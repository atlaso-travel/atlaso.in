import { cn } from "@/lib/utils";
import StarRating from "./StarRating";

interface ReviewCardProps {
  name: string;
  rating: number;
  date: string;
  text: string;
  avatar: string;
  destination?: string;
  className?: string;
}

export default function ReviewCard({
  name,
  rating,
  date,
  text,
  avatar,
  destination,
  className,
}: ReviewCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 shadow-sm border border-map-border bg-white",
        className
      )}
    >
      <div className="text-6xl font-serif leading-none mb-2 text-compass-blue/20">
        &ldquo;
      </div>
      <p className="italic text-sm leading-relaxed mb-4 text-map-muted font-body">
        {text}
      </p>
      <div className="border-t border-map-border pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-compass-light text-compass-blue font-display">
            {avatar}
          </div>
          <div>
            <p className="font-semibold text-sm text-map-text font-display">
              {name}
            </p>
            {destination && (
              <p className="text-xs text-map-muted font-body">
                Traveled to {destination}
              </p>
            )}
            {date && !destination && (
              <p className="text-xs text-map-muted font-body">{date}</p>
            )}
          </div>
        </div>
        <StarRating rating={rating} size={12} />
      </div>
    </div>
  );
}
