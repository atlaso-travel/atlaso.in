import { getLiveMarginRules, getLivePackages, getLiveOperators } from "@/server/overrides";
import { toggleMarginRuleAction, deleteMarginRuleAction } from "@/app/admin/actions";
import { Panel, ScopeBadge } from "@/components/portal/PortalChrome";
import MarginRuleForm from "@/components/portal/MarginRuleForm";
import { destinations } from "@/data/destinations";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SPECIFICITY: Record<string, number> = {
  PACKAGE: 5, OPERATOR_DESTINATION: 4, OPERATOR: 3, DESTINATION: 2, GLOBAL: 1,
};

function describe(rule: ReturnType<typeof getLiveMarginRules>[number]): string {
  switch (rule.strategy) {
    case "PERCENT":
      return `${(rule.percentBps ?? 0) / 100}% of cost`;
    case "FLAT":
      return `${formatPrice(rule.flatAmount ?? 0)} flat`;
    case "MIN_OF_PERCENT_AND_FLAT":
      return `min(${(rule.percentBps ?? 0) / 100}% of cost, ${formatPrice(rule.flatAmount ?? 0)})`;
    case "SPLIT_DISCOUNT":
      return `${(rule.splitBps ?? 0) / 100}% of the operator discount, capped at ${formatPrice(rule.flatAmount ?? 0)}`;
    case "MANUAL_OVERRIDE":
      return `fixed price ${formatPrice(rule.flatAmount ?? 0)}`;
  }
}

export default async function AdminMarginsPage() {
  const rules = [...getLiveMarginRules()].sort(
    (a, b) => SPECIFICITY[b.scope] - SPECIFICITY[a.scope] || b.priority - a.priority
  );
  const packages = getLivePackages();
  const operators = getLiveOperators();

  /** How many live packages each rule currently prices. */
  const usage = new Map<string, number>();
  for (const pkg of packages) {
    const id = pkg.pricing.appliedMarginRuleId;
    usage.set(id, (usage.get(id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-extrabold text-[19px] text-map-text">Margin rules</h2>
        <p className="text-[13px] text-map-muted font-body mt-0.5 max-w-2xl">
          Margin strategy lives here rather than in code, because it changes as the business
          learns. Saving a rule reprices every affected package immediately — but never
          retroactively: existing bookings keep the price snapshot they were taken at.
        </p>
        <p className="text-[12.5px] text-map-muted font-body mt-2">
          Resolution order, most specific first: <b className="text-map-text">package → operator+destination → operator → destination → global</b>.
          Ties break on priority.
        </p>
      </div>

      <Panel title="Active rules" description={`${rules.length} rules pricing ${packages.length} packages.`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-[13px]">
            <thead>
              <tr className="border-b border-map-border bg-[#FBF8F6]">
                <th className="label-util text-left px-5 py-2.5">Rule</th>
                <th className="label-util text-left px-3 py-2.5">Scope</th>
                <th className="label-util text-left px-3 py-2.5">Margin</th>
                <th className="label-util text-right px-3 py-2.5">Floor</th>
                <th className="label-util text-right px-3 py-2.5">Priority</th>
                <th className="label-util text-right px-3 py-2.5">In use</th>
                <th className="label-util text-right px-5 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b border-map-border last:border-0 align-top hover:bg-[#FBF8F6] transition-colors"
                >
                  <td className="px-5 py-3">
                    <span className="block font-semibold text-map-text">{rule.id}</span>
                    <span className="block text-[11.5px] text-map-muted font-body mt-0.5 max-w-[280px]">
                      {rule.note}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <ScopeBadge scope={rule.scope} />
                    {(rule.operatorId || rule.destinationId || rule.packageId) && (
                      <span className="block text-[11px] text-map-muted font-body mt-1">
                        {[rule.operatorId, rule.destinationId, rule.packageId]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-map-muted font-body">{describe(rule)}</td>
                  <td className="px-3 py-3 text-right text-map-muted tnum">
                    {formatPrice(rule.minMargin)}
                  </td>
                  <td className="px-3 py-3 text-right text-map-muted tnum">{rule.priority}</td>
                  <td className="px-3 py-3 text-right">
                    <span className="tnum text-map-text font-semibold">
                      {usage.get(rule.id) ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2.5">
                      <span className={rule.active ? "text-summit-green text-[11.5px] font-bold" : "text-map-muted text-[11.5px] font-bold"}>
                        {rule.active ? "on" : "off"}
                      </span>
                      <form action={toggleMarginRuleAction}>
                        <input type="hidden" name="id" value={rule.id} />
                        <button className="text-[12px] font-semibold text-compass-blue hover:underline font-body">
                          {rule.active ? "Disable" : "Enable"}
                        </button>
                      </form>
                      {rule.id !== "rule-global-default" && (
                        <form action={deleteMarginRuleAction}>
                          <input type="hidden" name="id" value={rule.id} />
                          <button className="text-[12px] font-semibold text-rose-600 hover:underline font-body">
                            Delete
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <MarginRuleForm
        operators={operators.map((o) => ({ id: o.id, name: o.name }))}
        destinations={destinations.map((d) => ({ id: d.id, name: d.name }))}
        packages={packages.map((p) => ({ id: p.id, title: p.title }))}
        existingIds={rules.map((r) => r.id)}
      />
    </div>
  );
}
