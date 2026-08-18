export default function CompareLoading() {
  /* Metrics mirror the real table in CompareView, so the swap from skeleton to
     content does not shift the columns. */
  return (
    <div className="min-h-screen bg-peach-wash">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-8 w-64 rounded-lg bg-map-card border border-warm-line animate-pulse mb-6" />
        <div className="rounded-2xl border border-warm-line bg-map-card shadow-card overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: "152px repeat(4, minmax(200px, 1fr))" }}>
            <div className="bg-peach-wash border-b border-r border-warm-line" />
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-b border-l border-warm-line p-3.5"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="h-[84px] rounded-xl bg-peach-wash animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-peach-wash animate-pulse mt-3" />
                <div className="h-3 w-full rounded bg-peach-wash animate-pulse mt-2" />
              </div>
            ))}
          </div>
          <div className="h-[320px] bg-map-card animate-pulse" />
        </div>
      </div>
    </div>
  );
}
