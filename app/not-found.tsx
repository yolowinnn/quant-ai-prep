import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
      <div
        className="text-7xl font-semibold text-[var(--accent)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        404
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        This problem doesn&apos;t exist… yet.
      </h1>
      <p className="mt-2 text-[var(--text-muted)]">
        The page you&apos;re looking for isn&apos;t here. Head back and pick a
        track to keep drilling.
      </p>
      <Link
        href="/problems"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to practice
      </Link>
    </div>
  );
}
