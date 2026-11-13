"use client";

import Link from "next/link";
import SectionHead from "./SectionHead";
import SystemFlow from "./SystemFlow";
import { useReveal } from "@/lib/useReveal";
import { getAllCaseStudies } from "@/lib/caseStudies";

/**
 * An index of shipped systems rather than a grid of equal cards. The lead entry
 * takes a wider, larger treatment; the rest are hairline rows with the spec in
 * a narrow right column. No pill chips inside bordered cards.
 */

const studies = getAllCaseStudies();

export default function CaseStudies() {
  const listRef = useReveal<HTMLDivElement>({ stagger: 80 });

  return (
    <section id="work" className="section section--opening">
      <SectionHead
        title="Systems in production"
        lede="Five engagements, anonymised by sector. Each one runs against a client's own documents, tickets and email."
      />

      <div
        ref={listRef}
        style={{ marginBlockStart: "var(--space-2xl)" }}
      >
        {studies.map((study, i) => {
          const isLead = i === 0;

          return (
            <Link
              key={study.slug}
              href={`/work/${study.slug}`}
              data-reveal-child
              className="reveal group grid grid-cols-1 lg:grid-cols-12 border-t border-rule"
              style={{
                gap: "var(--space-lg)",
                paddingBlock: isLead ? "var(--space-xl)" : "var(--space-lg)",
              }}
            >
              <div className={isLead ? "lg:col-span-8" : "lg:col-span-7"}>
                <h3
                  className={`${
                    isLead ? "text-lg md:text-xl" : "text-md md:text-lg"
                  } group-hover:text-accent`}
                  style={{ transition: "color var(--dur-micro) var(--ease-out)" }}
                >
                  {study.title}
                </h3>

                <p
                  className="text-muted text-sm"
                  style={{
                    maxWidth: isLead ? "68ch" : "62ch",
                    marginBlockStart: "var(--space-sm)",
                  }}
                >
                  {study.tagline}
                </p>

                <p
                  className="label-meta"
                  style={{ marginBlockStart: "var(--space-md)" }}
                >
                  {study.tags.join(" · ")}
                </p>

                <span
                  className="text-sm text-accent inline-block"
                  style={{ marginBlockStart: "var(--space-md)" }}
                >
                  Read case study
                </span>
              </div>

              <dl
                className={
                  isLead
                    ? "lg:col-span-3 lg:col-start-10"
                    : "lg:col-span-4 lg:col-start-9"
                }
              >
                <div>
                  <dt className="label-meta">Sector</dt>
                  <dd className="text-ink text-sm">{study.sector}</dd>
                </div>
                <div style={{ marginBlockStart: "var(--space-md)" }}>
                  <dt className="label-meta">System</dt>
                  <dd className="text-ink text-sm">{study.category}</dd>
                </div>

                {study.metrics?.length ? (
                  <div style={{ marginBlockStart: "var(--space-md)" }}>
                    <dt className="label-meta">Detail</dt>
                    <dd className="text-muted text-sm numeric">
                      {study.metrics
                        .map((m) => `${m.label}: ${m.value}`)
                        .join(" · ")}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {/* Index rows stay short on phones; the detail page always
                  shows the full flow. */}
              <SystemFlow
                steps={study.flow}
                className="hidden lg:block lg:col-span-12"
              />
            </Link>
          );
        })}
        <div className="border-t border-rule" />
      </div>
    </section>
  );
}
