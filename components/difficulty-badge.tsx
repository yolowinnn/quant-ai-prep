import { DIFFICULTY_META, type Difficulty } from "@/lib/types";

export function DifficultyBadge({
  difficulty,
  className = "",
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  const meta = DIFFICULTY_META[difficulty];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.className} ${className}`}
    >
      {meta.label}
    </span>
  );
}
