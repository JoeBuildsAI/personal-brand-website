import { cn } from "@/lib/utils";
import type { JourneyStage } from "@/data/journey";

/**
 * TrajectoryConstellation — a desktop horizontal view of the career journey as
 * connected nodes, with a tone progression (brand → violet → accent → warm)
 * that mirrors the systems graph language. The detailed timeline renders below
 * it for all screen sizes.
 */

type Tone = "brand" | "violet" | "accent" | "warm";

const tones: Tone[] = [
  "brand",
  "brand",
  "violet",
  "violet",
  "accent",
  "accent",
  "warm",
  "warm",
];

const dot: Record<Tone, string> = {
  brand: "bg-brand-400",
  violet: "bg-violet",
  accent: "bg-accent",
  warm: "bg-warm",
};

const text: Record<Tone, string> = {
  brand: "text-brand-200",
  violet: "text-violet-soft",
  accent: "text-accent-soft",
  warm: "text-warm",
};

const glow: Record<Tone, string> = {
  brand: "shadow-[0_0_16px_-2px_rgba(129,148,255,0.7)]",
  violet: "shadow-[0_0_16px_-2px_rgba(155,135,245,0.7)]",
  accent: "shadow-[0_0_16px_-2px_rgba(95,227,206,0.7)]",
  warm: "shadow-[0_0_16px_-2px_rgba(245,201,123,0.7)]",
};

export function TrajectoryConstellation({ stages }: { stages: JourneyStage[] }) {
  return (
    <div className="relative mt-10 hidden lg:block">
      <div
        aria-hidden="true"
        className="absolute inset-x-4 top-[13px] h-px bg-gradient-to-r from-brand-500/40 via-violet/40 to-warm/50"
      />
      <ol
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
      >
        {stages.map((stage, index) => {
          const tone = tones[index] ?? "brand";
          return (
            <li
              key={stage.title}
              className="group flex flex-col items-center px-2 text-center"
            >
              <span
                className={cn(
                  "relative grid h-7 w-7 place-items-center rounded-full border border-hairline bg-panel transition-transform duration-300 group-hover:scale-110",
                  glow[tone],
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", dot[tone])} />
              </span>
              <span
                className={cn(
                  "mt-3 font-mono text-[10px] uppercase tracking-[0.14em]",
                  text[tone],
                )}
              >
                {stage.marker}
              </span>
              <span className="mt-1 text-2xs font-medium leading-tight text-ink-muted">
                {stage.title}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
