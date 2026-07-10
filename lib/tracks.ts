import type { Track } from "./types";

export const TRACKS: Track[] = [
  {
    id: "brainteasers",
    name: "Brainteasers",
    short: "Teasers",
    blurb:
      "Logic puzzles, invariants and clever counting — the classic warm-up round every trading desk opens with.",
    domain: "quant",
    icon: "Puzzle",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "probability",
    name: "Probability",
    short: "Prob",
    blurb:
      "Conditioning, expectation, symmetry and martingale tricks — the single most tested area in quant interviews.",
    domain: "quant",
    icon: "Dice5",
    gradient: "from-teal-500 to-cyan-600",
  },
  {
    id: "stochastic",
    name: "Stochastic Calculus",
    short: "Stoch",
    blurb:
      "Brownian motion, Itô's lemma, martingales and SDEs — the mathematical engine behind derivatives pricing.",
    domain: "quant",
    icon: "Waves",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "pricing",
    name: "Derivatives Pricing",
    short: "Pricing",
    blurb:
      "Black–Scholes, the Greeks, put–call parity and risk-neutral valuation — from first principles to hedging.",
    domain: "quant",
    icon: "LineChart",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "math",
    name: "Calculus & Linear Algebra",
    short: "Math",
    blurb:
      "Eigenvalues, positive-definiteness, optimization and the integrals that show up again and again.",
    domain: "quant",
    icon: "Sigma",
    gradient: "from-lime-500 to-green-600",
  },
  {
    id: "programming",
    name: "Programming & Algorithms",
    short: "Code",
    blurb:
      "Sampling, dynamic programming, data structures and the numerical tricks a quant dev is expected to know cold.",
    domain: "quant",
    icon: "Braces",
    gradient: "from-emerald-600 to-teal-700",
  },
  {
    id: "ml-classic",
    name: "Classical ML",
    short: "ML",
    blurb:
      "Bias–variance, regularization, SVMs, trees and boosting — the fundamentals every ML interview probes.",
    domain: "ai",
    icon: "Brain",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "ml-deep",
    name: "Deep Learning",
    short: "DL",
    blurb:
      "Backprop, normalization, CNNs, RNNs and the Transformer — the architecture questions of the modern AI stack.",
    domain: "ai",
    icon: "Network",
    gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "ml-system",
    name: "ML System Design",
    short: "MLSys",
    blurb:
      "Recommenders, embeddings, A/B testing and training–serving skew — turning models into products at scale.",
    domain: "ai",
    icon: "Boxes",
    gradient: "from-indigo-500 to-violet-600",
  },
];

export const TRACK_MAP: Record<string, Track> = Object.fromEntries(
  TRACKS.map((t) => [t.id, t])
);
