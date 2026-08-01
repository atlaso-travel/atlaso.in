import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginCard from "@/components/portal/LoginCard";
import { operatorLoginAction } from "@/app/operator/actions";
import { getSession, DEMO_HINT } from "@/server/auth";
import { operators } from "@/data/operators";

export const metadata: Metadata = {
  title: "Operator sign in",
  robots: { index: false, follow: false },
};

export default async function OperatorLoginPage() {
  const session = await getSession();
  if (session?.role === "operator") redirect("/operator");

  const samples = operators.slice(0, 2);

  return (
    <LoginCard
      title="Operator sign in"
      subtitle="Manage your listings, pricing and bookings."
      action={operatorLoginAction}
      emailLabel="Work email"
      emailPlaceholder="ops@yourcompany.in"
      hint={
        DEMO_HINT.usingDefaults ? (
          <div className="mt-5 pt-4 border-t border-map-border">
            <p className="label-util mb-1.5">Demo accounts</p>
            <p className="text-[12px] text-map-muted font-body leading-relaxed">
              No operator table exists yet, so any seeded operator&apos;s contact email works
              with the password{" "}
              <code className="bg-map-white px-1.5 py-0.5 rounded text-map-text font-semibold">
                {DEMO_HINT.operatorPassword}
              </code>
              . For example:
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {samples.map((o) => (
                <li key={o.id} className="text-[12px] font-body">
                  <span className="text-map-text font-semibold">{o.contactEmail}</span>
                  <span className="text-map-muted"> — {o.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null
      }
    />
  );
}
