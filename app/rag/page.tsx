"use client";

import { useState } from "react";
import { Panel, Pill } from "@/components/Card";
import { RagPipelineTrace } from "@/types";
import { AlgorithmName } from "@/lib/sorting/types";

const ALGORITHMS: { value: AlgorithmName; label: string }[] = [
  { value: "quicksort", label: "Quick Sort" },
  { value: "mergesort", label: "Merge Sort" },
  { value: "builtin", label: "Built-in Sort" },
  { value: "nosort", label: "No Sort" }
];

const EXAMPLE_QUERIES = [
  "What is retrieval augmented generation?",
  "How does Quick Sort's worst case happen?",
  "How do I fairly benchmark two sorting algorithms?",
  "What does NDCG measure?"
];

export default function RagPlaygroundPage() {
  const [query, setQuery] = useState("");
  const [topN, setTopN] = useState(5);
  const [topK, setTopK] = useState(3);
  const [algorithm, setAlgorithm] = useState<AlgorithmName>("quicksort");
  const [loading, setLoading] = useState(false);
  const [trace, setTrace] = useState<RagPipelineTrace | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runQuery() {
    if (!query.trim()) {
      setError("Enter a question first.");
      return;
    }
    setError(null);
    setLoading(true);
    setTrace(null);
    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, topN, topK, sortAlgorithm: algorithm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setTrace(data as RagPipelineTrace);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-mono tracking-widest text-signal uppercase mb-1">Demonstration Mode</div>
        <h1 className="font-display text-3xl font-bold">RAG Playground</h1>
        <p className="text-ink-soft mt-1 max-w-2xl">
          Runs against a small ten-chunk demo corpus using local demo embeddings (bag-of-words cosine
          similarity) unless <span className="font-mono text-xs">EMBEDDING_PROVIDER</span> /{" "}
          <span className="font-mono text-xs">LLM_PROVIDER</span> are configured in your environment. This
          page demonstrates the pipeline — it is not the scientific benchmark (that's{" "}
          <span className="font-mono text-xs">Algorithm Comparison</span>).
        </p>
      </div>

      <Panel title="Ask a question">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What is retrieval augmented generation?"
          rows={2}
          className="w-full border border-rule rounded px-3 py-2 text-sm bg-paper resize-none"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="text-xs font-mono border border-rule rounded px-2 py-1 text-ink-soft hover:border-signal hover:text-ink"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-ink-soft">Retrieve top-N</label>
            <input
              type="number"
              min={1}
              max={10}
              value={topN}
              onChange={(e) => setTopN(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              className="mt-1 w-full border border-rule rounded px-2 py-1.5 text-sm font-mono bg-paper"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-ink-soft">Select top-K context</label>
            <input
              type="number"
              min={1}
              max={topN}
              value={topK}
              onChange={(e) => setTopK(Math.max(1, Math.min(topN, parseInt(e.target.value) || 1)))}
              className="mt-1 w-full border border-rule rounded px-2 py-1.5 text-sm font-mono bg-paper"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-ink-soft">Sorting algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as AlgorithmName)}
              className="mt-1 w-full border border-rule rounded px-2 py-1.5 text-sm bg-paper"
            >
              {ALGORITHMS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-fail text-sm mt-3">{error}</p>}

        <button
          onClick={runQuery}
          disabled={loading}
          className="mt-4 bg-ink text-paper font-mono text-sm px-4 py-2 rounded hover:bg-signal transition-colors disabled:opacity-50"
        >
          {loading ? "Running pipeline…" : "Run Query"}
        </button>
      </Panel>

      {trace && (
        <div className="space-y-6">
          <Panel eyebrow={`Mode: ${trace.mode === "demo" ? "DEMO — local pseudo-embeddings" : "API"}`} title="Pipeline trace">
            <div className="grid sm:grid-cols-4 gap-3 text-sm font-tabular">
              <TimingBox label="Embedding + retrieval" ms={trace.timings.embeddingMs} />
              <TimingBox label="Ranking (sorting)" ms={trace.timings.rankingMs} accent />
              <TimingBox label="Generation" ms={trace.timings.generationMs} />
              <TimingBox label="Total" ms={trace.timings.totalMs} />
            </div>
          </Panel>

          <Panel title="Retrieved documents (before ranking)">
            <ChunkTable chunks={trace.retrieved} rankKey="retrievalRank" />
          </Panel>

          <Panel title={`Reranked (${trace.sortAlgorithm}, ${trace.sortTimeMs.toFixed(3)} ms)`}>
            <ChunkTable chunks={trace.reranked} rankKey="rerankRank" />
          </Panel>

          <Panel title="Top-K context sent to the model">
            <ol className="space-y-2 text-sm">
              {trace.topK.map((c, i) => (
                <li key={c.chunkId} className="rule-bottom pb-2 last:border-b-0">
                  <span className="font-mono text-ink-soft">[{i + 1}]</span> {c.text}
                  <span className="text-xs text-ink-soft ml-2">({c.documentName})</span>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel eyebrow={trace.answerMode === "demo" ? "DEMO — extractive, no LLM called" : "API-generated"} title="Final answer">
            <p className="text-sm leading-relaxed">{trace.answer}</p>
          </Panel>
        </div>
      )}
    </div>
  );
}

function TimingBox({ label, ms, accent = false }: { label: string; ms: number; accent?: boolean }) {
  return (
    <div className="border border-rule rounded p-3">
      <div className="text-[10px] font-mono uppercase tracking-wide text-ink-soft">{label}</div>
      <div className={`text-lg font-semibold mt-0.5 ${accent ? "text-signal" : ""}`}>{ms.toFixed(3)} ms</div>
    </div>
  );
}

function ChunkTable({ chunks, rankKey }: { chunks: any[]; rankKey: "retrievalRank" | "rerankRank" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-ink-soft rule-bottom">
            <th className="py-2 pr-4">Rank</th>
            <th className="py-2 pr-4">Document</th>
            <th className="py-2 pr-4">Score</th>
            <th className="py-2 pr-4">Text</th>
          </tr>
        </thead>
        <tbody>
          {chunks.map((c) => (
            <tr key={c.chunkId + (c[rankKey] ?? "")} className="rule-bottom last:border-b-0 align-top">
              <td className="py-2 pr-4 font-tabular">{c[rankKey]}</td>
              <td className="py-2 pr-4 whitespace-nowrap text-ink-soft">{c.documentName}</td>
              <td className="py-2 pr-4 font-tabular">{c.relevanceScore.toFixed(4)}</td>
              <td className="py-2 pr-4 text-ink-soft">{c.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
