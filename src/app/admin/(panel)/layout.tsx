import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { adminLogoutAction } from "@/app/admin/actions";
import { PortalShell } from "@/components/portal/PortalChrome";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  return (
    <PortalShell
      title="Admin"
      subtitle="Platform overview"
      logoutAction={adminLogoutAction}
      nav={[
        { href: "/admin", label: "Overview", exact: true },
        { href: "/admin/operators", label: "Operators" },
        { href: "/admin/margins", label: "Margin rules" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
