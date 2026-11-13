"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme, ThemeColor, themeOptions } from "@/providers/ThemeProvider";

/**
 * N9 · Edge-aligned minimal. Wordmark hard-left, one action hard-right, nothing
 * in between — the empty middle is the design. Section navigation lives behind
 * a disclosure instead of an inline link row, which is the AI-nav fingerprint.
 */

const sections = [
  { label: "Services", href: "#services" },
  { label: "Clients", href: "#clients" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Questions", href: "#faq" },
];

const themeLabels: Record<ThemeColor, string> = {
  lime: "Lime",
  cyan: "Cyan",
  orange: "Orange",
  blue: "Blue",
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll and allow Escape to close while the index is open.
  useEffect(() => {
    if (!menuOpen) return;

    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 w-full ${
        scrolled ? "bg-paper/95 border-b border-rule" : "bg-transparent"
      }`}
      style={{
        zIndex: "var(--z-sticky-nav)",
        transition: "background-color var(--dur-short) var(--ease-out)",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          paddingInline: "var(--page-gutter)",
          paddingBlock: "var(--space-md)",
        }}
      >
        <a
          href="#top"
          className="font-display text-md font-bold tracking-tight"
          aria-label="SwotLabs home"
        >
          <span className="text-accent">swot</span>labs
        </a>

        <div className="flex items-center" style={{ gap: "var(--space-lg)" }}>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-sm text-muted hover:text-ink cursor-pointer"
            style={{ transition: "color var(--dur-micro) var(--ease-out)" }}
            aria-expanded={menuOpen}
            aria-controls="site-index"
          >
            Menu
          </button>

          <a
            href="#contact"
            className="whitespace-nowrap border border-accent text-accent text-sm hover:bg-accent hover:text-accent-ink"
            style={{
              paddingInline: "var(--space-md)",
              paddingBlock: "var(--space-xs)",
              borderRadius: "var(--radius-control)",
              transition:
                "background-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out)",
            }}
          >
            Talk to us
          </a>
        </div>
      </div>

      {/* Index overlay — the section list and the accent anchor live here. */}
      <div
        id="site-index"
        inert={!menuOpen}
        aria-hidden={!menuOpen}
        className={`fixed inset-0 bg-paper flex flex-col justify-center ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          zIndex: "var(--z-modal)",
          paddingInline: "var(--page-gutter)",
          transition: "opacity var(--dur-short) var(--ease-out)",
        }}
      >
        <button
          ref={closeRef}
          onClick={() => setMenuOpen(false)}
          className="text-sm text-muted hover:text-ink absolute cursor-pointer"
          style={{
            top: "var(--space-lg)",
            right: "var(--page-gutter)",
            transition: "color var(--dur-micro) var(--ease-out)",
          }}
        >
          Close
        </button>

        <nav
          className="flex flex-col"
          style={{ gap: "var(--space-sm)" }}
          aria-label="Sections"
        >
          {sections.map((section, i) => (
            <a
              key={section.label}
              href={section.href}
              onClick={() => setMenuOpen(false)}
              className="font-display text-2xl font-bold tracking-tight hover:text-accent w-fit"
              style={{ transition: "color var(--dur-micro) var(--ease-out)" }}
            >
              <span className="label-meta align-super numeric" style={{ marginRight: "var(--space-sm)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {section.label}
            </a>
          ))}
        </nav>

        <div
          className="flex items-center flex-wrap"
          style={{ gap: "var(--space-md)", marginTop: "var(--space-2xl)" }}
          role="group"
          aria-label="Accent anchor"
        >
          <span className="label-meta">Accent</span>
          {(Object.keys(themeOptions) as ThemeColor[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              aria-label={`${themeLabels[t]} accent`}
              aria-pressed={theme === t}
              className="cursor-pointer"
              style={{
                width: "1.25rem",
                height: "1.25rem",
                borderRadius: "var(--radius-control)",
                backgroundColor: themeOptions[t].accent,
                opacity: theme === t ? 1 : 0.45,
                transition: "opacity var(--dur-micro) var(--ease-out)",
              }}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
