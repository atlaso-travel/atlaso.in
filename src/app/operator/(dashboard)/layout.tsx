import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { operatorLogoutAction } from "@/app/operator/actions";
import { PortalShell, StatusPill } from "@/components/portal/PortalChrome";
import { getLiveOperatorById } from "@/server/overrides";

/**
 * Guard for every operator route. The login page sits outside this route group
 * so it is not wrapped by this layout — otherwise the redirect would loop.
 */
export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "operator") redirect("/operator/login");

  const operator = getLiveOperatorById(session.subject);
  if (!operator) redirect("/operator/login");

  return (
    <PortalShell
      title="Operator portal"
      subtitle={operator.name}
      badge={<StatusPill status={operator.verificationStatus} />}
      logoutAction={operatorLogoutAction}
      nav={[
        { href: "/operator", label: "Overview", exact: true },
        { href: "/operator/packages", label: "Packages" },
        { href: "/operator/bookings", label: "Bookings" },
      ]}
    >
      {operator.verificationStatus !== "VERIFIED" && (
        <div className="mb-5 rounded-xl border border-compass-blue/30 bg-compass-light px-4 py-3">
          <p className="text-[13px] font-bold text-map-text font-body">
            Your account is awaiting verification
          </p>
          <p className="text-[12.5px] text-map-muted font-body mt-0.5 leading-snug">
            You can add packages and set pricing now. Listings go live once Atlaso has
            checked your documents.
          </p>
        </div>
      )}
      {children}
    </PortalShell>
  );
}
