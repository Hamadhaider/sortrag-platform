import { StoredExperiment } from "../storage/local";

const CSV_COLUMNS = [
  "experiment_id",
  "timestamp",
  "algorithm",
  "input_size",
  "distribution",
  "seed",
  "warmup_runs",
  "measured_runs",
  "mean_ms",
  "median_ms",
  "min_ms",
  "max_ms",
  "std_ms",
  "p95_ms",
  "ranking_correct",
  "runtime_environment"
] as const;

function csvEscape(value: string | number | boolean): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Exports aggregated per-algorithm results as CSV — one row per algorithm
 * per experiment, per section 28. Raw per-trial times are exported
 * separately (exportRawTrialsCsv) rather than only exporting the average.
 */
export function exportSummaryCsv(experiments: StoredExperiment[]): string {
  const rows: string[] = [CSV_COLUMNS.join(",")];
  for (const exp of experiments) {
    for (const alg of exp.result.algorithms) {
      rows.push(
        [
          exp.experimentId,
          exp.timestamp,
          alg.algorithm,
          exp.config.size,
          exp.config.distribution,
          exp.config.seed,
          exp.config.warmupRuns,
          exp.config.measuredRuns,
          alg.stats.mean.toFixed(4),
          alg.stats.median.toFixed(4),
          alg.stats.min.toFixed(4),
          alg.stats.max.toFixed(4),
          alg.stats.stdDev.toFixed(4),
          alg.stats.p95.toFixed(4),
          alg.rankingCorrect,
          exp.environment
        ]
          .map(csvEscape)
          .join(",")
      );
    }
  }
  return rows.join("\n");
}

/** Exports every individual measured trial time — not just aggregates. */
export function exportRawTrialsCsv(experiments: StoredExperiment[]): string {
  const rows: string[] = ["experiment_id,algorithm,trial_number,execution_time_ms"];
  for (const exp of experiments) {
    for (const alg of exp.result.algorithms) {
      alg.trials.forEach((t, i) => {
        rows.push([exp.experimentId, alg.algorithm, i + 1, t.toFixed(4)].map(csvEscape).join(","));
      });
    }
  }
  return rows.join("\n");
}

export function exportJson(experiments: StoredExperiment[]): string {
  return JSON.stringify(experiments, null, 2);
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
