import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone, Tag } from "@/components/ui/Badge";
import { ArrowUpRight } from "@/components/ui/icons";
import type { CaseStudy, CaseStudyStatus } from "@/data/caseStudies";

const statusTone: Record<CaseStudyStatus, BadgeTone> = {
  Live: "success",
  "In Production": "success",
  Ongoing: "brand",
  Prototype: "accent",
  Archived: "muted",
};

export function CaseStudyCard({
  study,
  showMetrics = false,
}: {
  study: CaseStudy;
  showMetrics?: boolean;
}) {
  return (
    <Link href={`/case-studies/${study.slug}`} className="group block h-full">
      <Card interactive glow className="flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-2xs uppercase tracking-[0.16em] text-brand-300">
            {study.eyebrow}
          </span>
          <Badge tone={statusTone[study.status]} dot>
            {study.status}
          </Badge>
        </div>

        <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
          {study.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{study.summary}</p>

        {showMetrics && (
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-hairline pt-5">
            {study.metrics.map((metric) => (
              <div key={metric.label}>
                <div className="text-lg font-semibold tracking-tight text-ink">
                  {metric.value}
                </div>
                <div className="mt-1 text-2xs uppercase tracking-wide text-ink-subtle">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap gap-1.5">
            {study.tools.slice(0, 4).map((tool) => (
              <Tag key={tool}>{tool}</Tag>
            ))}
          </div>
          <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors group-hover:text-brand-300">
            View case study
            <ArrowUpRight className="text-base transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
