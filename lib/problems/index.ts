import type { Problem, TrackId } from "../types";
import { brainteasers } from "./brainteasers";
import { probability } from "./probability";
import { stochastic } from "./stochastic";
import { pricing } from "./pricing";
import { math } from "./math";
import { programming } from "./programming";
import { mlClassic } from "./ml-classic";
import { mlDeep } from "./ml-deep";
import { mlSystem } from "./ml-system";

export const ALL_PROBLEMS: Problem[] = [
  ...brainteasers,
  ...probability,
  ...stochastic,
  ...pricing,
  ...math,
  ...programming,
  ...mlClassic,
  ...mlDeep,
  ...mlSystem,
];

export const PROBLEMS_BY_ID: Record<string, Problem> = Object.fromEntries(
  ALL_PROBLEMS.map((p) => [p.id, p])
);

export function problemsByTrack(track: TrackId): Problem[] {
  return ALL_PROBLEMS.filter((p) => p.track === track);
}

export function trackCounts(): Record<string, number> {
  return ALL_PROBLEMS.reduce<Record<string, number>>((acc, p) => {
    acc[p.track] = (acc[p.track] ?? 0) + 1;
    return acc;
  }, {});
}

export function getProblem(id: string): Problem | undefined {
  return PROBLEMS_BY_ID[id];
}
