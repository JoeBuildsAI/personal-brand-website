"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { navLinks, siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Close, Github, Menu } from "@/components/ui/icons";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : (pathname?.startsWith(href) ?? false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled || open ? "border-hairline glass" : "border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-container items-center justify-between container-px">
        <Link href="/" className="flex items-center gap-3" aria-label={siteConfig.name}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent text-sm font-bold text-canvas shadow-[0_8px_24px_-8px_rgba(104,120,242,0.7)]">
            {siteConfig.initials}
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-ink">
              {siteConfig.name}
            </span>
            <span className="mt-1 hidden text-2xs uppercase tracking-[0.16em] text-ink-subtle sm:block">
              Systems Architect
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm transition-colors",
                isActive(link.href)
                  ? "text-ink"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden h-10 w-10 place-items-center rounded-full text-lg text-ink-muted transition-colors hover:bg-white/5 hover:text-ink sm:grid"
          >
            <Github />
          </a>
          <Button href="/contact" size="sm" className="hidden sm:inline-flex">
            Contact
          </Button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full text-xl text-ink transition-colors hover:bg-white/5 lg:hidden"
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden">
          <div className="mx-auto max-w-container pb-6 pt-1 container-px">
            <div className="flex flex-col gap-1 rounded-2xl border border-hairline bg-panel p-2 shadow-card">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm transition-colors",
                    isActive(link.href)
                      ? "bg-white/5 text-ink"
                      : "text-ink-muted hover:bg-white/5 hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-1 flex items-center gap-2 p-1">
                <Button href="/contact" className="flex-1">
                  Contact Me
                </Button>
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="grid h-11 w-11 place-items-center rounded-full border border-hairline-strong text-lg text-ink-muted transition-colors hover:text-ink"
                >
                  <Github />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
