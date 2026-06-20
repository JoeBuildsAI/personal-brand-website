import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-radial"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 bg-radial-brand"
      />
      <Container className="relative">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <span className="font-mono text-2xs uppercase tracking-[0.2em] text-brand-300">
            Error 404
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            This page took a different path.
          </h1>
          <p className="text-pretty text-ink-muted">
            The page you are looking for does not exist or may have moved. Let
            me get you back to solid ground.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/">Back home</Button>
            <Button href="/case-studies" variant="secondary">
              View case studies
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
