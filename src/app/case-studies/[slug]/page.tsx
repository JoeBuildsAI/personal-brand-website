import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { ArchitectureMap } from "@/components/graph/ArchitectureMap";
import { cn } from "@/lib/utils";
import {
  caseStudies,
  getCaseStudy,
  getCaseStudySlugs,
  type CaseStudyStatus,
} from "@/data/caseStudies";

type Params = { slug: string };

const statusTone: Record<CaseStudyStatus, BadgeTone> = {
  Live: "success",
  "In Production": "success",
  Ongoing: "brand",
  Prototype: "accent",
  Archived: "muted",
};

export function generateStaticParams(): Params[] {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    return { title: "Case Study Not Found" };
  }

  return {
    title: study.title,
    description: study.summary,
  };
}

function SectionLabel({
  index,
  title,
  hint,
}: {
  index: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        <span className="font-mono text-sm text-brand-300">{index}</span>
        {title}
      </h2>
      {hint ? (
        <span className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-subtle">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function ExecBlock({
  label,
  body,
  highlight,
}: {
  label: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        highlight
          ? "border-brand-500/25 bg-brand-500/[0.06]"
          : "border-hairline bg-panel/40",
      )}
    >
      <h3 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
        {label}
      </h3>
      <p
        className={cn(
          "mt-2.5 text-pretty leading-relaxed",
          highlight ? "text-ink" : "text-ink-muted",
        )}
      >
        {body}
      </p>
    </div>
  );
}

function TechBlock({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <h3 className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-ink">
        <span className="h-px w-5 bg-brand-400/60" />
        {label}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

function TechList({
  label,
  items,
  numbered,
}: {
  label: string;
  items: string[];
  numbered?: boolean;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-ink">
        <span className="h-px w-5 bg-brand-400/60" />
        {label}
      </h3>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item, index) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted"
          >
            {numbered ? (
              <span className="mt-px font-mono text-2xs text-brand-300">
                {String(index + 1).padStart(2, "0")}
              </span>
            ) : (
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    notFound();
  }

  const moreStudies = caseStudies.filter((item) => item.slug !== study.slug).slice(0, 2);

  return (
    <article>
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid opacity-50 mask-fade-b"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 bg-radial-brand"
        />
        <Container className="relative py-14 sm:py-18 lg:py-20">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="text-base" />
            All case studies
          </Link>

          <div className="mt-8 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-2xs uppercase tracking-[0.16em] text-brand-300">
                {study.eyebrow}
              </span>
              <Badge tone={statusTone[study.status]} dot>
                {study.status}
              </Badge>
            </div>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {study.title}
            </h1>
            <p className="max-w-2xl text-pretty text-lg leading-relaxed text-ink-muted">
              {study.summary}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {study.metrics.map((metric) => (
              <Card key={metric.label} className="p-5">
                <div className="text-2xl font-semibold tracking-tight text-ink">
                  {metric.value}
                </div>
                <div className="mt-1.5 text-2xs uppercase tracking-[0.14em] text-ink-subtle">
                  {metric.label}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <a
              href="#executive"
              className="rounded-full border border-hairline-strong bg-white/[0.04] px-3.5 py-1.5 text-sm text-ink-muted transition-colors hover:border-white/20 hover:text-ink"
            >
              Executive summary
            </a>
            <a
              href="#technical"
              className="rounded-full border border-hairline-strong bg-white/[0.04] px-3.5 py-1.5 text-sm text-ink-muted transition-colors hover:border-white/20 hover:text-ink"
            >
              Technical walkthrough
            </a>
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        {/* Executive summary */}
        <section id="executive" className="scroll-mt-24">
          <SectionLabel index="01" title="Executive Summary" hint="For decision-makers" />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="flex max-w-prose flex-col gap-4">
              <ExecBlock label="The problem" body={study.problem} />
              <ExecBlock label="Business impact" body={study.businessImpact} highlight />
              <ExecBlock label="The outcome" body={study.outcome} />
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
              <Card className="p-6">
                <h2 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                  Tools &amp; platforms
                </h2>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {study.tools.map((tool) => (
                    <Tag key={tool}>{tool}</Tag>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                  Confidentiality
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {study.confidentialityNote}
                </p>
              </Card>

              <Card glow className="flex flex-col gap-4 p-6">
                <p className="text-sm leading-relaxed text-ink">
                  Have a similar problem hiding in your operations?
                </p>
                <Button href="/contact">
                  Start a conversation
                  <ArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Card>
            </aside>
          </div>
        </section>

        {/* System architecture */}
        <section className="mt-16 border-t border-hairline pt-12">
          <SectionLabel
            index="02"
            title="System Architecture"
            hint="Sources → Logic → Review → Output"
          />
          <div className="mt-8 rounded-3xl border border-hairline bg-panel/30 p-5 sm:p-7">
            <ArchitectureMap layers={study.architectureMap} />
          </div>
        </section>

        {/* Technical walkthrough */}
        <section id="technical" className="mt-16 scroll-mt-24 border-t border-hairline pt-12">
          <SectionLabel index="03" title="Technical Walkthrough" hint="For engineers" />
          <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-2">
            <TechBlock label="Approach" body={study.approach} />
            <TechList label="Constraints" items={study.constraints} />
            <TechList label="Architecture" items={study.architecture} numbered />
            <TechList label="Tradeoffs" items={study.tradeoffs} />
            <TechList label="Governance" items={study.governance} />
            <TechList label="Failure modes prevented" items={study.failureModes} />
          </div>
          <div className="mt-8 border-t border-hairline pt-8">
            <TechList label="Lessons learned" items={study.lessons} />
          </div>
        </section>
      </Container>

      {moreStudies.length > 0 && (
        <section className="border-t border-hairline py-16">
          <Container>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              More case studies
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {moreStudies.map((item) => (
                <CaseStudyCard key={item.slug} study={item} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </article>
  );
}
