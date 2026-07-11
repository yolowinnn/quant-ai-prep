import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Layers,
  Target,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { TRACKS } from "@/lib/tracks";
import { ALL_PROBLEMS, trackCounts, getProblem } from "@/lib/problems";
import { TrackIcon } from "@/components/track-icon";
import { ProblemFlashcard } from "@/components/problem-flashcard";
import { DIFFICULTY_META } from "@/lib/types";

const FEATURED_IDS = [
  "screwy-pirates",
  "expected-tosses-hh-ht",
  "self-attention",
];

export default function Home() {
  const counts = trackCounts();
  const total = ALL_PROBLEMS.length;
  const sumDomain = (d: string) =>
    TRACKS.filter((t) => t.domain === d).reduce(
      (s, t) => s + (counts[t.id] ?? 0),
      0
    );
  const quantCount = sumDomain("quant");
  const aiCount = sumDomain("ai");
  const mleCount = sumDomain("mle");
  const featured = FEATURED_IDS.map((id) => getProblem(id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid" aria-hidden />
        <div
          className="absolute left-1/2 top-0 -z-0 h-[420px] w-[820px] max-w-full -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(20,176,98,0.55), transparent)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-4 py-1.5 text-xs font-medium text-[var(--text-muted)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              The classic Green Book, reimagined as an interactive study companion
            </div>

            <h1
              className="animate-fade-up text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Master the{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                quant &amp; AI
              </span>{" "}
              interview.
            </h1>

            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              A curated set of{" "}
              <strong className="font-semibold text-[var(--text)]">
                {total} worked problems
              </strong>{" "}
              — from the legendary brainteasers of{" "}
              <em>A Practical Guide to Quantitative Finance Interviews</em> to
              stochastic calculus, derivatives pricing, the modern
              deep-learning stack, and the infrastructure behind{" "}
              <strong className="font-semibold text-[var(--text)]">
                training, data curation and evaluating
              </strong>{" "}
              large models. Every problem comes with a full, first-principles
              solution.
            </p>

            <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/problems"
                className="group inline-flex items-center gap-2 rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
              >
                Start practicing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/tracks"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--accent)]"
              >
                Browse tracks
              </Link>
            </div>

            {/* stats */}
            <div className="animate-fade-up mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
              <Stat value={total} label="Problems" />
              <Stat value={TRACKS.length} label="Tracks" />
              <Stat
                value={`${quantCount}·${aiCount}·${mleCount}`}
                label="Quant · AI · MLE"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Tracks ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading
          eyebrow={`${TRACKS.length} tracks`}
          title="Everything the desks ask about"
          sub="Structured the way real interviews are — the quant canon, the AI/ML canon, and the training, data and evaluation stack behind large models."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t) => (
            <Link
              key={t.id}
              href={`/tracks/${t.id}`}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/50"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient} text-white shadow-sm`}
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

      {/* ---------- Featured ---------- */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-elev)]/40">
        <div className="mx-auto max-w-3xl px-5 py-16">
          <SectionHeading
            eyebrow="Try a few"
            title="Reveal the solution when you're ready"
            sub="Flip any card to see the full worked solution and the one-line takeaway. Mark it solved to track your progress."
          />
          <div className="space-y-5">
            {featured.map((p) => (
              <ProblemFlashcard key={p.id} problem={p} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/problems"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-5 py-2.5 text-sm font-semibold transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              See all {total} problems <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={BookOpen}
            title="First-principles solutions"
            body="No hand-waving. Each answer derives the result, states the key insight, and links to the intuition."
          />
          <Feature
            icon={Target}
            title="Difficulty-graded"
            body="From warm-ups to elite martingale tricks, filter to exactly the level you want to drill."
          />
          <Feature
            icon={Layers}
            title="Beautiful math"
            body="Full LaTeX rendering via KaTeX — Itô's lemma and Black–Scholes look the way they should."
          />
          <Feature
            icon={Zap}
            title="Track your progress"
            body="Star the hard ones, mark problems solved, and filter to what's left — saved right in your browser."
          />
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-emerald-600 to-teal-700 px-8 py-14 text-center text-white shadow-glow">
          <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
          <div className="relative">
            <h2
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to drill?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-emerald-50/90">
              Pick a track, hide the solutions, and start reasoning. The
              interview is just pattern recognition — build the patterns here.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-emerald-50/90">
              {["warmup", "core", "hard", "elite"].map((d) => (
                <span key={d} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  {DIFFICULTY_META[d as keyof typeof DIFFICULTY_META].label}
                </span>
              ))}
            </div>
            <Link
              href="/problems"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition-transform hover:scale-[1.02]"
            >
              Start practicing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-4">
      <div
        className="text-2xl font-semibold tracking-tight text-[var(--accent)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-8 max-w-2xl">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        {eyebrow}
      </div>
      <h2
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <p className="mt-2 text-[var(--text-muted)]">{sub}</p>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof BookOpen;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
        {body}
      </p>
    </div>
  );
}
