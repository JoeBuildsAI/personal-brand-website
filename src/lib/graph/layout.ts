import type { Bounds, GraphModel, GraphNode, NodeLevel } from "./types";

/**
 * Deterministic radial layout. The identity sits at the origin; domains orbit
 * it in a ring; each domain's systems fan outward from it; each system's
 * artifacts fan outward again. This produces the "solar system / galaxy" feel
 * without any physics simulation, so it is stable and SSR-safe.
 */

const RING_DOMAIN = 1320; // domain distance from center
const RING_SYSTEM = 820; // system distance from its domain
const RING_ARTIFACT = 420; // artifact distance from its system

const BASE_RADIUS: Record<NodeLevel, number> = {
  1: 96,
  2: 58,
  3: 30,
  4: 16,
};

function fanOffsets(count: number, maxSpread: number, perGap: number): number[] {
  if (count <= 1) return [0];
  const spread = Math.min(maxSpread, perGap * (count - 1));
  const step = spread / (count - 1);
  return Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * step);
}

export function layoutGraph(
  nodes: GraphNode[],
  childrenOf: Map<string, string[]>,
  byId: Map<string, GraphNode>,
  rootId: string,
): void {
  for (const node of nodes) node.r = BASE_RADIUS[node.level];

  const root = byId.get(rootId);
  if (!root) return;
  root.x = 0;
  root.y = 0;

  const domains = (childrenOf.get(rootId) ?? []).map((id) => byId.get(id)!);
  const domainStep = (Math.PI * 2) / Math.max(domains.length, 1);

  domains.forEach((domain, di) => {
    // Start at the top (−90°) and go clockwise.
    const a = -Math.PI / 2 + di * domainStep;
    domain.x = Math.cos(a) * RING_DOMAIN;
    domain.y = Math.sin(a) * RING_DOMAIN;

    const systems = (childrenOf.get(domain.id) ?? []).map((id) => byId.get(id)!);
    const sysOffsets = fanOffsets(systems.length, 2.0, 0.46);

    systems.forEach((system, si) => {
      // Fan systems around the outward radial direction of the domain.
      const sa = a + sysOffsets[si];
      system.x = domain.x + Math.cos(sa) * RING_SYSTEM;
      system.y = domain.y + Math.sin(sa) * RING_SYSTEM;

      const artifacts = (childrenOf.get(system.id) ?? []).map(
        (id) => byId.get(id)!,
      );
      if (artifacts.length === 0) return;

      // Outward direction from the universe center to this system.
      const outward = Math.atan2(system.y, system.x);
      const artOffsets = fanOffsets(artifacts.length, 1.6, 0.52);
      artifacts.forEach((artifact, ai) => {
        const ga = outward + artOffsets[ai];
        artifact.x = system.x + Math.cos(ga) * RING_ARTIFACT;
        artifact.y = system.y + Math.sin(ga) * RING_ARTIFACT;
      });
    });
  });
}

export function worldBounds(nodes: GraphNode[]): Bounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x - n.r);
    minY = Math.min(minY, n.y - n.r);
    maxX = Math.max(maxX, n.x + n.r);
    maxY = Math.max(maxY, n.y + n.r);
  }
  return { minX, minY, maxX, maxY };
}

/**
 * Bounding box used to frame a node when it becomes the focus: the node itself
 * plus its children (and a touch of its parent for context).
 */
export function subtreeBounds(model: GraphModel, nodeId: string): Bounds {
  const node = model.byId.get(nodeId);
  if (!node) return model.bounds;

  const members: GraphNode[] = [node];
  for (const childId of model.childrenOf.get(nodeId) ?? []) {
    const child = model.byId.get(childId);
    if (child) members.push(child);
  }
  if (node.parentId) {
    const parent = model.byId.get(node.parentId);
    if (parent) members.push(parent);
  }
  return worldBounds(members);
}
