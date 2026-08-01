import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginCard from "@/components/portal/LoginCard";
import { adminLoginAction } from "@/app/admin/actions";
import { getSession, DEMO_HINT } from "@/server/auth";

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
      emailLabel="Email"
      emailPlaceholder={DEMO_HINT.adminEmail}
      hint={
        DEMO_HINT.usingDefaults ? (
          <div className="mt-5 pt-4 border-t border-map-border">
            <p className="label-util mb-1.5">Demo account</p>
            <p className="text-[12px] text-map-muted font-body leading-relaxed">
              <code className="bg-map-white px-1.5 py-0.5 rounded text-map-text font-semibold">
                {DEMO_HINT.adminEmail}
              </code>{" "}
              /{" "}
              <code className="bg-map-white px-1.5 py-0.5 rounded text-map-text font-semibold">
                {DEMO_HINT.adminPassword}
              </code>
              . Set ADMIN_EMAIL and ADMIN_DEMO_PASSWORD to change these, and replace the whole
              mechanism with real accounts once the database exists.
            </p>
          </div>
        ) : null
      }
    />
  );
}
