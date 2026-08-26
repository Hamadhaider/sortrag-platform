import type { ScoredItem, SortDirection } from "./types";
import { compareItems } from "./validate";

/**
 * Merge Sort (top-down, stable).
 *
 * Complexity:
 *   Best / Average / Worst: O(n log n) time — Merge Sort's defining property
 *   versus Quick Sort is that it has no O(n²) worst case.
 *   Space: O(n) auxiliary — a full temporary array is allocated per merge
 *   level (classic top-down implementation; not in-place). This is the
 *   direct trade-off against Quick Sort's O(log n) space, and is exactly the
 *   kind of trade-off this benchmark exists to make measurable.
 *
 * Never mutates `input`.
 */
export function mergeSort(
  input: ScoredItem[],
  direction: SortDirection = "descending"
): ScoredItem[] {
  if (input.length <= 1) return [...input];
  return mergeSortRange(input, direction);
}

function mergeSortRange(items: ScoredItem[], direction: SortDirection): ScoredItem[] {
  if (items.length <= 1) return items;
  const mid = Math.floor(items.length / 2);
  const left = mergeSortRange(items.slice(0, mid), direction);
  const right = mergeSortRange(items.slice(mid), direction);
  return merge(left, right, direction);
}

function merge(
  left: ScoredItem[],
  right: ScoredItem[],
  direction: SortDirection
): ScoredItem[] {
  const result: ScoredItem[] = new Array(left.length + right.length);
  let i = 0,
    j = 0,
    k = 0;

  while (i < left.length && j < right.length) {
    // <= preserves stability: on ties, the element from the left run
    // (original earlier position) is taken first.
    if (compareItems(left[i], right[j], direction) <= 0) {
      result[k++] = left[i++];
    } else {
      result[k++] = right[j++];
    }
  }
  while (i < left.length) result[k++] = left[i++];
  while (j < right.length) result[k++] = right[j++];
  return result;
}
