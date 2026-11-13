"use client";

import SectionHead from "./SectionHead";
import { useReveal } from "@/lib/useReveal";

/**
 * Prose on the left, a company spec table as the proof half on the right.
 *
 * The previous version ran a four-up counter strip — "50+ AI projects",
 * "98% client retention" — none of which came from a source. Fabricated proof
 * reads as generated, so the numbers are gone rather than rounded. Give us real
 * figures and this section takes a stat strip again.
 */

const record = [
  { key: "Entity", value: "SwotLabs AGI Limited, a private limited company" },
  { key: "Registered", value: "Ireland" },
  { key: "Delivery", value: "United Kingdom & Europe" },
  { key: "Team", value: "AI researchers, engineers and strategists" },
  {
    key: "Sectors",
    value: "Energy, water, aviation, hospitality, data infrastructure",
  },
  { key: "Governance", value: "Built to the EU AI Act and international standards" },
];

export default function About() {
  const proseRef = useReveal<HTMLDivElement>({ stagger: 110 });
  const recordRef = useReveal<HTMLDListElement>({ stagger: 60 });

  return (
    <section id="about" className="section section--continues">
      <div
        className="grid grid-cols-1 lg:grid-cols-12"
        style={{ gap: "var(--space-2xl)" }}
      >
        <div className="lg:col-span-6">
          <SectionHead title="Incorporated in Ireland" />

          <div ref={proseRef} style={{ marginBlockStart: "var(--space-lg)" }}>
            <p
              data-reveal-child
              className="reveal text-muted text-base"
              style={{ maxWidth: "58ch" }}
            >
              We are an AI services company incorporated in Ireland. Our clients
              run infrastructure other people depend on: the networks that
              deliver power and water, and the airlines that move passengers.
            </p>
            <p
              data-reveal-child
              className="reveal text-muted text-base"
              style={{ maxWidth: "58ch", marginBlockStart: "var(--space-md)" }}
            >
              The work is specific: read the drawing, cite the clause, keep the
              pipeline running after the pilot ends. We assume stronger models
              keep arriving, so we build architecture a new model drops into.
            </p>
          </div>
        </div>

        <dl ref={recordRef} className="lg:col-span-5 lg:col-start-8">
          {record.map((row) => (
            <div
              key={row.key}
              data-reveal-child
              className="reveal border-t border-rule grid grid-cols-1 sm:grid-cols-3"
              style={{
                gap: "var(--space-sm)",
                paddingBlock: "var(--space-md)",
              }}
            >
              <dt className="label-meta sm:col-span-1">{row.key}</dt>
              <dd className="text-ink text-sm sm:col-span-2">{row.value}</dd>
            </div>
          ))}
          <div className="border-t border-rule" />
        </dl>
      </div>
    </section>
  );
}
