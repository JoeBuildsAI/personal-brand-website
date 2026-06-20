"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge, type BadgeTone, Tag } from "@/components/ui/Badge";
import { ArrowUpRight, Check, Github } from "@/components/ui/icons";
import {
  getVisibleProjects,
  projectCategories,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from "@/data/projects";

const statusTone: Record<ProjectStatus, BadgeTone> = {
  Live: "success",
  "In Development": "brand",
  Prototype: "accent",
  Maintained: "neutral",
  Planned: "muted",
};

type Tone = "brand" | "accent" | "violet";

const HUB = { x: 50, y: 50 };

const clusterAnchors: Record<ProjectCategory, { x: number; y: number; tone: Tone }> = {
  "Platforms & Products": { x: 28, y: 33, tone: "brand" },
  "Automation & AI": { x: 74, y: 31, tone: "accent" },
  "Platform Architecture": { x: 52, y: 77, tone: "violet" },
};

const toneClasses: Record<
  Tone,
  { dot: string; halo: string; text: string; stroke: string; field: string; glow: string }
> = {
  brand: {
    dot: "bg-brand-400",
    halo: "bg-brand-400/40",
    text: "text-brand-200",
    stroke: "stroke-brand-400",
    field: "bg-brand-500/10",
    glow: "shadow-[0_0_22px_rgba(129,148,255,0.85)]",
  },
  accent: {
    dot: "bg-accent",
    halo: "bg-accent/40",
    text: "text-accent-soft",
    stroke: "stroke-accent",
    field: "bg-accent/10",
    glow: "shadow-[0_0_22px_rgba(95,227,206,0.85)]",
  },
  violet: {
    dot: "bg-violet",
    halo: "bg-violet/40",
    text: "text-violet-soft",
    stroke: "stroke-violet",
    field: "bg-violet/10",
    glow: "shadow-[0_0_22px_rgba(155,135,245,0.85)]",
  },
};

function slotsFor(n: number): Array<{ dx: number; dy: number }> {
  switch (n) {
    case 1:
      return [{ dx: 0, dy: 0 }];
    case 2:
      return [
        { dx: -13, dy: -5 },
        { dx: 13, dy: 5 },
      ];
    case 3:
      return [
        { dx: 0, dy: -14 },
        { dx: 14, dy: 9 },
        { dx: -14, dy: 9 },
      ];
    default:
      return [
        { dx: -13, dy: -11 },
        { dx: 13, dy: -11 },
        { dx: -13, dy: 11 },
        { dx: 13, dy: 11 },
      ];
  }
}

function prettyUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

interface PositionedProject extends Project {
  x: number;
  y: number;
  tone: Tone;
}

export function ProjectExplorer() {
  const reduce = useReducedMotion();
  const projects = useMemo(() => getVisibleProjects(), []);

  const positioned = useMemo<PositionedProject[]>(() => {
    const result: PositionedProject[] = [];
    for (const category of projectCategories) {
      const anchor = clusterAnchors[category];
      const peers = projects.filter((project) => project.category === category);
      const slots = slotsFor(peers.length);
      peers.forEach((project, index) => {
        const slot = slots[index] ?? { dx: 0, dy: 0 };
        result.push({
          ...project,
          x: anchor.x + slot.dx,
          y: anchor.y + slot.dy,
          tone: anchor.tone,
        });
      });
    }
    return result;
  }, [projects]);

  const defaultSlug = (projects.find((project) => project.featured) ?? projects[0])
    ?.slug;
  const [activeSlug, setActiveSlug] = useState(defaultSlug);
  const active =
    positioned.find((project) => project.slug === activeSlug) ?? positioned[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
      {/* Constellation */}
      <div
        role="tablist"
        aria-label="Project constellation"
        className="relative aspect-square w-full overflow-hidden rounded-3xl border border-hairline bg-panel/40 sm:aspect-[4/3] lg:aspect-auto lg:min-h-[34rem]"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-50" />
        {projectCategories.map((category) => {
          const anchor = clusterAnchors[category];
          return (
            <div
              key={category}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]",
                toneClasses[anchor.tone].field,
              )}
              style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
            />
          );
        })}

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        >
          {positioned.map((project) => {
            const selected = project.slug === active.slug;
            return (
              <line
                key={project.slug}
                x1={HUB.x}
                y1={HUB.y}
                x2={project.x}
                y2={project.y}
                vectorEffect="non-scaling-stroke"
                strokeWidth={selected ? 1.5 : 0.8}
                strokeLinecap="round"
                strokeDasharray={selected ? "1 6" : undefined}
                className={cn(
                  selected
                    ? cn("animate-trace-flow", toneClasses[project.tone].stroke)
                    : "stroke-white/[0.07]",
                )}
              />
            );
          })}
        </svg>

        {/* Hub */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full border border-hairline-strong bg-panel shadow-card">
            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-brand-300 to-accent" />
          </span>
          <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-2xs uppercase tracking-[0.14em] text-ink-subtle">
            Projects
          </span>
        </div>

        {/* Project nodes */}
        {positioned.map((project, index) => {
          const selected = project.slug === active.slug;
          const tone = toneClasses[project.tone];
          return (
            <button
              key={project.slug}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`${project.title} — ${project.type}`}
              onClick={() => setActiveSlug(project.slug)}
              onPointerEnter={() => setActiveSlug(project.slug)}
              style={{ left: `${project.x}%`, top: `${project.y}%` }}
              className={cn(
                "group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-full p-2 outline-none transition-opacity duration-300",
                selected ? "z-20 opacity-100" : "z-10 opacity-90 hover:opacity-100",
              )}
            >
              <span className="relative flex items-center justify-center">
                <span
                  aria-hidden="true"
                  style={{ animationDelay: `${index * 0.4}s` }}
                  className={cn(
                    "absolute h-9 w-9 rounded-full blur-md animate-pulse-node",
                    tone.halo,
                  )}
                />
                <span
                  className={cn(
                    "relative h-3.5 w-3.5 rounded-full ring-1 ring-inset transition-transform duration-300",
                    tone.dot,
                    selected
                      ? cn("scale-125 ring-white/70", tone.glow)
                      : "ring-white/20 group-hover:scale-110",
                  )}
                />
              </span>
              <span
                className={cn(
                  "pointer-events-none mt-2 max-w-[8rem] whitespace-nowrap text-2xs font-medium tracking-tight transition-colors",
                  selected ? "text-ink" : "text-ink-muted",
                )}
              >
                {project.title}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.slug}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            exit={reduce ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-hairline bg-panel p-6 shadow-card sm:p-8"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-2xs uppercase tracking-[0.16em] text-accent-soft">
                {active.type}
              </span>
              <Badge tone={statusTone[active.status]} dot>
                {active.status}
              </Badge>
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {active.title}
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
              {active.summary}
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-hairline bg-canvas-raised">
              <div className="flex items-center gap-1.5 border-b border-hairline bg-panel px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="ml-3 truncate font-mono text-2xs text-ink-subtle">
                  {prettyUrl(active.demoUrl)}
                </span>
              </div>
              <div className="relative grid h-48 place-items-center overflow-hidden bg-grid sm:h-56">
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-3xl"
                />
                <div className="relative px-6 text-center">
                  <span className="font-mono text-2xs uppercase tracking-[0.16em] text-brand-300">
                    {active.type}
                  </span>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-ink">
                    {active.title}
                  </p>
                  <p className="mt-1 text-2xs uppercase tracking-[0.14em] text-ink-subtle">
                    Live preview coming soon
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                  Overview
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {active.description}
                </p>
              </div>
              <div>
                <h3 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                  Highlights
                </h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {active.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2 text-sm text-ink-muted"
                    >
                      <Check className="mt-0.5 shrink-0 text-base text-accent" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                Architecture
              </h3>
              <ol className="mt-3">
                {active.architecture.map((step, index) => {
                  const last = index === active.architecture.length - 1;
                  return (
                    <li
                      key={step}
                      className={cn("relative pl-7", !last && "pb-3")}
                    >
                      {!last && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0 left-[5px] top-4 w-px bg-hairline-strong"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-accent/70 bg-canvas"
                      />
                      <p className="text-sm leading-relaxed text-ink-muted">
                        {step}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {active.stack.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4 border-t border-hairline pt-5 text-sm">
              <a
                href={active.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink-muted transition-colors hover:text-ink"
              >
                <Github className="text-base" /> Code
              </a>
              <a
                href={active.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink-muted transition-colors hover:text-brand-300"
              >
                View <ArrowUpRight className="text-base" />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
