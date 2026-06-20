import type { Metadata } from "next";
import { GraphUniverse } from "@/components/graph/GraphUniverse";
import { getGraphModel } from "@/lib/graph/model";
import { siteConfig } from "@/lib/site";
import type { GraphNode } from "@/lib/graph/types";

export const metadata: Metadata = {
  description: `${siteConfig.tagline} Explore the work of ${siteConfig.name} as a living, interactive map of systems, case studies, products, and writing.`,
};

/**
 * Server-rendered, visually-hidden outline of the entire graph. This is the SEO
 * + no-JS + screen-reader substrate beneath the interactive universe: every
 * node here is a real, crawlable link to its deep page.
 */
function GraphTextOutline() {
  const model = getGraphModel();
  const children = (id: string): GraphNode[] =>
    (model.childrenOf.get(id) ?? []).map((childId) => model.byId.get(childId)!);

  return (
    <section className="sr-only" aria-label="Site overview">
      <h1>
        {siteConfig.name} — {siteConfig.role}
      </h1>
      <p>{siteConfig.tagline}</p>
      <nav aria-label="All sections and work">
        <ul>
          {children(model.root.id).map((domain) => (
            <li key={domain.id}>
              {domain.href ? (
                <a href={domain.href}>{domain.label}</a>
              ) : (
                domain.label
              )}
              <p>{domain.summary}</p>
              {children(domain.id).length > 0 ? (
                <ul>
                  {children(domain.id).map((system) => (
                    <li key={system.id}>
                      {system.href ? (
                        <a href={system.href}>{system.label}</a>
                      ) : (
                        system.label
                      )}
                      <p>{system.summary}</p>
                      {children(system.id).length > 0 ? (
                        <ul>
                          {children(system.id).map((artifact) => (
                            <li key={artifact.id}>
                              {artifact.href ? (
                                <a
                                  href={artifact.href}
                                  {...(artifact.external
                                    ? { target: "_blank", rel: "noopener noreferrer" }
                                    : {})}
                                >
                                  {artifact.label}
                                </a>
                              ) : (
                                artifact.label
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <section
        aria-label="Interactive systems universe"
        className="relative h-[calc(100svh-4rem)] w-full"
      >
        <GraphUniverse />
      </section>
      <GraphTextOutline />
    </>
  );
}
