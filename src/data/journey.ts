export interface JourneyStage {
  marker: string;
  title: string;
  description: string;
  tags: string[];
}

export const journey: JourneyStage[] = [
  {
    marker: "The Spark",
    title: "Early Technology Curiosity",
    description:
      "It started with taking things apart to understand how they fit back together. Software, hardware, and the systems behind everyday tools were never magic — they were patterns waiting to be understood.",
    tags: ["Curiosity", "First Principles"],
  },
  {
    marker: "Foundations",
    title: "Systems & Operations",
    description:
      "Working inside real operations made one thing obvious: most problems are not technical, they are structural. Undocumented processes and scattered data quietly tax every team that depends on them.",
    tags: ["Operations", "Process Design"],
  },
  {
    marker: "Specialization",
    title: "Legal Technology",
    description:
      "Legal operations became the proving ground — high stakes, complex data, and zero tolerance for unreliable numbers. I learned the platforms that run modern firms from the inside, hands on Salesforce and Litify.",
    tags: ["Legal Tech", "Salesforce", "Litify"],
  },
  {
    marker: "Craft",
    title: "Architecture",
    description:
      "I stopped patching symptoms and started designing systems. Data models, ownership, and flow became the work — building structures that stay clear and trustworthy as the organization grows.",
    tags: ["Systems Architecture", "Data Modeling"],
  },
  {
    marker: "Leverage",
    title: "Automation",
    description:
      "With the architecture sound, automation became real leverage. Manual, error-prone busywork gave way to pipelines and reporting that teams could finally rely on without checking twice.",
    tags: ["Automation", "Reporting"],
  },
  {
    marker: "Frontier",
    title: "AI Workflows",
    description:
      "AI entered the toolkit as an amplifier, not a replacement. The focus stayed on human-in-the-loop workflows: AI structures and drafts, people make the calls that matter, and everything stays auditable.",
    tags: ["AI", "Human-in-the-Loop"],
  },
  {
    marker: "Ownership",
    title: "Products",
    description:
      "The systems built for others started pointing toward products of my own — internal tools refined enough to stand alone and solve the same problems for many teams.",
    tags: ["Product", "Prototyping"],
  },
  {
    marker: "Ahead",
    title: "Future Vision",
    description:
      "The throughline never changed: take something tangled and turn it into infrastructure people can trust. Next is widening that impact through consulting, products, and technical leadership.",
    tags: ["Consulting", "Leadership"],
  },
];
