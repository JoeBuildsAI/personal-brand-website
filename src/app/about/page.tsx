import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { TrajectoryConstellation } from "@/components/sections/TrajectoryConstellation";
import { journey } from "@/data/journey";

export const metadata: Metadata = {
  title: "About",
  description:
    "Joe Wilkinson is a systems architect working across legal technology, automation, reporting, and AI workflows — building operational systems teams can trust.",
};

const focusAreas = [
  "Systems Architecture",
  "Legal Technology",
  "Automation & Reporting",
  "AI Workflows",
  "Data Operations",
  "Internal Tooling",
];

const toolbox = [
  "Salesforce",
  "Litify",
  "SOQL",
  "TypeScript",
  "Next.js",
  "LLM APIs",
  "Integrations",
  "Workflow Automation",
];

const currently = [
  "Building this personal platform",
  "Prototyping Life Financial OS",
  "Exploring AI-assisted intake",
];

const principles = [
  {
    title: "Architecture before automation",
    body: "Automating a broken process only makes the mess move faster. I design the system first, then automate what genuinely deserves it.",
  },
  {
    title: "Data you can trust",
    body: "If the numbers are not trustworthy, every decision built on them is a guess. Clean, governed data is non-negotiable infrastructure.",
  },
  {
    title: "Humans in the loop",
    body: "AI should remove busywork, not judgment. The best workflows let people make the calls that matter, faster and with better context.",
  },
  {
    title: "Built to scale",
    body: "A system should still make sense when the team and the workload double. I build for the organization you are becoming, not just the one you are.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageShell
        eyebrow="About"
        title="I turn operational chaos into systems that scale."
        description="Systems architect at the intersection of legal technology, automation, and operations — focused on practical infrastructure, not hype."
      >
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="flex max-w-prose flex-col gap-5 text-pretty leading-relaxed text-ink-muted">
            <p>
              I am Joe Wilkinson, a systems architect working at the intersection
              of legal technology, automation, and operations. My work starts
              where most software demos end: in the messy middle of real
              businesses, where processes are undocumented, data lives in a dozen
              places, and the people doing the work are buried in manual steps.
            </p>
            <p>
              I have spent my career inside legal operations, designing and
              building the systems that keep complex case and business operations
              running. That means deep, hands-on work across Salesforce and
              Litify, reporting and data operations, workflow automation,
              AI-assisted processes, integrations between systems that were never
              meant to talk to each other, and the internal tooling teams rely on
              every day.
            </p>
            <p>
              My approach is deliberately practical. I am less interested in hype
              than in whether a system actually makes a team faster, calmer, and
              more confident in its data. Good architecture is mostly invisible:
              it removes friction, enforces clarity, and quietly scales as the
              organization grows.
            </p>
            <p>
              Today I am focused on widening that impact — through consulting,
              productizing the systems I have built internally, and growing toward
              technical leadership. The throughline is the same one that has
              always driven me: take something tangled and turn it into
              infrastructure people can trust.
            </p>
          </div>

          <aside className="flex flex-col gap-5">
            <Card className="p-6">
              <h2 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                Focus areas
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm text-ink">
                {focusAreas.map((area) => (
                  <li key={area} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                    {area}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                Toolbox
              </h2>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {toolbox.map((tool) => (
                  <Tag key={tool}>{tool}</Tag>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                Currently
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm text-ink-muted">
                {currently.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>

        <div className="mt-16 border-t border-hairline pt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            The path here
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
            Every stage built on the last. This is how a habit of taking things
            apart became a career architecting systems.
          </p>

          <TrajectoryConstellation stages={journey} />

          <ol className="mt-10 lg:mt-14">
            {journey.map((stage, index) => {
              const last = index === journey.length - 1;
              return (
                <Reveal key={stage.title} delay={index * 0.04}>
                  <li className={last ? "relative pl-12" : "relative pb-10 pl-12"}>
                    {!last && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-[15px] top-9 w-px bg-gradient-to-b from-brand-400/40 to-hairline"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full border border-hairline bg-panel"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          last
                            ? "bg-accent shadow-[0_0_12px_rgba(95,227,206,0.8)]"
                            : "bg-brand-400 shadow-[0_0_12px_rgba(129,148,255,0.7)]"
                        }`}
                      />
                    </span>
                    <span className="font-mono text-2xs uppercase tracking-[0.16em] text-brand-300">
                      {stage.marker}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">
                      {stage.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-pretty leading-relaxed text-ink-muted">
                      {stage.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {stage.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>

        <div className="mt-16 border-t border-hairline pt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            How I think about systems
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {principles.map((principle) => (
              <Card key={principle.title} className="p-6 sm:p-7">
                <h3 className="text-lg font-semibold tracking-tight text-ink">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {principle.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </PageShell>

      <ContactCTA />
    </>
  );
}
