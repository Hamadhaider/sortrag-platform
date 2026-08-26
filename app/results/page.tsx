"use client";

import { useEffect, useState } from "react";
import { Panel, StatCard } from "@/components/Card";
import { ResultsTable } from "@/components/ResultsTable";
import { AlgorithmLineChart, ChartPoint } from "@/components/AlgorithmLineChart";
import { listExperiments, StoredExperiment } from "@/lib/storage/local";
import { exportSummaryCsv, exportRawTrialsCsv, exportJson, downloadTextFile } from "@/lib/utils/export";

export default function ResultsPage() {
  const [experiments, setExperiments] = useState<StoredExperiment[]>([]);

  useEffect(() => {
    setExperiments(listExperiments());
  }, []);

  if (experiments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Panel>
          <p className="text-ink-soft text-sm">
            No experiments saved yet. Run and save a comparison from{" "}
            <a href="/comparison" className="underline decoration-rule hover:text-signal">
              Algorithm Comparison
            </a>{" "}
            to see results here. This dashboard only ever displays real, executed experiment data — nothing
            here is fabricated or pre-filled.
          </p>
        </Panel>
      </div>
    );
  }

  const allAlgoResults = experiments.flatMap((e) => e.result.algorithms);
  const fastestOverall = [...allAlgoResults].sort((a, b) => a.stats.mean - b.stats.mean)[0];
  const totalTrials = allAlgoResults.reduce((sum, r) => sum + r.trials.length, 0);
  const meanStd = allAlgoResults.reduce((sum, r) => sum + r.stats.stdDev, 0) / (allAlgoResults.length || 1);

  // Build a size-vs-mean-time chart by aggregating across saved experiments sharing a distribution.
  const bySize = new Map<number, ChartPoint>();
  for (const exp of experiments) {
    const point = bySize.get(exp.config.size) ?? { size: exp.config.size };
    for (const alg of exp.result.algorithms) {
      (point as any)[alg.algorithm] = Math.round(alg.stats.mean * 1000) / 1000;
    }
    bySize.set(exp.config.size, point);
  }
  const chartData = [...bySize.values()].sort((a, b) => a.size - b.size);

  function download(kind: "summary" | "raw" | "json") {
    if (kind === "summary") downloadTextFile("sortrag-summary.csv", exportSummaryCsv(experiments), "text/csv");
    if (kind === "raw") downloadTextFile("sortrag-raw-trials.csv", exportRawTrialsCsv(experiments), "text/csv");
    if (kind === "json") downloadTextFile("sortrag-experiments.json", exportJson(experiments), "application/json");
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Experiments" value={String(experiments.length)} />
        <StatCard label="Fastest algorithm" value={fastestOverall?.algorithm ?? "—"} accent />
        <StatCard label="Total measured trials" value={totalTrials.toLocaleString()} />
        <StatCard label="Avg. std dev" value={meanStd.toFixed(3)} unit="ms" />
      </div>

      {chartData.length > 1 && (
        <Panel title="Sorting Time vs Input Size" eyebrow="Aggregated across saved experiments">
          <AlgorithmLineChart data={chartData} />
        </Panel>
      )}

      <Panel title="All experiments" eyebrow="Real, executed results only">
        <div className="space-y-8">
          {experiments.map((exp) => (
            <div key={exp.experimentId} className="rule-bottom pb-6 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <div className="font-mono text-sm">{exp.experimentId}</div>
                <div className="text-xs text-ink-soft">
                  {exp.config.distribution} · size {exp.config.size.toLocaleString()} · seed {exp.config.seed} ·{" "}
                  {new Date(exp.timestamp).toLocaleString()}
                </div>
              </div>
              <ResultsTable results={exp.result.algorithms} inputSize={exp.config.size} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Export">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => download("summary")} className="text-sm font-mono border border-rule rounded px-3 py-1.5 hover:border-signal">
            Download Summary CSV
          </button>
          <button onClick={() => download("raw")} className="text-sm font-mono border border-rule rounded px-3 py-1.5 hover:border-signal">
            Download Raw Trials CSV
          </button>
          <button onClick={() => download("json")} className="text-sm font-mono border border-rule rounded px-3 py-1.5 hover:border-signal">
            Download JSON
          </button>
        </div>
      </Panel>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <div className="text-[11px] font-mono tracking-widest text-signal uppercase mb-1">Research Data</div>
      <h1 className="font-display text-3xl font-bold">Results</h1>
      <p className="text-ink-soft mt-1 max-w-2xl">
        Built exclusively from experiments you have run and saved. No demo or placeholder numbers appear here.
      </p>
    </div>
  );
}
