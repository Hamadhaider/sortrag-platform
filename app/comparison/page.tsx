"use client";

import { useState } from "react";
import { Panel, StatCard, Pill } from "@/components/Card";
import { FairnessChecklist } from "@/components/FairnessChecklist";
import { ResultsTable, RelativePerformance } from "@/components/ResultsTable";
import { generateBenchmarkInput, DEFAULT_SIZES, DISTRIBUTIONS, Distribution } from "@/lib/benchmark/generator";
import { runComparison, buildFairnessChecklist, ComparisonResult } from "@/lib/benchmark/runner";
import { saveExperiment, nextExperimentId, currentRuntimeEnvironment } from "@/lib/storage/local";
import { MIN_RECOMMENDED_TRIALS } from "@/lib/benchmark/stats";

export default function ComparisonPage() {
  const [size, setSize] = useState(1000);
  const [distribution, setDistribution] = useState<Distribution>("random");
  const [seed, setSeed] = useState("12345");
  const [warmupRuns, setWarmupRuns] = useState(5);
  const [measuredRuns, setMeasuredRuns] = useState(30);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fairness = buildFairnessChecklist({
    sameInputAcrossAlgorithms: true, // guaranteed by runComparison's design — one input, cloned per algorithm
    size,
    seedProvided: seed.trim().length > 0,
    measuredRuns,
    direction: "descending",
    inputPreserved: true // guaranteed by cloneInput — verified in tests/sorting.selftest.reference.ts
  });

  async function runNow() {
    setRunning(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 30));

    const input = generateBenchmarkInput(size, distribution, seed);
    const comparison = runComparison(["quicksort", "mergesort", "builtin", "nosort"], input, {
      warmupRuns,
      measuredRuns,
      direction: "descending"
    });
    setResult(comparison);
    setExperimentId(nextExperimentId());
    setRunning(false);
  }

  function saveToHistory() {
    if (!result || !experimentId) return;
    saveExperiment({
      experimentId,
      timestamp: new Date().toISOString(),
      config: { size, distribution, seed, warmupRuns, measuredRuns },
      result,
      environment: currentRuntimeEnvironment()
    });
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-mono tracking-widest text-signal uppercase mb-1">Benchmark Mode</div>
        <h1 className="font-display text-3xl font-bold">Algorithm Comparison</h1>
        <p className="text-ink-soft mt-1 max-w-2xl">
          Quick Sort, Merge Sort, Built-in Sort, and No Sort run against the exact same generated input —
          the same array is cloned once per algorithm, never regenerated.
        </p>
      </div>

      <Panel title="Configuration">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wide text-ink-soft">Input size</label>
              <select
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="mt-1 w-full border border-rule rounded px-2 py-1.5 text-sm bg-paper font-mono"
              >
                {DEFAULT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wide text-ink-soft">Input distribution</label>
              <select
                value={distribution}
                onChange={(e) => setDistribution(e.target.value as Distribution)}
                className="mt-1 w-full border border-rule rounded px-2 py-1.5 text-sm bg-paper"
              >
                {DISTRIBUTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wide text-ink-soft">Seed</label>
              <input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="mt-1 w-full border border-rule rounded px-2 py-1.5 text-sm font-mono bg-paper"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-wide text-ink-soft">Warm-up runs</label>
                <input
                  type="number"
                  min={0}
                  value={warmupRuns}
                  onChange={(e) => setWarmupRuns(Math.max(0, parseInt(e.target.value) || 0))}
                  className="mt-1 w-full border border-rule rounded px-2 py-1.5 text-sm font-mono bg-paper"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wide text-ink-soft">Measured runs</label>
                <input
                  type="number"
                  min={1}
                  value={measuredRuns}
                  onChange={(e) => setMeasuredRuns(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1 w-full border border-rule rounded px-2 py-1.5 text-sm font-mono bg-paper"
                />
              </div>
            </div>
            {measuredRuns < MIN_RECOMMENDED_TRIALS && (
              <p className="text-xs text-fail">
                Fewer than {MIN_RECOMMENDED_TRIALS} measured runs — standard deviation and P95 will be noisy.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={runNow}
          disabled={running}
          className="mt-5 bg-ink text-paper font-mono text-sm px-4 py-2 rounded hover:bg-signal transition-colors disabled:opacity-50"
        >
          {running ? "Running comparison…" : "Run Comparison"}
        </button>
      </Panel>

      <Panel>
        <FairnessChecklist checks={fairness} />
      </Panel>

      {result && (
        <>
          <Panel eyebrow={experimentId ?? undefined} title="Algorithm Validation">
            <div className="flex flex-wrap gap-2 mb-4">
              {result.algorithms.map((r) => (
                <Pill key={r.algorithm} pass={r.rankingCorrect}>
                  {r.algorithm}: {r.rankingCorrect ? "PASS" : "FAIL"}
                </Pill>
              ))}
              <Pill pass={result.rankingConsistent}>
                Ranking consistency: {result.rankingConsistent ? "PASS" : "FAIL"}
              </Pill>
            </div>
            {!result.rankingConsistent && (
              <p className="text-fail text-sm">
                Quick Sort, Merge Sort, and Built-in Sort produced different orderings for the same input.
                This should not happen given the shared tie-breaking comparator — treat these results as
                invalid until investigated (see lib/sorting/validate.ts).
              </p>
            )}
          </Panel>

          <Panel title="Results" eyebrow={`Size ${size.toLocaleString()} · ${distribution} · seed ${seed}`}>
            <ResultsTable results={result.algorithms} inputSize={size} />
            <RelativePerformance results={result.algorithms} />
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={saveToHistory}
                disabled={saved}
                className="text-sm font-mono border border-rule rounded px-3 py-1.5 hover:border-signal disabled:opacity-50"
              >
                {saved ? "Saved to History" : "Save to Experiment History"}
              </button>
              {saved && <span className="text-xs text-pass font-mono">Saved as {experimentId}</span>}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
