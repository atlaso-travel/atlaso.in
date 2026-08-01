import { ArrowDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { PublicPrice } from "@/data/pricing";

/**
 * The single most important component on the site.
 *
 * Renders the platform price against the operator's retail price, with the
 * saving as the emphasised figure. Fern green appears here and nowhere else,
 * which is what makes it read at a glance.
 *
 * It only ever accepts a `PublicPrice` — the DTO that carries no b2bCost and no
 * margin. There is deliberately no way to hand this component a raw
 * `PackagePricing`, so a customer-facing surface cannot leak cost data, and
 * there is no arithmetic in here: every figure is computed server-side.
 */

type Size = "hero" | "card" | "inline";

const PRICE_SIZE: Record<Size, string> = {
  hero: "text-[34px] sm:text-[38px]",
  card: "text-[26px]",
  inline: "text-[17px]",
};

export default function PriceBlock({
  price,
  size = "card",
  showPerPerson = true,
  className,
}: {
  price: PublicPrice;
  size?: Size;
  showPerPerson?: boolean;
  className?: string;
}) {
  const hasSaving = price.savings > 0;

  /* Inline variant — for comparison table rows, where a pill breaks the grid. */
  if (size === "inline") {
    return (
      <div className={cn("flex items-baseline gap-2 flex-wrap", className)}>
        <span className="price-hero text-[17px] text-map-text">
          {formatPrice(price.platformPrice)}
        </span>
        {hasSaving && (
          <>
            <span className="tnum text-[12px] text-strike line-through decoration-[1.5px]">
              {formatPrice(price.retailPrice)}
            </span>
            <span className="tnum text-[12.5px] font-bold text-fern">
              −{formatPrice(price.savings)}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-col gap-0.5">
        {hasSaving && (
          <span className="tnum text-[13px] text-strike line-through decoration-[1.5px] font-body">
            {formatPrice(price.retailPrice)}
          </span>
        )}
        <span className={cn("price-hero text-map-text", PRICE_SIZE[size])}>
          {formatPrice(price.platformPrice)}
          {showPerPerson && (
            <span className="ml-1.5 text-[12.5px] font-medium text-map-muted font-body tracking-normal">
              / person
            </span>
          )}
        </span>
      </div>

      {hasSaving && (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-fern-tint pl-2 pr-2.5 py-1 text-fern">
          <ArrowDown size={13} strokeWidth={3} className="flex-shrink-0" />
          <span className="tnum text-[13px] font-bold">
            Save {formatPrice(price.savings)}
          </span>
          <span className="text-[12px] font-semibold opacity-75">
            {price.savingsPct}% off direct
          </span>
        </span>
      )}
    </div>
  );
}
