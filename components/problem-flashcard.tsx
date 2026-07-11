"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Star, Eye, EyeOff, Lightbulb, ArrowUpRight } from "lucide-react";
import type { Problem } from "@/lib/types";
import { TRACK_MAP } from "@/lib/tracks";
import { Markdown } from "./markdown";
import { DifficultyBadge } from "./difficulty-badge";
import { useProgress } from "./progress-provider";

export function ProblemFlashcard({
  problem,
  defaultRevealed = false,
}: {
  problem: Problem;
  defaultRevealed?: boolean;
}) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const { isSolved, isStarred, toggleSolved, toggleStarred, ready } =
    useProgress();
  const track = TRACK_MAP[problem.track];
  const gradient = track?.gradient ?? "from-emerald-500 to-teal-600";
  const trackName = track?.name ?? problem.track;

  const solved = ready && isSolved(problem.id);
  const starred = ready && isStarred(problem.id);

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-[var(--bg-elev)] shadow-card transition-all ${
        solved
          ? "border-emerald-500/40"
          : "border-[var(--border)] hover:border-[var(--accent)]/40"
      }`}
    >
      {/* accent rail */}
      <span
        className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${gradient} ${
          solved ? "opacity-100" : "opacity-60"
        }`}
      />

      <div className="p-5 pl-6 sm:p-6 sm:pl-7">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full bg-gradient-to-r ${gradient} px-2.5 py-0.5 text-xs font-medium text-white`}
          >
            {trackName}
          </span>
          <DifficultyBadge difficulty={problem.difficulty} />
          {problem.source && (
            <span className="hidden text-xs text-[var(--text-muted)] sm:inline">
              · {problem.source}
            </span>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              aria-label={starred ? "Remove star" : "Star this problem"}
              aria-pressed={starred}
              onClick={() => toggleStarred(problem.id)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                starred
                  ? "text-amber-500"
                  : "text-[var(--text-muted)] hover:text-amber-500"
              }`}
            >
              <Star
                className="h-[18px] w-[18px]"
                fill={starred ? "currentColor" : "none"}
              />
            </button>
            <button
              type="button"
              aria-label={solved ? "Mark unsolved" : "Mark solved"}
              aria-pressed={solved}
              onClick={() => toggleSolved(problem.id)}
              className={`inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                solved
                  ? "bg-[var(--accent-strong)] text-white"
                  : "bg-[var(--accent-soft)] text-[var(--text-muted)] hover:text-[var(--accent)]"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              {solved ? "Solved" : "Solve"}
            </button>
          </div>
        </div>

        <Link
          href={`/problems/${problem.id}`}
          className="inline-flex items-start gap-1 text-lg font-semibold leading-snug tracking-tight hover:text-[var(--accent)]"
        >
          {problem.title}
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
        </Link>

        <div className="mt-3">
          <Markdown>{problem.prompt}</Markdown>
        </div>

        <div className="mt-4">
          <button
            type="button"
            aria-expanded={revealed}
            onClick={() => setRevealed((r) => !r)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {revealed ? (
              <>
                <EyeOff className="h-4 w-4" /> Hide solution
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Reveal solution
              </>
            )}
          </button>
        </div>

        {revealed && (
          <div className="animate-fade-up mt-4 border-t border-dashed border-[var(--border)] pt-4">
            <Markdown>{problem.solution}</Markdown>

            {problem.keyInsight && (
              <div className="mt-5 flex gap-3 rounded-xl bg-[var(--accent-soft)] p-4">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
                <p className="text-sm leading-relaxed text-[var(--text)]">
                  <span className="font-semibold text-[var(--accent)]">
                    Key insight.{" "}
                  </span>
                  {problem.keyInsight}
                </p>
              </div>
            )}

            {problem.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {problem.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--text-muted)] ring-1 ring-inset ring-[var(--border)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
