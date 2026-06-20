import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { WritingExplorer } from "@/components/sections/WritingExplorer";

export const metadata: Metadata = {
  title: "Writing & Insights",
  description:
    "Essays and notes from Joe Wilkinson on systems thinking, legal technology, automation, and building personal operating systems.",
};

export default function WritingPage() {
  return (
    <>
      <ScrollProgress />
      <PageShell
        eyebrow="Writing & Insights"
        title="Notes on systems, legal tech, and AI."
        description="Essays on how real operations work and break, and how to architect systems that scale. Filter by topic to explore."
      >
        <WritingExplorer />

        <div className="mt-14 rounded-2xl border border-hairline bg-panel p-6 text-sm leading-relaxed text-ink-muted">
          <strong className="font-semibold text-ink">More coming soon.</strong>{" "}
          These pieces are in progress. A way to follow along and subscribe will
          be added here as the writing goes live.
        </div>
      </PageShell>
    </>
  );
}
