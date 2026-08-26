import type { ScoredItem } from "../sorting/types";
import { mulberry32, normalizeSeed } from "./rng";

export type Distribution =
  | "random"
  | "sorted-ascending"
  | "sorted-descending"
  | "nearly-sorted"
  | "duplicate-heavy";

export const DISTRIBUTIONS: { value: Distribution; label: string; description: string }[] = [
  { value: "random", label: "Random", description: "Uniform random relevance scores." },
  {
    value: "sorted-ascending",
    label: "Already sorted (ascending)",
    description: "Worst-case-shaped input for naive Quick Sort pivot choices."
  },
  {
    value: "sorted-descending",
    label: "Already sorted (descending)",
    description: "Already in the platform's default output order."
  },
  {
    value: "nearly-sorted",
    label: "Nearly sorted",
    description: "Mostly ordered with a small fraction of scores swapped."
  },
  {
    value: "duplicate-heavy",
    label: "Duplicate-heavy",
    description: "Many items share the same relevance score — stresses tie-breaking."
  }
];

export const DEFAULT_SIZES = [10, 50, 100, 500, 1000, 5000, 10000];
export const MAX_SAFE_SIZE = 200_000; // guards against crashing the browser/server

/**
 * Generates a benchmark input array for a given size, distribution, and seed.
 * Same (size, distribution, seed) always produces the same array — this is
 * the reproducibility contract the whole platform depends on. Generate ONCE
 * per experiment and clone it per algorithm (see lib/sorting/validate.ts
 * cloneInput) — never regenerate per algorithm.
 */
export function generateBenchmarkInput(
  size: number,
  distribution: Distribution,
  seed: string | number
): ScoredItem[] {
  if (size < 0 || !Number.isFinite(size)) {
    throw new Error(`Invalid benchmark size: ${size}`);
  }
  if (size > MAX_SAFE_SIZE) {
    throw new Error(
      `Benchmark size ${size} exceeds the safety ceiling of ${MAX_SAFE_SIZE.toLocaleString()}.`
    );
  }

  const rand = mulberry32(normalizeSeed(seed));
  const base: ScoredItem[] = Array.from({ length: size }, (_, id) => ({
    id,
    score: Math.round(rand() * 100000) / 1000 // 3 decimal places, range [0, 100)
  }));

  switch (distribution) {
    case "random":
      return base;

    case "sorted-ascending":
      return [...base].sort((a, b) => a.score - b.score).map((item, id) => ({ ...item, id }));

    case "sorted-descending":
      return [...base].sort((a, b) => b.score - a.score).map((item, id) => ({ ...item, id }));

    case "nearly-sorted": {
      const sorted = [...base]
        .sort((a, b) => b.score - a.score)
        .map((item, id) => ({ ...item, id }));
      // Swap a small, seeded fraction (~5%) of adjacent pairs.
      const swaps = Math.max(1, Math.floor(size * 0.05));
      for (let s = 0; s < swaps; s++) {
        const i = Math.floor(rand() * (sorted.length - 1));
        if (i >= 0 && i + 1 < sorted.length) {
          const tmp = sorted[i].score;
          sorted[i] = { ...sorted[i], score: sorted[i + 1].score };
          sorted[i + 1] = { ...sorted[i + 1], score: tmp };
        }
      }
      return sorted;
    }

    case "duplicate-heavy": {
      // Collapse the range so ~10 distinct score buckets cover the whole set.
      const bucketCount = Math.max(1, Math.min(10, size));
      return base.map((item) => ({
        ...item,
        score: Math.floor((item.score / 100) * bucketCount) * (100 / bucketCount)
      }));
    }

    default:
      return base;
  }
}
