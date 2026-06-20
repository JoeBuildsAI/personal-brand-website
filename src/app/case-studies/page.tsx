import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Badge";
import { ArrowUpRight } from "@/components/ui/icons";
import { ArchitectureMap } from "@/components/graph/ArchitectureMap";
import { caseStudies, type CaseStudy } from "@/data/caseStudies";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Anonymized operational systems Joe Wilkinson has designed and built — traced from problem and constraints through architecture, outcome, and lessons learned.",
};

// Executive-first index: business impact + architecture map per study.
// The full technical walkthrough lives on each case study's detail page.

function CaseStudyNarrative({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <Reveal>
      <article className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-brand-300">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="h-px w-8 bg-hairline-strong" />
            <span className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-subtle">
              {study.eyebrow}
            </span>
          </div>
          <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-ink">
            {study.title}
          </h2>
          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-white/[0.04] px-2.5 py-1 text-2xs uppercase tracking-[0.12em] text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {study.status}
          </span>

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-hairline pt-6 lg:grid-cols-1 lg:gap-4">
            {study.metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="text-2xs uppercase tracking-[0.12em] text-ink-subtle">
                  {metric.label}
                </dt>
                <dd className="mt-1 text-lg font-semibold tracking-tight text-ink">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {study.tools.slice(0, 5).map((tool) => (
              <Tag key={tool}>{tool}</Tag>
            ))}
          </div>

        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-hairline bg-panel/50 p-6 sm:p-8">
            <span className="font-mono text-2xs uppercase tracking-[0.16em] text-brand-300">
              Executive summary
            </span>
            <p className="mt-4 text-pretty leading-relaxed text-ink-muted">
              <span className="text-ink-subtle">Problem &mdash; </span>
              {study.problem}
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-ink">
              <span className="text-ink-subtle">Impact &mdash; </span>
              {study.businessImpact}
            </p>
            <Link
              href={`/case-studies/${study.slug}`}
              className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-200 transition-colors hover:text-brand-100"
            >
              Read the technical walkthrough
              <ArrowUpRight className="text-base transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="rounded-3xl border border-hairline bg-panel/30 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-subtle">
                System architecture
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">
                Sources &rarr; Output
              </span>
            </div>
            <ArchitectureMap layers={study.architectureMap} className="mt-5" />
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function CaseStudiesPage() {
  return (
    <PageShell
      eyebrow="Case Studies"
      title="Systems, traced end to end."
      description="Each system at a glance: the business impact up top, the architecture in the middle, and a full technical walkthrough one click away. Details are anonymized to protect confidential information."
    >
      <div className="flex flex-col gap-16 lg:gap-24">
        {caseStudies.map((study, index) => (
          <CaseStudyNarrative key={study.slug} study={study} index={index} />
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-hairline bg-panel p-6 text-sm leading-relaxed text-ink-muted">
        <strong className="font-semibold text-ink">
          A note on confidentiality.
        </strong>{" "}
        Every case study here is intentionally anonymized. Client names, matter
        details, and proprietary implementation specifics are omitted. Language
        such as &ldquo;plaintiff-side law firm&rdquo; and &ldquo;legal operations
        team&rdquo; is used to describe context without revealing protected
        information.
      </div>
    </PageShell>
  );
}
