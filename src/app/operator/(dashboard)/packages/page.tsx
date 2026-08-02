import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Plus } from "lucide-react";
import { getSession } from "@/server/auth";
import { getOperatorDashboard } from "@/server/portal";
import { togglePackageStatusAction } from "@/app/operator/actions";
import { Panel, EmptyRow, StatusPill } from "@/components/portal/PortalChrome";
import PricingEditor from "@/components/portal/PricingEditor";
import GradedImage from "@/components/ui/GradedImage";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OperatorPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const { created } = await searchParams;
  const session = await getSession();
  const data = await getOperatorDashboard(session!.subject);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-5">
      {created && (
        <div className="flex gap-2 rounded-xl border border-summit-green/30 bg-summit-light px-4 py-3">
          <CheckCircle2 size={16} className="text-summit-green flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-map-text font-body">Package submitted</p>
            <p className="text-[12.5px] text-map-muted font-body mt-0.5">
              It is marked <b>pending review</b> and will not appear in search until Atlaso
              approves it.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display font-extrabold text-[19px] text-map-text">
            Packages &amp; pricing
          </h2>
          <p className="text-[13px] text-map-muted font-body mt-0.5">
            {data.packages.length} listing{data.packages.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/operator/packages/new" className="btn-primary text-[13.5px] py-2 px-4">
          <Plus size={14} /> Add package
        </Link>
      </div>

      {data.packages.length === 0 ? (
        <Panel title="No packages yet">
          <EmptyRow>
            Add your first trip and set both prices so we can list it.
          </EmptyRow>
        </Panel>
      ) : (
        <div className="flex flex-col gap-4">
          {data.packages.map((pkg) => {
            const seatsFilledPct =
              pkg.seatsTotal > 0
                ? Math.round(((pkg.seatsTotal - pkg.seatsLeft) / pkg.seatsTotal) * 100)
                : 0;

            return (
            <Panel
              key={pkg.id}
              title={
                <div className="flex items-center gap-3 min-w-0">
                  <GradedImage
                    src={pkg.image}
                    alt={pkg.title}
                    sizes="56px"
                    ratio="fill"
                    focus="landscape"
                    className="h-11 w-11 flex-shrink-0 rounded-lg"
                  />
                  <span className="min-w-0 truncate">{pkg.title}</span>
                </div>
              }
              description={`${pkg.destinationName} · ${pkg.duration} · ${pkg.departures} departure${pkg.departures === 1 ? "" : "s"} · ${pkg.seatsLeft} seats open`}
              action={
                <div className="flex items-center gap-2">
                  <StatusPill status={pkg.status} />
                  {pkg.validationStatus !== "OK" && (
                    <StatusPill status={pkg.validationStatus} />
                  )}
                  <form action={togglePackageStatusAction}>
                    <input type="hidden" name="packageId" value={pkg.id} />
                    <button
                      type="submit"
                      className="text-[12.5px] font-semibold text-compass-blue hover:underline font-body"
                    >
                      {pkg.status === "ACTIVE" ? "Pause" : "Resume"}
                    </button>
                  </form>
                </div>
              }
            >
              <div className="px-5 pt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${seatsFilledPct}%`, backgroundImage: "var(--gradient-signature)" }}
                  />
                </div>
                <span className="mono-chart text-[10.5px] text-map-muted whitespace-nowrap">
                  {seatsFilledPct}% seats filled
                </span>
              </div>

              <div className="p-5">
                <PricingEditor
                  packageId={pkg.id}
                  retailPrice={pkg.retailPrice}
                  b2bCost={pkg.b2bCost}
                  validationStatus={pkg.validationStatus}
                  validationNote={pkg.validationNote}
                />

                <div className="mt-4 pt-4 border-t border-map-border flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-[12px] text-map-muted font-body">
                    Currently offering{" "}
                    <b className="text-map-text tnum">{pkg.discountPct}%</b> off your direct price
                    of <b className="text-map-text tnum">{formatPrice(pkg.retailPrice)}</b>
                  </span>
                  {pkg.status === "ACTIVE" && (
                    <Link
                      href={`/packages/${pkg.slug}`}
                      className="text-[12.5px] font-semibold text-compass-blue hover:underline font-body"
                    >
                      View public listing →
                    </Link>
                  )}
                </div>
              </div>
            </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
