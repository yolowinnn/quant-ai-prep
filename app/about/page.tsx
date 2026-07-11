import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookMarked, GitBranch, ShieldCheck } from "lucide-react";
import { ALL_PROBLEMS, trackCounts } from "@/lib/problems";
import { TRACKS } from "@/lib/tracks";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Quant·AI Prep — a curated, open study companion for quant and AI/ML interviews.",
};

export default function AboutPage() {
  const counts = trackCounts();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        About
      </div>
      <h1
        className="text-3xl font-semibold tracking-tight sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        The Green Book, made interactive.
      </h1>

      <div className="prose-quant mt-6 text-[var(--text-muted)]">
        <p>
          Quant·AI Prep began with a simple observation: the best interview
          references — Xinfeng Zhou&apos;s{" "}
          <em>A Practical Guide to Quantitative Finance Interviews</em> (the
          &ldquo;Green Book&rdquo;), Hull&apos;s{" "}
          <em>Options, Futures, and Other Derivatives</em>, and the standard ML
          texts — are dense PDFs. Great for reading, poor for{" "}
          <strong>drilling</strong>. This site turns that canon into something
          you can search, filter, and quiz yourself against.
        </p>
        <p>
          Every problem is rewritten from first principles with a complete
          worked solution and a one-line key insight — the thing you actually
          need to recall under pressure. Math is rendered with real LaTeX, code
          is syntax-clean, and your progress lives in your browser.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <InfoCard
          icon={BookMarked}
          title={`${ALL_PROBLEMS.length} problems`}
          body={`Across ${TRACKS.length} tracks, from warm-up teasers to elite martingale arguments and large-scale training systems.`}
        />
        <InfoCard
          icon={ShieldCheck}
          title="Original solutions"
          body="Curated from classic references; all explanations written fresh. Not affiliated with any publisher."
        />
        <InfoCard
          icon={GitBranch}
          title="Open source"
          body="The whole thing is on GitHub. Spot a slicker proof? Contributions welcome."
        />
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        What&apos;s inside
      </h2>
      <div className="mt-4 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]">
        {TRACKS.map((t) => (
          <Link
            key={t.id}
            href={`/tracks/${t.id}`}
            className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--accent-soft)]"
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br ${t.gradient}`}
            />
            <span className="text-sm font-medium">{t.name}</span>
            <span className="ml-auto text-xs text-[var(--text-muted)]">
              {counts[t.id] ?? 0} problems
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] p-6">
        <h3 className="text-base font-semibold">A note on use</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          This is a study aid. The goal isn&apos;t to memorize answers — it&apos;s
          to internalize the handful of recurring ideas (conditioning, symmetry,
          replication, the bias–variance tradeoff) that generate them. Read the
          prompt, close the solution, and try to reconstruct the argument
          yourself.
        </p>
        <Link
          href="/problems"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-strong)] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        >
          Start practicing <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof BookMarked;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-5">
      <Icon className="h-5 w-5 text-[var(--accent)]" />
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
        {body}
      </p>
    </div>
  );
}
