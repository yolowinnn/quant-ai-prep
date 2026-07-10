import {
  Puzzle,
  Dice5,
  Waves,
  LineChart,
  Sigma,
  Braces,
  Brain,
  Network,
  Boxes,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Puzzle,
  Dice5,
  Waves,
  LineChart,
  Sigma,
  Braces,
  Brain,
  Network,
  Boxes,
};

export function TrackIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Puzzle;
  return <Icon className={className} />;
}
