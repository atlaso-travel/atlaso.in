import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { destinations } from "@/data/destinations";
import NewPackageForm from "@/components/portal/NewPackageForm";

export const dynamic = "force-dynamic";

export default function NewPackagePage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/operator/packages"
        className="inline-flex items-center gap-1.5 text-[13px] text-map-muted hover:text-compass-blue font-body mb-4 transition-colors"
      >
        <ArrowLeft size={13} /> Back to packages
      </Link>

      <h2 className="font-display font-extrabold text-[20px] text-map-text">Add a package</h2>
      <p className="text-[13px] text-map-muted font-body mt-1 mb-5">
        Submissions are reviewed by Atlaso before they appear in search. You can edit
        pricing at any time afterwards.
      </p>

      <NewPackageForm
        destinations={destinations.map((d) => ({ id: d.id, name: d.name, region: d.region }))}
      />
    </div>
  );
}
