import type { Metadata } from "next";
import { ALL_PROBLEMS } from "@/lib/problems";
import { PracticeExplorer } from "@/components/practice-explorer";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "Search and filter the full problem set across quant and AI/ML interview tracks, with worked solutions and progress tracking.",
};

export default function ProblemsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-8">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Practice mode
        </div>
        <h1
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The full problem set
        </h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Filter by track, domain, or difficulty. Hide the solution, reason it
          out, then reveal. Your stars and solved marks are saved in your
          browser.
        </p>
      </header>

      <PracticeExplorer problems={ALL_PROBLEMS} />
    </div>
  );
}
