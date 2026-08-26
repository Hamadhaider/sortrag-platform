export interface TrialStats {
  n: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  p95: number;
}

/** Computes summary statistics over a set of measured trial times (ms). */
export function computeStats(samples: number[]): TrialStats {
  if (samples.length === 0) {
    return { n: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0, p95: 0 };
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const median =
    n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[(n - 1) / 2];
  const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const p95Index = Math.min(n - 1, Math.ceil(0.95 * n) - 1);
  const p95 = sorted[p95Index];

  return {
    n,
    mean,
    median,
    min: sorted[0],
    max: sorted[n - 1],
    stdDev,
    p95
  };
}

/**
 * Minimum recommended sample size before treating stdDev/p95 as meaningful.
 * Below this, the UI should show a low-sample-size warning (section 47).
 */
export const MIN_RECOMMENDED_TRIALS = 10;
