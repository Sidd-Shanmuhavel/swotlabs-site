"use client";

import { useState } from "react";
import SectionHead from "./SectionHead";
import { useReveal } from "@/lib/useReveal";

/**
 * Closing diptych: how to reach us on the left, the form on the right.
 *
 * Labels are visible rather than floating, focus rings are the global ring
 * (nothing calls outline-none), and success is stated in place — no pulsing
 * checkmark, no celebratory toast for a thing the user can already see.
 */

const interestOptions = [
  { id: "consulting", label: "Strategy & consulting" },
  { id: "engineering", label: "ML engineering" },
  { id: "generative", label: "Generative AI" },
  { id: "safety", label: "AI safety / EU AI Act" },
] as const;

type Interest = (typeof interestOptions)[number]["id"];

const industries = [
  "Energy & Utilities",
  "Aviation & Aerospace",
  "Automotive",
  "Banking & Financial Services",
  "Insurance",
  "Healthcare & Life Sciences",
  "Pharmaceuticals & Biotech",
  "Retail & E-commerce",
  "Consumer Goods (FMCG)",
  "Hospitality & Travel",
  "Telecommunications",
  "Media & Entertainment",
  "Technology & Software",
  "Manufacturing & Industrial",
  "Logistics & Supply Chain",
  "Construction & Real Estate",
  "Agriculture & Food",
  "Mining & Metals",
  "Oil & Gas",
  "Public Sector & Government",
  "Education",
  "Legal & Professional Services",
  "Marketing & Advertising",
  "Non-Profit & NGO",
  "Other",
] as const;

const reach = [
  { key: "Email", value: "hello@swotlabs.com", href: "mailto:hello@swotlabs.com" },
  { key: "Based", value: "Dublin, Ireland" },
  { key: "Working", value: "United Kingdom & Europe" },
];

const fieldClass =
  "w-full text-ink text-sm bg-paper-2 border border-rule focus:border-accent";

const fieldStyle: React.CSSProperties = {
  paddingInline: "var(--space-md)",
  paddingBlock: "var(--space-sm)",
  borderRadius: "var(--radius-control)",
  transition: "border-color var(--dur-micro) var(--ease-out)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBlockEnd: "var(--space-2xs)",
};

export default function Contact() {
  const contentRef = useReveal<HTMLDivElement>();
  const [formState, setFormState] = useState<{
    name: string;
    email: string;
    company: string;
    industry: string;
    interest: Interest;
    message: string;
  }>({
    name: "",
    email: "",
    company: "",
    industry: "",
    interest: "consulting",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section section--close">
      <div
        ref={contentRef}
        className="reveal grid grid-cols-1 lg:grid-cols-12"
        style={{ gap: "var(--space-2xl)" }}
      >
        <div className="lg:col-span-4">
          <SectionHead
            title="Tell us what the system needs to do"
            lede="A paragraph about the problem is enough to start. We will reply with what we would try first."
          />

          <dl style={{ marginBlockStart: "var(--space-xl)" }}>
            {reach.map((row) => (
              <div
                key={row.key}
                className="border-t border-rule"
                style={{ paddingBlock: "var(--space-md)" }}
              >
                <dt className="label-meta">{row.key}</dt>
                <dd
                  className="text-ink text-sm"
                  style={{ marginBlockStart: "var(--space-2xs)" }}
                >
                  {row.href ? (
                    <a
                      href={row.href}
                      className="hover:text-accent"
                      style={{
                        transition: "color var(--dur-micro) var(--ease-out)",
                      }}
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          {isSubmitted ? (
            <div
              className="border border-rule"
              style={{
                borderRadius: "var(--radius-panel)",
                padding: "var(--space-xl)",
              }}
            >
              <h3 className="text-md">Message sent</h3>
              <p
                className="text-muted text-sm"
                style={{ maxWidth: "52ch", marginBlockStart: "var(--space-sm)" }}
              >
                It reached the team inbox. A person reads everything that lands
                there and will reply to you directly.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="border border-rule text-ink text-sm hover:border-accent hover:text-accent cursor-pointer"
                style={{
                  marginBlockStart: "var(--space-lg)",
                  paddingInline: "var(--space-md)",
                  paddingBlock: "var(--space-xs)",
                  borderRadius: "var(--radius-control)",
                  transition:
                    "border-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out)",
                }}
              >
                Send another
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2"
              style={{ gap: "var(--space-lg)" }}
            >
              <div>
                <label htmlFor="name" className="label-meta" style={labelStyle}>
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>

              <div>
                <label htmlFor="email" className="label-meta" style={labelStyle}>
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState({ ...formState, email: e.target.value })
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="label-meta"
                  style={labelStyle}
                >
                  Organisation
                </label>
                <input
                  id="company"
                  type="text"
                  autoComplete="organization"
                  value={formState.company}
                  onChange={(e) =>
                    setFormState({ ...formState, company: e.target.value })
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="industry"
                  className="label-meta"
                  style={labelStyle}
                >
                  Sector
                </label>
                <select
                  id="industry"
                  required
                  value={formState.industry}
                  onChange={(e) =>
                    setFormState({ ...formState, industry: e.target.value })
                  }
                  className={`${fieldClass} cursor-pointer`}
                  style={fieldStyle}
                >
                  <option value="" disabled>
                    Select a sector
                  </option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="sm:col-span-2">
                <legend className="label-meta" style={labelStyle}>
                  What it concerns
                </legend>
                <div
                  className="flex flex-wrap"
                  style={{ gap: "var(--space-xs)" }}
                >
                  {interestOptions.map((opt) => {
                    const selected = formState.interest === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`chip text-sm cursor-pointer border ${
                          selected
                            ? "border-accent text-accent"
                            : "border-rule text-muted hover:text-ink"
                        }`}
                        style={{
                          paddingInline: "var(--space-md)",
                          paddingBlock: "var(--space-xs)",
                          borderRadius: "var(--radius-control)",
                          transition:
                            "border-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out)",
                        }}
                      >
                        <input
                          type="radio"
                          name="interest"
                          value={opt.id}
                          checked={selected}
                          onChange={() =>
                            setFormState({ ...formState, interest: opt.id })
                          }
                          // Zero-sized but left in normal flow: an absolutely
                          // positioned radio makes the page jump on click.
                          style={{
                            width: 0,
                            height: 0,
                            opacity: 0,
                            margin: 0,
                            padding: 0,
                            border: 0,
                            appearance: "none",
                          }}
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="label-meta"
                  style={labelStyle}
                >
                  The problem
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={(e) =>
                    setFormState({ ...formState, message: e.target.value })
                  }
                  className={`${fieldClass} resize-none`}
                  style={fieldStyle}
                />
              </div>

              {/* The message slot is always present: an error appearing must not
                  push the submit button down the page. */}
              <p
                role="alert"
                aria-live="polite"
                className="sm:col-span-2 text-sm"
                style={{
                  minHeight: "1lh",
                  color: error ? "var(--color-danger)" : undefined,
                }}
              >
                {error}
              </p>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="whitespace-nowrap bg-accent text-accent-ink text-sm font-medium hover:bg-accent-light cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    paddingInline: "var(--space-lg)",
                    paddingBlock: "var(--space-sm)",
                    borderRadius: "var(--radius-control)",
                    transition: "background-color var(--dur-micro) var(--ease-out)",
                  }}
                >
                  {isSubmitting ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
