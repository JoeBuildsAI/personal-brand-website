export interface OperatingStep {
  number: string;
  title: string;
  summary: string;
  detail: string[];
}

export const operatingModel: OperatingStep[] = [
  {
    number: "01",
    title: "Discover",
    summary:
      "Understand how work actually flows — not how the org chart says it does.",
    detail: [
      "Map current processes, systems, and data",
      "Interview the people doing the work",
      "Locate the real bottlenecks and risks",
    ],
  },
  {
    number: "02",
    title: "Architect",
    summary:
      "Design the system before touching automation. Structure first, speed second.",
    detail: [
      "Define the data model and ownership",
      "Design integrations and workflow",
      "Document a prioritized roadmap",
    ],
  },
  {
    number: "03",
    title: "Build",
    summary:
      "Implement in deliberate increments that ship value without breaking operations.",
    detail: [
      "Build pipelines, automations, and tooling",
      "Layer in AI where it genuinely helps",
      "Keep humans in the loop by design",
    ],
  },
  {
    number: "04",
    title: "Measure",
    summary:
      "Make the impact visible with metrics that are defined once and trusted everywhere.",
    detail: [
      "Instrument the system and its data quality",
      "Establish single-source metric definitions",
      "Surface exceptions before they become fires",
    ],
  },
  {
    number: "05",
    title: "Scale",
    summary:
      "Harden, document, and hand off so the system outlasts any single person.",
    detail: [
      "Document the architecture and runbooks",
      "Enable the team to own and extend it",
      "Plan the next horizon of leverage",
    ],
  },
];
