import { cn } from "@/lib/utils";
import type { OperatingStep } from "@/data/operatingModel";

/**
 * ProcessFlow — the operating model rendered as a connected process graph
 * (Discover → Architect → Build → Measure → Scale). Horizontal flow on
 * desktop, vertical on mobile, with a tone progression across the stages.
 */

const stepTones = ["brand", "violet", "accent", "accent", "warm"] as const;
type StepTone = (typeof stepTones)[number];

const toneText: Record<StepTone, string> = {
  brand: "text-brand-200",
  violet: "text-violet-soft",
  accent: "text-accent-soft",
  warm: "text-warm",
};

const toneBorder: Record<StepTone, string> = {
  brand: "border-brand-500/40",
  violet: "border-violet/40",
  accent: "border-accent/40",
  warm: "border-warm/40",
};

const toneGlow: Record<StepTone, string> = {
  brand: "bg-brand-500/30",
  violet: "bg-violet/30",
  accent: "bg-accent/30",
  warm: "bg-warm/30",
};

const toneDot: Record<StepTone, string> = {
  brand: "bg-brand-400",
  violet: "bg-violet",
  accent: "bg-accent",
  warm: "bg-warm",
};

export function ProcessFlow({ steps }: { steps: OperatingStep[] }) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-6 right-6 top-6 hidden h-px bg-gradient-to-r from-brand-500/50 via-accent/40 to-warm/50 lg:block"
      />
      <ol className="grid gap-x-6 gap-y-10 lg:grid-cols-5">
        {steps.map((step, index) => {
          const tone = stepTones[Math.min(index, stepTones.length - 1)];
          return (
            <li key={step.number} className="relative">
              <div className="flex items-center gap-4 lg:block">
                <span
                  className={cn(
                    "relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-2xl border bg-panel font-mono text-sm shadow-card",
                    toneBorder[tone],
                    toneText[tone],
                  )}
                >
                  {step.number}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 -z-10 rounded-2xl opacity-40 blur-md",
                      toneGlow[tone],
                    )}
                  />
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-ink lg:mt-4">
                  {step.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {step.summary}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {step.detail.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs leading-relaxed text-ink-subtle"
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-1 w-1 shrink-0 rounded-full",
                        toneDot[tone],
                      )}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
