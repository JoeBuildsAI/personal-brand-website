"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { Renderer, Program, Mesh, Geometry, Triangle, RenderTarget } from "ogl";

type Parallax = { x: number; y: number };

/**
 * Isolated WebGL enhancement layer (first slice).
 *
 * Purely additive, non-interactive background that sits BEHIND the SVG/HTML
 * graph. It never owns nodes, labels, clicks, routing, SEO, or a11y — those
 * stay in the SVG/HTML layer. WebGL is used only for atmospheric depth, soft
 * additive particles, and a thresholded bloom/glow pass.
 *
 * Hardening:
 *  - prefers-reduced-motion → single static frame, no loop
 *  - visibilitychange       → loop paused when tab hidden
 *  - webglcontextlost       → tears down + reveals the 2D AtmosphereField
 *  - performance guard       → drops bloom, then self-disables, on sustained low fps
 *
 * The 2D <AtmosphereField> always stays mounted, so any failure here degrades
 * gracefully to the previous experience.
 */

const FULLSCREEN_VERT = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const NEBULA_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uParallax;
  uniform vec2 uRes;
  float blob(vec2 uv, vec2 c, float r) {
    float d = length((uv - c) * vec2(uRes.x / uRes.y, 1.0));
    return smoothstep(r, 0.0, d);
  }
  void main() {
    vec2 uv = vUv + uParallax * 0.04;
    float t = uTime * 0.05;
    vec3 col = vec3(0.008, 0.012, 0.035); // deep-space base
    col += vec3(0.16, 0.20, 0.50) * blob(uv, vec2(0.32 + sin(t) * 0.05, 0.36 + cos(t * 0.8) * 0.04), 0.58) * 1.0;
    col += vec3(0.06, 0.34, 0.30) * blob(uv, vec2(0.72 + cos(t * 0.7) * 0.05, 0.62 + sin(t) * 0.04), 0.52) * 0.9;
    col += vec3(0.20, 0.12, 0.40) * blob(uv, vec2(0.55, 0.50), 0.72) * 0.6;
    col += vec3(0.10, 0.16, 0.42) * blob(uv, vec2(0.16 + sin(t * 0.6) * 0.04, 0.82), 0.5) * 0.5;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const PARTICLE_VERT = /* glsl */ `
  precision highp float;
  attribute vec2 aPos;
  attribute float aSize;
  attribute float aDepth;
  attribute float aVel;
  uniform float uTime;
  uniform vec2 uParallax;
  uniform float uScale;
  varying float vDepth;
  void main() {
    vec2 drift = vec2(aVel, aVel * 0.6) * uTime * 0.015;
    vec2 p = fract(aPos + drift + uParallax * aDepth * 0.15);
    vDepth = aDepth;
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = aSize * (0.5 + aDepth * 1.6) * uScale;
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  precision highp float;
  varying float vDepth;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(vec3(0.50, 0.60, 1.0), vec3(0.40, 0.92, 0.85), vDepth);
    gl_FragColor = vec4(col * a, a * (0.22 + vDepth * 0.4));
  }
`;

const THRESHOLD_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tScene;
  uniform float uThreshold;
  void main() {
    vec3 c = texture2D(tScene, vUv).rgb;
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    float k = smoothstep(uThreshold, uThreshold + 0.25, l);
    gl_FragColor = vec4(c * k, 1.0);
  }
`;

const BLUR_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tTex;
  uniform vec2 uDir;
  uniform vec2 uRes;
  void main() {
    vec2 px = uDir / uRes;
    vec3 s = texture2D(tTex, vUv).rgb * 0.227;
    s += texture2D(tTex, vUv + px * 1.384).rgb * 0.316;
    s += texture2D(tTex, vUv - px * 1.384).rgb * 0.316;
    s += texture2D(tTex, vUv + px * 3.231).rgb * 0.070;
    s += texture2D(tTex, vUv - px * 3.231).rgb * 0.070;
    gl_FragColor = vec4(s, 1.0);
  }
`;

const COMPOSITE_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tScene;
  uniform sampler2D tBloom;
  uniform float uBloom;
  void main() {
    vec3 scene = texture2D(tScene, vUv).rgb;
    vec3 bloom = texture2D(tBloom, vUv).rgb;
    vec3 col = scene + bloom * uBloom;
    col = col / (col + vec3(1.0));     // tone map (no clipping, keeps it luxe)
    col = pow(col, vec3(0.85));        // gentle gamma lift
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function WebGLAtmosphere({
  parallaxRef,
  className,
  onFallback,
}: {
  parallaxRef?: React.RefObject<Parallax>;
  className?: string;
  onFallback?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        canvas,
        alpha: false,
        antialias: false,
        dpr: Math.min(1.5, window.devicePixelRatio || 1),
        powerPreference: "high-performance",
      });
    } catch {
      onFallback?.();
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);

    let disposed = false;
    let raf = 0;
    let W = 1;
    let H = 1;

    // ── Geometry / programs ───────────────────────────────────────────────
    const triangle = new Triangle(gl);

    const nebula = new Mesh(gl, {
      geometry: triangle,
      program: new Program(gl, {
        vertex: FULLSCREEN_VERT,
        fragment: NEBULA_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uParallax: { value: [0, 0] },
          uRes: { value: [1, 1] },
        },
      }),
    });

    // Soft additive particle depth field.
    const COUNT = window.innerWidth < 720 ? 260 : 520;
    const aPos = new Float32Array(COUNT * 2);
    const aSize = new Float32Array(COUNT);
    const aDepth = new Float32Array(COUNT);
    const aVel = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      aPos[i * 2] = Math.random();
      aPos[i * 2 + 1] = Math.random();
      aSize[i] = 2 + Math.random() * 7;
      aDepth[i] = Math.random();
      aVel[i] = (Math.random() - 0.5) * 0.6;
    }
    const particleProgram = new Program(gl, {
      vertex: PARTICLE_VERT,
      fragment: PARTICLE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uParallax: { value: [0, 0] },
        uScale: { value: renderer.dpr },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    particleProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE); // additive
    const particles = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: new Geometry(gl, {
        aPos: { size: 2, data: aPos },
        aSize: { size: 1, data: aSize },
        aDepth: { size: 1, data: aDepth },
        aVel: { size: 1, data: aVel },
      }),
      program: particleProgram,
    });

    const threshold = new Mesh(gl, {
      geometry: triangle,
      program: new Program(gl, {
        vertex: FULLSCREEN_VERT,
        fragment: THRESHOLD_FRAG,
        uniforms: { tScene: { value: null }, uThreshold: { value: 0.32 } },
      }),
    });

    const blur = new Mesh(gl, {
      geometry: triangle,
      program: new Program(gl, {
        vertex: FULLSCREEN_VERT,
        fragment: BLUR_FRAG,
        uniforms: {
          tTex: { value: null },
          uDir: { value: [1, 0] },
          uRes: { value: [1, 1] },
        },
      }),
    });

    const composite = new Mesh(gl, {
      geometry: triangle,
      program: new Program(gl, {
        vertex: FULLSCREEN_VERT,
        fragment: COMPOSITE_FRAG,
        uniforms: {
          tScene: { value: null },
          tBloom: { value: null },
          uBloom: { value: 1.65 },
        },
      }),
    });

    // ── Render targets ────────────────────────────────────────────────────
    let sceneRT: RenderTarget;
    let bloomA: RenderTarget;
    let bloomB: RenderTarget;

    const allocTargets = () => {
      const fw = Math.max(1, gl.canvas.width);
      const fh = Math.max(1, gl.canvas.height);
      const hw = Math.max(1, Math.floor(fw / 2));
      const hh = Math.max(1, Math.floor(fh / 2));
      sceneRT = new RenderTarget(gl, { width: fw, height: fh });
      bloomA = new RenderTarget(gl, { width: hw, height: hh });
      bloomB = new RenderTarget(gl, { width: hw, height: hh });
    };

    const resize = () => {
      // Layout size (clientWidth/Height) is independent of CSS transforms on
      // ancestors, so the GL canvas always covers the full element with no edge
      // dead space — even while the graph stage is mid-entry-scale.
      W = Math.max(1, parent.clientWidth);
      H = Math.max(1, parent.clientHeight);
      renderer.setSize(W, H);
      nebula.program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
      allocTargets();
    };

    let bloomEnabled = true;

    const draw = (time: number) => {
      const par = parallaxRef?.current ?? { x: 0, y: 0 };
      const p: [number, number] = [par.x, par.y];

      nebula.program.uniforms.uTime.value = time * 0.001;
      nebula.program.uniforms.uParallax.value = p;
      particleProgram.uniforms.uTime.value = time * 0.001;
      particleProgram.uniforms.uParallax.value = p;

      // Scene pass → sceneRT (nebula, then additive particles).
      renderer.render({ scene: nebula, target: sceneRT, clear: true });
      renderer.render({ scene: particles, target: sceneRT, clear: false });

      if (bloomEnabled) {
        // Bright pass → bloomA (half res).
        threshold.program.uniforms.tScene.value = sceneRT.texture;
        renderer.render({ scene: threshold, target: bloomA, clear: true });
        // Separable blur: H (A→B) then V (B→A).
        blur.program.uniforms.uRes.value = [bloomA.width, bloomA.height];
        blur.program.uniforms.tTex.value = bloomA.texture;
        blur.program.uniforms.uDir.value = [1, 0];
        renderer.render({ scene: blur, target: bloomB, clear: true });
        blur.program.uniforms.tTex.value = bloomB.texture;
        blur.program.uniforms.uDir.value = [0, 1];
        renderer.render({ scene: blur, target: bloomA, clear: true });
      }

      // Composite → screen.
      composite.program.uniforms.tScene.value = sceneRT.texture;
      composite.program.uniforms.tBloom.value = bloomEnabled
        ? bloomA.texture
        : sceneRT.texture;
      composite.program.uniforms.uBloom.value = bloomEnabled ? 1.65 : 0.0;
      renderer.render({ scene: composite, clear: true });
    };

    // ── Performance guard ─────────────────────────────────────────────────
    let last = performance.now();
    let slow = 0;
    let fullyDisabled = false;

    const loop = (time: number) => {
      if (disposed) return;
      const dt = time - last;
      last = time;
      // Ignore the first/huge frames (tab resume, init).
      if (dt > 0 && dt < 1000) {
        if (dt > 22) slow += 1;
        else slow = Math.max(0, slow - 1);
        if (slow > 90 && bloomEnabled) {
          bloomEnabled = false; // stage 1: drop the most expensive passes
          slow = 0;
        } else if (slow > 90 && !bloomEnabled && !fullyDisabled) {
          fullyDisabled = true; // stage 2: hand off to the 2D field
          canvas.style.opacity = "0";
          onFallback?.();
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
          return;
        }
      }
      draw(time);
      raf = requestAnimationFrame(loop);
    };

    // ── Context-loss fallback ─────────────────────────────────────────────
    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      canvas.style.opacity = "0";
      onFallback?.();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (!reduce && !fullyDisabled && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    ro.observe(parent);
    resize();

    if (reduce) {
      // Single static frame, no animation loop.
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      const ext = gl.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    };
  }, [reduce, parallaxRef, onFallback]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
