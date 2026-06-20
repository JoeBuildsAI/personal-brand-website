/**
 * Products shown on the roadmap. Each product's `stage` decides which roadmap
 * phase it sits in (see `phaseByStage` on the products page).
 *
 * HOW TO EDIT:
 *  • Add a product: copy a block and fill every field.
 *  • Hide one:      set `visible: false`.   • Feature: set `featured: true`.
 *  • Move stages:   change `stage` and it relocates on the roadmap.
 */

export type ProductStage =
  | "Concept"
  | "Prototype"
  | "Building"
  | "Private Beta"
  | "Planned";

export interface Product {
  name: string;
  slug: string;
  summary: string;
  stage: ProductStage;
  audience: string;
  problemSolved: string;
  features: string[];
  futureVision: string;
  featured?: boolean;
  visible?: boolean;
  sortOrder?: number;
}

export const products: Product[] = [
  {
    name: "Life Financial OS",
    slug: "life-financial-os",
    summary:
      "A personal financial operating system that turns scattered spreadsheets into one connected, always-current model.",
    stage: "Prototype",
    audience: "Individuals and households who want clarity and control over their finances.",
    problemSolved:
      "Financial life is spread across disconnected apps and spreadsheets, leaving no single view of cash flow, runway, or progress toward goals.",
    features: [
      "Connected model of accounts and recurring flows",
      "Runway and cash-flow projections",
      "Scenario planning and goal tracking",
      "Monthly reconciliation workflow",
    ],
    futureVision:
      "Grow into a polished product that gives anyone a calm, systems-level view of their financial life and the confidence to plan ahead.",
  },
  {
    name: "Legal Ops Command Center",
    slug: "legal-ops-command-center",
    summary:
      "A unified operational dashboard that gives legal teams real-time visibility into caseload, intake, and performance.",
    stage: "Concept",
    audience: "Legal operations teams and firm leadership.",
    problemSolved:
      "Operational data is fragmented across systems, so leaders make decisions from stale, manually assembled reports.",
    features: [
      "Unified caseload and intake metrics",
      "Real-time operational dashboards",
      "Documented, single-source definitions",
      "Alerting on operational thresholds",
    ],
    futureVision:
      "Become the operational nerve center for legal teams, replacing manual reporting with live, trustworthy insight.",
  },
  {
    name: "AI Intake Assistant",
    slug: "ai-intake-assistant",
    summary:
      "An AI-assisted intake layer that captures, summarizes, and structures inbound matters while keeping humans in control.",
    stage: "Building",
    audience: "Firms and teams handling high volumes of inbound intake.",
    problemSolved:
      "Manual intake triage is slow, inconsistent, and steals time from qualification and client communication.",
    features: [
      "Structured capture across channels",
      "AI summarization and classification",
      "Missing-information detection",
      "Human-in-the-loop routing",
    ],
    futureVision:
      "Offer a dependable intake assistant that makes the top of the funnel fast, consistent, and fully auditable.",
  },
  {
    name: "Case Review Workflow Engine",
    slug: "case-review-workflow-engine",
    summary:
      "A workflow engine that enforces structured review and quality assurance across case records.",
    stage: "Concept",
    audience: "Operations and quality teams managing case data at scale.",
    problemSolved:
      "Records drift out of standard over time, and quality issues surface too late to prevent downstream damage.",
    features: [
      "Configurable review queues",
      "Validation and quality rules",
      "Proactive exception surfacing",
      "Audit trail and accountability",
    ],
    futureVision:
      "Make data quality a continuous, measurable process rather than a periodic clean-up project.",
  },
  {
    name: "Reporting Watchdog",
    slug: "reporting-watchdog",
    summary:
      "A monitoring system that watches key metrics and pipelines, alerting teams the moment numbers drift or break.",
    stage: "Planned",
    audience: "Data-driven operations teams that depend on reliable reporting.",
    problemSolved:
      "Broken pipelines and silent data drift go unnoticed until a report is already wrong in front of leadership.",
    features: [
      "Automated metric and pipeline monitoring",
      "Anomaly and drift detection",
      "Threshold-based alerting",
      "Health history and reporting",
    ],
    futureVision:
      "Guarantee that the numbers leaders rely on are continuously verified, so trust in reporting never has to be assumed.",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

/** Visible products, ordered by optional `sortOrder`. */
export function getVisibleProducts(): Product[] {
  return products
    .filter((product) => product.visible !== false)
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}
