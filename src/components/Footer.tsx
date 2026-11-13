/**
 * Ft5 · Statement. One closing line carries the footer; the wordmark, index and
 * registration sit beneath it in small type.
 *
 * The previous footer shipped three social links pointing at `#`. Dead links
 * read as unfinished, so they are out until there are real URLs to use.
 */

const index = [
  { label: "Services", href: "#services" },
  { label: "Clients", href: "#clients" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Questions", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer
      className="border-t border-rule"
      style={{
        paddingInline: "var(--page-gutter)",
        paddingBlock: "var(--space-3xl) var(--space-xl)",
      }}
    >
      <p
        className="display-line text-2xl md:text-3xl"
        style={{ maxWidth: "26ch" }}
      >
        Bring us the problem with too many documents.
      </p>

      <nav
        aria-label="Footer"
        className="flex flex-wrap"
        style={{ gap: "var(--space-lg)", marginBlockStart: "var(--space-2xl)" }}
      >
        {index.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-muted text-sm hover:text-accent"
            style={{ transition: "color var(--dur-micro) var(--ease-out)" }}
          >
            {item.label}
          </a>
        ))}
        <a
          href="mailto:hello@swotlabs.com"
          className="text-muted text-sm hover:text-accent"
          style={{ transition: "color var(--dur-micro) var(--ease-out)" }}
        >
          hello@swotlabs.com
        </a>
      </nav>

      <div
        className="flex flex-wrap items-baseline justify-between border-t border-rule"
        style={{
          gap: "var(--space-md)",
          marginBlockStart: "var(--space-xl)",
          paddingBlockStart: "var(--space-md)",
        }}
      >
        <span className="font-display font-bold tracking-tight text-sm">
          <span className="text-accent">swot</span>labs
        </span>
        <span className="label-meta">
          © {new Date().getFullYear()} SwotLabs AGI Limited · Registered in
          Ireland
        </span>
      </div>
    </footer>
  );
}
