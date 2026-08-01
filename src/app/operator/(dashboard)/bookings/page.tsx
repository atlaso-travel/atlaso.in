import { notFound } from "next/navigation";
import { getSession } from "@/server/auth";
import { getOperatorDashboard } from "@/server/portal";
import { Panel, EmptyRow, StatusPill, StatTile } from "@/components/portal/PortalChrome";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const day = (iso: string) =>
  new Date(iso.slice(0, 10)).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

export default async function OperatorBookingsPage() {
  const session = await getSession();
  const data = await getOperatorDashboard(session!.subject);
  if (!data) notFound();

  const { totals } = data;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Confirmed" value={String(totals.confirmedBookings)} />
        <StatTile label="Travellers" value={String(totals.travellers)} />
        <StatTile label="Awaiting payout" value={formatPrice(totals.awaitingPayout)} tone={totals.awaitingPayout > 0 ? "warn" : "default"} />
        <StatTile label="Settled" value={formatPrice(totals.paidOut)} tone="good" />
      </div>

      <Panel
        title="Bookings"
        description="Amounts shown are what Atlaso owes you at your agreed rate."
      >
        {data.bookings.length === 0 ? (
          <EmptyRow>
            No bookings yet. They appear here the moment a customer&apos;s payment clears.
          </EmptyRow>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead>
                <tr className="border-b border-map-border">
                  <Th>Reference</Th>
                  <Th>Trip</Th>
                  <Th>Departure</Th>
                  <Th>Lead traveller</Th>
                  <Th align="right">Pax</Th>
                  <Th align="right">You are owed</Th>
                  <Th>Payment</Th>
                  <Th>Payout</Th>
                </tr>
              </thead>
              <tbody>
                {data.bookings.map((b) => (
                  <tr key={b.id} className="border-b border-map-border last:border-0">
                    <Td>
                      <span className="font-semibold text-map-text tnum">{b.reference}</span>
                    </Td>
                    <Td>{b.packageTitle}</Td>
                    <Td className="tnum">{day(b.startDate)}</Td>
                    <Td>
                      <span className="block text-map-text">{b.contactName}</span>
                      <span className="block text-[11.5px] text-map-muted tnum">
                        {b.contactPhone}
                      </span>
                    </Td>
                    <Td align="right" className="tnum">{b.travellerCount}</Td>
                    <Td align="right">
                      <span className="font-semibold text-map-text tnum">
                        {formatPrice(b.operatorPayable)}
                      </span>
                    </Td>
                    <Td><StatusPill status={b.paymentStatus} /></Td>
                    <Td><StatusPill status={b.payoutStatus} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Callback requests">
        {data.leads.length === 0 ? (
          <EmptyRow>No callback requests yet.</EmptyRow>
        ) : (
          <ul className="divide-y divide-map-border">
            {data.leads.map((lead) => (
              <li key={lead.id} className="px-5 py-3 flex items-start gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-[13px] text-map-text">{lead.name}</p>
                  <p className="text-[11.5px] text-map-muted font-body tnum">
                    {lead.phone} · {lead.email}
                  </p>
                  {lead.message && (
                    <p className="text-[12.5px] text-map-text font-body mt-1">{lead.message}</p>
                  )}
                </div>
                <StatusPill status={lead.status} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      className={`label-util px-4 py-2.5 ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

function Td({
  children, align, className = "",
}: {
  children: React.ReactNode;
  align?: "right";
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-3 text-map-muted font-body align-top ${align === "right" ? "text-right" : ""} ${className}`}
    >
      {children}
    </td>
  );
}
