"use client";

import { useEffect, useState } from "react";
import { Panel, Pill } from "@/components/Card";
import { ResultsTable } from "@/components/ResultsTable";
import { listExperiments, deleteExperiment, StoredExperiment } from "@/lib/storage/local";
import { exportSummaryCsv, exportJson, downloadTextFile } from "@/lib/utils/export";

export default function HistoryPage() {
  const [experiments, setExperiments] = useState<StoredExperiment[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setExperiments(listExperiments());
  }, []);

  function handleDelete(id: string) {
    deleteExperiment(id);
    setExperiments(listExperiments());
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-mono tracking-widest text-signal uppercase mb-1">Local Storage</div>
        <h1 className="font-display text-3xl font-bold">Experiment History</h1>
        <p className="text-ink-soft mt-1 max-w-2xl">
          Stored in this browser only (localStorage) — not a cloud database, not synced across devices. See{" "}
          <a href="/documentation" className="underline decoration-rule hover:text-signal">Documentation</a>{" "}
          for details and how to move to persistent storage.
        </p>
      </div>

      {experiments.length === 0 ? (
        <Panel>
          <p className="text-ink-soft text-sm">
            No experiments yet. Run one from{" "}
            <a href="/comparison" className="underline decoration-rule hover:text-signal">Algorithm Comparison</a>.
          </p>
        </Panel>
      ) : (
        <Panel>
          <div className="space-y-3">
            {experiments.map((exp) => {
              const isOpen = expanded === exp.experimentId;
              return (
                <div key={exp.experimentId} className="rule-bottom pb-3 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm">{exp.experimentId}</span>
                      <span className="text-xs text-ink-soft ml-3">
                        {exp.config.distribution} · size {exp.config.size.toLocaleString()} · seed {exp.config.seed}
                      </span>
                      <span className="text-xs text-ink-soft ml-3">{new Date(exp.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Pill pass={exp.result.rankingConsistent}>
                        {exp.result.rankingConsistent ? "Consistent" : "Inconsistent"}
                      </Pill>
                      <button
                        onClick={() => setExpanded(isOpen ? null : exp.experimentId)}
                        className="text-xs font-mono border border-rule rounded px-2 py-1 hover:border-signal"
                      >
                        {isOpen ? "Hide" : "View"}
                      </button>
                      <button
                        onClick={() =>
                          downloadTextFile(`${exp.experimentId}.json`, exportJson([exp]), "application/json")
                        }
                        className="text-xs font-mono border border-rule rounded px-2 py-1 hover:border-signal"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => handleDelete(exp.experimentId)}
                        className="text-xs font-mono border border-rule rounded px-2 py-1 hover:border-fail hover:text-fail"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-3">
                      <ResultsTable results={exp.result.algorithms} inputSize={exp.config.size} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
