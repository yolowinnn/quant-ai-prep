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
  Database,
  Cpu,
  FlaskConical,
  Gauge,
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
  Database,
  Cpu,
  FlaskConical,
  Gauge,
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
