/**
 * Projects shown in the interactive Project Constellation.
 *
 * HOW TO EDIT:
 *  • Add a project: copy a block below and fill every field. `category`
 *    decides which cluster it orbits in the constellation.
 *  • Hide one:      set `visible: false` (keeps the data).
 *  • Feature one:   set `featured: true` (selected first, highlighted).
 *  • Order:         optional `sortOrder` (lower = earlier).
 * Use real GitHub/demo URLs, or point `demoUrl` at a related case study.
 */

export type ProjectStatus =
  | "Live"
  | "In Development"
  | "Prototype"
  | "Maintained"
  | "Planned";

export type ProjectCategory =
  | "Platforms & Products"
  | "Automation & AI"
  | "Platform Architecture";

export interface Project {
  title: string;
  slug: string;
  category: ProjectCategory;
  summary: string;
  description: string;
  type: string;
  status: ProjectStatus;
  stack: string[];
  githubUrl: string;
  demoUrl: string;
  highlights: string[];
  /** Short, anonymized architecture notes shown in the detail panel. */
  architecture: string[];
  featured?: boolean;
  visible?: boolean;
  sortOrder?: number;
}

export const projects: Project[] = [
  {
    title: "Personal Brand Website",
    slug: "personal-brand-website",
    category: "Platforms & Products",
    summary:
      "The platform you’re on now: a static-first personal site and digital headquarters.",
    description:
      "A premium, dark, systems-inspired personal brand site built as a long-term platform for case studies, services, products, and writing. Content lives in typed data files so it can be edited quickly without a CMS, while the architecture stays ready to grow.",
    type: "Web Platform",
    status: "In Development",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "App Router"],
    githubUrl: "https://github.com/joewilkinson/personal-brand-website",
    demoUrl: "https://joewilkinson.dev",
    highlights: [
      "Static-first App Router architecture",
      "Typed content system with no CMS required",
      "Reusable design system and component library",
      "Built to scale into products and writing",
    ],
    architecture: [
      "Static-first Next.js App Router, no server required",
      "Typed content layer in versioned data files",
      "Signature graph rendered with SVG + requestAnimationFrame",
    ],
  },
  {
    title: "Life Financial OS",
    slug: "life-financial-os",
    category: "Platforms & Products",
    featured: true,
    summary:
      "A personal financial operating system that models cash flow, runway, and goals in one place.",
    description:
      "A structured tool that replaces scattered spreadsheets with a connected model of accounts, recurring flows, and goals. It calculates runway, supports scenario planning, and is designed to mature into a productized offering.",
    type: "Product Prototype",
    status: "Prototype",
    stack: ["Next.js", "TypeScript", "Data Modeling", "Automated Calculations"],
    githubUrl: "https://github.com/joewilkinson/life-financial-os",
    demoUrl: "https://joewilkinson.dev/products/life-financial-os",
    highlights: [
      "Single connected financial data model",
      "Runway and scenario planning",
      "Auditable, reconciliation-first design",
      "Roadmap toward a productized release",
    ],
    architecture: [
      "Single connected schema for accounts and recurring flows",
      "Deterministic runway and scenario engine",
      "Reconciliation-first design with a full audit trail",
    ],
  },
  {
    title: "Legal Reporting Automation",
    slug: "legal-reporting-automation",
    category: "Automation & AI",
    summary:
      "An automated reporting pipeline that consolidates operational legal data into governed dashboards.",
    description:
      "A reporting system that unifies case, intake, and activity data from multiple sources into a single, trusted reporting layer with documented metric definitions. Built to eliminate manual exports and reconcile conflicting numbers.",
    type: "Automation System",
    status: "Maintained",
    stack: ["Salesforce", "Litify", "SOQL", "Automated Exports"],
    githubUrl: "https://github.com/joewilkinson",
    demoUrl: "https://joewilkinson.dev/case-studies/legal-operations-reporting-system",
    highlights: [
      "Unified multi-source reporting layer",
      "Documented, single-source metric definitions",
      "Eliminated hours of manual reporting weekly",
      "Daily operational visibility for leadership",
    ],
    architecture: [
      "Extract and reconcile data across 6+ source systems",
      "One governed metric layer with documented definitions",
      "Scheduled refresh into role-based dashboards",
    ],
  },
  {
    title: "AI Intake / Agent Workflow",
    slug: "ai-intake-agent-workflow",
    category: "Automation & AI",
    featured: true,
    summary:
      "An AI-assisted intake and triage workflow that structures inbound matters while keeping humans in control.",
    description:
      "A workflow that captures inbound intake into a structured pipeline, then uses AI to summarize, classify, and flag missing information before routing. Designed for human-in-the-loop decisions with the AI handling first-pass structuring.",
    type: "AI Workflow",
    status: "In Development",
    stack: ["LLM APIs", "TypeScript", "Workflow Automation", "Webhooks"],
    githubUrl: "https://github.com/joewilkinson",
    demoUrl: "https://joewilkinson.dev/case-studies/ai-assisted-intake-workflow",
    highlights: [
      "Structured capture across multiple channels",
      "AI summarization and classification",
      "Human-in-the-loop by design",
      "Faster, more consistent first response",
    ],
    architecture: [
      "Structured capture normalizes every inbound channel",
      "LLM step summarizes, classifies, and extracts fields",
      "Human review gate before routing via webhooks",
    ],
  },
  {
    title: "Salesforce Review System",
    slug: "salesforce-review-system",
    category: "Platform Architecture",
    summary:
      "A review and quality-assurance architecture that makes case-data integrity measurable and enforceable.",
    description:
      "A platform layer of validation logic, structured review queues, and exception reporting built on Salesforce and Litify. It turns data quality from an assumption into a tracked, defensible metric that downstream systems can rely on.",
    type: "Platform Architecture",
    status: "Maintained",
    stack: ["Salesforce", "Litify", "Validation Rules", "SOQL"],
    githubUrl: "https://github.com/joewilkinson",
    demoUrl: "https://joewilkinson.dev/case-studies/salesforce-litify-review-architecture",
    highlights: [
      "Validation and review queue architecture",
      "Proactive exception reporting",
      "Data quality as a tracked metric",
      "Trustworthy foundation for automation",
    ],
    architecture: [
      "Validation rules encode what good data means",
      "Exception queues surface records that drift out of standard",
      "Data quality tracked as an ongoing, visible metric",
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Visible projects, ordered by optional `sortOrder`. */
export function getVisibleProjects(): Project[] {
  return projects
    .filter((project) => project.visible !== false)
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export const projectCategories: ProjectCategory[] = [
  "Platforms & Products",
  "Automation & AI",
  "Platform Architecture",
];
