import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "@/components/sections/ContactForm";
import { ArrowUpRight, Github, Linkedin, Mail } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Joe Wilkinson about systems architecture, legal technology, automation, AI workflows, and product work.",
};

const interestAreas = [
  "Systems architecture & workflow design",
  "Legal technology & operations",
  "Automation & reporting systems",
  "Salesforce / Litify architecture",
  "AI workflow strategy",
  "Product prototyping & advisory",
];

const directLinks = [
  {
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
  {
    label: "LinkedIn",
    value: "Connect on LinkedIn",
    href: siteConfig.social.linkedin,
    icon: Linkedin,
  },
  {
    label: "GitHub",
    value: "See the code",
    href: siteConfig.social.github,
    icon: Github,
  },
].filter((link) => link.href && link.href !== "mailto:");

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Let’s build something that lasts."
      description="Tell me about the process, system, or product you’re working on. I read every message and reply personally."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
              Areas of interest
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {interestAreas.map((area) => (
                <li key={area} className="flex items-start gap-3 text-ink-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
              Reach me directly
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {directLinks.map((link) => {
                const Icon = link.icon;
                const external = link.href.startsWith("http");
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-4 rounded-xl border border-hairline bg-panel p-4 transition-colors hover:border-hairline-strong"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-hairline bg-white/[0.03] text-lg text-brand-300">
                      <Icon />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-2xs uppercase tracking-[0.14em] text-ink-subtle">
                        {link.label}
                      </span>
                      <span className="text-sm text-ink">{link.value}</span>
                    </span>
                    <ArrowUpRight className="ml-auto text-base text-ink-subtle transition-colors group-hover:text-ink" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <ContactForm />
        </Card>
      </div>
    </PageShell>
  );
}
