import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TRACKS, TRACK_MAP } from "@/lib/tracks";
import { problemsByTrack } from "@/lib/problems";
import type { TrackId } from "@/lib/types";
import { TrackIcon } from "@/components/track-icon";
import { PracticeExplorer } from "@/components/practice-explorer";

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  const t = TRACK_MAP[track];
  if (!t) return { title: "Track not found" };
  return { title: t.name, description: t.blurb };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const t = TRACK_MAP[track];
  if (!t) notFound();

  const problems = problemsByTrack(track as TrackId);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/tracks"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
      >
        <ArrowLeft className="h-4 w-4" /> All tracks
      </Link>

      <header className="mb-8 flex items-start gap-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${t.gradient} text-white shadow-glow`}
        >
          <TrackIcon name={t.icon} className="h-7 w-7" />
        </span>
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {t.domain === "quant" ? "Quant" : "AI / ML"}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              · {problems.length} problems
            </span>
          </div>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.name}
          </h1>
          <p className="mt-2 text-[var(--text-muted)]">{t.blurb}</p>
        </div>
      </header>

      <PracticeExplorer
        problems={problems}
        initialTrack={track as TrackId}
        lockTrack
      />
    </div>
  );
}
