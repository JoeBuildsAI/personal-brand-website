"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { articles } from "@/data/writing";

const categoryThemes: Record<string, string> = {
  "Systems Thinking": "from-brand-500/30 via-brand-400/10 to-transparent",
  "Legal Technology": "from-accent/25 via-accent/5 to-transparent",
  "Personal Systems": "from-violet/25 via-violet/5 to-transparent",
  default: "from-brand-500/20 via-brand-400/5 to-transparent",
};

const categoryDot: Record<string, string> = {
  "Systems Thinking": "bg-brand-400",
  "Legal Technology": "bg-accent",
  "Personal Systems": "bg-violet",
  default: "bg-ink-subtle",
};

function ArticleThumb({
  category,
  large = false,
}: {
  category: string;
  large?: boolean;
}) {
  const gradient = categoryThemes[category] ?? categoryThemes.default;
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-hairline bg-canvas-raised",
        large ? "aspect-[16/10]" : "aspect-[16/9]",
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-60" />
      <div
        aria-hidden="true"
        className={cn("absolute inset-0 bg-gradient-to-br", gradient)}
      />
      <svg
        viewBox="0 0 200 90"
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 text-brand-300"
      >
        <g stroke="rgba(255,255,255,0.14)" strokeWidth={1}>
          <line x1="30" y1="45" x2="90" y2="22" />
          <line x1="30" y1="45" x2="90" y2="68" />
          <line x1="90" y1="22" x2="150" y2="45" />
          <line x1="90" y1="68" x2="150" y2="45" />
          <line x1="150" y1="45" x2="178" y2="30" />
        </g>
        {[
          { x: 30, y: 45, d: "0s" },
          { x: 90, y: 22, d: "0.5s" },
          { x: 90, y: 68, d: "1s" },
          { x: 150, y: 45, d: "0.3s" },
          { x: 178, y: 30, d: "0.8s" },
        ].map((node, index) => (
          <g key={index}>
            <circle cx={node.x} cy={node.y} r={7} fill="currentColor" opacity={0.12} />
            <circle
              cx={node.x}
              cy={node.y}
              r={3}
              fill="currentColor"
              className="animate-pulse-node"
              style={{ animationDelay: node.d }}
            />
          </g>
        ))}
      </svg>
      <span className="absolute bottom-3 left-4 font-mono text-2xs uppercase tracking-[0.16em] text-ink-muted">
        {category}
      </span>
    </div>
  );
}

export function WritingExplorer() {
  const reduce = useReducedMotion();
  const featured = articles[0];
  const archive = useMemo(() => articles.slice(1), []);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(archive.map((a) => a.category)))],
    [archive],
  );
  const [filter, setFilter] = useState("All");
  const filtered =
    filter === "All" ? archive : archive.filter((a) => a.category === filter);

  return (
    <div className="flex flex-col gap-14">
      <article className="group grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <ArticleThumb category={featured.category} large />
        <div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-2xs uppercase tracking-[0.14em] text-brand-200">
              Featured
            </span>
            <span className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-subtle">
              {featured.category}
            </span>
          </div>
          <h2 className="mt-5 text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {featured.title}
          </h2>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink-muted">
            {featured.excerpt}
          </p>
          <div className="mt-6 flex items-center gap-3 text-2xs uppercase tracking-[0.14em] text-ink-subtle">
            <span>{featured.readTime}</span>
            <span className="h-1 w-1 rounded-full bg-ink-subtle/60" />
            <span>{featured.status}</span>
          </div>
        </div>
      </article>

      <div>
        <div className="border-t border-hairline pt-8">
          <span className="font-mono text-2xs uppercase tracking-[0.16em] text-ink-subtle">
            Topic clusters
          </span>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {categories.map((category) => {
              const active = filter === category;
              const count =
                category === "All"
                  ? archive.length
                  : archive.filter((item) => item.category === category).length;
              const dot = categoryDot[category] ?? categoryDot.default;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFilter(category)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200",
                    active
                      ? "border-brand-500/40 bg-brand-500/10 text-brand-100"
                      : "border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink",
                  )}
                >
                  {category !== "All" ? (
                    <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
                  ) : null}
                  {category}
                  <span className="font-mono text-[10px] text-ink-subtle">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((article) => (
              <motion.article
                key={article.slug}
                layout
                initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                animate={reduce ? {} : { opacity: 1, scale: 1 }}
                exit={reduce ? {} : { opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-4 rounded-3xl border border-hairline bg-panel/50 p-4 transition-colors duration-300 hover:border-hairline-strong sm:p-5"
              >
                <ArticleThumb category={article.category} />
                <div className="flex flex-1 flex-col">
                  <h3 className="text-lg font-semibold tracking-tight text-ink">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4 text-2xs uppercase tracking-[0.14em] text-ink-subtle">
                    <span>{article.readTime}</span>
                    <span>{article.status}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
