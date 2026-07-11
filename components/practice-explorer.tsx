"use client";

import { useMemo, useState } from "react";
import { Search, Star, X, SlidersHorizontal } from "lucide-react";
import type { Difficulty, Domain, Problem, TrackId } from "@/lib/types";
import { DIFFICULTY_META } from "@/lib/types";
import { TRACKS } from "@/lib/tracks";
import { ProblemFlashcard } from "./problem-flashcard";
import { useProgress } from "./progress-provider";

const DIFFICULTIES: Difficulty[] = ["warmup", "core", "hard", "elite"];

const DOMAIN_LABELS: Record<Domain | "all", string> = {
  all: "All domains",
  quant: "Quant",
  ai: "AI / ML",
  mle: "Training & Eval",
};

export function PracticeExplorer({
  problems,
  initialTrack = "all",
  lockTrack = false,
}: {
  problems: Problem[];
  initialTrack?: TrackId | "all";
  lockTrack?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState<TrackId | "all">(initialTrack);
  const [domain, setDomain] = useState<Domain | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [starredOnly, setStarredOnly] = useState(false);
  const [unsolvedOnly, setUnsolvedOnly] = useState(false);

  const { isSolved, isStarred, solved } = useProgress();

  const visibleTracks = useMemo(
    () => (domain === "all" ? TRACKS : TRACKS.filter((t) => t.domain === domain)),
    [domain]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (track !== "all" && p.track !== track) return false;
      if (domain !== "all") {
        const t = TRACKS.find((x) => x.id === p.track);
        if (t?.domain !== domain) return false;
      }
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (starredOnly && !isStarred(p.id)) return false;
      if (unsolvedOnly && isSolved(p.id)) return false;
      if (q) {
        const hay = (
          p.title +
          " " +
          p.tags.join(" ") +
          " " +
          p.prompt +
          " " +
          (p.source ?? "")
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    problems,
    query,
    track,
    domain,
    difficulty,
    starredOnly,
    unsolvedOnly,
    isStarred,
    isSolved,
  ]);

  const solvedInView = filtered.filter((p) => solved.has(p.id)).length;
  const pct = filtered.length
    ? Math.round((solvedInView / filtered.length) * 100)
    : 0;

  const anyFilter =
    query || domain !== "all" || difficulty !== "all" || starredOnly || unsolvedOnly ||
    (!lockTrack && track !== "all");

  const clearAll = () => {
    setQuery("");
    if (!lockTrack) setTrack("all");
    setDomain("all");
    setDifficulty("all");
    setStarredOnly(false);
    setUnsolvedOnly(false);
  };

  return (
    <div>
      {/* Search */}
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="search"
          aria-label="Search problems"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search problems, tags, sources…"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] py-3 pl-11 pr-4 text-sm transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        />
      </div>

      {/* Domain + difficulty + toggles */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {!lockTrack && (
          <>
            <FilterGroup>
              {(["all", "quant", "ai", "mle"] as const).map((d) => (
                <Chip
                  key={d}
                  active={domain === d}
                  onClick={() => {
                    setDomain(d);
                    if (d !== "all") setTrack("all");
                  }}
                >
                  {DOMAIN_LABELS[d]}
                </Chip>
              ))}
            </FilterGroup>

            <span className="hidden h-5 w-px bg-[var(--border)] sm:block" />
          </>
        )}

        <FilterGroup>
          <Chip active={difficulty === "all"} onClick={() => setDifficulty("all")}>
            Any level
          </Chip>
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              active={difficulty === d}
              onClick={() => setDifficulty(d)}
            >
              {DIFFICULTY_META[d].label}
            </Chip>
          ))}
        </FilterGroup>

        <span className="hidden h-5 w-px bg-[var(--border)] sm:block" />

        <Chip active={starredOnly} onClick={() => setStarredOnly((v) => !v)}>
          <Star
            className="mr-1 inline h-3.5 w-3.5"
            fill={starredOnly ? "currentColor" : "none"}
          />
          Starred
        </Chip>
        <Chip active={unsolvedOnly} onClick={() => setUnsolvedOnly((v) => !v)}>
          Unsolved
        </Chip>

        {anyFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Track chips */}
      {!lockTrack && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Chip active={track === "all"} onClick={() => setTrack("all")}>
            All tracks
          </Chip>
          {visibleTracks.map((t) => (
            <Chip
              key={t.id}
              active={track === t.id}
              onClick={() => setTrack(t.id)}
            >
              {t.name}
            </Chip>
          ))}
        </div>
      )}

      {/* Progress + count */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-4">
        <SlidersHorizontal className="h-5 w-5 shrink-0 text-[var(--accent)]" />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">
              {filtered.length} problem{filtered.length === 1 ? "" : "s"}
            </span>
            <span className="text-[var(--text-muted)]">
              {solvedInView} solved · {pct}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] py-16 text-center text-[var(--text-muted)]">
          No problems match these filters.
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((p) => (
            <ProblemFlashcard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-1.5">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
        active
          ? "bg-[var(--accent-strong)] text-white"
          : "border border-[var(--border)] bg-[var(--bg-elev)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      {children}
    </button>
  );
}
