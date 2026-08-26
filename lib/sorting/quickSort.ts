import type { ScoredItem, SortDirection } from "./types";
import { compareItems, cloneInput } from "./validate";

/**
 * Quick Sort (in-place on an internal working copy, median-of-three pivot).
 *
 * Complexity:
 *   Average: O(n log n) time
 *   Worst:   O(n²) time — e.g. already-sorted input with a naive first/last
 *            pivot. Median-of-three pivot selection is used here specifically
 *            to make the worst case unlikely for the "sorted" and "nearly
 *            sorted" input distributions this platform benchmarks, without
 *            claiming the worst case is eliminated (it isn't).
 *   Space:   O(log n) average (recursion stack) for this Hoare-partition
 *            variant, since it sorts a copy of the input in place rather than
 *            allocating new arrays per partition.
 *
 * The function never mutates `input` — it works on a clone, per the fairness
 * requirement that the same original array can be reused across algorithms.
 */
export function quickSort(
  input: ScoredItem[],
  direction: SortDirection = "descending"
): ScoredItem[] {
  const arr = cloneInput(input);
  quickSortInPlace(arr, 0, arr.length - 1, direction);
  return arr;
}

function quickSortInPlace(
  arr: ScoredItem[],
  low: number,
  high: number,
  direction: SortDirection
): void {
  while (low < high) {
    // Small partitions: insertion sort is faster in practice and avoids
    // recursion overhead — a standard, well-documented Quick Sort optimization.
    if (high - low < 16) {
      insertionSort(arr, low, high, direction);
      return;
    }

    const pivotIndex = medianOfThreePivot(arr, low, high, direction);
    const p = partition(arr, low, high, pivotIndex, direction);

    // Recurse into the smaller side, loop into the larger side.
    // Bounds recursion depth to O(log n) in the average case.
    if (p - low < high - p) {
      quickSortInPlace(arr, low, p - 1, direction);
      low = p + 1;
    } else {
      quickSortInPlace(arr, p + 1, high, direction);
      high = p - 1;
    }
  }
}

function medianOfThreePivot(
  arr: ScoredItem[],
  low: number,
  high: number,
  direction: SortDirection
): number {
  const mid = Math.floor((low + high) / 2);
  const a = arr[low],
    b = arr[mid],
    c = arr[high];
  // Sort the three candidates by value, return the index of the middle one.
  const items: [ScoredItem, number][] = [
    [a, low],
    [b, mid],
    [c, high]
  ];
  items.sort((x, y) => compareItems(x[0], y[0], direction));
  return items[1][1];
}

function partition(
  arr: ScoredItem[],
  low: number,
  high: number,
  pivotIndex: number,
  direction: SortDirection
): number {
  const pivot = arr[pivotIndex];
  swap(arr, pivotIndex, high);
  let storeIndex = low;
  for (let i = low; i < high; i++) {
    if (compareItems(arr[i], pivot, direction) < 0) {
      swap(arr, i, storeIndex);
      storeIndex++;
    }
  }
  swap(arr, storeIndex, high);
  return storeIndex;
}

function insertionSort(
  arr: ScoredItem[],
  low: number,
  high: number,
  direction: SortDirection
): void {
  for (let i = low + 1; i <= high; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= low && compareItems(arr[j], key, direction) > 0) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}

function swap(arr: ScoredItem[], i: number, j: number): void {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}
