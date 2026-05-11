import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const operators = ["Alpine Treks", "Summit Squad", "Peak Pathways"];
const rows = [
  { label: "Price", values: ["₹14,999", "₹9,999", "₹19,999"] },
  { label: "Meals", values: [true, true, true] },
  { label: "Transport", values: [true, false, true] },
  { label: "Guide", values: [true, true, true] },
  { label: "Cancellation", values: ["7 days", "No refund", "3 days"] },
];
const bestValueCol = 1;

export default function ComparisonPreview() {
  return (
    <section className="py-24 bg-atlas-night relative overflow-hidden">
      <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-compass-blue/25 blur-3xl" />
      <div className="absolute -bottom-40 -left-20 w-[360px] h-[360px] rounded-full bg-trail-orange/20 blur-3xl" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.35em] uppercase text-white/50 font-body mb-4">
            Comparison preview
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3 font-display">
            Compare like a pro
          </h2>
          <p className="text-white/60 font-body max-w-2xl mx-auto">
            See exactly what you get with every operator
          </p>
        </div>

        {/* Table */}
        <div className="relative">
          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_30px_80px_rgba(7,14,32,0.6)]">
          <table className="w-full min-w-[520px]">
            <thead className="bg-white/[0.03]">
              <tr className="border-b border-white/10">
                <th className="text-left pt-7 pb-4 px-5 text-white/50 text-sm font-medium w-32 font-body">
                  Feature
                </th>
                {operators.map((op, i) => (
                  <th key={op} className="pt-7 pb-4 px-5 text-center relative">
                    {i === bestValueCol && (
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-trail-orange text-white text-xs px-3 py-1 rounded-full whitespace-nowrap font-semibold shadow-md ring-1 ring-white/20">
                        ⭐ Best Value
                      </span>
                    )}
                    <span
                      className={cn(
                        "font-semibold text-sm font-display",
                        i === bestValueCol ? "text-compass-blue" : "text-white"
                      )}
                    >
                      {op}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-white/5 transition-colors",
                    ri % 2 === 0 ? "bg-white/5" : "bg-transparent",
                    "hover:bg-white/[0.07]"
                  )}
                >
                  <td className="py-3.5 px-5 text-white/60 text-sm font-body">
                    {row.label}
                  </td>
                  {row.values.map((val, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        "py-3.5 px-5 text-center",
                        ci === bestValueCol ? "bg-compass-blue/15" : ""
                      )}
                    >
                      {typeof val === "boolean" ? (
                        val ? (
                          <CheckCircle2 size={18} className="mx-auto text-summit-green" />
                        ) : (
                          <XCircle size={18} className="mx-auto text-red-400" />
                        )
                      ) : (
                        <span
                          className={cn(
                            "text-sm font-medium",
                            ci === bestValueCol ? "text-compass-blue" : "text-white"
                          )}
                        >
                          {val}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-white/60 mb-5 font-body">
            Ready to compare real operators?
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-compass-blue text-white font-bold px-8 py-3.5 rounded-full transition-all duration-200 hover:scale-[1.04] hover:opacity-95 shadow-[0_16px_40px_rgba(42,109,217,0.35)]"
          >
            Search &amp; Compare Now
          </Link>
        </div>
      </div>
    </section>
  );
}
