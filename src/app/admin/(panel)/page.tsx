import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getAdminOverview } from "@/server/portal";
import { pausePackageAction, markPayoutPaidAction } from "@/app/admin/actions";
import { StatTile, Panel, EmptyRow, StatusPill } from "@/components/portal/PortalChrome";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const data = await getAdminOverview();

  return (
    <div className="flex flex-col gap-5">
      {/* Money */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="GMV"
          value={formatPrice(data.gmv)}
          hint={`${data.confirmedBookings} confirmed booking${data.confirmedBookings === 1 ? "" : "s"}`}
        />
        <StatTile
          label="Platform margin"
          value={formatPrice(data.margin)}
          hint={`${data.takeRatePct}% take rate`}
          tone="good"
        />
        <StatTile
          label="Owed to operators"
          value={formatPrice(data.awaitingPayout)}
          hint={`${formatPrice(data.operatorCost)} total cost`}
          tone={data.awaitingPayout > 0 ? "warn" : "default"}
        />
        <StatTile
          label="Customer savings"
          value={formatPrice(data.customerSavings)}
          hint="Versus operator direct prices"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Average order" value={data.averageOrderValue ? formatPrice(data.averageOrderValue) : "—"} hint={`${data.travellers} travellers`} />
        <StatTile label="Live listings" value={String(data.activeListings)} hint={`${data.totalListings} total`} />
        <StatTile label="Operators verified" value={String(data.operatorsVerified)} hint={`${data.operatorsPending} awaiting review`} tone={data.operatorsPending > 0 ? "warn" : "default"} />
        <StatTile label="Active margin rules" value={String(data.marginRuleCount)} hint="Editable from Margin rules" />
      </div>

      {/* Pricing violations */}
      <Panel
        title="Pricing rule violations"
        description="Packages where the computed price breaks a rule. Fix the operator's numbers or the margin rule — do not let these sit."
      >
        {data.violations.length === 0 ? (
          <EmptyRow>Every package passes its pricing rules.</EmptyRow>
        ) : (
          <ul className="divide-y divide-map-border">
            {data.violations.map((v) => (
              <li key={v.packageId} className="px-5 py-4">
                <div className="flex items-start gap-3 flex-wrap">
                  <AlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-[13.5px] text-map-text">
                        {v.title}
                      </span>
                      <StatusPill status={v.validationStatus} />
                      <StatusPill status={v.status} />
                      {v.stillSellable && (
                        <span className="text-[10.5px] font-bold text-compass-blue bg-compass-light rounded-full px-2 py-0.5 font-body">
                          still on sale
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-map-muted font-body mt-0.5">
                      {v.operatorName} · rule{" "}
                      <code className="text-map-text">{v.appliedMarginRuleId}</code>
                    </p>
                    <p className="text-[12.5px] text-rose-700 font-body mt-1.5">
                      {v.validationNote}
                    </p>
                    <p className="text-[12px] text-map-muted font-body mt-1.5 tnum">
                      cost {formatPrice(v.b2bCost)} · platform {formatPrice(v.platformPrice)} ·
                      retail {formatPrice(v.retailPrice)} · margin{" "}
                      <b className={v.marginAmount < 0 ? "text-rose-600" : "text-map-text"}>
                        {formatPrice(v.marginAmount)}
                      </b>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={pausePackageAction}>
                      <input type="hidden" name="packageId" value={v.packageId} />
                      <input
                        type="hidden"
                        name="next"
                        value={v.status === "ACTIVE" ? "PAUSED" : "ACTIVE"}
                      />
                      <button
                        type="submit"
                        className="text-[12.5px] font-semibold text-compass-blue hover:underline font-body whitespace-nowrap"
                      >
                        {v.status === "ACTIVE" ? "Withhold from search" : "Put back on sale"}
                      </button>
                    </form>
                    <Link
                      href="/admin/margins"
                      className="text-[12.5px] font-semibold text-map-muted hover:text-map-text font-body whitespace-nowrap"
                    >
                      Edit rule
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="By destination" description="Listings and realised margin.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-[13px]">
              <thead>
                <tr className="border-b border-map-border">
                  <th className="label-util text-left px-5 py-2.5">Destination</th>
                  <th className="label-util text-right px-3 py-2.5">Listings</th>
                  <th className="label-util text-right px-3 py-2.5">Bookings</th>
                  <th className="label-util text-right px-5 py-2.5">Margin</th>
                </tr>
              </thead>
              <tbody>
                {data.byDestination.map((d) => (
                  <tr key={d.destinationId} className="border-b border-map-border last:border-0">
                    <td className="px-5 py-2.5 text-map-text font-body">{d.name}</td>
                    <td className="px-3 py-2.5 text-right text-map-muted tnum">{d.listings}</td>
                    <td className="px-3 py-2.5 text-right text-map-muted tnum">{d.bookings}</td>
                    <td className="px-5 py-2.5 text-right text-map-text font-semibold tnum">
                      {d.margin ? formatPrice(d.margin) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Recent bookings" description="Payouts are settled manually until RazorpayX is wired.">
          {data.recentBookings.length === 0 ? (
            <EmptyRow>
              No bookings yet. Complete one through checkout with Razorpay test keys to see it
              here.
            </EmptyRow>
          ) : (
            <ul className="divide-y divide-map-border">
              {data.recentBookings.map((b) => (
                <li key={b.id} className="px-5 py-3 flex items-center gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-[13px] text-map-text truncate">
                      {b.reference} · {b.operatorName}
                    </p>
                    <p className="text-[11.5px] text-map-muted font-body tnum">
                      {formatPrice(b.totalAmount)} gross · {formatPrice(b.platformMargin)} margin
                    </p>
                  </div>
                  <StatusPill status={b.paymentStatus} />
                  <StatusPill status={b.payoutStatus} />
                  {b.paymentStatus === "PAID" && b.payoutStatus !== "PAID" && (
                    <form action={markPayoutPaidAction}>
                      <input type="hidden" name="reference" value={b.reference} />
                      <button
                        type="submit"
                        className="text-[12px] font-semibold text-compass-blue hover:underline font-body whitespace-nowrap"
                      >
                        Mark paid
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
