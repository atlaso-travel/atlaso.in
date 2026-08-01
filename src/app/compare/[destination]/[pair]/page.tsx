import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FactBlock from "@/components/seo/FactBlock";
import ComparisonTable from "@/components/seo/ComparisonTable";
import PriceBlock from "@/components/ui/PriceBlock";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import ItemListSchema from "@/components/schema/ItemListSchema";
import FaqSchema from "@/components/schema/FaqSchema";
import { buildMetadata, clamp, inr } from "@/lib/seo/meta";
import { getPairComparison, listComparisonPairs } from "@/server/comparePages";

export function generateStaticParams() {
  return listComparisonPairs();
}

/**
 * Only the 49 canonical pairs exist. Anything else — including the reverse
 * ordering "b-vs-a" — 404s at the routing layer.
 *
 * The first attempt normalised the ordering with a `redirect()` inside the
 * component and `dynamicParams = true`. That silently did not fire: the reverse
 * URL rendered a complete duplicate page carrying its own self-referencing
 * canonical, which is precisely the duplicate content the redirect was meant to
 * prevent. (`notFound()` in the same component did work, so it was specific to
 * redirect during on-demand static generation.)
 *
 * Excluding at the routing layer needs no component code and cannot silently
 * fail. Nothing links to the reverse ordering — our internal links and the
 * sitemap only ever emit sorted pairs — so the 404 is unreachable in practice.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ destination: string; pair: string }>;
}): Promise<Metadata> {
  const { destination, pair } = await params;
  const data = await getPairComparison(destination, pair);
  if (!data) return {};

  const { a, b, destinationName, priceDifference, cheaper } = data;

  const title = clamp(
    `${a.operatorName} vs ${b.operatorName} — ${destinationName} Packages Compared`,
    70
  );

  const description = clamp(
    cheaper === "tie"
      ? `Both price ${destinationName} at ${inr(a.price.platformPrice)} per person. Compare itinerary, inclusions, ratings and cancellation policy side by side.`
      : `${cheaper === "a" ? a.operatorName : b.operatorName} is ${inr(priceDifference)} cheaper for ${destinationName}. Compare price, inclusions, ratings and cancellation side by side on Atlaso.`,
    158
  );

  return buildMetadata({
    title,
    description,
    path: `/compare/${destination}/${pair}`,
    image: a.image,
    imageAlt: `${a.operatorName} and ${b.operatorName} ${destinationName} packages`,
    type: "article",
  });
}

export default async function PairComparisonPage({
  params,
}: {
  params: Promise<{ destination: string; pair: string }>;
}) {
  const { destination, pair } = await params;
  const data = await getPairComparison(destination, pair);
  if (!data) notFound();

  const { a, b, rows, destinationName, destinationRegion, fact, supporting, verdict, cheaper, priceDifference } = data;

  const faqs = [
    {
      question: `Which is cheaper for ${destinationName}, ${a.operatorName} or ${b.operatorName}?`,
      answer:
        cheaper === "tie"
          ? `Neither — both are ${inr(a.price.platformPrice)} per person on Atlaso.`
          : `${cheaper === "a" ? a.operatorName : b.operatorName} is cheaper by ${inr(priceDifference)} per person: ${inr(cheaper === "a" ? a.price.platformPrice : b.price.platformPrice)} against ${inr(cheaper === "a" ? b.price.platformPrice : a.price.platformPrice)}.`,
    },
    {
      question: `Is ${a.operatorName} or ${b.operatorName} better rated?`,
      answer:
        a.rating === b.rating
          ? `Both are rated ${a.rating} out of 5. ${a.operatorName} has ${a.reviewCount} reviews and ${b.operatorName} has ${b.reviewCount}.`
          : `${a.rating > b.rating ? a.operatorName : b.operatorName} is rated higher — ${Math.max(a.rating, b.rating)}/5 against ${Math.min(a.rating, b.rating)}/5.`,
    },
    {
      question: `Can I book either operator through Atlaso?`,
      answer: `Yes. Both are bookable directly on Atlaso at a price below the operator's own direct rate — ${inr(a.price.savings)} less with ${a.operatorName} and ${inr(b.price.savings)} less with ${b.operatorName}.`,
    },
  ];

  return (
    <>
      <Navbar />

      <BreadcrumbSchema
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Compare", href: "/compare" },
          { label: destinationName, href: `/compare/${destination}` },
          { label: `${a.operatorName} vs ${b.operatorName}`, href: `/compare/${destination}/${pair}` },
        ]}
      />
      <ItemListSchema
        name={`${a.operatorName} vs ${b.operatorName} for ${destinationName}`}
        description={fact}
        items={[
          { name: a.packageTitle, path: `/packages/${a.packageSlug}`, image: a.image, price: a.price.platformPrice, description: a.summary },
          { name: b.packageTitle, path: `/packages/${b.packageSlug}`, image: b.image, price: b.price.platformPrice, description: b.summary },
        ]}
      />
      <FaqSchema items={faqs} />

      <main className="min-h-screen bg-map-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7 sm:py-10 flex flex-col gap-7">
          <div>
            <nav className="text-[12.5px] text-map-muted font-body mb-3">
              <Link href="/" className="hover:text-compass-blue">Home</Link>
              <span className="mx-1.5">›</span>
              <Link href={`/compare/${destination}`} className="hover:text-compass-blue">
                {destinationName} operators
              </Link>
            </nav>

            <h1 className="font-display font-black text-[26px] sm:text-[34px] text-map-text tracking-tight leading-tight">
              {a.operatorName} vs {b.operatorName}
            </h1>
            <p className="text-[15px] text-map-muted font-body mt-1.5">
              {destinationName}, {destinationRegion} — compared on price, inclusions, ratings
              and cancellation policy.
            </p>
          </div>

          <FactBlock heading="The short answer" fact={fact} supporting={supporting} />

          {/* Two cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[a, b].map((side) => (
              <article
                key={side.operatorSlug}
                className="rounded-2xl border border-map-border bg-map-card overflow-hidden flex flex-col"
              >
                <div className="relative h-[132px]">
                  <Image
                    src={side.image}
                    alt={`${side.operatorName} — ${side.packageTitle}`}
                    fill
                    sizes="(max-width:640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-bold text-[15px] text-map-text">
                      <Link
                        href={`/operators/${side.operatorSlug}`}
                        className="hover:text-compass-blue transition-colors"
                      >
                        {side.operatorName}
                      </Link>
                    </h2>
                    {side.verified ? (
                      <VerifiedBadge compact />
                    ) : (
                      <VerifiedBadge compact variant="pending" label="Unverified" />
                    )}
                  </div>
                  <h3 className="text-[13.5px] text-map-muted font-body leading-snug">
                    <Link
                      href={`/packages/${side.packageSlug}`}
                      className="hover:text-compass-blue transition-colors"
                    >
                      {side.packageTitle}
                    </Link>
                  </h3>
                  <div className="mt-auto pt-2">
                    <PriceBlock price={side.price} size="card" />
                    <Link
                      href={`/packages/${side.packageSlug}`}
                      className="btn-primary w-full text-[13px] py-2 mt-3"
                    >
                      View trip
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section>
            <h2 className="font-display font-extrabold text-[20px] text-map-text mb-1">
              Side by side
            </h2>
            <p className="text-[13.5px] text-map-muted font-body mb-4">{verdict}</p>
            <ComparisonTable
              caption={`${a.operatorName} compared with ${b.operatorName} for ${destinationName}: price, inclusions, ratings and cancellation policy`}
              columnA={a.operatorName}
              columnB={b.operatorName}
              rows={rows}
            />
          </section>

          <section>
            <h2 className="font-display font-extrabold text-[20px] text-map-text mb-3">
              Questions people ask
            </h2>
            <dl className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-map-border bg-map-card px-4 py-3.5"
                >
                  <dt className="font-display font-bold text-[14px] text-map-text">
                    {faq.question}
                  </dt>
                  <dd className="text-[13.5px] text-map-muted font-body leading-relaxed mt-1">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="text-[13.5px] text-map-muted font-body">
            Comparing something else?{" "}
            <Link href={`/compare/${destination}`} className="text-compass-blue font-semibold hover:underline">
              See every {destinationName} operator side by side
            </Link>{" "}
            or{" "}
            <Link href={`/destinations/${destination}`} className="text-compass-blue font-semibold hover:underline">
              read the {destinationName} guide
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
