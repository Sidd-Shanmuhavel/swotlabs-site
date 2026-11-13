"use client";

import SectionHead from "./SectionHead";
import { useReveal } from "@/lib/useReveal";

/**
 * Split Studio diptych — statement on the left four columns, the practice list
 * as the proof half on the right seven. No ordinal eyebrows: these are a menu
 * of practices, not steps in a sequence.
 */

const services = [
  {
    title: "AI strategy & consulting",
    description:
      "We pick the use cases and write the roadmap with the people who will run the system once we hand it over.",
    capabilities: "Strategy · Roadmapping · ROI analysis",
  },
  {
    title: "Machine learning engineering",
    description:
      "We train and deploy models for language, vision and forecasting problems, on your data rather than a benchmark.",
    capabilities: "NLP · Computer vision · Predictive models",
  },
  {
    title: "Generative AI systems",
    description:
      "Retrieval pipelines, agent orchestration and multimodal assistants that hold up once real users reach them.",
    capabilities: "LLMs · RAG · Agents · MCP",
  },
  {
    title: "Data engineering & MLOps",
    description:
      "The pipelines, evaluation harnesses and monitoring that keep a model working through the year after launch.",
    capabilities: "Pipelines · MLOps · Monitoring",
  },
  {
    title: "AI safety & governance",
    description:
      "We audit for bias, instrument explainability, track model lineage and write the documentation the EU AI Act asks for.",
    capabilities: "Governance · Evaluation · Compliance",
  },
];

export default function Services() {
  const listRef = useReveal<HTMLDivElement>({ stagger: 70 });

  return (
    <section id="services" className="section section--continues">
      <div
        className="grid grid-cols-1 lg:grid-cols-12"
        style={{ gap: "var(--space-2xl)" }}
      >
        <SectionHead
          className="lg:col-span-4"
          title="The five practices"
          lede="From the first roadmap to the monitoring that runs a year after launch."
        />

        <div ref={listRef} className="lg:col-span-7 lg:col-start-6">
          {services.map((service, i) => (
            <article
              key={service.title}
              data-reveal-child
              className="reveal group border-t border-rule"
              style={{
                paddingBlock: i === 0 ? "var(--space-lg)" : "var(--space-xl)",
              }}
            >
              <h3
                className="text-md md:text-lg group-hover:text-accent"
                style={{ transition: "color var(--dur-micro) var(--ease-out)" }}
              >
                {service.title}
              </h3>
              <p
                className="text-muted text-sm"
                style={{
                  maxWidth: "62ch",
                  marginBlockStart: "var(--space-sm)",
                }}
              >
                {service.description}
              </p>
              <p
                className="label-meta"
                style={{ marginBlockStart: "var(--space-md)" }}
              >
                {service.capabilities}
              </p>
            </article>
          ))}
          <div className="border-t border-rule" />
        </div>
      </div>
    </section>
  );
}
