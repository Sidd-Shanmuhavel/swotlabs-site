/**
 * Section head: display heading, optional lede, stacked in one column.
 *
 * No eyebrow. Eyebrows are off by default in design.md — a mono label is only
 * allowed where the content is genuinely ordinal or tabular, and the tag-left /
 * heading-right two-column head is banned outright.
 */
export default function SectionHead({
  title,
  lede,
  className = "",
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-2xl md:text-3xl">{title}</h2>
      {lede ? (
        <p
          className="text-muted text-base"
          style={{ maxWidth: "56ch", marginBlockStart: "var(--space-md)" }}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}
