import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Mail } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site";

export function ContactCTA() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-hairline bg-panel px-6 py-14 shadow-card sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-grid opacity-30 mask-radial"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[42rem] -translate-x-1/2 bg-radial-brand"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Have a messy process that should be a system?
            </h2>
            <p className="text-pretty text-lg leading-relaxed text-ink-muted">
              Tell me what is slowing your team down. I will help you turn it
              into scalable, well-documented infrastructure.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/contact" size="lg">
                Contact Me
                <ArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <Button
                href={`mailto:${siteConfig.email}`}
                size="lg"
                variant="secondary"
              >
                <Mail className="text-base" />
                {siteConfig.email}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
