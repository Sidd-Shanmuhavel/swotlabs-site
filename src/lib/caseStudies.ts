export type CaseStudyMetric = { label: string; value: string };

/**
 * One stage of the system diagram. `parallel` lists branches that run side by
 * side inside the stage. Taken from the "How it works" part of each write-up;
 * names tools, never the client.
 */
export type FlowStep = { label: string; note?: string; parallel?: string[] };

export type CaseStudy = {
  slug: string;
  /** Anonymised sector label shown in place of the client name. */
  sector: string;
  title: string;
  /** Headline classification of the system. */
  category: string;
  /** One-line summary shown on cards and the detail header. */
  tagline: string;
  /** Capability chips. */
  tags: string[];
  metrics?: CaseStudyMetric[];
  /** How the system runs, input to output, drawn as the case-study visual. */
  flow: FlowStep[];
  /** Markdown filename in public/projects-case_studies. */
  file: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "field-service-agent",
    sector: "Water & Utilities",
    title: "Field Service Agent",
    category: "Multimodal RAG Agent",
    tagline:
      "Field engineers ask in plain language, or send a photo of the equipment, and get an answer cited back to the drawing or procedure it came from.",
    tags: ["Multimodal", "Vision", "Multi-Agent", "LangGraph", "RAG", "Databricks"],
    metrics: [
      { value: "Photo", label: "Visual query input" },
      { value: "ISO 19650", label: "Document standard" },
      { value: "Cited", label: "Source-backed answers" },
    ],
    flow: [
      { label: "Drawings & procedures", note: "Cloud storage, synced" },
      { label: "Vision parsing", note: "Images, tables, chunk titles" },
      { label: "Hybrid index", parallel: ["Semantic", "Keyword"] },
      { label: "Agent retrieval", note: "Text + photo query" },
      { label: "Graded answer", note: "Cited to the drawing" },
    ],
    file: "fsa_databricks_and_ui.md",
  },
  {
    slug: "virtual-customer-agent",
    sector: "Energy & Power Networks",
    title: "Virtual Customer Agent",
    category: "Email Triage & Automation Agent",
    tagline:
      "Takes the front line of a grid operator's connections team: it classifies inbound email, reads the attached application forms, and opens a populated CRM case.",
    tags: ["Multimodal", "Extraction", "CRM Automation", "Self-improving", "Databricks"],
    metrics: [
      { value: "4", label: "Email classes triaged" },
      { value: "Auto", label: "CRM case creation" },
      { value: "Vision", label: "Form extraction" },
    ],
    flow: [
      { label: "Outlook mailbox", note: "Graph API, scheduled" },
      { label: "Classify", parallel: ["Rules", "Model"] },
      { label: "Read forms", parallel: ["Text", "Form fields", "Vision"] },
      { label: "Match account", note: "Address similarity" },
      { label: "Salesforce case", note: "Fields filled, email attached" },
    ],
    file: "virtual_customer_agent.md",
  },
  {
    slug: "policy-assistant",
    sector: "Hospitality & Brewing",
    title: "Conversational Policy Assistant",
    category: "Conversational RAG Assistant",
    tagline:
      "Answers staff policy questions from the organisation's own documents, cites the passage it used, and says so when no document covers the question.",
    tags: ["RAG", "Conversational", "Citations", "Document Sync", "Databricks"],
    metrics: [
      { value: "Daily", label: "Auto doc sync" },
      { value: "Cited", label: "Every answer" },
      { value: "Evaluated", label: "Before release" },
    ],
    flow: [
      { label: "SharePoint", note: "Daily delta sync" },
      { label: "Chunk & title", note: "Questions each chunk answers" },
      { label: "Vector index" },
      { label: "Rewrite & grade", note: "Off-topic chunks dropped" },
      { label: "Cited answer", note: "Or “not covered”" },
    ],
    file: "gk_policy_chatbot.md",
  },
  {
    slug: "safety-classifier",
    sector: "Aviation",
    title: "Safety & Security Classifier",
    category: "Classification Pipeline Agent",
    tagline:
      "Reads safety and security incident reports, categorises them, scores risk from 1 to 5, and writes the summary back onto the original ticket for the analyst who opens it.",
    tags: ["Classification", "Risk Scoring", "Deterministic", "Evaluation", "Databricks"],
    metrics: [
      { value: "1–5", label: "Risk severity scale" },
      { value: "4", label: "Operational categories" },
      { value: "Audited", label: "Accuracy tracked" },
    ],
    flow: [
      { label: "Incident reports", note: "Ingested incrementally" },
      { label: "Base table", note: "Quality-checked" },
      { label: "Classify", parallel: ["Category", "Risk 1–5", "Summary"] },
      { label: "Merge & score", note: "Accuracy vs analyst" },
      { label: "Back on the ticket" },
    ],
    file: "safety_security_classifier.md",
  },
  {
    slug: "lease-extraction",
    sector: "Real Estate & Property",
    title: "Lease Extraction & Rent Review Platform",
    category: "Document Extraction Agent",
    tagline:
      "Reads commercial property leases, extracts the rent-review mechanism, writes a calculation recipe it tests against mock data, and produces revised rents across a portfolio.",
    tags: ["Multi-Agent", "Document AI", "LangGraph", "Self-testing", "LLM"],
    metrics: [
      { value: "Per-lease", label: "Generated formulas" },
      { value: "Audited", label: "Traceable to clause" },
      { value: "Sandboxed", label: "Self-tested recipes" },
    ],
    flow: [
      { label: "OCR'd leases", note: "Chunked, titled, indexed" },
      { label: "Extract terms", parallel: ["Dates", "Rent", "Review"] },
      { label: "Write formula", note: "One recipe per lease" },
      { label: "Sandbox test", note: "Mock data, refine" },
      { label: "Rent by year", note: "With index evidence" },
    ],
    file: "civitas.md",
  },
];

export function getAllCaseStudies(): CaseStudy[] {
  return caseStudies;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
