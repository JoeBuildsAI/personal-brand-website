"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getGraphModel } from "@/lib/graph/model";
import { subtreeBounds } from "@/lib/graph/layout";
import type { GraphNode, NodeTone } from "@/lib/graph/types";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { AtmosphereField } from "./AtmosphereField";

// WebGL enhancement layer — client-only, never server-rendered (keeps SSR
// output / SEO / hydration identical). Failure to load simply leaves the 2D
// AtmosphereField as the background.
const WebGLAtmosphere = dynamic(
  () => import("./WebGLAtmosphere").then((m) => m.WebGLAtmosphere),
  { ssr: false },
);

type Rect = { x: number; y: number; w: number; h: number };
type Tier = "focus" | "child" | "ancestor" | "sibling" | "grand" | "far";

const toneRGB: Record<NodeTone, string> = {
  brand: "129,148,255",
  accent: "95,227,206",
  violet: "155,135,245",
  warm: "245,201,123",
};

const dotBg: Record<NodeTone, string> = {
  brand: "bg-brand-400",
  accent: "bg-accent",
  violet: "bg-violet",
  warm: "bg-warm",
};

const haloBg: Record<NodeTone, string> = {
  brand: "bg-brand-400/30",
  accent: "bg-accent/30",
  violet: "bg-violet/30",
  warm: "bg-warm/30",
};

// Per-level visual scale (identity → domain → system → artifact). The identity
// is rendered as a bespoke core, so DOT_SIZE[0] is only a fallback.
const DOT_SIZE = ["h-5 w-5", "h-4 w-4", "h-2.5 w-2.5", "h-1.5 w-1.5"];
const HALO_SIZE = ["h-24 w-24", "h-20 w-20", "h-10 w-10", "h-6 w-6"];
// Domains read as architectural "layer" headings (uppercase, tracked out).
const LABEL_SIZE = [
  "text-xl font-bold uppercase tracking-[0.3em]",
  "text-[17px] font-bold uppercase tracking-[0.3em]",
  "text-[15px] font-semibold tracking-normal",
  "text-[12px] font-medium tracking-normal",
];
// Horizontal clearance (px) from the node CORE center to the start of the
// label, sized so text clears each level's largest ring and never sits on the
// rings or the inbound connecting lines.
const LABEL_GAP = [56, 50, 18, 12];

function buildPath(a: GraphNode, b: GraphNode, curve: number): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const off = len * curve;
  // Round to fixed precision so the serialized path is identical between SSR
  // and the browser — sub-ULP float differences in Math.hypot/cos/sin across
  // JS engines would otherwise cause a hydration mismatch on the `d` attribute.
  const f = (n: number) => n.toFixed(2);
  return `M ${f(a.x)} ${f(a.y)} Q ${f(mx + nx * off)} ${f(my + ny * off)} ${f(b.x)} ${f(b.y)}`;
}

