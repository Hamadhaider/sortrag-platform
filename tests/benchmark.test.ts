import { describe, it, expect } from "vitest";
import { generateBenchmarkInput } from "@/lib/benchmark/generator";
import { runComparison } from "@/lib/benchmark/runner";

describe("generateBenchmarkInput", () => {
  it("is deterministic for the same seed, size, and distribution", () => {
    const a = generateBenchmarkInput(200, "random", 12345);
    const b = generateBenchmarkInput(200, "random", 12345);
    expect(a).toEqual(b);
  });

  it("produces different input for a different seed", () => {
    const a = generateBenchmarkInput(200, "random", 12345);
    const b = generateBenchmarkInput(200, "random", 999);
    expect(a).not.toEqual(b);
  });

  it("rejects sizes above the safety ceiling", () => {
    expect(() => generateBenchmarkInput(10_000_000, "random", 1)).toThrow();
  });
});

describe("runComparison", () => {
  it("never mutates the shared original input across algorithms", () => {
    const input = generateBenchmarkInput(300, "duplicate-heavy", "research-seed-1");
    const snapshot = JSON.stringify(input);
    runComparison(["quicksort", "mergesort", "builtin", "nosort"], input, {
      warmupRuns: 2,
      measuredRuns: 5,
      direction: "descending"
    });
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it("produces ranking-consistent, correctly-ordered results across ranked algorithms", () => {
    const input = generateBenchmarkInput(300, "duplicate-heavy", "research-seed-1");
    const result = runComparison(["quicksort", "mergesort", "builtin"], input, {
      warmupRuns: 2,
      measuredRuns: 5,
      direction: "descending"
    });
    expect(result.rankingConsistent).toBe(true);
    for (const r of result.algorithms) {
      expect(r.rankingCorrect).toBe(true);
      expect(r.trials.length).toBe(5);
    }
  });
});
