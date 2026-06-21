"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Parallax = { x: number; y: number };

type Particle = {
  x: number; // normalized 0..1
  y: number;
  vx: number; // normalized units / second
  vy: number;
  r: number; // px radius
  a: number; // base alpha
  depth: number; // parallax depth factor
  hue: [number, number, number];
};

type Spark = {
  fx: number; // from (normalized)
  fy: number;
  tx: number; // to (normalized)
  ty: number;
  t: number; // 0..1 progress
  speed: number;
  hue: [number, number, number];
};

type Cluster = {
  x: number; // normalized center (can sit slightly off-screen)
  y: number;
  depth: number;
  hue: [number, number, number];
  dots: Array<{ x: number; y: number; r: number }>; // offsets in normalized units
  act: number; // activation energy 0..1 (decays over time)
  ring: number; // awakening ring elapsed ms; RING_OFF when inactive
};

// An autonomous data packet travelling between two distant hubs (clusters).
type Packet = {
  a: number; // from cluster index
  b: number; // to cluster index
  t: number; // 0..1 progress
  speed: number; // progress per second
  hue: [number, number, number];
  hops: number; // propagation depth
};

// Rare environmental events: a pulse wave that crosses the network with an
// origin ignition flash. Infrequent (every ~20–60s) so the world feels alive
// even when the user is idle — "did I just see that?".
type Pulse = {
  x: number;
  y: number;
  t: number; // elapsed ms
  dur: number;
  max: number; // max radius as a fraction of max(W,H)
  hue: [number, number, number];
};

const HUES: Array<[number, number, number]> = [
  [129, 148, 255], // brand
  [95, 227, 206], // accent
  [155, 135, 245], // violet
  [210, 220, 255], // pale starlight
];

const LAYERS = [
  { depth: 0.1, count: 0.5, rMin: 0.5, rMax: 1.5, aMin: 0.14, aMax: 0.5, speed: 0.004 },
  { depth: 0.28, count: 0.44, rMin: 0.7, rMax: 2.1, aMin: 0.2, aMax: 0.64, speed: 0.0075 },
  { depth: 0.5, count: 0.32, rMin: 1.0, rMax: 3.0, aMin: 0.26, aMax: 0.8, speed: 0.012 },
  { depth: 0.78, count: 0.18, rMin: 1.4, rMax: 4.2, aMin: 0.28, aMax: 0.88, speed: 0.018 },
];

/**
 * Volumetric atmosphere behind the graph: parallax particle strata, faint
 * neural filaments in the far field, slow drifting light fog, and occasional
 * signal sparks. Pure canvas — no DOM churn, DPR-aware, visibility-paused, and
 * fully static under prefers-reduced-motion.
 */
