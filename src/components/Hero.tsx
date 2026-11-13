"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Split Studio opening diptych: the positioning statement holds the left seven
 * columns, the proof column holds the right four. Left-biased, height set by
 * its content — no full-viewport centring, no ambient 3D, no enrichment.
 */

const facts = [
  { key: "Registered", value: "Dublin, Ireland" },
  { key: "Delivery", value: "United Kingdom & Europe" },
  { key: "Practice", value: "Agentic systems, multimodal RAG, MLOps" },
  { key: "Sectors", value: "Energy · Water · Aviation · Retail data" },
];

export default function Hero() {
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const factsRef = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const targets = [ledeRef.current, ctaRef.current, factsRef.current];

    // One orchestrated entrance, opacity only, total stagger under 500ms.
    // The h1 is not in it: it paints at full contrast on the first frame, so
    // the headline never reads dim while JS loads (and LCP isn't held back).
    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(targets, {
      opacity: 1,
      duration: 0.42,
      ease: "power2.out",
      stagger: 0.11,
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section id="top" className="section section--hero">
      <div
        className="grid grid-cols-1 lg:grid-cols-12"
        style={{ gap: "var(--space-2xl)" }}
      >
        <div className="lg:col-span-7">
          <h1
            className="text-display"
            style={{ maxWidth: "18ch" }}
          >
            Agentic AI systems for critical infrastructure
          </h1>

          <p
            ref={ledeRef}
            className="text-muted text-md opacity-0"
            style={{ maxWidth: "58ch", marginBlockStart: "var(--space-xl)" }}
          >
            SwotLabs AGI Limited is an Ireland-based AI services company. We
            build the systems that read your documents and triage your work,
            then keep them running after the pilot ends.
          </p>

          <div
            ref={ctaRef}
            className="flex flex-wrap items-center opacity-0"
            style={{ gap: "var(--space-md)", marginBlockStart: "var(--space-xl)" }}
          >
            <a
              href="#work"
              className="whitespace-nowrap bg-accent text-accent-ink text-sm font-medium hover:bg-accent-light"
              style={{
                paddingInline: "var(--space-lg)",
                paddingBlock: "var(--space-sm)",
                borderRadius: "var(--radius-control)",
                transition: "background-color var(--dur-micro) var(--ease-out)",
              }}
            >
              Read the work
            </a>
            <a
              href="#services"
              className="whitespace-nowrap border border-rule text-ink text-sm hover:border-accent hover:text-accent"
              style={{
                paddingInline: "var(--space-lg)",
                paddingBlock: "var(--space-sm)",
                borderRadius: "var(--radius-control)",
                transition:
                  "border-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out)",
              }}
            >
              What we do
            </a>
          </div>
        </div>

        {/* Proof half of the diptych: facts, not decoration. */}
        <dl
          ref={factsRef}
          className="lg:col-span-4 lg:col-start-9 self-end opacity-0"
        >
          {facts.map((fact) => (
            <div
              key={fact.key}
              className="border-t border-rule"
              style={{
                paddingBlock: "var(--space-md)",
              }}
            >
              <dt className="label-meta">{fact.key}</dt>
              <dd
                className="text-ink text-sm"
                style={{ marginBlockStart: "var(--space-2xs)" }}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
