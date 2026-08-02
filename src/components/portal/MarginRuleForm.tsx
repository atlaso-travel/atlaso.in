"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";
import { saveMarginRuleAction, type ActionState } from "@/app/admin/actions";
import { Panel } from "@/components/portal/PortalChrome";

type Scope = "GLOBAL" | "DESTINATION" | "OPERATOR" | "OPERATOR_DESTINATION" | "PACKAGE";
type Strategy = "PERCENT" | "FLAT" | "MIN_OF_PERCENT_AND_FLAT" | "SPLIT_DISCOUNT" | "MANUAL_OVERRIDE";

const STRATEGY_HELP: Record<Strategy, string> = {
  PERCENT: "Cost-plus. Margin is a percentage of the operator's rate and ignores their retail price.",
  FLAT: "Cost-plus. A fixed rupee margin per traveller.",
  MIN_OF_PERCENT_AND_FLAT: "Cost-plus. The smaller of a percentage and a cap.",
  SPLIT_DISCOUNT:
    "Discount-split. Takes a share of the gap between the operator's rate and their retail price, so the customer's saving scales with how good a deal we got. This is the platform default.",
  MANUAL_OVERRIDE: "Sets an absolute customer price. Can breach the margin floor — it will be flagged.",
};

export default function MarginRuleForm({
  operators,
  destinations,
  packages,
  existingIds,
}: {
  operators: { id: string; name: string }[];
  destinations: { id: string; name: string }[];
  packages: { id: string; title: string }[];
  existingIds: string[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveMarginRuleAction,
    {}
  );
  const [scope, setScope] = useState<Scope>("DESTINATION");
  const [strategy, setStrategy] = useState<Strategy>("SPLIT_DISCOUNT");

  const needsOperator = scope === "OPERATOR" || scope === "OPERATOR_DESTINATION";
  const needsDestination = scope === "DESTINATION" || scope === "OPERATOR_DESTINATION";
  const needsPackage = scope === "PACKAGE";
  const usesPercent = strategy === "PERCENT" || strategy === "MIN_OF_PERCENT_AND_FLAT";
  const usesSplit = strategy === "SPLIT_DISCOUNT";
  const usesFlat =
    strategy === "FLAT" || strategy === "MIN_OF_PERCENT_AND_FLAT" ||
    strategy === "SPLIT_DISCOUNT" || strategy === "MANUAL_OVERRIDE";

  return (
    <Panel title="Add or replace a rule" description="Reusing an existing id overwrites that rule.">
      <form action={formAction} className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-map-text font-body">Rule id</span>
            <input
              name="id" required pattern="[a-z0-9-]+" placeholder="rule-dest-coorg"
              className="input-field" list="existing-rule-ids"
            />
            <datalist id="existing-rule-ids">
              {existingIds.map((id) => <option key={id} value={id} />)}
            </datalist>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-map-text font-body">Scope</span>
            <select
              name="scope" value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
              className="input-field cursor-pointer"
            >
              <option value="GLOBAL">Global</option>
              <option value="DESTINATION">Destination</option>
              <option value="OPERATOR">Operator</option>
              <option value="OPERATOR_DESTINATION">Operator + destination</option>
              <option value="PACKAGE">Single package</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-map-text font-body">Priority</span>
            <input name="priority" type="number" defaultValue={10} className="input-field tnum" />
          </label>
        </div>

        {(needsOperator || needsDestination || needsPackage) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {needsOperator && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold text-map-text font-body">Operator</span>
                <select name="operatorId" defaultValue="" className="input-field cursor-pointer">
                  <option value="" disabled>Choose…</option>
                  {operators.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </label>
            )}
            {needsDestination && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold text-map-text font-body">Destination</span>
                <select name="destinationId" defaultValue="" className="input-field cursor-pointer">
                  <option value="" disabled>Choose…</option>
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
            )}
            {needsPackage && (
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-[12.5px] font-semibold text-map-text font-body">Package</span>
                <select name="packageId" defaultValue="" className="input-field cursor-pointer">
                  <option value="" disabled>Choose…</option>
                  {packages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>
            )}
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-map-text font-body">Strategy</span>
          <select
            name="strategy" value={strategy}
            onChange={(e) => setStrategy(e.target.value as Strategy)}
            className="input-field cursor-pointer"
          >
            <option value="SPLIT_DISCOUNT">Split the operator discount</option>
            <option value="PERCENT">Percentage of cost</option>
            <option value="FLAT">Flat amount</option>
            <option value="MIN_OF_PERCENT_AND_FLAT">Min of percentage and cap</option>
            <option value="MANUAL_OVERRIDE">Manual price override</option>
          </select>
          <span className="text-[11.5px] text-map-muted font-body leading-snug">
            {STRATEGY_HELP[strategy]}
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {usesSplit && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-map-text font-body">
                Our share (bps)
              </span>
              <input name="splitBps" type="number" defaultValue={5000} className="input-field tnum" />
              <span className="text-[11.5px] text-map-muted font-body">5000 = half the discount</span>
            </label>
          )}
          {usesPercent && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-map-text font-body">
                Percent of cost (bps)
              </span>
              <input name="percentBps" type="number" defaultValue={2000} className="input-field tnum" />
              <span className="text-[11.5px] text-map-muted font-body">2000 = 20%</span>
            </label>
          )}
          {usesFlat && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-map-text font-body">
                {strategy === "MANUAL_OVERRIDE" ? "Customer price (₹)" : "Cap / amount (₹)"}
              </span>
              <input name="flatAmount" type="number" defaultValue={1500} className="input-field tnum" />
            </label>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-map-text font-body">
              Margin floor (₹)
            </span>
            <input name="minMargin" type="number" defaultValue={500} className="input-field tnum" />
            <span className="text-[11.5px] text-map-muted font-body">Below this, flag it</span>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-map-text font-body">Note</span>
          <input
            name="note" className="input-field"
            placeholder="Why this rule exists — future you will want to know."
          />
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="active" defaultChecked className="w-4 h-4 accent-[#FF5A5F] cursor-pointer" />
          <span className="text-[13px] text-map-text font-body">Active</span>
        </label>

        {state.error && (
          <p role="alert" className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 font-body">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="text-[12.5px] text-summit-green bg-summit-light rounded-xl px-3 py-2 font-body">
            {state.success}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary text-[13.5px] py-2 px-4 w-fit">
          <Save size={14} />
          {pending ? "Saving…" : "Save rule"}
        </button>
      </form>
    </Panel>
  );
}