export function AtmosphereField({
  parallaxRef,
  className,
}: {
  parallaxRef?: React.RefObject<Parallax>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = 1;
    let H = 1;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();

    const particles: Particle[] = [];
    const sparks: Spark[] = [];
    const clusters: Cluster[] = [];
    const pulses: Pulse[] = [];
    const packets: Packet[] = [];
    let nextEvent = 0;
    // Autonomous "system" schedulers: the network behaves on its own so the
    // scene feels like a massive system operating even when idle.
    let nextPacket = 0;
    let nextAwake = 0;
    let nextSync = 0;
    const RING_OFF = Number.POSITIVE_INFINITY;
    const RING_DUR = 1700;
    const KSYS = 130;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const build = () => {
      particles.length = 0;
      const area = W * H;
      const density = Math.min(2.0, Math.max(0.7, area / 1_000_000));
      for (const layer of LAYERS) {
        const n = Math.round(layer.count * 300 * density);
        for (let i = 0; i < n; i++) {
          const hue =
            Math.random() < 0.78
              ? HUES[3]
              : HUES[Math.floor(Math.random() * 3)];
          particles.push({
            x: Math.random(),
            y: Math.random(),
            vx: rand(-1, 1) * layer.speed,
            vy: rand(-1, 1) * layer.speed,
            r: rand(layer.rMin, layer.rMax),
            a: rand(layer.aMin, layer.aMax),
            depth: layer.depth,
            hue,
          });
        }
      }
      sparks.length = 0;
      const sparkCount = Math.round(22 * density);
      for (let i = 0; i < sparkCount; i++) sparks.push(spawnSpark());

      // Distant systems — faint clusters biased toward the edges so the world
      // reads as far larger than the viewport (partial objects beyond frame).
      clusters.length = 0;
      for (let i = 0; i < 16; i++) {
        const onLeft = Math.random() < 0.5;
        const cx = onLeft ? rand(-0.14, 0.16) : rand(0.84, 1.14);
        const cy = rand(-0.12, 1.12);
        const spread = rand(0.035, 0.085);
        const dn = 9 + Math.floor(Math.random() * 9);
        const dots = Array.from({ length: dn }, () => ({
          x: rand(-spread, spread),
          y: rand(-spread, spread),
          r: rand(0.6, 1.7),
        }));
        clusters.push({
          x: cx,
          y: cy,
          depth: rand(0.07, 0.18),
          hue: HUES[Math.floor(Math.random() * 3)],
          dots,
          act: 0,
          ring: RING_OFF,
        });
      }
    };

    function spawnPulse() {
      pulses.push({
        x: rand(0.18, 0.82),
        y: rand(0.24, 0.72),
        t: 0,
        dur: rand(3400, 4600),
        max: rand(1.05, 1.6),
        hue: HUES[Math.floor(Math.random() * 3)],
      });
    }

    const clusterPos = (cl: Cluster, par: Parallax) => ({
      x: cl.x * W + par.x * cl.depth * KSYS,
      y: cl.y * H + par.y * cl.depth * KSYS,
    });

    const randCluster = () => Math.floor(Math.random() * clusters.length);

    function emitPacket(from: number, hops = 0) {
      if (clusters.length < 2 || packets.length > 18) return;
      let to = randCluster();
      if (to === from) to = (to + 1) % clusters.length;
      packets.push({
        a: from,
        b: to,
        t: 0,
        speed: rand(0.22, 0.46),
        hue: clusters[from].hue,
        hops,
      });
    }

    // A distant hub awakens: it brightens, fires an expanding ring, and routes
    // a few packets out to neighbours (pathway energy propagation).
    function awaken(i: number) {
      const cl = clusters[i];
      if (!cl) return;
      cl.act = 1;
      cl.ring = 0;
      const fanout = 1 + Math.floor(Math.random() * 3);
      for (let k = 0; k < fanout; k++) emitPacket(i);
    }

    // Network synchronization: a cascade of awakenings and overlapping waves.
    function synchronize() {
      const n = Math.min(8, clusters.length);
      for (let k = 0; k < n; k++) {
        const idx = randCluster();
        clusters[idx].act = Math.max(clusters[idx].act, 0.85);
        clusters[idx].ring = -k * 80; // staggered ring ignition
        if (Math.random() < 0.5) emitPacket(idx);
      }
      spawnPulse();
      if (Math.random() < 0.6) spawnPulse();
    }

    const updateSystem = (time: number, animate: boolean, dt: number) => {
      if (animate) {
        if (nextAwake === 0) nextAwake = time + rand(1800, 4200);
        if (time >= nextAwake) {
          awaken(randCluster());
          nextAwake = time + rand(4500, 10000);
        }
        if (nextPacket === 0) nextPacket = time + rand(1200, 3000);
        if (time >= nextPacket) {
          emitPacket(randCluster());
          nextPacket = time + rand(2200, 5200);
        }
        if (nextSync === 0) nextSync = time + rand(22000, 40000);
        if (time >= nextSync) {
          synchronize();
          nextSync = time + rand(38000, 80000);
        }
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const pk = packets[i];
        if (animate) pk.t += (pk.speed * dt) / 1000;
        if (pk.t >= 1) {
          const target = clusters[pk.b];
          if (target) {
            target.act = 1;
            target.ring = 0;
          }
          // Pathway propagation: a chance the signal continues onward.
          if (pk.hops < 2 && Math.random() < 0.5) emitPacket(pk.b, pk.hops + 1);
          packets.splice(i, 1);
        }
      }
      for (const cl of clusters) {
        if (cl.act > 0) cl.act = Math.max(0, cl.act - dt / 2400);
        if (cl.ring !== RING_OFF) {
          cl.ring += dt;
          if (cl.ring > RING_DUR) cl.ring = RING_OFF;
        }
      }
    };

    const drawSystem = (par: Parallax) => {
      const maxR = Math.max(W, H);
      ctx.globalCompositeOperation = "lighter";
      // Awakening rings around recently activated hubs.
      for (const cl of clusters) {
        if (cl.ring === RING_OFF || cl.ring < 0) continue;
        const prog = cl.ring / RING_DUR;
        const p = clusterPos(cl, par);
        const rad = prog * maxR * 0.15;
        const fade = Math.sin(prog * Math.PI);
        const [r, g, b] = cl.hue;
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.35 * fade})`;
        ctx.lineWidth = 1.6 * (1 - prog) + 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Packets racing hub-to-hub, brightening their pathway as they go.
      for (const pk of packets) {
        const a = clusters[pk.a];
        const b = clusters[pk.b];
        if (!a || !b) continue;
        const pa = clusterPos(a, par);
        const pb = clusterPos(b, par);
        const x = pa.x + (pb.x - pa.x) * pk.t;
        const y = pa.y + (pb.y - pa.y) * pk.t;
        const [r, g, b2] = pk.hue;
        const fade = Math.sin(Math.min(1, pk.t) * Math.PI) * 0.6 + 0.4;
        ctx.strokeStyle = `rgba(${r},${g},${b2},${0.05 + 0.06 * fade})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
        const gr = 7;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, gr);
        glow.addColorStop(0, `rgba(${r},${g},${b2},${0.75 * fade})`);
        glow.addColorStop(1, `rgba(${r},${g},${b2},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, gr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(240,244,255,${0.9 * fade})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    function spawnSpark(): Spark {
      const fx = Math.random();
      const fy = Math.random();
      const ang = Math.random() * Math.PI * 2;
      const dist = rand(0.08, 0.22);
      const hue = HUES[Math.floor(Math.random() * 3)];
      return {
        fx,
        fy,
        tx: fx + Math.cos(ang) * dist,
        ty: fy + Math.sin(ang) * dist,
        t: Math.random(),
        speed: rand(0.08, 0.2),
        hue,
      };
    }

    const resize = () => {
      // Use layout size (clientWidth/Height), which is independent of any CSS
      // transform on ancestors — so the canvas always covers the full element
      // even while the graph stage is mid-entry-scale (no edge dead space).
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, parent.clientWidth);
      H = Math.max(1, parent.clientHeight);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) build();
    };

    const mod = (v: number, m: number) => ((v % m) + m) % m;

    const drawFog = (time: number) => {
      const blobs: Array<{ cx: number; cy: number; hue: [number, number, number]; a: number; r: number }> = [
        { cx: 0.3 + Math.sin(time * 0.00007) * 0.08, cy: 0.32 + Math.cos(time * 0.00005) * 0.07, hue: HUES[0], a: 0.29, r: 0.72 },
        { cx: 0.72 + Math.cos(time * 0.00006) * 0.07, cy: 0.64 + Math.sin(time * 0.00008) * 0.06, hue: HUES[1], a: 0.21, r: 0.64 },
        { cx: 0.55 + Math.sin(time * 0.00004) * 0.06, cy: 0.48 + Math.cos(time * 0.00007) * 0.06, hue: HUES[2], a: 0.17, r: 0.8 },
        { cx: 0.5 + Math.cos(time * 0.00003) * 0.05, cy: 0.12 + Math.sin(time * 0.00006) * 0.04, hue: HUES[0], a: 0.14, r: 0.56 },
        { cx: 0.16 + Math.sin(time * 0.00005) * 0.05, cy: 0.82 + Math.cos(time * 0.00004) * 0.05, hue: HUES[1], a: 0.12, r: 0.6 },
        { cx: 0.84 + Math.sin(time * 0.00009) * 0.06, cy: 0.22 + Math.cos(time * 0.00006) * 0.05, hue: HUES[2], a: 0.13, r: 0.5 },
        { cx: 0.38 + Math.cos(time * 0.00008) * 0.07, cy: 0.78 + Math.sin(time * 0.00005) * 0.06, hue: HUES[0], a: 0.12, r: 0.62 },
      ];
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        const cx = b.cx * W;
        const cy = b.cy * H;
        const rad = b.r * Math.max(W, H);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const [r, gn, bl] = b.hue;
        g.addColorStop(0, `rgba(${r},${gn},${bl},${b.a})`);
        g.addColorStop(1, `rgba(${r},${gn},${bl},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const drawFrame = (time: number, animate: boolean) => {
      const dt = animate ? Math.min(48, time - last) : 0;
      last = time;
      ctx.clearRect(0, 0, W, H);

      const par = parallaxRef?.current ?? { x: 0, y: 0 };
      const K = 130;

      updateSystem(time, animate, dt);
      drawFog(time);
      drawArchitecture(time, par);
      drawSystem(par);
      drawEvents(time, animate, dt);

      // Far-field neural filaments (first/farthest layer only).
      const far = particles.filter((p) => p.depth < 0.2);
      const offFarX = par.x * 0.12 * K;
      const offFarY = par.y * 0.12 * K;
      const thresh = Math.min(W, H) * 0.16;
      ctx.lineWidth = 1;
      for (let i = 0; i < far.length; i++) {
        const a = far[i];
        const ax = mod(a.x * W + offFarX, W);
        const ay = mod(a.y * H + offFarY, H);
        for (let j = i + 1; j < far.length; j++) {
          const b = far[j];
          const bx = mod(b.x * W + offFarX, W);
          const by = mod(b.y * H + offFarY, H);
          const dx = ax - bx;
          const dy = ay - by;
          const d2 = dx * dx + dy * dy;
          if (d2 > thresh * thresh) continue;
          const alpha = (1 - Math.sqrt(d2) / thresh) * 0.075;
          ctx.strokeStyle = `rgba(129,148,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }

      // Particle strata.
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        if (animate) {
          p.x = mod(p.x + (p.vx * dt) / 1000, 1);
          p.y = mod(p.y + (p.vy * dt) / 1000, 1);
        }
        const ox = par.x * p.depth * K;
        const oy = par.y * p.depth * K;
        const px = mod(p.x * W + ox, W);
        const py = mod(p.y * H + oy, H);
        const [r, g, b] = p.hue;
        ctx.fillStyle = `rgba(${r},${g},${b},${p.a})`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Signal sparks racing through the far field.
      for (const s of sparks) {
        if (animate) {
          s.t += (s.speed * dt) / 1000;
          if (s.t >= 1) Object.assign(s, spawnSpark());
        }
        const sx = mod((s.fx + (s.tx - s.fx) * s.t) * W + offFarX, W);
        const sy = mod((s.fy + (s.ty - s.fy) * s.t) * H + offFarY, H);
        const fade = Math.sin(Math.min(1, s.t) * Math.PI);
        const [r, g, b] = s.hue;
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 9);
        glow.addColorStop(0, `rgba(${r},${g},${b},${0.78 * fade})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx, sy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(235,240,255,${0.9 * fade})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const drawEvents = (time: number, animate: boolean, dt: number) => {
      if (animate) {
        if (nextEvent === 0) nextEvent = time + rand(3000, 8000);
        if (time >= nextEvent) {
          spawnPulse();
          // Occasionally fire a second pulse for layered, overlapping waves.
          if (Math.random() < 0.35) spawnPulse();
          nextEvent = time + rand(9000, 22000);
        }
      }
      if (pulses.length === 0) return;
      const maxR = Math.max(W, H);
      ctx.globalCompositeOperation = "lighter";
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        if (animate) p.t += dt;
        const prog = p.t / p.dur;
        if (prog >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const ease = 1 - Math.pow(1 - prog, 2.2); // fast then settle
        const rad = ease * p.max * maxR;
        const fade = Math.sin(prog * Math.PI); // rise then fall
        const cx = p.x * W;
        const cy = p.y * H;
        const [r, g, b] = p.hue;
        // Expanding shockwave ring.
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.28 * fade})`;
        ctx.lineWidth = 2.6 * (1 - prog) + 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.stroke();
        // Soft volumetric bloom riding the wavefront.
        const grad = ctx.createRadialGradient(cx, cy, rad * 0.72, cx, cy, rad);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.86, `rgba(${r},${g},${b},${0.1 * fade})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
        // Origin ignition flash in the first moment.
        if (prog < 0.22) {
          const f = 1 - prog / 0.22;
          const ir = maxR * 0.14;
          const ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, ir);
          ig.addColorStop(0, `rgba(${r},${g},${b},${0.5 * f})`);
          ig.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = ig;
          ctx.beginPath();
          ctx.arc(cx, cy, ir, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const drawArchitecture = (time: number, par: Parallax) => {
      const K = 130;
      const cx = W / 2 + par.x * 0.05 * K;
      const cy = H / 2 + par.y * 0.05 * K;
      const maxR = Math.max(W, H);
      ctx.globalCompositeOperation = "lighter";

      // Enormous slow structure arcs that bleed past every edge of the frame.
      const arcs = [
        { r: 0.46, a0: 0.2, a1: 2.5, hue: HUES[0], w: 2.0, spd: 0.000018, alpha: 0.15 },
        { r: 0.74, a0: 3.0, a1: 5.0, hue: HUES[2], w: 1.6, spd: -0.000012, alpha: 0.115 },
        { r: 1.04, a0: 1.0, a1: 2.7, hue: HUES[1], w: 2.0, spd: 0.0000095, alpha: 0.1 },
        { r: 1.36, a0: 4.0, a1: 6.0, hue: HUES[0], w: 1.6, spd: -0.000007, alpha: 0.08 },
      ];
      for (const arc of arcs) {
        const rot = time * arc.spd;
        const [r, g, b] = arc.hue;
        ctx.strokeStyle = `rgba(${r},${g},${b},${arc.alpha})`;
        ctx.lineWidth = arc.w;
        ctx.beginPath();
        ctx.arc(cx, cy, arc.r * maxR, arc.a0 + rot, arc.a1 + rot);
        ctx.stroke();
      }

      // Distant systems.
      for (const cl of clusters) {
        const bx = cl.x * W + par.x * cl.depth * K;
        const by = cl.y * H + par.y * cl.depth * K;
        const [r, g, b] = cl.hue;
        const gr = maxR * (0.13 + cl.act * 0.05);
        const glow = ctx.createRadialGradient(bx, by, 0, bx, by, gr);
        glow.addColorStop(0, `rgba(${r},${g},${b},${0.1 + cl.act * 0.55})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(bx - gr, by - gr, gr * 2, gr * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.07 + cl.act * 0.4})`;
        ctx.lineWidth = 0.6;
        const ox = bx + cl.dots[0].x * W;
        const oy = by + cl.dots[0].y * H;
        for (let i = 0; i < cl.dots.length; i++) {
          const d = cl.dots[i];
          const dx = bx + d.x * W;
          const dy = by + d.y * H;
          if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(dx, dy);
            ctx.stroke();
          }
          ctx.fillStyle = `rgba(${r},${g},${b},${0.32 + cl.act * 0.55})`;
          ctx.beginPath();
          ctx.arc(dx, dy, d.r * (1 + cl.act * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (time: number) => {
      drawFrame(time, true);
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) drawFrame(performance.now(), false);
    });
    ro.observe(parent);
    resize();

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (!reduce && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    if (reduce) {
      drawFrame(performance.now(), false);
    } else {
      raf = requestAnimationFrame(loop);
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce, parallaxRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
