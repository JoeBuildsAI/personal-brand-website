import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";
import { Github, Instagram, Linkedin, Mail } from "@/components/ui/icons";

// Filter out any social handle left blank in site config so it disappears
// everywhere automatically.
const socialLinks = [
  { label: "GitHub", href: siteConfig.social.github, Icon: Github },
  { label: "LinkedIn", href: siteConfig.social.linkedin, Icon: Linkedin },
  { label: "Instagram", href: siteConfig.social.instagram, Icon: Instagram },
  { label: "Email", href: `mailto:${siteConfig.email}`, Icon: Mail },
].filter((item) => item.href && !item.href.endsWith("mailto:"));

const footerNav: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "About", href: "/about" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Projects", href: "/projects" },
    ],
  },
  {
    heading: "Work",
    links: [
      { label: "Services", href: "/services" },
      { label: "Products", href: "/products" },
      { label: "Writing", href: "/writing" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "GitHub", href: siteConfig.social.github },
      { label: "LinkedIn", href: siteConfig.social.linkedin },
      { label: "Instagram", href: siteConfig.social.instagram },
    ].filter((link) => link.href),
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-hairline">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent text-sm font-bold text-canvas">
                {siteConfig.initials}
              </span>
              <span className="text-sm font-semibold tracking-tight text-ink">
                {siteConfig.name}
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
              {siteConfig.tagline}
            </p>
            <div className="mt-1 flex items-center gap-2">
              {socialLinks.map(({ label, href, Icon }) => {
                const external = href.startsWith("http");
                return (
                  <a
                    key={label}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    aria-label={label}
                    className="group grid h-10 w-10 place-items-center rounded-full border border-hairline text-lg text-ink-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-hairline-strong hover:text-ink"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {footerNav.map((group) => (
            <div key={group.heading} className="flex flex-col gap-3">
              <h3 className="text-2xs font-medium uppercase tracking-[0.18em] text-ink-subtle">
                {group.heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => {
                  const external = link.href.startsWith("http");
                  return (
                    <li key={link.label}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-ink-muted transition-colors hover:text-ink"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-ink-muted transition-colors hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 text-sm text-ink-subtle sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="font-mono text-2xs uppercase tracking-[0.16em]">
            Systems / Legal Tech / Automation / AI
          </p>
        </div>
      </Container>
    </footer>
  );
}
