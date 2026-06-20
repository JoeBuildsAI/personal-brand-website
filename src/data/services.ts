export interface Service {
  slug: string;
  title: string;
  summary: string;
  whatItIncludes: string[];
  bestFor: string[];
  outcomes: string[];
  pricingNote: string;
}

export const services: Service[] = [
  {
    slug: "systems-architecture-workflow-design",
    title: "Systems Architecture & Workflow Design",
    summary:
      "Turn tangled, undocumented processes into clear, scalable systems with defined data, ownership, and flow.",
    whatItIncludes: [
      "Process and data-flow mapping",
      "System and integration architecture",
      "Workflow redesign and documentation",
      "Implementation roadmap with priorities",
    ],
    bestFor: [
      "Teams outgrowing manual processes",
      "Operations that live in scattered spreadsheets",
      "Founders preparing systems to scale",
    ],
    outcomes: [
      "A clear map of how work actually flows",
      "Documented, defensible system design",
      "A prioritized path from chaos to infrastructure",
    ],
    pricingNote: "Scoped by project",
  },
  {
    slug: "legal-technology-consulting",
    title: "Legal Technology Consulting",
    summary:
      "Practical legal-tech strategy and implementation grounded in real legal operations, not vendor hype.",
    whatItIncludes: [
      "Legal operations and tooling assessment",
      "Platform selection and configuration guidance",
      "Workflow design for intake, matters, and reporting",
      "Change management and adoption support",
    ],
    bestFor: [
      "Law firms modernizing operations",
      "Legal ops teams standardizing processes",
      "Organizations evaluating legal platforms",
    ],
    outcomes: [
      "Technology aligned to how legal work happens",
      "Cleaner data and more reliable reporting",
      "Higher adoption and less manual overhead",
    ],
    pricingNote: "Available by consult",
  },
  {
    slug: "automation-reporting-systems",
    title: "Automation & Reporting Systems",
    summary:
      "Replace manual, error-prone busywork with automated pipelines and reporting you can actually trust.",
    whatItIncludes: [
      "Automation opportunity assessment",
      "Workflow and integration automation",
      "Reporting pipelines and dashboards",
      "Documented, single-source metric definitions",
    ],
    bestFor: [
      "Teams drowning in manual reporting",
      "Operations with repetitive, rules-based tasks",
      "Leaders who need current, reliable numbers",
    ],
    outcomes: [
      "Hours of manual work eliminated",
      "Consistent, reconciled reporting",
      "Faster, data-backed decisions",
    ],
    pricingNote: "Scoped by project",
  },
  {
    slug: "salesforce-litify-architecture",
    title: "Salesforce / Litify Architecture",
    summary:
      "Design and harden Salesforce and Litify so they stay clean, structured, and reportable as you grow.",
    whatItIncludes: [
      "Data model and configuration review",
      "Validation, review queues, and quality controls",
      "Reporting and exception architecture",
      "Documentation and governance guidance",
    ],
    bestFor: [
      "Firms on Salesforce or Litify",
      "Teams struggling with data quality",
      "Organizations scaling case operations",
    ],
    outcomes: [
      "Trustworthy, well-governed platform data",
      "Proactive detection of data exceptions",
      "A reliable foundation for automation",
    ],
    pricingNote: "Available by consult",
  },
  {
    slug: "ai-workflow-strategy",
    title: "AI Workflow Strategy",
    summary:
      "Find where AI genuinely helps, then design human-in-the-loop workflows that are safe and dependable.",
    whatItIncludes: [
      "AI use-case identification and prioritization",
      "Human-in-the-loop workflow design",
      "Prompt, structuring, and routing patterns",
      "Guardrails, review, and quality checks",
    ],
    bestFor: [
      "Teams exploring AI without a clear plan",
      "Operations with high-volume triage or drafting",
      "Leaders who want practical, safe AI adoption",
    ],
    outcomes: [
      "AI applied where it actually pays off",
      "Faster throughput with humans in control",
      "Consistent, structured outputs",
    ],
    pricingNote: "Available by consult",
  },
  {
    slug: "product-prototyping",
    title: "Product Prototyping",
    summary:
      "Move from idea to a working, credible prototype that proves the concept and is ready to iterate.",
    whatItIncludes: [
      "Concept shaping and scoping",
      "Data model and architecture",
      "Working prototype build",
      "Roadmap toward a real product",
    ],
    bestFor: [
      "Founders validating an idea",
      "Operators productizing internal tools",
      "Teams that need a credible proof of concept",
    ],
    outcomes: [
      "A tangible, working prototype",
      "Clarity on feasibility and scope",
      "A realistic path to production",
    ],
    pricingNote: "Scoped by project",
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
