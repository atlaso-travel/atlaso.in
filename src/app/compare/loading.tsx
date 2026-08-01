export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-map-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
        <div className="h-8 w-64 rounded-lg bg-map-card border border-map-border animate-pulse mb-6" />
        <div className="grid gap-3" style={{ gridTemplateColumns: "132px repeat(3, minmax(184px, 1fr))" }}>
          <div />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-map-border bg-map-card h-[236px] animate-pulse"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-map-border bg-map-card h-[300px] animate-pulse" />
      </div>
    </div>
  );
}
