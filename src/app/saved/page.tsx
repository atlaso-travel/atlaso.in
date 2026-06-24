import { Suspense } from "react";
import SavedContent from "@/components/home/SavedContent";

export default function SavedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
          <div className="text-[#64748B] text-sm">Loading saved trips…</div>
        </div>
      }
    >
      <SavedContent />
    </Suspense>
  );
}
