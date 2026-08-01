import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompareView from "@/components/compare/CompareView";
import { buildComparison } from "@/server/compare";
import { getComparisonCandidates } from "@/server/catalogue";
import { destinationById } from "@/data/destinations";

export const metadata: Metadata = {
  title: "Compare tour operators side by side",
  description:
    "Compare up to four operators for the same destination — price against their direct rate, inclusions, cancellation policy and day-by-day itinerary.",
  robots: { index: false, follow: true },
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsParam } = await searchParams;
  const ids = (idsParam ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const comparison = await buildComparison(ids);

  const candidates = comparison.destinationId
    ? await getComparisonCandidates(
        comparison.destinationId,
        comparison.columns.map((c) => c.pkg.id)
      )
    : [];

  const destinationName = comparison.destinationId
    ? destinationById[comparison.destinationId]?.name ?? null
    : null;

  return (
    <>
      <Navbar />
      <CompareView
        comparison={comparison}
        candidates={candidates}
        destinationName={destinationName}
      />
      <Footer />
    </>
  );
}
