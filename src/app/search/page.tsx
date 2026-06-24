import { Suspense } from "react";
import SearchContent from "../../components/search/SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7FA' }}><div style={{ color: '#64748B' }}>Loading results...</div></div>}>
      <SearchContent />
    </Suspense>
  );
}
