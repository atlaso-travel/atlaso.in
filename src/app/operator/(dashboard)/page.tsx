import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarCheck, MapPinned, Plus, Wallet } from "lucide-react";
import { getSession } from "@/server/auth";
import { getOperatorDashboard } from "@/server/portal";
import { StatTile, Panel, EmptyRow, StatusPill } from "@/components/portal/PortalChrome";
import { PortalBarChart, type WeekPoint } from "@/components/portal/PortalBarChart";
import GradedImage from "@/components/ui/GradedImage";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** Nine weekly buckets ending this week — one bar per week, one axis (count),
 *  amount rides along in the hover tooltip rather than a second scale. */
function weeklyBuckets(
  bookings: { createdAt: string; paymentStatus: string; operatorPayable: number }[],
  weeks = 9
): WeekPoint[] {
  const points: WeekPoint[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let w = weeks - 1; w >= 0; w--) {
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - w * 7 - 6);
    const end = new Date(today);
    end.setUTCDate(end.getUTCDate() - w * 7);
    end.setUTCHours(23, 59, 59, 999);

    const inRange = bookings.filter((b) => {
      const created = new Date(b.createdAt);
      return created >= start && created <= end;
    });

    points.push({
      label: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      count: inRange.length,
      amount: inRange
        .filter((b) => b.paymentStatus === "PAID")
        .reduce((s, b) => s + b.operatorPayable, 0),
    });
  }

  return points;
}

export default async function OperatorOverview() {
  const session = await getSession();
  const data = await getOperatorDashboard(session!.subject);
  if (!data) notFound();

  const { totals } = data;
  const flagged = data.packages.filter((p) => p.validationStatus !== "OK");
  const weeklyPoints = weeklyBuckets(data.bookings);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Live listings" value={String(totals.liveListings)} hint={`${data.packages.length} total`} icon={<MapPinned size={12} />} />
        <StatTile label="Confirmed bookings" value={String(totals.confirmedBookings)} hint={`${totals.travellers} travellers`} icon={<CalendarCheck size={12} />} />
        <StatTile label="Earned" value={formatPrice(totals.earned)} hint="At your agreed rates" tone="good" />
        <StatTile label="Awaiting payout" value={formatPrice(totals.awaitingPayout)} hint={`${formatPrice(totals.paidOut)} settled`} tone={totals.awaitingPayout > 0 ? "warn" : "default"} icon={<Wallet size={12} />} />
      </div>

      {flagged.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-[13px] font-bold text-rose-700 font-body">
            {flagged.length} listing{flagged.length === 1 ? " needs" : "s need"} a pricing fix
          </p>
          <p className="text-[12.5px] text-rose-700/85 font-body mt-0.5">
            {flagged.map((f) => f.title).join(", ")} —{" "}
            <Link href="/operator/packages" className="underline font-semibold">
              review pricing
            </Link>
          </p>
        </div>
      )}

      <Panel title="Performance">
        <PortalBarChart points={weeklyPoints} />
      </Panel>

      <Panel
        title="Your packages"
        description="Both prices are required — we derive the customer price from your Atlaso rate."
        action={
          <div className="flex gap-2">
            <Link href="/operator/packages/new" className="btn-outline text-[13px] py-1.5 px-3">
              <Plus size={13} /> Add package
            </Link>
            <Link href="/operator/packages" className="btn-primary text-[13px] py-1.5 px-3">
              Manage <ArrowRight size={13} />
            </Link>
          </div>
        }
      >
        {data.packages.length === 0 ? (
          <EmptyRow>
            You have no packages yet.{" "}
            <Link href="/operator/packages/new" className="text-compass-blue font-semibold underline">
              Add your first one
            </Link>
            .
          </EmptyRow>
        ) : (
          <ul className="divide-y divide-map-border">
            {data.packages.slice(0, 5).map((pkg) => (
              <li key={pkg.id} className="px-5 py-3 flex items-center gap-3 flex-wrap">
                <GradedImage
                  src={pkg.image}
                  alt={pkg.title}
                  sizes="56px"
                  ratio="fill"
                  focus="landscape"
                  className="h-12 w-12 flex-shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-[13.5px] text-map-text truncate">
                    {pkg.title}
                  </p>
                  <p className="text-[12px] text-map-muted font-body">
                    {pkg.destinationName} · {pkg.duration}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-[13px] font-semibold text-map-text tnum">
                    {formatPrice(pkg.b2bCost)}
                  </span>
                  <span className="block text-[11px] text-map-muted font-body">your rate</span>
                </div>
                <StatusPill status={pkg.status} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Recent bookings">
          {data.bookings.length === 0 ? (
            <EmptyRow>No bookings yet.</EmptyRow>
          ) : (
            <ul className="divide-y divide-map-border">
              {data.bookings.slice(0, 5).map((b) => (
                <li key={b.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-[13px] text-map-text truncate">
                      {b.packageTitle}
                    </p>
                    <p className="text-[11.5px] text-map-muted font-body tnum">
                      {b.reference} · {b.travellerCount} traveller
                      {b.travellerCount === 1 ? "" : "s"} · {date(b.createdAt)}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold text-map-text tnum">
                    {formatPrice(b.operatorPayable)}
                  </span>
                  <StatusPill status={b.paymentStatus} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Callback requests" description="Customers who asked to speak to someone.">
          {data.leads.length === 0 ? (
            <EmptyRow>No callback requests yet.</EmptyRow>
          ) : (
            <ul className="divide-y divide-map-border">
              {data.leads.slice(0, 5).map((lead) => (
                <li key={lead.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-[13px] text-map-text">
                      {lead.name}
                    </span>
                    <StatusPill status={lead.status} />
                  </div>
                  <p className="text-[11.5px] text-map-muted font-body mt-0.5">
                    {lead.phone} · {lead.packageTitle ?? "General enquiry"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
