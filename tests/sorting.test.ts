import { describe, it, expect } from "vitest";
import { quickSort } from "@/lib/sorting/quickSort";
import { mergeSort } from "@/lib/sorting/mergeSort";
import { builtinSort, noSort } from "@/lib/sorting/builtinSort";
import { isCorrectlyOrdered, sameOrdering } from "@/lib/sorting/validate";
import { ScoredItem } from "@/lib/sorting/types";

function mk(scores: number[]): ScoredItem[] {
  return scores.map((s, i) => ({ id: i, score: s }));
}

describe("edge cases (shared across all algorithms)", () => {
  it("handles an empty array", () => {
    expect(quickSort(mk([])).length).toBe(0);
    expect(mergeSort(mk([])).length).toBe(0);
    expect(builtinSort(mk([])).length).toBe(0);
    expect(noSort(mk([])).length).toBe(0);
  });

  it("handles a single element", () => {
    expect(mergeSort(mk([5]))[0].score).toBe(5);
  });

  it("handles two elements", () => {
    const [first, second] = quickSort(mk([1, 9]));
    expect(first.score).toBe(9);
    expect(second.score).toBe(1);
  });
});

describe("ordering correctness", () => {
  it("sorts already-sorted (descending) input", () => {
    const input = mk([100, 90, 80, 70, 60]);
    expect(isCorrectlyOrdered(input, quickSort(input))).toBe(true);
    expect(isCorrectlyOrdered(input, mergeSort(input))).toBe(true);
  });

  it("sorts reverse-sorted input", () => {
    const input = mk([1, 2, 3, 4, 5]);
    const sorted = quickSort(input);
    expect(sorted[0].score).toBe(5);
    expect(sorted[4].score).toBe(1);
  });

  it("sorts decimal and negative values", () => {
    const input = mk([-1.5, 3.14, 0, -0.001, 2.71828]);
    expect(isCorrectlyOrdered(input, quickSort(input))).toBe(true);
    expect(isCorrectlyOrdered(input, mergeSort(input))).toBe(true);
  });
});

describe("tie-breaking", () => {
  it("breaks ties by id ascending, deterministically", () => {
    const input: ScoredItem[] = [
      { id: 3, score: 5 },
      { id: 1, score: 5 },
      { id: 2, score: 5 },
      { id: 0, score: 5 }
    ];
    const ids = quickSort(input).map((i) => i.id);
    expect(ids).toEqual([0, 1, 2, 3]);
  });
});

describe("input preservation", () => {
  it("never mutates the original array", () => {
    const input = mk([5, 3, 8, 1]);
    const snapshot = JSON.stringify(input);
    quickSort(input);
    mergeSort(input);
    builtinSort(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });
});

describe("no-sort baseline", () => {
  it("preserves original order and does not claim a ranking", () => {
    const input = mk([3, 1, 4, 1, 5]);
    expect(noSort(input).map((i) => i.score)).toEqual([3, 1, 4, 1, 5]);
  });
});

describe("large input + cross-algorithm agreement", () => {
  it("quicksort, mergesort, and builtin agree on ordering for n=5000 with duplicates", () => {
    const n = 5000;
    let seed = 42;
    function rand() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }
    const input: ScoredItem[] = Array.from({ length: n }, (_, i) => ({
      id: i,
      score: Math.round(rand() * 1000) / 10
    }));

    const qs = quickSort(input);
    const ms = mergeSort(input);
    const bs = builtinSort(input);

    expect(isCorrectlyOrdered(input, qs)).toBe(true);
    expect(isCorrectlyOrdered(input, ms)).toBe(true);
    expect(isCorrectlyOrdered(input, bs)).toBe(true);
    expect(sameOrdering(qs, ms)).toBe(true);
    expect(sameOrdering(qs, bs)).toBe(true);
  });

  it("handles a large already-sorted-ascending input without quadratic blowup", () => {
    const n = 20000;
    const input = mk(Array.from({ length: n }, (_, i) => i));
    const start = performance.now();
    const sorted = quickSort(input);
    const elapsed = performance.now() - start;
    expect(isCorrectlyOrdered(input, sorted)).toBe(true);
    expect(elapsed).toBeLessThan(1000);
  });
});
