import { getVerificationQueue } from "@/server/portal";
import { setVerificationAction } from "@/app/admin/actions";
import { Panel, StatusPill } from "@/components/portal/PortalChrome";

export const dynamic = "force-dynamic";

const DOC_LABEL: Record<string, string> = {
  GST: "GST certificate",
  PAN: "PAN",
  LICENSE: "Tourism licence",
  INSURANCE: "Liability insurance",
};

export default async function AdminOperatorsPage() {
  const operators = await getVerificationQueue();
  const pending = operators.filter((o) => o.verificationStatus === "PENDING");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-extrabold text-[19px] text-map-text">
          Operator verification
        </h2>
        <p className="text-[13px] text-map-muted font-body mt-0.5">
          {pending.length} awaiting review · {operators.length} total. Unverified operators can
          list, but their packages carry an &quot;unverified&quot; badge on the public site.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {operators.map((o) => {
          const approved = o.documents.filter((d) => d.status === "APPROVED").length;
          return (
            <Panel
              key={o.id}
              title={o.name}
              description={`${o.legalName} · ${o.city}, ${o.state} · since ${o.foundedYear}`}
              action={<StatusPill status={o.verificationStatus} />}
            >
              <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div>
                  <span className="label-util">Contact</span>
                  <p className="text-[13px] text-map-text font-body mt-1">{o.contactName}</p>
                  <p className="text-[12.5px] text-map-muted font-body tnum">{o.contactPhone}</p>
                  <p className="text-[12.5px] text-map-muted font-body break-all">
                    {o.contactEmail}
                  </p>
                </div>

                <div>
                  <span className="label-util">Registration</span>
                  <p className="text-[12.5px] text-map-muted font-body mt-1">
                    GSTIN{" "}
                    <span className="text-map-text tnum">
                      {o.gstin ?? <span className="text-rose-600">not supplied</span>}
                    </span>
                  </p>
                  <p className="text-[12.5px] text-map-muted font-body">
                    PAN <span className="text-map-text tnum">{o.panMasked ?? "—"}</span>
                  </p>
                  <p className="text-[12.5px] text-map-muted font-body">
                    Payout account{" "}
                    <span className={o.payoutVerified ? "text-summit-green" : "text-rose-600"}>
                      {o.payoutVerified ? "verified" : "unverified"}
                    </span>
                  </p>
                </div>

                <div>
                  <span className="label-util">
                    Documents ({approved}/{o.documents.length} approved)
                  </span>
                  <ul className="mt-1 flex flex-col gap-1">
                    {o.documents.map((d) => (
                      <li key={d.id} className="flex items-center gap-2 text-[12.5px] font-body">
                        <span className="text-map-text flex-1 min-w-0 truncate">
                          {DOC_LABEL[d.type] ?? d.type}
                        </span>
                        <StatusPill status={d.status} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-map-border flex items-center gap-2 flex-wrap">
                <span className="text-[12.5px] text-map-muted font-body flex-1 min-w-0">
                  {o.packageCount} listing{o.packageCount === 1 ? "" : "s"} · {o.rating} from{" "}
                  {o.reviewCount} reviews
                </span>
                {(["VERIFIED", "PENDING", "SUSPENDED", "REJECTED"] as const)
                  .filter((s) => s !== o.verificationStatus)
                  .map((status) => (
                    <form key={status} action={setVerificationAction}>
                      <input type="hidden" name="operatorId" value={o.id} />
                      <input type="hidden" name="status" value={status} />
                      <button
                        type="submit"
                        className={
                          status === "VERIFIED"
                            ? "btn-primary text-[12.5px] py-1.5 px-3"
                            : "text-[12.5px] font-semibold text-map-muted hover:text-map-text font-body px-2 py-1.5"
                        }
                      >
                        {status === "VERIFIED"
                          ? "Approve"
                          : status === "PENDING"
                          ? "Back to pending"
                          : status === "SUSPENDED"
                          ? "Suspend"
                          : "Reject"}
                      </button>
                    </form>
                  ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
