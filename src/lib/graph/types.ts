/**
 * Unified graph schema.
 *
 * Everything on the site is a NODE, and every connection is an EDGE. The
 * homepage "graph universe" is generated entirely from this model — there is no
 * hand-placed graph data. To change what appears in the universe, edit the
 * underlying content files (caseStudies, projects, products, writing, services,
 * journey); the model in `model.ts` derives nodes + relationships from them.
 *
 * Hierarchy (drill-down levels):
 *   L1 identity  → L2 domains → L3 systems → L4 artifacts
 */

export type NodeLevel = 1 | 2 | 3 | 4;

export type NodeKind = "identity" | "domain" | "system" | "artifact";

export type NodeTone = "brand" | "accent" | "violet" | "warm";

export interface GraphNode {
  id: string;
  level: NodeLevel;
  kind: NodeKind;
  label: string;
  tone: NodeTone;
  summary: string;
  /** Hierarchy parent (null only for the identity root). */
  parentId: string | null;
  /** Deep-linkable SEO page for this node, if any. */
  href?: string;
  /** True when href points to an external origin (opens in a new tab). */
  external?: boolean;
  /** Optional status badge (e.g. "In Production", "Prototype"). */
  status?: string;
  /** Optional headline metric (e.g. "-85% manual"). */
  metric?: string;
  /** Optional small descriptor (e.g. "4 systems", "6 min read"). */
  meta?: string;
  /** Normalized signal tags used to derive cross-cutting relation edges. */
  tags: string[];
  featured?: boolean;
  // ── Layout (assigned by layoutGraph) ──
  x: number;
  y: number;
  /** Base node radius in world units (depends on level). */
  r: number;
}

export type EdgeKind = "hierarchy" | "relation";

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  /** 0..1 visual weight. */
  strength: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface GraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
  root: GraphNode;
  byId: Map<string, GraphNode>;
  childrenOf: Map<string, string[]>;
  /** All nodes connected to a given node by any edge. */
  neighborsOf: Map<string, Set<string>>;
  bounds: Bounds;
}
