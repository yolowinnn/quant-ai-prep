export type Difficulty = "warmup" | "core" | "hard" | "elite";

export type Domain = "quant" | "ai";

export type TrackId =
  | "brainteasers"
  | "probability"
  | "stochastic"
  | "pricing"
  | "math"
  | "programming"
  | "ml-classic"
  | "ml-deep"
  | "ml-system";

export interface Problem {
  /** Globally unique, URL-safe slug. */
  id: string;
  track: TrackId;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  /** Where the canonical version of this question comes from. */
  source?: string;
  /** Markdown + LaTeX ($...$ inline, $$...$$ block). */
  prompt: string;
  /** Markdown + LaTeX worked solution. */
  solution: string;
  /** One-line takeaway shown as a highlight. */
  keyInsight?: string;
}

export interface Track {
  id: TrackId;
  name: string;
  /** Short label used in compact UI. */
  short: string;
  blurb: string;
  domain: Domain;
  /** lucide-react icon name. */
  icon: string;
  /** Tailwind gradient stops, e.g. "from-emerald-500 to-teal-600". */
  gradient: string;
}

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; order: number; className: string }
> = {
  warmup: {
    label: "Warm-up",
    order: 0,
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
  },
  core: {
    label: "Core",
    order: 1,
    className:
      "bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/20",
  },
  hard: {
    label: "Hard",
    order: 2,
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20",
  },
  elite: {
    label: "Elite",
    order: 3,
    className:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/20",
  },
};
