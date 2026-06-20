import { caseStudies } from "@/data/caseStudies";
import { projects, type ProjectCategory } from "@/data/projects";
import { products } from "@/data/products";
import { articles } from "@/data/writing";
import { services } from "@/data/services";
import { journey } from "@/data/journey";
import type { EdgeKind, GraphEdge, GraphModel, GraphNode, NodeTone } from "./types";
import { layoutGraph, worldBounds } from "./layout";

/**
 * Builds the entire graph universe from the content files. Nothing here is
 * hand-placed — add/edit content in the data files and the graph regenerates.
 */

const ROOT = "root";

// Cross-cutting "signal" themes used to draw relation edges between systems
// that live in different domains (the neural pathways through the universe).
const SIGNALS: ReadonlyArray<readonly [string, RegExp]> = [
  ["salesforce", /salesforce/i],
  ["litify", /litify/i],
  ["ai", /\bai\b|a\.i\.|intelligence|\bllm\b|gpt/i],
  ["automation", /automat/i],
  ["reporting", /report|dashboard|metric|analytics/i],
  ["legal", /legal|matter|intake|firm|litigation/i],
  ["systems", /system|architect|workflow|operat|infrastructure/i],
  ["product", /product|prototype|roadmap|beta|concept/i],
  ["data", /\bdata\b|soql|pipeline|schema|governance|model/i],
];

