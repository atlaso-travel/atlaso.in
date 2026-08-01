import Link from "next/link";
import { inr } from "@/lib/seo/meta";
import type { PlatformInsight } from "@/server/insights";

/**
 * The homepage's factual summary, server-rendered.
 *
 * The hero above it is an image and a search widget — visually strong, but it
 * gives a crawler almost nothing to read and an answer engine nothing to quote.
 * This section is the plain-language answer to "what is Atlaso, what does it
 * cover, and what does it cost", stated once in extractable prose with real
 * numbers, plus the internal links into the three hub pages.
 */
export default function HomeFacts({ insight }: { insight: PlatformInsight }) {
  return (
    <section className="bg-map-card border-b border-map-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-11 sm:py-14">
        <h2 className="font-display font-black text-[24px] sm:text-[30px] text-map-text tracking-tight leading-tight max-w-3xl">
          Compare {insight.operators} Indian tour operators before you book
        </h2>

        <p className="text-[15px] text-map-text font-body leading-relaxed mt-3 max-w-3xl">
          {insight.fact}
        </p>

        <p className="text-[14.5px] text-map-muted font-body leading-relaxed mt-3 max-w-3xl">
          Operators charge one price to customers who book with them directly and a lower rate
          to wholesale channels. Atlaso is given that lower rate, adds a margin, and publishes a
          price in between — so you pay less than the operator&apos;s own direct price while the
          operator receives the rate they set. Nothing is added at checkout.
        </p>

        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
          <Stat label="Destinations" value={String(insight.destinations)} />
          <Stat
            label="Operators"
            value={String(insight.operators)}
            note={`${insight.verifiedOperators} verified`}
          />
          <Stat label="Packages" value={String(insight.packages)} note="all comparable" />
          <Stat
            label="Average saving"
            value={inr(insight.averageSaving)}
            note={`${insight.averageSavingPct}% below direct`}
            highlight
          />
        </dl>

        <p className="text-[13.5px] text-map-muted font-body mt-6">
          Browse{" "}
          <Link href="/packages" className="text-compass-blue font-semibold hover:underline">
            all {insight.packages} packages
          </Link>
          , read the{" "}
          <Link href="/insights" className="text-compass-blue font-semibold hover:underline">
            pricing data by destination
          </Link>
          , or start with{" "}
          {insight.byDestination.slice(0, 3).map((d, i, arr) => (
            <span key={d.destinationId}>
              <Link
                href={`/compare/${d.destinationId}`}
                className="text-compass-blue font-semibold hover:underline"
              >
                {d.name}
              </Link>
              {i < arr.length - 2 ? ", " : i === arr.length - 2 ? " or " : ""}
            </span>
          ))}
          .
        </p>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: string;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-map-border bg-map-white px-4 py-3">
      <dt className="label-util">{label}</dt>
      <dd
        className={`font-display font-extrabold text-[22px] tnum mt-0.5 tracking-tight ${
          highlight ? "text-summit-green" : "text-map-text"
        }`}
      >
        {value}
      </dd>
      {note && (
        <dd className="text-[11.5px] text-map-muted font-body mt-0.5">{note}</dd>
      )}
    </div>
  );
}
