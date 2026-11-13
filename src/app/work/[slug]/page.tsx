import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import SystemFlow from "@/components/SystemFlow";
import { getAllCaseStudies, getCaseStudyBySlug } from "@/lib/caseStudies";
import {
  loadCaseStudyMarkdown,
  extractClientFacingMarkdown,
  renderMarkdown,
} from "@/lib/markdown";

/* Hallmark · genre: modern-minimal · macrostructure: Long Document ·
 * design-system: design.md · designed-as-app · footer: Ft5 · enrichment: none
 *
 * Content-page family: one measure of prose, a spec table for the record, no
 * marketing furniture. The metrics sit in a definition list rather than a
 * three-up counter grid — they are qualitative descriptors, not performance
 * claims, and presenting them as big accent numerals overstated them.
 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllCaseStudies().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return { title: "Case Study Not Found" };

  const title = `${study.title} | SwotLabs Case Study`;
  return {
    title,
    description: study.tagline,
    openGraph: { title, description: study.tagline, type: "article" },
    twitter: { card: "summary_large_image", title, description: study.tagline },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  const raw = await loadCaseStudyMarkdown(study.file);
  const body = extractClientFacingMarkdown(raw);

  const measure = { maxWidth: "68ch", marginInline: "auto" } as const;

  return (
    <main className="min-h-screen flex flex-col">
      <article
        className="flex-1"
        style={{
          paddingInline: "var(--page-gutter)",
          paddingBlock: "var(--space-4xl) var(--space-3xl)",
        }}
      >
        <div style={measure}>
          <Link
            href="/#work"
            className="text-sm text-muted hover:text-accent"
            style={{ transition: "color var(--dur-micro) var(--ease-out)" }}
          >
            ← All work
          </Link>
        </div>

        <header style={{ ...measure, marginBlockStart: "var(--space-xl)" }}>
          <p className="label-meta">
            {study.sector} · {study.category}
          </p>

          <h1
            className="text-2xl md:text-3xl"
            style={{ marginBlockStart: "var(--space-md)" }}
          >
            {study.title}
          </h1>

          <p
            className="text-muted text-md"
            style={{ marginBlockStart: "var(--space-md)" }}
          >
            {study.tagline}
          </p>

          <p
            className="label-meta"
            style={{ marginBlockStart: "var(--space-lg)" }}
          >
            {study.tags.join(" · ")}
          </p>

          {study.metrics?.length ? (
            <dl
              className="grid grid-cols-1 sm:grid-cols-3 border-t border-rule"
              style={{
                gap: "var(--space-lg)",
                marginBlockStart: "var(--space-xl)",
                paddingBlockStart: "var(--space-lg)",
              }}
            >
              {study.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="label-meta">{m.label}</dt>
                  <dd
                    className="text-ink text-md numeric"
                    style={{ marginBlockStart: "var(--space-2xs)" }}
                  >
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </header>

        {/* Wider than the prose measure so five stages fit side by side. */}
        <div
          style={{
            maxWidth: "72rem",
            marginInline: "auto",
            marginBlockStart: "var(--space-2xl)",
          }}
        >
          <SystemFlow steps={study.flow} />
        </div>

        <div style={{ ...measure, marginBlockStart: "var(--space-2xl)" }}>
          {renderMarkdown(body)}
        </div>

        <div
          className="border-t border-rule"
          style={{
            ...measure,
            marginBlockStart: "var(--space-3xl)",
            paddingBlockStart: "var(--space-xl)",
          }}
        >
          <h2 className="text-lg md:text-xl">A similar problem?</h2>
          <p
            className="text-muted text-base"
            style={{ maxWidth: "56ch", marginBlockStart: "var(--space-sm)" }}
          >
            Describe what the system would need to read or decide, and we will
            reply with the approach we would try first.
          </p>
          <Link
            href="/#contact"
            className="inline-block whitespace-nowrap bg-accent text-accent-ink text-sm font-medium hover:bg-accent-light"
            style={{
              marginBlockStart: "var(--space-lg)",
              paddingInline: "var(--space-lg)",
              paddingBlock: "var(--space-sm)",
              borderRadius: "var(--radius-control)",
              transition: "background-color var(--dur-micro) var(--ease-out)",
            }}
          >
            Start a conversation
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
