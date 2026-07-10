import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TRACKS } from "@/lib/tracks";
import { trackCounts } from "@/lib/problems";
import { TrackIcon } from "@/components/track-icon";
import type { Domain } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tracks",
  description:
    "Curated tracks spanning quantitative finance, AI/ML, and large-model training, data and evaluation interview preparation.",
};

const GROUPS: { domain: Domain; label: string; sub: string }[] = [
  {
    domain: "quant",
    label: "Quantitative Finance",
    sub: "The Green Book canon — brainteasers through stochastic calculus and pricing.",
  },
  {
    domain: "ai",
    label: "AI / Machine Learning",
    sub: "From the fundamentals of statistical learning to the modern deep-learning stack.",
  },
  {
    domain: "mle",
    label: "Training & Research Infrastructure",
    sub: "How large models are actually built — data curation, distributed training, automated experimentation, and evaluation at scale.",
  },
];

export default function TracksPage() {
  const counts = trackCounts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-10 max-w-2xl">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          {TRACKS.length} tracks
        </div>
        <h1
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Choose your track
        </h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Each track is a self-contained sequence of problems with full
          solutions. Work top-to-bottom or jump to what you need.
        </p>
      </header>

      {GROUPS.map((g) => (
        <section key={g.domain} className="mb-12">
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="text-xl font-semibold tracking-tight">{g.label}</h2>
            <span className="text-sm text-[var(--text-muted)]">{g.sub}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKS.filter((t) => t.domain === g.domain).map((t) => (
              <Link
                key={t.id}
                href={`/tracks/${t.id}`}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/50"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient} text-white`}
                  >
                    <TrackIcon name={t.icon} className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                    {counts[t.id] ?? 0} problems
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">
                  {t.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                  {t.blurb}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                  Open track <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
