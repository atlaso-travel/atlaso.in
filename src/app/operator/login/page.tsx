import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import LoginCard from "@/components/portal/LoginCard";
import { operatorLoginAction } from "@/app/operator/actions";
import { getSession } from "@/server/auth";

export const metadata: Metadata = {
  title: "Operator sign in",
  robots: { index: false, follow: false },
};

export default async function OperatorLoginPage() {
  const session = await getSession();
  if (session?.role === "operator") redirect("/operator");

  return (
    <LoginCard
      title="Operator sign in"
      subtitle="Manage your listings, pricing and bookings."
      action={operatorLoginAction}
      icon={<Building2 />}
      badge="Operator portal"
      features={[
        "Publish and update your trip listings",
        "Set your rates and track platform pricing",
        "Manage bookings and payouts in one place",
      ]}
      emailLabel="Work email"
      emailPlaceholder="ops@yourcompany.in"
    />
  );
}
