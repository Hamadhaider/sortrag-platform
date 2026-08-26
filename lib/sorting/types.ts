/**
 * A single item being ranked in the benchmark or RAG pipeline.
 *
 * `id` is what makes tie-breaking deterministic: when two items have the
 * exact same score, the sort must not depend on incoming array order or on
 * algorithm-specific quirks. See lib/sorting/validate.ts for the shared
 * comparator every algorithm is required to use.
 */
export interface ScoredItem {
  id: number;
  score: number;
  /** Optional payload (e.g. document text) carried along unchanged. */
  payload?: unknown;
}

export type SortDirection = "descending" | "ascending";

export interface SortResult {
  sorted: ScoredItem[];
  /** Wall-clock time for the sort call only, in milliseconds. */
  timeMs: number;
  algorithm: AlgorithmName;
}

export type AlgorithmName = "quicksort" | "mergesort" | "builtin" | "nosort";
