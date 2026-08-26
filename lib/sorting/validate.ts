import type { ScoredItem, SortDirection } from "./types";

/**
 * The ONE tie-breaking rule every algorithm in this project must use.
 *
 * Primary key:   relevance score (descending by default)
 * Secondary key: item id (ascending)
 *
 * Without a shared, deterministic secondary key, two "correct" sorts of the
 * same input containing equal scores could legitimately disagree on order,
 * which would make Quick Sort vs Merge Sort output comparisons meaningless.
 * This function is the single source of truth so every algorithm implementation
 * reduces to "produce an order that satisfies this comparator."
 */
export function compareItems(
  a: ScoredItem,
  b: ScoredItem,
  direction: SortDirection = "descending"
): number {
  const primary = direction === "descending" ? b.score - a.score : a.score - b.score;
  if (primary !== 0) return primary;
  return a.id - b.id; // secondary key: id ascending, always
}

/**
 * Checks that `sorted` is a valid, deterministic ordering of `original`
 * under compareItems — i.e. every adjacent pair satisfies the comparator,
 * and the multiset of ids is unchanged (nothing lost, duplicated, or mutated).
 */
export function isCorrectlyOrdered(
  original: ScoredItem[],
  sorted: ScoredItem[],
  direction: SortDirection = "descending"
): boolean {
  if (original.length !== sorted.length) return false;

  const originalIds = [...original.map((i) => i.id)].sort((x, y) => x - y);
  const sortedIds = [...sorted.map((i) => i.id)].sort((x, y) => x - y);
  for (let i = 0; i < originalIds.length; i++) {
    if (originalIds[i] !== sortedIds[i]) return false;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    if (compareItems(sorted[i], sorted[i + 1], direction) > 0) return false;
  }
  return true;
}

/** Compares two already-sorted arrays for identical ordering (id sequence). */
export function sameOrdering(a: ScoredItem[], b: ScoredItem[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
  }
  return true;
}

/** Deep-ish clone so a benchmark input can be handed to multiple algorithms
 *  without one algorithm's (mis)behavior leaking into another's input. */
export function cloneInput(items: ScoredItem[]): ScoredItem[] {
  return items.map((i) => ({ ...i }));
}
