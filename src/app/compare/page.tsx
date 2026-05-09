import { Suspense } from "react";
import CompareContent from "./CompareContent";

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7FA' }}><div style={{ color: '#64748B' }}>Loading comparison...</div></div>}>
      <CompareContent />
    </Suspense>
  );
}
