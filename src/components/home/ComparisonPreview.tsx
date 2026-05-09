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
    <section className="py-20 bg-atlas-night">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-3 font-display">
            Compare like a pro
          </h2>
          <p className="text-white/60 font-body">
            See exactly what you get with every operator
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-5 text-white/50 text-sm font-medium w-32 font-body">
                  Feature
                </th>
                {operators.map((op, i) => (
                  <th key={op} className="py-4 px-5 text-center relative">
                    {i === bestValueCol && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-trail-orange text-white text-xs px-3 py-1 rounded-full whitespace-nowrap font-semibold">
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
                    "border-b border-white/5",
                    ri % 2 === 0 ? "bg-white/5" : "bg-transparent"
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
                        ci === bestValueCol ? "bg-compass-blue/10" : ""
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

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-white/60 mb-5 font-body">
            Ready to compare real operators?
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-compass-blue text-white font-bold px-8 py-3.5 rounded-full transition-all duration-200 hover:scale-105 hover:opacity-90"
          >
            Search &amp; Compare Now
          </Link>
        </div>
      </div>
    </section>
  );
}
