import { AlgorithmRunResult } from "@/lib/benchmark/runner";
import { Pill } from "./Card";

const ALGO_LABEL: Record<string, string> = {
  quicksort: "Quick Sort",
  mergesort: "Merge Sort",
  builtin: "Built-in Sort (Baseline)",
  nosort: "No Sort (Baseline)"
};

const ALGO_COLOR: Record<string, string> = {
  quicksort: "bg-quick",
  mergesort: "bg-merge",
  builtin: "bg-builtin",
  nosort: "bg-nosort"
};

export function ResultsTable({ results, inputSize }: { results: AlgorithmRunResult[]; inputSize: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-tabular">
        <thead>
          <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-ink-soft rule-bottom">
            <th className="py-2 pr-4">Algorithm</th>
            <th className="py-2 pr-4">Input Size</th>
            <th className="py-2 pr-4">Mean (ms)</th>
            <th className="py-2 pr-4">Median (ms)</th>
            <th className="py-2 pr-4">Std Dev</th>
            <th className="py-2 pr-4">P95 (ms)</th>
            <th className="py-2 pr-4">Min / Max</th>
            <th className="py-2 pr-4">Correct</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.algorithm} className="rule-bottom last:border-b-0">
              <td className="py-2.5 pr-4 font-body">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${ALGO_COLOR[r.algorithm]}`} />
                {ALGO_LABEL[r.algorithm]}
              </td>
              <td className="py-2.5 pr-4">{inputSize.toLocaleString()}</td>
              <td className="py-2.5 pr-4">{r.stats.mean.toFixed(3)}</td>
              <td className="py-2.5 pr-4">{r.stats.median.toFixed(3)}</td>
              <td className="py-2.5 pr-4">{r.stats.stdDev.toFixed(3)}</td>
              <td className="py-2.5 pr-4">{r.stats.p95.toFixed(3)}</td>
              <td className="py-2.5 pr-4 text-ink-soft">
                {r.stats.min.toFixed(3)} / {r.stats.max.toFixed(3)}
              </td>
              <td className="py-2.5 pr-4">
                <Pill pass={r.rankingCorrect}>{r.rankingCorrect ? "PASS" : "FAIL"}</Pill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Relative performance callout, phrased per section 23: this-experiment only. */
export function RelativePerformance({ results }: { results: AlgorithmRunResult[] }) {
  if (results.length < 2) return null;
  const sorted = [...results].sort((a, b) => a.stats.mean - b.stats.mean);
  const fastest = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="mt-4 space-y-1.5 text-sm">
      {rest.map((r) => {
        const pctSlower = ((r.stats.mean - fastest.stats.mean) / fastest.stats.mean) * 100;
        return (
          <p key={r.algorithm} className="text-ink-soft">
            <span className="text-ink font-medium">{ALGO_LABEL[fastest.algorithm]}</span> was{" "}
            <span className="font-tabular text-signal font-semibold">{pctSlower.toFixed(1)}%</span> faster than{" "}
            <span className="text-ink font-medium">{ALGO_LABEL[r.algorithm]}</span> in this experiment
            (mean of {fastest.stats.n} measured runs).
          </p>
        );
      })}
    </div>
  );
}
