import Link from "next/link";
import {
  AlertTriangle,
  IndianRupee,
  MapPinned,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wallet,
} from "lucide-react";
import { getAdminOverview } from "@/server/portal";
import { pausePackageAction, markPayoutPaidAction } from "@/app/admin/actions";
import { StatTile, Panel, EmptyRow, StatusPill } from "@/components/portal/PortalChrome";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const data = await getAdminOverview();
  const maxListings = Math.max(1, ...data.byDestination.map((d) => d.listings));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-extrabold text-[19px] text-map-text">Platform overview</h2>
        <p className="text-[13px] text-map-muted font-body mt-0.5">
          Revenue, margin and risk across the marketplace.
        </p>
      </div>

      {/* Money */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="GMV"
          value={formatPrice(data.gmv)}
          hint={`${data.confirmedBookings} confirmed booking${data.confirmedBookings === 1 ? "" : "s"}`}
          icon={<IndianRupee size={12} />}
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
          icon={<Wallet size={12} />}
        />
        <StatTile
          label="Customer savings"
          value={formatPrice(data.customerSavings)}
          hint="Versus operator direct prices"
          icon={<Sparkles size={12} />}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Average order"
          value={data.averageOrderValue ? formatPrice(data.averageOrderValue) : "—"}
          hint={`${data.travellers} travellers`}
          icon={<Receipt size={12} />}
        />
        <StatTile
          label="Live listings"
          value={String(data.activeListings)}
          hint={`${data.totalListings} total`}
          icon={<MapPinned size={12} />}
        />
        <StatTile
          label="Operators verified"
          value={String(data.operatorsVerified)}
          hint={`${data.operatorsPending} awaiting review`}
          tone={data.operatorsPending > 0 ? "warn" : "default"}
          icon={<ShieldCheck size={12} />}
        />
        <StatTile
          label="Active margin rules"
          value={String(data.marginRuleCount)}
          hint="Editable from Margin rules"
          icon={<SlidersHorizontal size={12} />}
        />
      </div>

      {/* Pricing violations */}
      <Panel
        title="Pricing rule violations"
        description="Packages where the computed price breaks a rule. Fix the operator's numbers or the margin rule — do not let these sit."
      >
        {data.violations.length === 0 ? (
          <EmptyRow>Every package passes its pricing rules.</EmptyRow>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {data.violations.map((v) => (
              <div
                key={v.packageId}
                className="rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 transition-colors px-4 py-3.5"
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <AlertTriangle size={14} />
                  </span>
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
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="By destination" description="Listings and realised margin.">
          {data.byDestination.length === 0 ? (
            <EmptyRow>No destinations with listings yet.</EmptyRow>
          ) : (
            <div className="flex flex-col divide-y divide-map-border">
              {data.byDestination.map((d) => (
                <div
                  key={d.destinationId}
                  className="px-5 py-3 hover:bg-[#FBF8F6] transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-body font-semibold text-[13px] text-map-text truncate">
                      {d.name}
                    </span>
                    <span className="text-[13px] font-semibold text-map-text tnum whitespace-nowrap">
                      {d.margin ? formatPrice(d.margin) : "—"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2.5">
                    <div className="h-1.5 flex-1 rounded-full bg-[#F1F5F9] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((d.listings / maxListings) * 100)}%`,
                          backgroundImage: "var(--gradient-signature)",
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-map-muted font-body tnum whitespace-nowrap">
                      {d.listings} listing{d.listings === 1 ? "" : "s"} · {d.bookings} booking
                      {d.bookings === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
