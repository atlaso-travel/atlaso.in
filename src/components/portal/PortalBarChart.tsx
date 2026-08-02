import { formatPrice } from "@/lib/utils";

export interface WeekPoint {
  label: string;
  count: number;
  amount: number;
}

/**
 * Weekly bookings, one bar per week, one axis (count) — the amount that week
 * earned rides along in the hover tooltip rather than as a second scale.
 * Pure CSS hover (`group-hover`), so this needs no client JS and no chart
 * library for nine bars.
 */
export function PortalBarChart({ points }: { points: WeekPoint[] }) {
  const max = Math.max(1, ...points.map((p) => p.count));
  const totalBookings = points.reduce((s, p) => s + p.count, 0);
  const totalAmount = points.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="px-5 py-5">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <span className="label-util block">Bookings, last {points.length} weeks</span>
          <span className="font-display font-extrabold text-[24px] text-map-text tnum mt-1 block">
            {totalBookings}
          </span>
        </div>
        <div className="text-right">
          <span className="label-util block">Earned in period</span>
          <span className="font-display font-extrabold text-[24px] text-summit-green tnum mt-1 block">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      <div className="flex items-end gap-2 sm:gap-3 h-32 border-b border-map-border">
        {points.map((p, i) => {
          const heightPct = p.count === 0 ? 3 : Math.max(8, Math.round((p.count / max) * 100));
          return (
            <div
              key={i}
              className="group relative flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-lg bg-espresso-deep px-2.5 py-1.5 text-[11px] text-white opacity-0 shadow-dropdown transition-opacity duration-150 group-hover:opacity-100 z-10"
              >
                <span className="font-semibold">
                  {p.count} booking{p.count === 1 ? "" : "s"}
                </span>
                <span className="text-white/60"> · {formatPrice(p.amount)}</span>
              </div>
              <div
                className="w-full max-w-[26px] rounded-t-md transition-[filter] duration-150 group-hover:brightness-95"
                style={{
                  height: `${heightPct}%`,
                  backgroundImage: p.count > 0 ? "var(--gradient-signature)" : undefined,
                  backgroundColor: p.count > 0 ? undefined : "#F1F5F9",
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 sm:gap-3 mt-2">
        {points.map((p, i) => (
          <span
            key={i}
            className="mono-chart flex-1 text-center text-[9.5px] text-map-muted truncate"
          >
            {p.label}
          </span>
        ))}
      </div>

      {/* Table fallback for screen readers and no-JS/no-hover contexts. */}
      <table className="sr-only">
        <caption>Bookings and earnings by week</caption>
        <thead>
          <tr>
            <th>Week starting</th>
            <th>Bookings</th>
            <th>Earned</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={i}>
              <td>{p.label}</td>
              <td>{p.count}</td>
              <td>{formatPrice(p.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
