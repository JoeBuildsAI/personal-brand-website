/**
 * Case studies — written on two levels: an Executive Summary for
 * decision-makers and a Technical Walkthrough for engineers.
 *
 * HOW TO EDIT:
 *  • Add a study:  copy a block and fill every field. Keep it anonymized —
 *                  no client/employer names, matter details, or config.
 *  • Hide a study: set `visible: false`.  • Feature: set `featured: true`.
 *  • Order:        optional `sortOrder` (lower = earlier).
 *  • architectureMap drives the mini diagram: Sources → Logic → Review → Output.
 */

export type CaseStudyStatus =
  | "Live"
  | "In Production"
  | "Ongoing"
  | "Prototype"
  | "Archived";

export interface CaseStudyMetric {
  label: string;
  value: string;
}

/** Ordered left-to-right stages of a case study's architecture diagram. */
export type ArchitectureStage = "Sources" | "Logic" | "Review" | "Output";

export interface ArchitectureLayer {
  stage: ArchitectureStage;
  label: string;
  nodes: string[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  // ── Executive summary (decision-maker language) ──
  problem: string;
  businessImpact: string;
  outcome: string;
  metrics: CaseStudyMetric[];
  // ── Technical walkthrough ──
  approach: string;
  constraints: string[];
  architecture: string[];
  architectureMap: ArchitectureLayer[];
  tradeoffs: string[];
  governance: string[];
  /** Failure modes the design prevents. */
  failureModes: string[];
  lessons: string[];
  // ── Meta ──
  tools: string[];
  status: CaseStudyStatus;
  featured: boolean;
  confidentialityNote: string;
  visible?: boolean;
  sortOrder?: number;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "legal-operations-reporting-system",
    title: "Legal Operations Reporting System",
    eyebrow: "Reporting & Data Operations",
    summary:
      "A unified reporting layer that turned fragmented case and operational data into a single, trustworthy source of truth for a legal operations team.",
    problem:
      "A legal operations team relied on manual spreadsheet exports pulled from several disconnected systems to answer basic questions about caseload, intake velocity, and team performance. Reports took days to assemble, were outdated on arrival, and frequently disagreed with one another.",
    approach:
      "I mapped the underlying data model across the core systems, standardized the metrics that actually drove decisions, and built an automated reporting pipeline that consolidated case, intake, and activity data into governed dashboards. Every metric was documented with a single, defensible definition so numbers stopped being a matter of opinion.",
    outcome:
      "Leadership moved from monthly guesswork to daily, dependable operational visibility. Hours of manual reporting were eliminated each week, and staffing and intake decisions could finally be made from current, reconciled data.",
    tools: ["Salesforce", "Litify", "SOQL", "Reporting Dashboards", "Automated Exports"],
    status: "In Production",
    featured: true,
    metrics: [
      { label: "Manual reporting time", value: "-85%" },
      { label: "Report freshness", value: "Monthly to Daily" },
      { label: "Data sources unified", value: "6+" },
    ],
    confidentialityNote:
      "Details anonymized. Built for a plaintiff-side law firm; all client, matter, and proprietary data omitted.",
    constraints: [
      "Six-plus production systems with no shared data model",
      "Zero tolerance for downtime on live case operations",
      "Core metric definitions disagreed across teams",
    ],
    architecture: [
      "Mapped and reconciled the data model across every source system",
      "Standardized one documented definition for each decision-driving metric",
      "Built automated extract-and-consolidate pipelines into a governed layer",
      "Published role-based dashboards on top of the trusted source of truth",
    ],
    lessons: [
      "Agreeing on metric definitions was harder, and more valuable, than the engineering",
      "Governance is what makes automation trustworthy, not the other way around",
    ],
    businessImpact:
      "Leadership stopped guessing. Staffing, intake, and performance decisions now run on one set of numbers everyone trusts — produced in minutes instead of days.",
    architectureMap: [
      { stage: "Sources", label: "Source systems", nodes: ["Case system", "Intake", "Activity logs"] },
      { stage: "Logic", label: "Processing", nodes: ["Extract & reconcile", "Metric definitions"] },
      { stage: "Review", label: "Human checkpoint", nodes: ["Analyst validation"] },
      { stage: "Output", label: "Reporting", nodes: ["Role-based dashboards"] },
    ],
    tradeoffs: [
      "Chose one governed metric layer over fast point-fixes in each tool",
      "Invested in upfront definitions to end recurring reconciliation",
    ],
    governance: [
      "One documented owner and definition per metric",
      "Downstream reports must read from the source-of-truth layer",
    ],
    failureModes: [
      "Conflicting numbers across competing spreadsheets",
      "Stale reports presented as current in leadership meetings",
    ],
  },
  {
    slug: "ai-assisted-intake-workflow",
    title: "AI-Assisted Intake Workflow",
    eyebrow: "AI Workflows & Automation",
    summary:
      "An AI-assisted intake pipeline that triaged, summarized, and routed inbound matters so the team spent its time on judgment instead of data entry.",
    problem:
      "Inbound intake arrived through many channels in inconsistent formats. Staff manually read, classified, and re-keyed every submission, creating bottlenecks, slow response times, and uneven data quality at the most important point in the funnel.",
    approach:
      "I designed a workflow that captured intake into a structured pipeline, used AI to summarize and classify each submission, and flagged missing information before routing. Humans stayed in the loop for every qualifying decision while the AI handled first-pass structuring and drafting.",
    outcome:
      "Response times on new matters dropped sharply, intake records became consistently structured, and staff were freed from repetitive triage to focus on qualification and client communication.",
    tools: ["LLM APIs", "Workflow Automation", "Structured Data Capture", "TypeScript", "Webhooks"],
    status: "Ongoing",
    featured: true,
    metrics: [
      { label: "First-response time", value: "-70%" },
      { label: "Intake auto-structured", value: "90%+" },
      { label: "Channels unified", value: "Many to 1" },
    ],
    confidentialityNote:
      "Anonymized workflow overview. Implemented for a legal operations team; no confidential or client-identifying details included.",
    constraints: [
      "Inbound arrived in many formats across disconnected channels",
      "Every qualifying decision had to remain with a human",
      "Sensitive data required careful handling and a clear audit trail",
    ],
    architecture: [
      "Captured all channels into a single structured intake pipeline",
      "Used LLMs to summarize, classify, and extract structured fields",
      "Inserted human review gates before any qualifying decision",
      "Routed completed records into downstream systems via webhooks",
    ],
    lessons: [
      "AI earns trust fastest when it drafts and structures while humans decide",
      "Structuring data at the source removes most downstream cleanup",
    ],
    businessImpact:
      "New matters get a fast, consistent first response, and the team spends its time on qualification and client care instead of re-keying forms.",
    architectureMap: [
      { stage: "Sources", label: "Inbound channels", nodes: ["Web forms", "Email", "Phone notes"] },
      { stage: "Logic", label: "AI structuring", nodes: ["Summarize", "Classify", "Extract fields"] },
      { stage: "Review", label: "Human checkpoint", nodes: ["Qualify gate"] },
      { stage: "Output", label: "Routing", nodes: ["Case system", "Notifications"] },
    ],
    tradeoffs: [
      "Kept every qualifying decision with a human, trading full automation for trust",
      "Invested in structured capture so AI output stays reliable",
    ],
    governance: [
      "Audit trail on every AI suggestion and human decision",
      "Sensitive data handled under explicit, documented rules",
    ],
    failureModes: [
      "Unstructured intake lost between disconnected channels",
      "AI making qualifying decisions without supervision",
    ],
  },
  {
    slug: "financial-operating-system",
    title: "Financial Operating System",
    eyebrow: "Personal & Business Systems",
    summary:
      "A financial operating system that models cash flow, runway, and goals as one connected system rather than a drawer full of disconnected spreadsheets.",
    problem:
      "Financial decisions were spread across disconnected spreadsheets and apps with no single view of cash flow, obligations, or long-term trajectory, which made confident planning nearly impossible.",
    approach:
      "I architected a structured data model for accounts, recurring flows, and goals, then built automated calculations for runway, scenario planning, and monthly reconciliation. The system is auditable by design and structured to evolve into a productized tool.",
    outcome:
      "A live, always-current view of financial position with scenario modeling replaced manual spreadsheet upkeep and surfaced important decisions earlier and with more confidence.",
    tools: ["Next.js", "TypeScript", "Data Modeling", "Automated Calculations"],
    status: "Ongoing",
    featured: true,
    metrics: [
      { label: "Spreadsheets replaced", value: "12 to 1" },
      { label: "Reconciliation time", value: "-80%" },
      { label: "Planning view", value: "Real-time" },
    ],
    confidentialityNote:
      "Personal system. Figures are illustrative and intentionally generalized.",
    constraints: [
      "A decade of habits spread across a dozen spreadsheets",
      "Every figure had to remain auditable back to its source",
      "Had to stay maintainable by one person, not a team",
    ],
    architecture: [
      "Modeled accounts, recurring flows, and goals as one connected schema",
      "Automated runway, scenario, and reconciliation calculations",
      "Designed an audit trail so any number traces to its inputs",
      "Structured the codebase to graduate into a product",
    ],
    lessons: [
      "A connected model beats more spreadsheets every single time",
      "Designing for audit from day one makes a system calm to trust",
    ],
    businessImpact:
      "A single, always-current view of cash flow and runway replaced spreadsheet upkeep — surfacing the decisions that matter earlier and with more confidence.",
    architectureMap: [
      { stage: "Sources", label: "Inputs", nodes: ["Accounts", "Recurring flows", "Goals"] },
      { stage: "Logic", label: "Calculation", nodes: ["Runway engine", "Scenario modeling"] },
      { stage: "Review", label: "Human checkpoint", nodes: ["Monthly reconciliation"] },
      { stage: "Output", label: "Decision view", nodes: ["Live financial picture"] },
    ],
    tradeoffs: [
      "Built a connected model instead of more spreadsheets, accepting upfront schema work",
      "Optimized for auditability over clever shortcuts",
    ],
    governance: [
      "Every figure traces back to its inputs",
      "Monthly reconciliation keeps the model honest",
    ],
    failureModes: [
      "Untraceable numbers no one could explain",
      "Drift between scattered, conflicting spreadsheets",
    ],
  },
  {
    slug: "salesforce-litify-review-architecture",
    title: "Salesforce / Litify Review Architecture",
    eyebrow: "Platform Architecture",
    summary:
      "A structured review and quality-assurance architecture on Salesforce and Litify that made case-data integrity measurable, enforceable, and trustworthy.",
    problem:
      "Case records drifted out of standard over time. Without a systematic review layer, data-quality issues surfaced late, undermining reporting and every downstream automation that depended on clean records.",
    approach:
      "I designed a review architecture layered on the existing platform: validation logic, structured review queues, and exception reporting that surfaced the exact records needing attention. The model made the definition of good data explicit and reviewable instead of assumed.",
    outcome:
      "Data quality became a tracked metric instead of a recurring fire drill, and downstream reporting and automation could finally be trusted to reflect reality.",
    tools: ["Salesforce", "Litify", "Validation Rules", "SOQL", "Process Automation"],
    status: "In Production",
    featured: false,
    metrics: [
      { label: "Records under governance", value: "100%" },
      { label: "Exception detection", value: "Reactive to Proactive" },
      { label: "Reporting trust", value: "Restored" },
    ],
    confidentialityNote:
      "Anonymized. Implemented inside an internal business system for a legal organization; configuration specifics omitted.",
    constraints: [
      "Records drifted out of standard across years of daily use",
      "Could not disrupt the live platform teams worked in",
      "Quality had to become measurable, not anecdotal",
    ],
    architecture: [
      "Codified what good data means as explicit validation logic",
      "Built structured review queues for flagged exceptions",
      "Surfaced the exact records needing attention via exception reporting",
      "Tracked data quality as an ongoing, visible metric",
    ],
    lessons: [
      "Make the definition of good data explicit and you can enforce it",
      "Proactive exception surfacing prevents recurring reporting fire drills",
    ],
    businessImpact:
      "Data quality became a number leadership can see and trust, so the reporting and automation built on top of it stopped breaking in surprising ways.",
    architectureMap: [
      { stage: "Sources", label: "Platform data", nodes: ["Salesforce", "Litify records"] },
      { stage: "Logic", label: "Quality engine", nodes: ["Validation rules", "Exception detection"] },
      { stage: "Review", label: "Human checkpoint", nodes: ["Review queues"] },
      { stage: "Output", label: "Trusted data", nodes: ["Quality metric", "Clean records"] },
    ],
    tradeoffs: [
      "Layered review onto the live platform rather than a risky migration",
      "Made “good data” explicit, accepting stricter rules for long-term trust",
    ],
    governance: [
      "Validation logic codifies the standard",
      "Exception queues assign clear accountability",
    ],
    failureModes: [
      "Silent data drift discovered only in broken reports",
      "Automation acting on records that were out of standard",
    ],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getCaseStudySlugs(): string[] {
  return caseStudies.map((study) => study.slug);
}

export const featuredCaseStudies: CaseStudy[] = caseStudies.filter(
  (study) => study.featured,
);
