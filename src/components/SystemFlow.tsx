import type { FlowStep } from "@/lib/caseStudies";

/**
 * The case-study visual: the system drawn as its stages, input to output.
 * Built from the write-up rather than a screenshot, so nothing client-side
 * (UI, data, branding) leaks onto an anonymised page. Horizontal from lg up,
 * a vertical run on narrow screens. The output stage carries the accent.
 */
export default function SystemFlow({
  steps,
  className = "",
}: {
  steps: FlowStep[];
  className?: string;
}) {
  return (
    <figure className={`system-flow ${className}`}>
      <figcaption className="label-meta">How it runs</figcaption>
      <ol
        className="system-flow__steps"
        style={{ "--flow-steps": steps.length } as React.CSSProperties}
      >
        {steps.map((step, i) => (
          <li key={step.label} className="system-flow__step">
            <span className="system-flow__num numeric">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="system-flow__label">{step.label}</span>
            {step.parallel ? (
              <ul className="system-flow__branches" aria-label="In parallel">
                {step.parallel.map((branch) => (
                  <li key={branch}>{branch}</li>
                ))}
              </ul>
            ) : step.note ? (
              <span className="system-flow__note">{step.note}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}
