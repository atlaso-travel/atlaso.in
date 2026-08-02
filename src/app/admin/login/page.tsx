import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import LoginCard from "@/components/portal/LoginCard";
import { adminLoginAction } from "@/app/admin/actions";
import { getSession } from "@/server/auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin");

  return (
    <LoginCard
      title="Atlaso admin"
      subtitle="Internal. Operator verification, margin rules and platform analytics."
      action={adminLoginAction}
      icon={<ShieldCheck />}
      badge="Admin access"
      features={[
        "Verify operators and manage listing status",
        "Set and adjust margin rules across the catalogue",
        "Track payouts and platform-wide analytics",
      ]}
      emailLabel="Email"
      emailPlaceholder="you@atlaso.in"
    />
  );
}