function signalsFor(parts: Array<string | string[] | undefined>): string[] {
  const text = parts
    .flat()
    .filter((part): part is string => Boolean(part))
    .join(" ");
  return SIGNALS.filter(([, re]) => re.test(text)).map(([key]) => key);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const isVisible = <T extends { visible?: boolean }>(item: T): boolean =>
  item.visible !== false;

const byOrder = <T extends { sortOrder?: number }>(a: T, b: T): number =>
  (a.sortOrder ?? 100) - (b.sortOrder ?? 100);

const isExternal = (href: string): boolean => /^https?:\/\//.test(href);

export function buildGraphModel(): GraphModel {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const byId = new Map<string, GraphNode>();
  const childrenOf = new Map<string, string[]>();

  const add = (node: GraphNode): void => {
    nodes.push(node);
    byId.set(node.id, node);
    if (node.parentId) {
      const siblings = childrenOf.get(node.parentId) ?? [];
      siblings.push(node.id);
      childrenOf.set(node.parentId, siblings);
    }
  };

  const link = (
    source: string,
    target: string,
    kind: EdgeKind,
    strength: number,
  ): void => {
    edges.push({ id: `${kind}:${source}->${target}`, source, target, kind, strength });
  };

  const blank = { x: 0, y: 0, r: 0 } as const;

  // ── L1 · Core ──────────────────────────────────────────────────────────
  // Deliberately abstract: visitors enter a *system*, not a portfolio. The
  // person behind it is discovered inside the "About" domain (the identity
  // core), never as the first thing you see.
  add({
    id: ROOT,
    level: 1,
    kind: "identity",
    label: "CORE",
    tone: "brand",
    summary:
      "An operating layer of connected systems. You are seeing a fragment — move through it to reveal the rest.",
    parentId: null,
    meta: "Operating layer",
    tags: ["systems"],
    ...blank,
  });

  // ── L2 · Domains ───────────────────────────────────────────────────────
  const domains: Array<{
    id: string;
    label: string;
    tone: NodeTone;
    href: string;
    summary: string;
  }> = [
    {
      id: "d-about",
      label: "About",
      tone: "brand",
      href: "/about",
      summary: "The identity core — where the system began.",
    },
    {
      id: "d-case-studies",
      label: "Case Studies",
      tone: "accent",
      href: "/case-studies",
      summary: "An archive of systems shipped into the world.",
    },
    {
      id: "d-services",
      label: "Services",
      tone: "violet",
      href: "/services",
      summary: "An operations command center.",
    },
    {
      id: "d-projects",
      label: "Projects",
      tone: "brand",
      href: "/projects",
      summary: "A build laboratory of platforms and automations.",
    },
    {
      id: "d-products",
      label: "Products",
      tone: "warm",
      href: "/products",
      summary: "A roadmap observatory.",
    },
    {
      id: "d-writing",
      label: "Writing",
      tone: "accent",
      href: "/writing",
      summary: "A knowledge network of field notes.",
    },
  ];

  for (const domain of domains) {
    add({
      id: domain.id,
      level: 2,
      kind: "domain",
      label: domain.label,
      tone: domain.tone,
      summary: domain.summary,
      href: domain.href,
      parentId: ROOT,
      tags: signalsFor([domain.label, domain.summary]),
      ...blank,
    });
    link(ROOT, domain.id, "hierarchy", 0.95);
  }

  // ── L3 · Systems under each domain ─────────────────────────────────────

  // Case studies → systems
  caseStudies
    .filter(isVisible)
    .slice()
    .sort(byOrder)
    .forEach((study) => {
      const id = `cs-${study.slug}`;
      add({
        id,
        parentId: "d-case-studies",
        level: 3,
        kind: "system",
        label: study.title,
        tone: study.featured ? "accent" : "brand",
        summary: study.summary,
        href: `/case-studies/${study.slug}`,
        status: study.status,
        metric: study.metrics[0]?.value,
        meta: "Case study",
        tags: signalsFor([study.title, study.eyebrow, study.tools, study.summary]),
        featured: study.featured,
        ...blank,
      });
      link("d-case-studies", id, "hierarchy", 0.72);
    });

  // Services → capability systems
  services.forEach((service) => {
    const id = `svc-${service.slug}`;
    add({
      id,
      parentId: "d-services",
      level: 3,
      kind: "system",
      label: service.title,
      tone: "violet",
      summary: service.summary,
      href: "/services",
      meta: "Capability",
      tags: signalsFor([service.title, service.summary, service.whatItIncludes]),
      ...blank,
    });
    link("d-services", id, "hierarchy", 0.72);
  });

  // Projects → category systems (L3) → projects (L4 artifacts)
  const projectCats: ProjectCategory[] = [
    "Platforms & Products",
    "Automation & AI",
    "Platform Architecture",
  ];
  const catTone: Record<ProjectCategory, NodeTone> = {
    "Platforms & Products": "brand",
    "Automation & AI": "violet",
    "Platform Architecture": "accent",
  };
  projectCats.forEach((cat) => {
    const items = projects
      .filter(isVisible)
      .filter((project) => project.category === cat)
      .sort(byOrder);
    if (items.length === 0) return;
    const catId = `pcat-${slugify(cat)}`;
    add({
      id: catId,
      parentId: "d-projects",
      level: 3,
      kind: "system",
      label: cat,
      tone: catTone[cat],
      summary: `${items.length} ${items.length === 1 ? "project" : "projects"} in ${cat.toLowerCase()}.`,
      href: "/projects",
      meta: `${items.length} ${items.length === 1 ? "project" : "projects"}`,
      tags: signalsFor([cat]),
      ...blank,
    });
    link("d-projects", catId, "hierarchy", 0.72);

    items.forEach((project) => {
      const id = `prj-${project.slug}`;
      const href = project.demoUrl || project.githubUrl || "/projects";
      add({
        id,
        parentId: catId,
        level: 4,
        kind: "artifact",
        label: project.title,
        tone: catTone[cat],
        summary: project.summary,
        href,
        external: isExternal(href),
        status: project.status,
        meta: project.type,
        tags: signalsFor([project.title, project.type, project.stack, project.summary]),
        featured: project.featured,
        ...blank,
      });
      link(catId, id, "hierarchy", 0.55);
    });
  });

  // Products → roadmap systems (tone progresses with maturity)
  const stageTone: Record<string, NodeTone> = {
    Concept: "violet",
    Prototype: "accent",
    Building: "brand",
    "Private Beta": "brand",
    Planned: "warm",
  };
  products
    .filter(isVisible)
    .slice()
    .sort(byOrder)
    .forEach((product) => {
      const id = `prd-${product.slug}`;
      add({
        id,
        parentId: "d-products",
        level: 3,
        kind: "system",
        label: product.name,
        tone: stageTone[product.stage] ?? "warm",
        summary: product.summary,
        href: "/products",
        status: product.stage,
        meta: product.stage,
        tags: signalsFor([product.name, product.summary, product.problemSolved]),
        featured: product.featured,
        ...blank,
      });
      link("d-products", id, "hierarchy", 0.72);
    });

  // Writing → topic clusters (L3) → articles (L4 artifacts)
  const topicTone: Record<string, NodeTone> = {
    "Systems Thinking": "brand",
    "Legal Technology": "accent",
    "Personal Systems": "violet",
  };
  const topics = Array.from(new Set(articles.map((article) => article.category)));
  topics.forEach((topic) => {
    const items = articles.filter((article) => article.category === topic);
    const topicId = `wtopic-${slugify(topic)}`;
    add({
      id: topicId,
      parentId: "d-writing",
      level: 3,
      kind: "system",
      label: topic,
      tone: topicTone[topic] ?? "accent",
      summary: `${items.length} ${items.length === 1 ? "piece" : "pieces"} on ${topic.toLowerCase()}.`,
      href: "/writing",
      meta: `${items.length} ${items.length === 1 ? "article" : "articles"}`,
      tags: signalsFor([topic]),
      ...blank,
    });
    link("d-writing", topicId, "hierarchy", 0.72);

    items.forEach((article) => {
      const id = `art-${article.slug}`;
      add({
        id,
        parentId: topicId,
        level: 4,
        kind: "artifact",
        label: article.title,
        tone: topicTone[topic] ?? "accent",
        summary: article.excerpt,
        href: "/writing",
        status: article.status,
        meta: article.readTime,
        tags: signalsFor([article.title, article.category, article.excerpt]),
        ...blank,
      });
      link(topicId, id, "hierarchy", 0.5);
    });
  });

  // About → journey milestones (tone progresses across the trajectory)
  const aboutTones: NodeTone[] = [
    "brand",
    "brand",
    "violet",
    "violet",
    "accent",
    "accent",
    "warm",
    "warm",
  ];
  journey.forEach((stage, index) => {
    const id = `jrn-${slugify(stage.marker)}`;
    add({
      id,
      parentId: "d-about",
      level: 3,
      kind: "system",
      label: stage.title,
      tone: aboutTones[index] ?? "brand",
      summary: stage.description,
      href: "/about",
      meta: stage.marker,
      tags: signalsFor([stage.title, stage.tags]),
      ...blank,
    });
    link("d-about", id, "hierarchy", 0.6);
  });

  // ── Relation edges · cross-domain neural pathways ──────────────────────
  const systemsNodes = nodes.filter((node) => node.level >= 3);
  const seen = new Set<string>();
  for (const [signal] of SIGNALS) {
    const matches = systemsNodes.filter((node) => node.tags.includes(signal));
    let previous: GraphNode | null = null;
    let made = 0;
    for (const current of matches) {
      if (previous && previous.parentId !== current.parentId && made < 4) {
        const key = [previous.id, current.id].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          link(previous.id, current.id, "relation", 0.2);
          made += 1;
        }
      }
      previous = current;
    }
  }

  // ── Layout + indexes ───────────────────────────────────────────────────
  layoutGraph(nodes, childrenOf, byId, ROOT);

  const neighborsOf = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!neighborsOf.has(edge.source)) neighborsOf.set(edge.source, new Set());
    if (!neighborsOf.has(edge.target)) neighborsOf.set(edge.target, new Set());
    neighborsOf.get(edge.source)!.add(edge.target);
    neighborsOf.get(edge.target)!.add(edge.source);
  }

  return {
    nodes,
    edges,
    root: byId.get(ROOT)!,
    byId,
    childrenOf,
    neighborsOf,
    bounds: worldBounds(nodes),
  };
}

let cached: GraphModel | null = null;

/** Memoized model (the build is pure + deterministic). */
export function getGraphModel(): GraphModel {
  if (!cached) cached = buildGraphModel();
  return cached;
}