export function GraphUniverse() {
  const model = useMemo(() => getGraphModel(), []);
  const reduce = useReducedMotion();
  const router = useRouter();

  const [focusId, setFocusId] = useState<string>(model.root.id);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  // Cinematic entry: pane visible on load, dismissed on CTA or first interaction.
  const [entered, setEntered] = useState(false);
  const [paneGone, setPaneGone] = useState(false);
  // Arrival: the focused destination + its pathways ignite briefly on entry.
  const [arrivingId, setArrivingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeEls = useRef<Map<string, HTMLButtonElement>>(new Map());
  const sizeRef = useRef({ w: 1, h: 1 });
  const camRef = useRef<Rect>({ x: 0, y: 0, w: 1, h: 1 });
  const targetRef = useRef<Rect>({ x: 0, y: 0, w: 1, h: 1 });
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef({ active: false, x: 0, y: 0, moved: false });
  const enteredRef = useRef(false);
  const arriveTimer = useRef<number | null>(null);
  const focusRef = useRef(focusId);
  const tweenRef = useRef({
    from: { x: 0, y: 0, w: 1, h: 1 } as Rect,
    to: { x: 0, y: 0, w: 1, h: 1 } as Rect,
    fromCx: 0,
    fromCy: 0,
    toCx: 0,
    toCy: 0,
    bump: 0,
    start: 0,
    dur: 0,
    active: false,
  });
  // Normalized camera center, read by the atmosphere layer for parallax depth.
  const parallaxRef = useRef({ x: 0, y: 0 });
  // Cinematic motion: flick momentum (vx/vy) + idle breathing drift (dx/dy/t).
  const motionRef = useRef({ vx: 0, vy: 0, dx: 0, dy: 0, t: Math.random() * 1000 });

  // Dismiss the cinematic entry pane: brighten/advance the graph immediately,
  // then unmount the pane once its fade-out has played.
  const dismiss = useCallback(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    setEntered(true);
    window.setTimeout(() => setPaneGone(true), 900);
  }, []);

  // ── Focus context (drives reveal + tab order) ──────────────────────────
  const ctx = useMemo(() => {
    const ancestors = new Set<string>();
    let cur: GraphNode | undefined = model.byId.get(focusId);
    const focusNode = cur;
    while (cur?.parentId) {
      ancestors.add(cur.parentId);
      cur = model.byId.get(cur.parentId);
    }
    const children = new Set(model.childrenOf.get(focusId) ?? []);
    const siblings = new Set(
      (focusNode?.parentId ? (model.childrenOf.get(focusNode.parentId) ?? []) : []).filter(
        (id) => id !== focusId,
      ),
    );
    const grandchildren = new Set<string>();
    children.forEach((cid) =>
      (model.childrenOf.get(cid) ?? []).forEach((g) => grandchildren.add(g)),
    );
    return { ancestors, children, siblings, grandchildren };
  }, [focusId, model]);

  const tierOf = useCallback(
    (id: string): Tier => {
      if (id === focusId) return "focus";
      if (ctx.children.has(id)) return "child";
      if (ctx.ancestors.has(id)) return "ancestor";
      if (ctx.siblings.has(id)) return "sibling";
      if (ctx.grandchildren.has(id)) return "grand";
      return "far";
    },
    [ctx, focusId],
  );

  // ── Camera framing ─────────────────────────────────────────────────────
  const cameraForNode = useCallback(
    (id: string): Rect => {
      const { w: W, h: H } = sizeRef.current;
      const aspect = W / H;
      // Mobile gets its own framing preset: much wider so the world reads as
      // massive and no giant cropped lines dominate the small viewport.
      const isMobile = W < 768;
      const node = model.byId.get(id) ?? model.root;

      // Root view — two distinct presets:
      //  • Entry (card visible): a wide establishing shot that frames the CORE
      //    and the full domain ring so the broader composition reads clearly
      //    behind the entry card.
      //  • Entered: a tighter, more immersive root view to travel from.
      if (id === model.root.id) {
        const dn = model.nodes.find((n) => n.level === 2);
        const base = dn ? Math.hypot(dn.x, dn.y) : 1320;
        if (!enteredRef.current) {
          // Fit a square of half-extent R (≈ the domain ring) into the viewport,
          // expanding the longer axis — correct for landscape AND portrait, so
          // mobile zooms out further and never shows giant cropped lines.
          const R = base * (isMobile ? 1.5 : 1.04);
          let cw = 2 * R;
          let ch = 2 * R;
          if (cw / ch < aspect) cw = ch * aspect;
          else ch = cw / aspect;
          return { x: -cw / 2, y: -ch / 2, w: cw, h: ch };
        }
        const cw = base * (isMobile ? 3.0 : 2.05);
        const ch = cw / aspect;
        return { x: -cw / 2, y: -ch / 2, w: cw, h: ch };
      }

      const b = subtreeBounds(model, id);
      const cx = (b.minX + b.maxX) / 2;
      const cy = (b.minY + b.maxY) / 2;
      const pad = node.level >= 4 ? 3.2 : node.level === 3 ? 2.1 : 1.6;
      const mobileMul = isMobile ? 1.5 : 1;
      let cw = (b.maxX - b.minX) * pad * mobileMul;
      let ch = (b.maxY - b.minY) * pad * mobileMul;
      const minW = (node.level >= 4 ? 680 : node.level === 3 ? 1040 : 1640) * mobileMul;
      cw = Math.max(cw, minW);
      ch = Math.max(ch, minW / aspect);
      if (cw / ch < aspect) cw = ch * aspect;
      else ch = cw / aspect;
      return { x: cx - cw / 2, y: cy - ch / 2, w: cw, h: ch };
    },
    [model],
  );

  const project = useCallback(() => {
    const { w: W } = sizeRef.current;
    const cam = camRef.current;
    const svg = svgRef.current;
    if (svg) svg.setAttribute("viewBox", `${cam.x} ${cam.y} ${cam.w} ${cam.h}`);
    // Feed the atmosphere layer a normalized camera center for parallax depth.
    parallaxRef.current.x = -(cam.x + cam.w / 2) / 1600;
    parallaxRef.current.y = -(cam.y + cam.h / 2) / 1600;
    const scale = W / cam.w;
    nodeEls.current.forEach((el, id) => {
      const n = model.byId.get(id);
      if (!n) return;
      const sx = (n.x - cam.x) * scale;
      const sy = (n.y - cam.y) * scale;
      el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
    });
  }, [model]);

  // Persistent cinematic loop. When a tween is active it runs an ease-in/out
  // move; otherwise it applies flick momentum and a subtle idle "breathing"
  // drift so the camera always feels alive. Fully disabled under reduced motion.
  const frame = useCallback(() => {
    const cam = camRef.current;
    const tw = tweenRef.current;
    const m = motionRef.current;

    if (tw.active) {
      const t = Math.min(1, (performance.now() - tw.start) / Math.max(tw.dur, 1));
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
      // Center-based travel with a mid-flight "pull-back": the camera rises up
      // over the world and descends into the destination, like flying there.
      const warp = 1 + tw.bump * Math.sin(Math.PI * t);
      const w = (tw.from.w + (tw.to.w - tw.from.w) * e) * warp;
      const h = (tw.from.h + (tw.to.h - tw.from.h) * e) * warp;
      const cx = tw.fromCx + (tw.toCx - tw.fromCx) * e;
      const cy = tw.fromCy + (tw.toCy - tw.fromCy) * e;
      cam.w = w;
      cam.h = h;
      cam.x = cx - w / 2;
      cam.y = cy - h / 2;
      if (t >= 1) {
        camRef.current = { ...tw.to };
        tw.active = false;
      }
      m.dx = 0; // reset drift baseline so it resumes without a jump
      m.dy = 0;
    } else if (!dragRef.current.active) {
      // Flick momentum.
      if (Math.abs(m.vx) > 0.05 || Math.abs(m.vy) > 0.05) {
        cam.x += m.vx;
        cam.y += m.vy;
        targetRef.current.x += m.vx;
        targetRef.current.y += m.vy;
        m.vx *= 0.9;
        m.vy *= 0.9;
      } else {
        m.vx = 0;
        m.vy = 0;
      }
      // Idle breathing drift — applied as per-frame deltas so it oscillates
      // around the resting position and never permanently wanders.
      m.t += 0.0009;
      const ax = Math.sin(m.t) * cam.w * 0.0022;
      const ay = Math.cos(m.t * 0.83) * cam.h * 0.0022;
      cam.x += ax - m.dx;
      cam.y += ay - m.dy;
      m.dx = ax;
      m.dy = ay;
    }

    project();
    rafRef.current = requestAnimationFrame(frame);
  }, [project]);

  const startLoop = useCallback(() => {
    if (!reduce && rafRef.current == null) {
      rafRef.current = requestAnimationFrame(frame);
    }
  }, [frame, reduce]);

  const flyTo = useCallback(
    (to: Rect, instant = false) => {
      targetRef.current = to;
      const cam = camRef.current;
      if (instant || reduce) {
        tweenRef.current.active = false;
        camRef.current = { ...to };
        project();
        return;
      }
      motionRef.current.vx = 0; // cancel any residual momentum
      motionRef.current.vy = 0;
      const fromCx = cam.x + cam.w / 2;
      const fromCy = cam.y + cam.h / 2;
      const toCx = to.x + to.w / 2;
      const toCy = to.y + to.h / 2;
      const move = Math.hypot(toCx - fromCx, toCy - fromCy) / Math.max(cam.w, 1);
      const zoom = Math.abs(Math.log((to.w || 1) / (cam.w || 1)));
      const ratio = Math.min(1, move * 0.9 + zoom * 0.55);
      tweenRef.current = {
        from: { ...cam },
        to,
        fromCx,
        fromCy,
        toCx,
        toCy,
        bump: Math.min(0.32, move * 0.32), // small arc — keeps fast travel smooth
        start: performance.now(),
        dur: 280 + ratio * 380, // ~280–660ms, responsive cinematic travel
        active: true,
      };
      startLoop();
    },
    [project, reduce, startLoop],
  );

  // ── Initial measure + paint (before browser paint to avoid flash) ──────
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      sizeRef.current = { w: Math.max(r.width, 1), h: Math.max(r.height, 1) };
    };
    measure();
    const initial = cameraForNode(model.root.id);
    targetRef.current = initial;
    camRef.current = { ...initial };
    project();
    setMounted(true);
    startLoop(); // begin idle breathing drift (no-op under reduced motion)

    const ro = new ResizeObserver(() => {
      measure();
      const to = cameraForNode(focusRef.current);
      targetRef.current = to;
      camRef.current = { ...to };
      project();
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-frame on focus change.
  useEffect(() => {
    focusRef.current = focusId;
    flyTo(cameraForNode(focusId));
    // Awaken the destination: ignition ring + pathway surge, cleared after the
    // camera settles so arrival feels like traveling into a living place.
    setArrivingId(focusId);
    if (arriveTimer.current) window.clearTimeout(arriveTimer.current);
    arriveTimer.current = window.setTimeout(() => setArrivingId(null), 1500);
    return () => {
      if (arriveTimer.current) window.clearTimeout(arriveTimer.current);
    };
  }, [focusId, cameraForNode, flyTo]);

  // On enter at the root, settle from the wide entry composition into the
  // tighter immersive root view (distinct framing for entry vs entered).
  useEffect(() => {
    if (!entered) return;
    if (focusId !== model.root.id) return;
    flyTo(cameraForNode(model.root.id));
  }, [entered, focusId, model.root.id, cameraForNode, flyTo]);

  // Pause the loop when the tab is hidden; resume on return. Always cancel on
  // unmount to avoid leaking an animation frame.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        if (rafRef.current != null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else {
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [startLoop]);

  // ── Pointer + wheel interactions (desktop power controls) ──────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      dismiss();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const base = camRef.current;
      const factor = Math.exp(e.deltaY * 0.0012);
      const wx = base.x + (px / rect.width) * base.w;
      const wy = base.y + (py / rect.height) * base.h;
      const span = model.bounds.maxX - model.bounds.minX;
      const nw = Math.min(Math.max(base.w * factor, 240), span * 1.8);
      const nh = nw * (rect.height / rect.width);
      flyTo({
        w: nw,
        h: nh,
        x: wx - (px / rect.width) * nw,
        y: wy - (py / rect.height) * nh,
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      dismiss();
      dragRef.current.moved = false;
      if (e.pointerType !== "mouse") {
        dragRef.current.active = false;
        return;
      }
      if ((e.target as HTMLElement).closest("[data-node],[data-ui]")) {
        dragRef.current.active = false;
        return;
      }
      dragRef.current = { active: true, x: e.clientX, y: e.clientY, moved: false };
    };
    const onPointerMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active) return;
      tweenRef.current.active = false; // hand control to the pointer
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
      d.x = e.clientX;
      d.y = e.clientY;
      const cam = camRef.current;
      const t = targetRef.current;
      const wdx = (dx / rect.width) * cam.w;
      const wdy = (dy / rect.height) * cam.h;
      cam.x -= wdx;
      cam.y -= wdy;
      t.x -= wdx;
      t.y -= wdy;
      // Record velocity so a flick keeps gliding after release (same direction).
      motionRef.current.vx = -wdx;
      motionRef.current.vy = -wdy;
      project();
    };
    const onPointerUp = () => {
      dragRef.current.active = false;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [model, project, flyTo, dismiss]);

  // ── Actions ────────────────────────────────────────────────────────────
  const navigate = useCallback(
    (node: GraphNode) => {
      if (!node.href) return;
      if (node.external) window.open(node.href, "_blank", "noopener,noreferrer");
      else router.push(node.href);
    },
    [router],
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (dragRef.current.moved) return;
      dismiss();
      const hasChildren = (model.childrenOf.get(node.id)?.length ?? 0) > 0;
      if (node.id === focusId) {
        if (!hasChildren && node.href) navigate(node);
        return;
      }
      setFocusId(node.id);
    },
    [focusId, model, navigate, dismiss],
  );

  const zoomOut = useCallback(() => {
    const node = model.byId.get(focusId);
    if (node?.parentId) setFocusId(node.parentId);
  }, [focusId, model]);

  const onBackgroundClick = useCallback(
    (e: ReactMouseEvent) => {
      if (dragRef.current.moved) return;
      const el = e.target as HTMLElement;
      if (el.closest("[data-node]") || el.closest("[data-ui]")) return;
      dismiss();
      zoomOut();
    },
    [zoomOut, dismiss],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      dismiss();
      if (e.key === "Escape" && focusId !== model.root.id) {
        e.preventDefault();
        zoomOut();
      }
    },
    [focusId, model.root.id, zoomOut, dismiss],
  );

  // ── Derived render data ────────────────────────────────────────────────
  const edgePaths = useMemo(
    () =>
      model.edges.map((edge) => {
        const a = model.byId.get(edge.source)!;
        const b = model.byId.get(edge.target)!;
        return {
          edge,
          d: buildPath(a, b, edge.kind === "relation" ? 0.18 : 0.07),
          tone: a.tone,
        };
      }),
    [model],
  );

  // Concentric "infrastructure layer" radii, derived from the live layout so
  // they stay in sync if the layout constants change.
  const rings = useMemo(() => {
    const d = model.nodes.find((n) => n.level === 2);
    // Rounded so the SSR-rendered circle radii match the browser exactly.
    const base = Math.round(d ? Math.hypot(d.x, d.y) : 660);
    return { core: Math.round(base * 0.46), domain: base, outer: Math.round(base * 1.62) };
  }, [model]);

  const spotlight = model.byId.get(hoverId ?? focusId) ?? model.root;
  const trail = useMemo(() => {
    const arr: GraphNode[] = [];
    let cur: GraphNode | undefined = model.byId.get(focusId);
    while (cur) {
      arr.unshift(cur);
      cur = cur.parentId ? model.byId.get(cur.parentId) : undefined;
    }
    return arr;
  }, [focusId, model]);

  const baseOpacity = (tier: Tier): number => {
    switch (tier) {
      case "focus":
        return 1;
      case "child":
        return 0.96;
      case "ancestor":
        return 0.62;
      case "sibling":
        return 0.5;
      case "grand":
        return 0.34;
      default:
        return 0.12;
    }
  };

  const atRoot = focusId === model.root.id;
  // The tone of the destination you're currently inside (its domain) tints the
  // whole environment, so every place has its own atmosphere.
  const placeTone: NodeTone = trail.find((n) => n.level === 2)?.tone ?? "brand";

  return (
    <div
      ref={containerRef}
      onClick={onBackgroundClick}
      onKeyDown={onKeyDown}
      className="relative h-full w-full cursor-grab touch-pan-y overflow-hidden bg-canvas active:cursor-grabbing"
      role="group"
      aria-label="Interactive systems graph. Use Tab to move between nodes, Enter to enter a node, and Escape to zoom out. A full text outline of every section follows below."
    >
      {/* ── Full-bleed environment ───────────────────────────────────────
          Lives OUTSIDE the transformed stage so it always fills the entire
          viewport — the entry scale/brightness no longer leaves edge or
          letterbox dead space. */}
      <div aria-hidden className="bg-deep-space pointer-events-none absolute inset-0" />
      {/* WebGL enhancement (deepest layer): bloom + soft volumetric depth.
          Sits behind the 2D field, which remains as the always-on fallback. */}
      <WebGLAtmosphere parallaxRef={parallaxRef} className="pointer-events-none" />
      <AtmosphereField parallaxRef={parallaxRef} className="pointer-events-none opacity-50" />
      {/* Per-destination atmosphere: the air takes on the colour of wherever
          you are, so each place feels distinct — no text required. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{
          background: `radial-gradient(120% 95% at 50% 42%, rgba(${toneRGB[placeTone]},0.24), rgba(${toneRGB[placeTone]},0.07) 45%, transparent 72%)`,
          opacity: atRoot ? 0.5 : 1,
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" />

      {/* ── Graph stage: scales/brightens the GRAPH forward on entry.
          Only the (transparent) graph content is transformed, so the
          environment above always covers the full viewport. */}
      <div
        className={cn(
          "absolute inset-0 origin-center transition-[transform,filter] ease-out",
          reduce ? "duration-700" : "duration-[1100ms]",
          entered || reduce
            ? "scale-100 brightness-100"
            : "scale-[0.97] brightness-[0.85]",
        )}
      >

      {/* ── Connection lattice (world-space, shares the camera viewBox) ── */}
      <svg
        ref={svgRef}
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-1000",
          mounted ? "opacity-100" : "opacity-0",
        )}
      >
        <defs>
          <radialGradient id="gu-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(150,168,255,0.62)" />
            <stop offset="26%" stopColor="rgba(95,227,206,0.2)" />
            <stop offset="100%" stopColor="rgba(6,7,12,0)" />
          </radialGradient>
        </defs>

        {/* Core glow — anchored to the identity in world space (two layers) */}
        <circle
          cx={model.root.x}
          cy={model.root.y}
          r={Math.round(rings.domain * 1.05)}
          fill="url(#gu-core)"
          opacity={atRoot ? 1 : 0.55}
          className={cn(!reduce && "animate-core-pulse")}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <circle
          cx={model.root.x}
          cy={model.root.y}
          r={rings.core}
          fill="url(#gu-core)"
          opacity={atRoot ? 1 : 0.55}
          className={cn(!reduce && "animate-pulse-node")}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />

        {/* Precision connection lines + flowing data + energy packets */}
        {edgePaths.map(({ edge, d, tone }, idx) => {
          const st = tierOf(edge.source);
          const tt = tierOf(edge.target);
          const bothNear = st !== "far" && tt !== "far";
          const strongPair =
            (st === "focus" || st === "child" || st === "ancestor") &&
            (tt === "focus" || tt === "child" || tt === "ancestor");
          const activeEdge =
            hoverId != null && (edge.source === hoverId || edge.target === hoverId);
          const arrivingEdge =
            arrivingId != null && (edge.source === arrivingId || edge.target === arrivingId);
          const isRel = edge.kind === "relation";
          let op = isRel ? (bothNear ? 0.16 : 0.05) : bothNear ? 0.36 : 0.08;
          if (activeEdge) op = isRel ? 0.55 : 0.88;
          if (arrivingEdge) op = Math.max(op, isRel ? 0.5 : 0.95);
          return (
            <g key={edge.id}>
              <path
                id={edge.id}
                d={d}
                fill="none"
                stroke={`rgba(${toneRGB[tone]}, ${op})`}
                strokeWidth={(isRel ? 1.2 : 2.6) + (activeEdge ? 1.2 : 0)}
                strokeLinecap="round"
                strokeDasharray={isRel ? "3 7" : undefined}
                vectorEffect="non-scaling-stroke"
                className={cn(
                  activeEdge && !reduce && "animate-trace-flow",
                  arrivingEdge && !reduce && "animate-surge",
                )}
              />
              {!isRel && bothNear && !reduce ? (
                <path
                  d={d}
                  fill="none"
                  stroke={`rgba(${toneRGB[tone]}, ${activeEdge ? 1 : 0.75})`}
                  strokeWidth={activeEdge ? 3.4 : 2.6}
                  strokeLinecap="round"
                  strokeDasharray="1 6"
                  vectorEffect="non-scaling-stroke"
                  className="animate-stream-flow"
                />
              ) : null}
              {!isRel && strongPair && !reduce ? (
                <circle r={activeEdge ? 14 : 9} fill={`rgba(${toneRGB[tone]}, ${activeEdge ? 1 : 0.98})`}>
                  <animateMotion
                    dur={`${4.5 + (idx % 5) * 0.8}s`}
                    begin={`-${(idx % 7) * 0.7}s`}
                    repeatCount="indefinite"
                  >
                    <mpath href={`#${edge.id}`} />
                  </animateMotion>
                </circle>
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-700",
          mounted ? "opacity-100" : "opacity-0",
        )}
      >
        {model.nodes.map((node) => {
          const tier = tierOf(node.id);
          const isHover = hoverId === node.id;
          const isNeighbor =
            hoverId != null && model.neighborsOf.get(hoverId)?.has(node.id);
          let opacity = baseOpacity(tier);
          if (hoverId != null) {
            if (isHover) opacity = 1;
            else if (isNeighbor) opacity = Math.max(opacity, 0.85);
            else opacity *= 0.55;
          }
          const revealed = tier === "focus" || tier === "child" || tier === "ancestor";
          // Mystery by default: only the core, the six domains, the active focus
          // and its children stay labeled — the rest reveals on hover/neighbor.
          const showLabel =
            node.level <= 2 ||
            tier === "focus" ||
            tier === "child" ||
            isHover ||
            Boolean(isNeighbor);
          const emphasized = isHover || tier === "focus";
          const li = node.level - 1;
          // Place the label on the side pointing OUTWARD from the parent so
          // labels radiate away from the hub — clear of the inbound lines and
          // of sibling labels on the far side.
          const parentNode = node.parentId ? model.byId.get(node.parentId) : undefined;
          const outwardRight = parentNode ? node.x >= parentNode.x : true;
          return (
            <button
              key={node.id}
              type="button"
              data-node
              ref={(el) => {
                if (el) nodeEls.current.set(node.id, el);
                else nodeEls.current.delete(node.id);
              }}
              tabIndex={revealed ? 0 : -1}
              aria-label={`${node.label}${node.meta ? `, ${node.meta}` : ""}`}
              onClick={() => handleNodeClick(node)}
              onPointerEnter={() => setHoverId(node.id)}
              onPointerLeave={() => setHoverId((h) => (h === node.id ? null : h))}
              onFocus={() => setHoverId(node.id)}
              onBlur={() => setHoverId((h) => (h === node.id ? null : h))}
              style={{ left: 0, top: 0, opacity, willChange: "transform" }}
              className={cn(
                "pointer-events-auto absolute select-none rounded-full outline-none transition-opacity duration-300",
                "focus-visible:ring-2 focus-visible:ring-brand-400/70",
              )}
            >
              <span className="relative grid place-items-center">
                {arrivingId === node.id && !reduce ? (
                  <span
                    aria-hidden
                    className="absolute rounded-full border-2 animate-ignite"
                    style={{
                      width: node.level <= 2 ? 88 : 52,
                      height: node.level <= 2 ? 88 : 52,
                      borderColor: `rgba(${toneRGB[node.tone]},0.85)`,
                      boxShadow: `0 0 30px rgba(${toneRGB[node.tone]},0.55)`,
                    }}
                  />
                ) : null}
                {node.kind === "identity" ? (
                  <>
                    <span
                      aria-hidden
                      className={cn(
                        "absolute h-32 w-32 rounded-full border border-brand-400/25",
                        !reduce && "animate-core-pulse",
                      )}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "absolute h-24 w-24 rounded-full bg-brand-500/45 blur-lg",
                        !reduce && "animate-pulse-node",
                      )}
                    />
                    <span
                      className="relative h-6 w-6 rounded-full bg-gradient-to-br from-brand-100 via-brand-300 to-accent shadow-node ring-2 ring-white/50"
                      style={{ boxShadow: "0 0 28px rgba(129,148,255,0.7), 0 0 10px rgba(255,255,255,0.5)" }}
                    />
                  </>
                ) : node.kind === "domain" ? (
                  <>
                    {/* Outer breathing aura — domains are enormous destinations */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute h-44 w-44 rounded-full blur-2xl",
                        haloBg[node.tone],
                        emphasized ? "opacity-100" : "opacity-90",
                        !reduce && "animate-breathe",
                      )}
                    />
                    {/* Outer structural ring — reads as a station perimeter */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute h-28 w-28 rounded-full border",
                        emphasized ? "border-white/20" : "border-white/[0.08]",
                      )}
                    />
                    {/* Rotating operational ring */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute h-20 w-20 rounded-full border border-dashed",
                        emphasized ? "border-white/30" : "border-white/[0.14]",
                        !reduce && "animate-spin-slow",
                      )}
                    />
                    {/* Crisp inner ring */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute h-12 w-12 rounded-full border",
                        emphasized ? "border-white/35" : "border-white/[0.16]",
                      )}
                    />
                    {/* Core orb */}
                    <span
                      className={cn(
                        "relative h-7 w-7 rounded-full shadow-node ring-1 ring-white/50",
                        dotBg[node.tone],
                      )}
                      style={{
                        boxShadow: `0 0 ${emphasized ? 34 : 22}px rgba(${toneRGB[node.tone]},${emphasized ? 0.8 : 0.5})`,
                      }}
                    />
                  </>
                ) : (
                  <>
                    <span
                      aria-hidden
                      className={cn(
                        "absolute rounded-full blur-md",
                        HALO_SIZE[li],
                        haloBg[node.tone],
                        emphasized ? "opacity-100" : "opacity-55",
                        !reduce && (emphasized || revealed) && "animate-pulse-node",
                      )}
                    />
                    <span
                      className={cn(
                        "relative rounded-full ring-1 ring-white/20 transition-shadow duration-300",
                        DOT_SIZE[li],
                        dotBg[node.tone],
                        emphasized && "shadow-node",
                      )}
                    />
                  </>
                )}
                {/* Label is anchored to the CORE center (top-1/2 + translateY)
                    and offset purely horizontally, so it never shifts the core
                    or its rings off the projected node coordinate. */}
                {showLabel ? (
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap",
                      outwardRight ? "left-full text-left" : "right-full text-right",
                      LABEL_SIZE[li],
                      tier === "far" && !isHover && !isNeighbor
                        ? "text-ink-subtle"
                        : node.level === 4
                          ? "text-ink-muted"
                          : "text-ink",
                    )}
                    style={{
                      marginLeft: outwardRight ? LABEL_GAP[li] : undefined,
                      marginRight: outwardRight ? undefined : LABEL_GAP[li],
                      textShadow: `0 1px 12px rgba(0,0,0,0.92), 0 0 22px rgba(${toneRGB[node.tone]},0.22)`,
                    }}
                  >
                    {node.label}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cinematic edge frame (vignette + top/bottom scrims) */}
      <div aria-hidden className="graph-frame pointer-events-none absolute inset-0" />
      </div>
      {/* end graph stage */}

      {/* ── Overlay UI ─────────────────────────────────────────────────── */}

      {/* Breadcrumb + intro (top-left) */}
      <div
        data-ui
        className="pointer-events-none absolute left-0 right-0 top-0 p-5 sm:p-7"
      >
        <nav
          aria-label="Graph location"
          className="pointer-events-auto inline-flex max-w-[86vw] items-center gap-2 rounded-full border border-hairline/70 bg-canvas/50 px-3 py-1.5 font-mono text-2xs uppercase tracking-[0.18em] text-ink-subtle backdrop-blur"
        >
          <span
            aria-hidden
            className={cn("h-1.5 w-1.5 shrink-0 rounded-full bg-accent", !reduce && "animate-pulse-node")}
            style={{ boxShadow: "0 0 8px rgba(95,227,206,0.9)" }}
          />
          {trail.map((node, index) => (
            <span key={node.id} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden className="text-ink-subtle/40">/</span> : null}
              <button
                type="button"
                onClick={() => setFocusId(node.id)}
                className={cn(
                  "max-w-[10rem] truncate rounded transition-colors hover:text-ink",
                  index === trail.length - 1 ? "text-ink" : "text-ink-muted",
                )}
              >
                {node.label}
              </button>
            </span>
          ))}
        </nav>
        {atRoot && paneGone ? (
          <div
            className={cn(
              "pointer-events-none mt-5 transition-opacity duration-700",
              hoverId ? "opacity-0" : "opacity-100",
            )}
          >
            <p className="font-mono text-2xs uppercase tracking-[0.34em] text-accent/70">
              Systems Operating Layer
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-subtle">
              Enter anywhere
            </p>
          </div>
        ) : null}
      </div>

      {/* Controls (top-right) */}
      {!atRoot ? (
        <div
          data-ui
          className="pointer-events-auto absolute right-4 top-4 flex items-center gap-1.5 sm:right-6 sm:top-6"
        >
          <button
            type="button"
            onClick={zoomOut}
            className="flex items-center gap-1.5 rounded-full border border-hairline/70 bg-canvas/50 px-3 py-1.5 font-mono text-2xs uppercase tracking-[0.16em] text-ink-muted backdrop-blur transition-colors hover:border-hairline-strong hover:text-ink"
          >
            <span aria-hidden className="text-ink-subtle">↑</span>
            Zoom out
          </button>
          <button
            type="button"
            onClick={() => setFocusId(model.root.id)}
            className="rounded-full border border-hairline/70 bg-canvas/50 px-3 py-1.5 font-mono text-2xs uppercase tracking-[0.16em] text-ink-muted backdrop-blur transition-colors hover:border-hairline-strong hover:text-ink"
          >
            Reset
          </button>
        </div>
      ) : null}

      {/* Metadata panel (bottom-left on desktop, bottom sheet on mobile) */}
      <div
        data-ui
        className="pointer-events-auto absolute inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[22rem]"
      >
        <div className="glass-strong relative overflow-hidden rounded-2xl border border-hairline p-4 shadow-card sm:p-5">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(${toneRGB[spotlight.tone]},0.7), transparent)`,
            }}
          />
          <h2 className="flex items-center gap-2.5 text-pretty text-lg font-semibold leading-snug tracking-tight text-ink">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor: `rgb(${toneRGB[spotlight.tone]})`,
                boxShadow: `0 0 12px rgba(${toneRGB[spotlight.tone]},0.95)`,
              }}
            />
            {spotlight.label}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {spotlight.summary}
          </p>

          {spotlight.href ? (
            <div className="mt-4 border-t border-hairline/70 pt-3.5">
              {spotlight.external ? (
                <a
                  href={spotlight.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-200 transition-colors hover:text-brand-100"
                >
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <Link
                  href={spotlight.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-200 transition-colors hover:text-brand-100"
                >
                  Enter
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Hint (bottom-right, desktop) */}
      <div
        data-ui
        className={cn(
          "pointer-events-none absolute bottom-6 right-6 hidden text-right font-mono text-2xs uppercase tracking-[0.16em] text-ink-subtle transition-opacity duration-700 lg:block",
          atRoot && !hoverId && paneGone ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="text-ink-muted">Drag</span> to explore ·{" "}
        <span className="text-ink-muted">click</span> to enter
      </div>

      {/* ── Cinematic entry pane (glass control gateway) ──────────────── */}
      {!paneGone ? (
        <div
          aria-hidden={entered}
          className={cn(
            "absolute inset-0 z-30 flex items-center justify-center px-6",
            "transition-opacity",
            reduce ? "duration-500" : "duration-[800ms]",
            entered ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <div
            className={cn(
              "glass-strong relative w-full max-w-xl overflow-hidden rounded-[28px] border border-brand-300/20 px-9 py-12 text-center sm:px-14 sm:py-16",
              "shadow-[0_40px_140px_-24px_rgba(8,11,32,0.95),0_0_70px_-12px_rgba(129,148,255,0.4)]",
              "transition-[transform,opacity] ease-out",
              reduce ? "duration-500" : "duration-[800ms]",
              entered
                ? "-translate-y-2 scale-[0.97] opacity-0"
                : "translate-y-0 scale-100 opacity-100",
            )}
          >
            {/* Inner bloom for depth */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(130% 90% at 50% -10%, rgba(129,148,255,0.22), transparent 58%)",
              }}
            />
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/80 to-transparent"
            />
            <p className="relative font-mono text-2xs uppercase tracking-[0.36em] text-accent/80">
              Systems Operating Layer
            </p>
            <p className="relative mt-6 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl">
              I build systems that turn chaos into infrastructure.
            </p>
            <p className="relative mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-ink-muted">
              Explore the operating layer behind my work.
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="group relative mt-9 inline-flex items-center gap-2 rounded-full border border-brand-400/50 bg-brand-500/20 px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-brand-50 shadow-node outline-none backdrop-blur transition-all hover:border-brand-300/80 hover:bg-brand-500/30 focus-visible:ring-2 focus-visible:ring-brand-400/70"
            >
              Enter Site
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="relative mt-6 font-mono text-2xs uppercase tracking-[0.2em] text-ink-subtle">
              Continue into the system.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
