import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectExplorer } from "@/components/sections/ProjectExplorer";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore the systems, tools, and prototypes Joe Wilkinson designs and builds — spanning automation, AI workflows, reporting, and platform architecture.",
};

export default function ProjectsPage() {
  return (
    <PageShell
      eyebrow="Project Constellation"
      title="Every build, mapped."
      description="Projects orbit the clusters they belong to — platforms, automation and AI, and platform architecture. Select any node to inspect its overview, architecture, stack, and links."
    >
      <ProjectExplorer />
    </PageShell>
  );
}
