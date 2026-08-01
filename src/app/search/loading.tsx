import ContourField from "@/components/ui/ContourField";

/** Contour skeleton — a slow connection still looks like the product. */
export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-map-white">
      <div className="h-[320px] bg-atlas-night relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <ContourField seed={7.3} className="h-[320px]" opacity={0.9} scale={110} />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-9 flex gap-5">
        <div className="hidden md:block w-[248px] flex-shrink-0">
          <div className="rounded-2xl border border-map-border bg-map-card h-[420px] animate-pulse" />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="rounded-2xl border border-map-border bg-map-card h-[52px] animate-pulse" />
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-map-border bg-map-card h-[172px] animate-pulse"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
