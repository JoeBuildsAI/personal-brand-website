import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "@/components/ui/icons";
import type { ArchitectureLayer, ArchitectureStage } from "@/data/caseStudies";

/**
 * ArchitectureMap — the mini system diagram shown per case study.
 * Reads the study's `architectureMap` (Sources → Logic → Review → Output) and
 * renders tone-coded stages connected by flow arrows. The human review stage is
 * intentionally warm-toned to mark the decision point.
 */

const stageTone: Record<
  ArchitectureStage,
  { dot: string; text: string; chip: string }
> = {
  Sources: { dot: "bg-brand-400", text: "text-brand-200", chip: "border-brand-500/20" },
  Logic: { dot: "bg-violet", text: "text-violet-soft", chip: "border-violet/20" },
  Review: { dot: "bg-warm", text: "text-warm", chip: "border-warm/25" },
  Output: { dot: "bg-accent", text: "text-accent-soft", chip: "border-accent/20" },
};

export function ArchitectureMap({
  layers,
  className,
}: {
  layers: ArchitectureLayer[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-1.5",
        className,
      )}
    >
      {layers.map((layer, index) => {
        const tone = stageTone[layer.stage];
        return (
          <Fragment key={layer.stage}>
            <div className="relative flex-1 rounded-2xl border border-hairline bg-panel/50 p-4 shadow-inner-top">
              <div className="flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
                <span className="font-mono text-2xs uppercase tracking-[0.14em] text-ink-subtle">
                  {layer.stage}
                </span>
              </div>
              <p className={cn("mt-1.5 text-sm font-medium tracking-tight", tone.text)}>
                {layer.label}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {layer.nodes.map((node) => (
                  <span
                    key={node}
                    className={cn(
                      "rounded-lg border bg-white/[0.02] px-2 py-1 text-2xs text-ink-muted",
                      tone.chip,
                    )}
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>
            {index < layers.length - 1 && (
              <div
                aria-hidden="true"
                className="flex shrink-0 items-center justify-center self-center py-1 sm:py-0"
              >
                <ArrowRight className="rotate-90 text-base text-ink-subtle sm:rotate-0" />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
