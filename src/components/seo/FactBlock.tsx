/**
 * A block of plainly-stated facts, sized to be lifted verbatim by an answer
 * engine.
 *
 * Deliberately a <section> of real prose with a heading — not a stat grid of
 * bare numbers in divs. A model extracting "how much do Spiti packages cost"
 * needs a sentence with the subject, the number and the unit in it; a tile
 * reading "₹9,099" next to a label reading "from" loses the subject the moment
 * it leaves the page.
 *
 * Visually understated on purpose. It is real content for readers, not a
 * keyword box, and it sits inline with the rest of the page.
 */
export default function FactBlock({
  heading,
  fact,
  supporting = [],
  updatedNote,
}: {
  heading: string;
  fact: string;
  supporting?: string[];
  updatedNote?: string;
}) {
  return (
    <section
      aria-label={heading}
      className="rounded-2xl border border-map-border bg-map-card px-5 py-4 sm:px-6 sm:py-5"
    >
      <h2 className="font-display font-bold text-[15px] text-map-text">{heading}</h2>

      <p className="text-[14.5px] text-map-text font-body leading-relaxed mt-2">{fact}</p>

      {supporting.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {supporting.map((line) => (
            <li
              key={line}
              className="text-[13.5px] text-map-muted font-body leading-relaxed pl-4 relative"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-[0.55em] w-1.5 h-1.5 rounded-full bg-map-border"
              />
              {line}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11.5px] text-map-muted font-body mt-3">
        {updatedNote ?? "Figures are calculated from currently listed packages and change as operators update their pricing."}
      </p>
    </section>
  );
}
