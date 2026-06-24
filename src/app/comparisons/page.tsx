import { Suspense } from "react";
import MyComparisons from "@/components/compare/MyComparisons";

export default function ComparisonsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
          <div className="text-[#64748B] text-sm">Loading comparisons…</div>
        </div>
      }
    >
      <MyComparisons />
    </Suspense>
  );
}
