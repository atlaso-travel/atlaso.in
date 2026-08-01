import { cn } from "@/lib/utils";
import type { ComparisonRow } from "@/server/comparePages";

/**
 * A real semantic <table> with <caption>, scoped <th> and a proper header row.
 *
 * This is the point of the whole page. RAG pipelines and AI crawlers reliably
 * parse table markup into rows and columns; a CSS grid of divs, however
 * identical it looks, arrives as a flat run of text with no association between
 * a label and its two values. The visual treatment is unchanged from the rest of
 * the site — only the underlying element is different.
 *
 * The winning cell is marked with a text symbol as well as colour, so the
 * signal survives both plain-text extraction and colour-blind readers.
 */
export default function ComparisonTable({
  caption,
  columnA,
  columnB,
  rows,
}: {
  caption: string;
  columnA: string;
  columnB: string;
  rows: ComparisonRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-map-border bg-map-card">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-map-border bg-map-white">
            <th scope="col" className="label-util px-4 py-3 w-[34%]">
              Criterion
            </th>
            <th
              scope="col"
              className="px-4 py-3 font-display font-bold text-[13.5px] text-map-text"
            >
              {columnA}
            </th>
            <th
              scope="col"
              className="px-4 py-3 font-display font-bold text-[13.5px] text-map-text"
            >
              {columnB}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-map-border last:border-0">
              <th
                scope="row"
                className="px-4 py-3 text-[12.5px] font-medium text-map-muted font-body align-top"
              >
                {row.label}
              </th>
              <Cell value={row.a} winner={row.better === "a"} />
              <Cell value={row.b} winner={row.better === "b"} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ value, winner }: { value: string; winner: boolean }) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-[13px] font-body align-top tnum",
        winner ? "text-map-text font-bold bg-summit-light" : "text-map-muted"
      )}
    >
      {value}
      {winner && (
        <span className="text-summit-green font-bold ml-1.5" aria-label="better on this criterion">
          ✓
        </span>
      )}
    </td>
  );
}
