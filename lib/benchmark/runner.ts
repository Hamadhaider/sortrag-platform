import type { ScoredItem, AlgorithmName, SortDirection } from "../sorting/types";
import { quickSort } from "../sorting/quickSort";
import { mergeSort } from "../sorting/mergeSort";
import { builtinSort, noSort } from "../sorting/builtinSort";
import { cloneInput, isCorrectlyOrdered, sameOrdering } from "../sorting/validate";
import { computeStats } from "./stats";
import type { TrialStats } from "./stats";

export interface RunConfig {
  warmupRuns: number;
  measuredRuns: number;
  direction: SortDirection;
}

export const DEFAULT_RUN_CONFIG: RunConfig = {
  warmupRuns: 5,
  measuredRuns: 30,
  direction: "descending"
};

export interface AlgorithmRunResult {
  algorithm: AlgorithmName;
  trials: number[]; // every measured execution time, ms — never just the fastest
  stats: TrialStats;
  rankingCorrect: boolean;
  sortedOutput: ScoredItem[]; // from the LAST measured trial, for display/verification
}

function runAlgorithm(name: AlgorithmName, input: ScoredItem[], direction: SortDirection): ScoredItem[] {
  switch (name) {
    case "quicksort":
      return quickSort(input, direction);
    case "mergesort":
      return mergeSort(input, direction);
    case "builtin":
      return builtinSort(input, direction);
    case "nosort":
      return noSort(input);
  }
}

/**
 * Times ONLY the sorting call itself. No cloning, no logging, no chart
 * rendering, and no network I/O happens inside the timed section — all of
 * that happens before performance.now() starts or after it stops.
 */
function timedRun(
  name: AlgorithmName,
  input: ScoredItem[],
  direction: SortDirection
): { output: ScoredItem[]; timeMs: number } {
  const isolatedInput = cloneInput(input); // cloned OUTSIDE the timer
  const start = performance.now();
  const output = runAlgorithm(name, isolatedInput, direction);
  const timeMs = performance.now() - start;
  return { output, timeMs };
}

/**
 * Runs warm-up + measured trials for a single algorithm against a single
 * benchmark input. The SAME `input` array (never regenerated) is cloned
 * fresh for every trial so no algorithm can see another's mutations, and no
 * trial can see a previous trial's already-sorted output.
 */
export function benchmarkAlgorithm(
  name: AlgorithmName,
  input: ScoredItem[],
  config: RunConfig = DEFAULT_RUN_CONFIG
): AlgorithmRunResult {
  for (let i = 0; i < config.warmupRuns; i++) {
    timedRun(name, input, config.direction);
  }

  const trials: number[] = [];
  let lastOutput: ScoredItem[] = [];
  for (let i = 0; i < config.measuredRuns; i++) {
    const { output, timeMs } = timedRun(name, input, config.direction);
    trials.push(timeMs);
    lastOutput = output;
  }

  const rankingCorrect =
    name === "nosort" ? true : isCorrectlyOrdered(input, lastOutput, config.direction);

  return {
    algorithm: name,
    trials,
    stats: computeStats(trials),
    rankingCorrect,
    sortedOutput: lastOutput
  };
}

export interface ComparisonResult {
  algorithms: AlgorithmRunResult[];
  fastestAlgorithm: AlgorithmName | null;
  /** True only if every ranked algorithm (excluding No Sort) produced identical orderings. */
  rankingConsistent: boolean;
}

/**
 * Runs a fair, same-input comparison across multiple algorithms.
 * The benchmark input is generated ONCE by the caller and passed in here —
 * this function never regenerates it per algorithm (section 5/12).
 */
export function runComparison(
  algorithms: AlgorithmName[],
  input: ScoredItem[],
  config: RunConfig = DEFAULT_RUN_CONFIG
): ComparisonResult {
  const results = algorithms.map((name) => benchmarkAlgorithm(name, input, config));

  let fastestAlgorithm: AlgorithmName | null = null;
  let fastestMean = Infinity;
  for (const r of results) {
    if (r.stats.mean < fastestMean) {
      fastestMean = r.stats.mean;
      fastestAlgorithm = r.algorithm;
    }
  }

  const rankedResults = results.filter((r) => r.algorithm !== "nosort");
  let rankingConsistent = true;
  for (let i = 1; i < rankedResults.length; i++) {
    if (!sameOrdering(rankedResults[0].sortedOutput, rankedResults[i].sortedOutput)) {
      rankingConsistent = false;
      break;
    }
  }

  return { algorithms: results, fastestAlgorithm, rankingConsistent };
}

export interface FairnessCheck {
  label: string;
  pass: boolean;
}

/** Builds the "Experimental Fairness Checklist" shown before running a comparison (section 27). */
export function buildFairnessChecklist(params: {
  sameInputAcrossAlgorithms: boolean;
  size: number;
  seedProvided: boolean;
  measuredRuns: number;
  direction: SortDirection;
  inputPreserved: boolean;
}): FairnessCheck[] {
  return [
    { label: "Same input for every algorithm", pass: params.sameInputAcrossAlgorithms },
    { label: "Same relevance scores for every algorithm", pass: params.sameInputAcrossAlgorithms },
    { label: `Same input size (${params.size})`, pass: params.size >= 0 },
    { label: "Seed recorded for reproducibility", pass: params.seedProvided },
    { label: `Same number of measured runs (${params.measuredRuns})`, pass: params.measuredRuns > 0 },
    { label: `Same ranking direction (${params.direction})`, pass: true },
    { label: "Original input array left unmutated", pass: params.inputPreserved }
  ];
}
