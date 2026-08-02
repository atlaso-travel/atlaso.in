import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
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
      icon={<ShieldCheck size={18} />}
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
