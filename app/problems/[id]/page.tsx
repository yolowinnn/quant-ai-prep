import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { ALL_PROBLEMS, getProblem, problemsByTrack } from "@/lib/problems";
import { TRACK_MAP } from "@/lib/tracks";
import { ProblemFlashcard } from "@/components/problem-flashcard";

export function generateStaticParams() {
  return ALL_PROBLEMS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = getProblem(id);
  if (!p) return { title: "Problem not found" };
  return {
    title: p.title,
    description: `${p.title} — a ${p.difficulty} problem in ${
      TRACK_MAP[p.track]?.name ?? p.track
    }, with a full worked solution.`,
  };
}

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = getProblem(id);
  if (!problem) notFound();

  const track = TRACK_MAP[problem.track];
  const siblings = problemsByTrack(problem.track);
  const idx = siblings.findIndex((p) => p.id === problem.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="mb-6 flex items-center justify-between gap-3 text-sm">
        <Link
          href={`/tracks/${problem.track}`}
          className="inline-flex items-center gap-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          <ArrowLeft className="h-4 w-4" /> {track?.name ?? "Track"}
        </Link>
        <span className="text-xs text-[var(--text-muted)]">
          {idx + 1} / {siblings.length}
        </span>
      </div>

      <ProblemFlashcard problem={problem} defaultRevealed />

      {/* prev / next */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={`/problems/${prev.id}`}
            className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-4 transition-colors hover:border-[var(--accent)]/50"
          >
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </span>
            <span className="mt-1 text-sm font-medium leading-snug group-hover:text-[var(--accent)]">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/problems/${next.id}`}
            className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-4 text-right transition-colors hover:border-[var(--accent)]/50"
          >
            <span className="inline-flex items-center justify-end gap-1 text-xs text-[var(--text-muted)]">
              Next <ChevronRight className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 text-sm font-medium leading-snug group-hover:text-[var(--accent)]">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
