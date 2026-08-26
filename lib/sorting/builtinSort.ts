import type { ScoredItem, SortDirection } from "./types";
import { compareItems, cloneInput } from "./validate";

/**
 * Built-in Sort (Baseline) — Array.prototype.sort with the same shared
 * comparator used by Quick Sort and Merge Sort, so its RESULT is directly
 * comparable while its INTERNAL algorithm is whatever the JS engine ships.
 *
 * V8 (Node.js, Chrome) uses TimSort for Array.prototype.sort since V8 7.0 —
 * a hybrid insertion-sort/merge-sort, O(n log n) average and worst case,
 * O(n) space. Other engines may differ; this is stated for V8 specifically
 * because that is what this platform actually runs on. Do not assume this
 * label is accurate on an unverified runtime — TimSort is documented for V8,
 * not asserted generically for "JavaScript."
 */
export function builtinSort(
  input: ScoredItem[],
  direction: SortDirection = "descending"
): ScoredItem[] {
  const arr = cloneInput(input);
  arr.sort((a, b) => compareItems(a, b, direction));
  return arr;
}

/**
 * No Sort (baseline) — passes items through in whatever order retrieval
 * produced. This is NOT a ranking; it exists only to measure the cost/value
 * of adding an explicit sorting stage at all. The UI must not present this
 * output as if it were relevance-ordered.
 */
export function noSort(input: ScoredItem[]): ScoredItem[] {
  return cloneInput(input);
}
