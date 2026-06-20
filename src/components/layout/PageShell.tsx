import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type PageShellProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  actions?: ReactNode;
  children: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  align = "left",
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid opacity-50 mask-fade-b"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 bg-radial-brand"
        />
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <div
            className={cn(
              "flex flex-col gap-5",
              align === "center" && "items-center text-center",
            )}
          >
            {eyebrow && (
              <span className="inline-flex items-center gap-2.5 font-mono text-2xs uppercase tracking-[0.18em] text-brand-300">
                <span className="h-px w-6 bg-brand-400/50" />
                {eyebrow}
              </span>
            )}
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  "max-w-2xl text-pretty text-lg leading-relaxed text-ink-muted",
                  align === "center" && "mx-auto",
                )}
              >
                {description}
              </p>
            )}
            {actions && <div className="mt-2 flex flex-wrap gap-3">{actions}</div>}
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">{children}</Container>
    </div>
  );
}
