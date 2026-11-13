"use client";

import { useState } from "react";
import SectionHead from "./SectionHead";
import { useReveal } from "@/lib/useReveal";

/**
 * Questions on the left, statement on the right — the diptych flips again.
 * Answers are written to answer, not to sell.
 */

const faqs = [
  {
    question: "What do you build?",
    answer:
      "Agentic systems with one job each. A field assistant that answers from engineering drawings. An email triage agent that opens populated CRM cases. A policy assistant that cites the document it read. We build the plumbing underneath them too: retrieval pipelines, evaluation harnesses and the monitoring that catches a model drifting.",
  },
  {
    question: "How do you handle AI safety and compliance?",
    answer:
      "We audit for bias, instrument explainability, track model lineage and write the risk documentation the EU AI Act asks for. We test a classifier against a labelled set before it ships and keep measuring its accuracy in production. When a system has no source for an answer, it says so.",
  },
  {
    question: "Which sectors do you know well?",
    answer:
      "Energy distribution, water, aviation, hospitality, social housing and consumer-data platforms. Our client index names them: UK Power Networks, Northumbrian Water, Virgin Atlantic, Greene King, Civitas, CK Delta and Circana.",
  },
  {
    question: "Do we need a data platform before we start?",
    answer:
      "No. Most of our work lands on Databricks, because that is where these clients already keep their documents and tables. With nothing in place, a first engagement covers one narrow use case and the pipeline it needs.",
  },
  {
    question: "Why does AGI appear in your name?",
    answer:
      "Model capability keeps moving, and we design for that. The architecture around a model, its tool interfaces, evaluation and human review points, survives a model swap, so a stronger release is a substitution instead of a rebuild. The name is a statement about architecture, and it says nothing about timelines.",
  },
];

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useReveal<HTMLDivElement>({ stagger: 60 });

  return (
    <section id="faq" className="section section--continues">
      <div
        className="grid grid-cols-1 lg:grid-cols-12"
        style={{ gap: "var(--space-2xl)" }}
      >
        <SectionHead
          className="lg:col-span-4 lg:col-start-9 lg:row-start-1"
          title="Questions we get asked"
          lede="Email us anything this does not cover and we will answer it."
        />

        <div
          ref={listRef}
          className="lg:col-span-7 lg:col-start-1 lg:row-start-1"
        >
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div
                key={faq.question}
                data-reveal-child
                className="reveal border-t border-rule"
              >
                <h3>
                  <button
                    id={buttonId}
                    onClick={() => setActiveIndex(isOpen ? null : index)}
                    className="w-full flex items-baseline justify-between text-left group cursor-pointer text-md font-bold tracking-tight"
                    style={{
                      gap: "var(--space-md)",
                      paddingBlock: "var(--space-lg)",
                      fontFamily: "var(--font-display)",
                    }}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span
                      className="group-hover:text-accent"
                      style={{
                        transition: "color var(--dur-micro) var(--ease-out)",
                      }}
                    >
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`text-sm shrink-0 font-normal ${
                        isOpen ? "text-accent" : "text-muted"
                      }`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {isOpen ? "Close" : "Open"}
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="grid"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transition:
                      "grid-template-rows var(--dur-long) var(--ease-in-out)",
                  }}
                >
                  <div className="overflow-hidden">
                    <p
                      className="text-muted text-sm"
                      style={{
                        maxWidth: "68ch",
                        paddingBlockEnd: "var(--space-lg)",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="border-t border-rule" />
        </div>
      </div>
    </section>
  );
}
