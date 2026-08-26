"use client";

import { useState } from "react";
import { Panel, StatCard } from "@/components/Card";
import { AlgorithmLineChart, ChartPoint } from "@/components/AlgorithmLineChart";
import { generateBenchmarkInput, DEFAULT_SIZES, DISTRIBUTIONS, Distribution, MAX_SAFE_SIZE } from "@/lib/benchmark/generator";
import { benchmarkAlgorithm } from "@/lib/benchmark/runner";
import { AlgorithmName } from "@/lib/sorting/types";

const ALGORITHMS: { value: AlgorithmName; label: string }[] = [
  { value: "quicksort", label: "Quick Sort" },
  { value: "mergesort", label: "Merge Sort" },
  { value: "builtin", label: "Built-in Sort (Baseline)" },
  { value: "nosort", label: "No Sort (Baseline)" }
];

export default function BenchmarkPage() {
  const [selected, setSelected] = useState<AlgorithmName[]>(["quicksort", "mergesort", "builtin"]);
  const [distribution, setDistribution] = useState<Distribution>("random");
  const [seed, setSeed] = useState("12345");
  const [warmupRuns, setWarmupRuns] = useState(5);
  const [measuredRuns, setMeasuredRuns] = useState(30);
  const [sizes, setSizes] = useState<number[]>(DEFAULT_SIZES.slice(0, 5)); // cap default UI run for responsiveness
  const [customSize, setCustomSize] = useState("");
  const [running, setRunning] = useState(false);
  const [data, setData] = useState<ChartPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggleAlgorithm(a: AlgorithmName) {
    setSelected((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function addCustomSize() {
    const n = parseInt(customSize, 10);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Custom size must be a positive integer.");
      return;
    }
    if (n > MAX_SAFE_SIZE) {
      setError(`Custom size exceeds the safety ceiling of ${MAX_SAFE_SIZE.toLocaleString()}.`);
      return;
    }
    setError(null);
    setSizes((prev) => Array.from(new Set([...prev, n])).sort((a, b) => a - b));
    setCustomSize("");
  }

  async function runBenchmark() {
    setError(null);
    if (selected.length === 0) {
      setError("Select at least one algorithm.");
      return;
    }
    setRunning(true);
    // Yield to the browser so the "Running..." state paints before the
    // (synchronous, CPU-bound) benchmark loop blocks the main thread.
    await new Promise((r) => setTimeout(r, 30));

    const points: ChartPoint[] = [];
    for (const size of sizes) {
      const input = generateBenchmarkInput(size, distribution, seed);
      const point: ChartPoint = { size };
      for (const alg of selected) {
        const result = benchmarkAlgorithm(alg, input, { warmupRuns, measuredRuns, direction: "descending" });
        point[alg] = Math.round(result.stats.mean * 1000) / 1000;
      }
      points.push(point);
    }
    setData(points);
    setRunning(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-mono tracking-widest text-signal uppercase mb-1">Benchmark Mode</div>
        <h1 className="font-display text-3xl font-bold">Algorithm Benchmark</h1>
        <p className="text-ink-soft mt-1 max-w-2xl">
          Measures pure sorting time across input sizes, isolated from RAG retrieval, network I/O, and chart
          rendering. Not the same metric as RAG end-to-end latency — see{" "}
          <span className="font-mono text-sm">RAG Playground</span> for that.
        </p>
      </div>

      <Panel title="Configuration">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-ink-soft">Algorithms</label>
            <div className="mt-2 space-y-2">
              {ALGORITHMS.map((a) => (
                <label key={a.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(a.value)}
                    onChange={() => toggleAlgorithm(a.value)}
                    className="accent-signal"
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
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
          </div>
        </div>

        <div className="mt-5 rule-top pt-4">
          <label className="text-xs font-mono uppercase tracking-wide text-ink-soft">Input sizes</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {sizes.map((s) => (
              <span
                key={s}
                className="font-mono text-xs bg-signal-soft text-ink px-2 py-1 rounded flex items-center gap-1.5"
              >
                {s.toLocaleString()}
                <button
                  onClick={() => setSizes((prev) => prev.filter((x) => x !== s))}
                  aria-label={`Remove size ${s}`}
                  className="text-ink-soft hover:text-fail"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              placeholder="Add custom size"
              className="border border-rule rounded px-2 py-1.5 text-sm font-mono bg-paper w-40"
            />
            <button onClick={addCustomSize} className="text-sm font-mono border border-rule rounded px-3 py-1.5 hover:border-signal">
              Add
            </button>
          </div>
        </div>

        {error && <p className="text-fail text-sm mt-3">{error}</p>}

        <button
          onClick={runBenchmark}
          disabled={running}
          className="mt-5 bg-ink text-paper font-mono text-sm px-4 py-2 rounded hover:bg-signal transition-colors disabled:opacity-50"
        >
          {running ? "Running benchmark…" : "Run Benchmark"}
        </button>
      </Panel>

      {data.length > 0 && (
        <Panel title="Sorting Time vs Input Size" eyebrow={`Distribution: ${distribution} · Seed: ${seed} · ${measuredRuns} measured runs`}>
          <AlgorithmLineChart data={data} />
        </Panel>
      )}
    </div>
  );
}
