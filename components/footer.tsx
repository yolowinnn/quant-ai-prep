import Link from "next/link";
import { TrendingUp, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-elev)]">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <TrendingUp className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Quant·AI Prep</div>
              <div className="text-xs text-[var(--text-muted)]">
                The Green Book &amp; Beyond
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
            <Link href="/problems" className="hover:text-[var(--accent)]">
              Practice
            </Link>
            <Link href="/tracks" className="hover:text-[var(--accent)]">
              Tracks
            </Link>
            <Link href="/about" className="hover:text-[var(--accent)]">
              About
            </Link>
            <a
              href="https://github.com/yolowinnn/quant-ai-prep"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[var(--accent)]"
            >
              <Github className="h-4 w-4" /> Source
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6 text-xs leading-relaxed text-[var(--text-muted)]">
          Built for study and interview preparation. Content is curated from
          classic references including{" "}
          <em>A Practical Guide to Quantitative Finance Interviews</em> (Xinfeng
          Zhou), Hull&apos;s <em>Options, Futures, and Other Derivatives</em>,
          and standard machine-learning texts. All original explanations. Not
          affiliated with any employer or publisher.
        </div>
      </div>
    </footer>
  );
}
