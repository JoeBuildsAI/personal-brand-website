import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { getVisibleProducts, type ProductStage } from "@/data/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "The product roadmap by Joe Wilkinson — internal tools and prototypes moving from idea to prototype to validation toward production.",
};

const phases = [
  {
    name: "Idea",
    dot: "bg-ink-subtle",
    text: "text-ink-subtle",
    border: "hover:border-hairline-strong",
    shadow: "shadow-card",
  },
  {
    name: "Prototype",
    dot: "bg-brand-300",
    text: "text-brand-200",
    border: "hover:border-brand-500/40",
    shadow: "shadow-[0_0_22px_-4px_rgba(129,148,255,0.55)]",
  },
  {
    name: "Validation",
    dot: "bg-violet",
    text: "text-violet-soft",
    border: "hover:border-violet/40",
    shadow: "shadow-[0_0_22px_-4px_rgba(155,135,245,0.55)]",
  },
  {
    name: "Production",
    dot: "bg-accent",
    text: "text-accent-soft",
    border: "hover:border-accent/40",
    shadow: "shadow-[0_0_22px_-4px_rgba(95,227,206,0.55)]",
  },
] as const;

const phaseByStage: Record<ProductStage, string> = {
  Concept: "Idea",
  Planned: "Idea",
  Prototype: "Prototype",
  Building: "Validation",
  "Private Beta": "Validation",
};

export default function ProductsPage() {
  const products = getVisibleProducts();
  const grouped = phases.map((phase) => ({
    ...phase,
    items: products.filter((product) => phaseByStage[product.stage] === phase.name),
  }));

  return (
    <PageShell
      eyebrow="Products & Future Ventures"
      title="The product roadmap."
      description="Systems I am building toward real products. Each one starts as internal tooling or a prototype and earns its way along the roadmap as it proves itself."
    >
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-10 h-56 bg-conic-aurora opacity-[0.18] blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-ink-subtle/30 via-violet/40 to-accent/60 lg:block"
        />
        <div className="relative grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {grouped.map((phase, index) => (
            <Reveal key={phase.name} delay={index * 0.08}>
              <div className="flex h-full flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "relative z-10 grid h-12 w-12 place-items-center rounded-2xl border border-hairline bg-panel",
                      phase.shadow,
                    )}
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", phase.dot)} />
                  </span>
                  <div>
                    <div className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-subtle">
                      Phase {String(index + 1).padStart(2, "0")}
                    </div>
                    <h2 className={cn("text-base font-semibold tracking-tight", phase.text)}>
                      {phase.name}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {phase.items.length > 0 ? (
                    phase.items.map((product) => (
                      <div
                        key={product.slug}
                        className={cn(
                          "group rounded-2xl border border-hairline bg-panel/50 p-4 shadow-inner-top transition-all duration-300 hover:-translate-y-0.5",
                          phase.border,
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium leading-snug tracking-tight text-ink">
                            {product.name}
                          </h3>
                          {product.featured ? (
                            <span
                              aria-hidden="true"
                              className={cn(
                                "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                                phase.dot,
                              )}
                            />
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ink-muted line-clamp-3">
                          {product.summary}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-2xs uppercase tracking-[0.12em] text-ink-subtle">
                          <span>{product.stage}</span>
                          <span>{product.features.length} features</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-hairline-strong bg-transparent p-4">
                      <p className="text-sm leading-relaxed text-ink-subtle">
                        On the horizon — the next system to graduate.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-2xl border border-hairline bg-panel p-6 text-sm leading-relaxed text-ink-muted">
        <strong className="font-semibold text-ink">How to read this.</strong>{" "}
        Products move left to right as they earn it — from a rough idea, to a
        working prototype, to validation with real use, and finally to a
        production product. Nothing ships to production until the system has
        proven it deserves to.
      </div>
    </PageShell>
  );
}
