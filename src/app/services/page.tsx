import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { ProcessFlow } from "@/components/sections/ProcessFlow";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check } from "@/components/ui/icons";
import { operatingModel } from "@/data/operatingModel";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "How Joe Wilkinson works — a five-stage operating model — and the areas of expertise behind each engagement: systems architecture, legal tech, automation, Salesforce/Litify, AI, and prototyping.",
};

export default function ServicesPage() {
  return (
    <PageShell
      eyebrow="Services"
      title="How I work, and what I build."
      description="Every engagement follows the same operating model: understand the system, design it, build it, measure it, and make it scale. Here is how that works in practice."
    >
      <section>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-[0.18em] text-brand-300">
            The Operating Model
          </span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <Reveal>
          <div className="mt-10">
            <ProcessFlow steps={operatingModel} />
          </div>
        </Reveal>
      </section>

      <section className="mt-20">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-[0.18em] text-brand-300">
            Areas of Expertise
          </span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2">
          {services.map((service) => (
            <div key={service.slug} className="flex flex-col bg-canvas p-6 sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-tight text-ink">
                  {service.title}
                </h3>
                <span className="shrink-0 rounded-full border border-hairline-strong bg-white/[0.04] px-2.5 py-1 text-2xs uppercase tracking-[0.12em] text-ink-subtle">
                  {service.pricingNote}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {service.summary}
              </p>
              <ul className="mt-4 grid gap-2">
                {service.whatItIncludes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-ink-muted"
                  >
                    <Check className="mt-0.5 shrink-0 text-base text-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-16 flex flex-col gap-5 rounded-2xl border border-hairline bg-panel p-6 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Not sure which engagement fits?
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            Pricing is scoped per project and shared during a consult, once the
            problem and the outcome are clear. Start with a conversation and I’ll
            map the right approach with you.
          </p>
        </div>
        <Button href="/contact" size="lg" className="shrink-0">
          Book a consult
          <ArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </div>
    </PageShell>
  );
}
