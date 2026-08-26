import { DocumentChunk, RetrievedChunk, RagPipelineTrace } from "@/types";
import { AlgorithmName, ScoredItem } from "../sorting/types";
import { quickSort } from "../sorting/quickSort";
import { mergeSort } from "../sorting/mergeSort";
import { builtinSort, noSort } from "../sorting/builtinSort";
import { retrieveTopN } from "./retrieval";
import { generateAnswer } from "./generation";
import { currentEmbeddingMode } from "./embeddings";

function toScoredItems(chunks: RetrievedChunk[]): ScoredItem[] {
  return chunks.map((c, i) => ({ id: i, score: c.relevanceScore, payload: c }));
}

function applySort(algorithm: AlgorithmName, items: ScoredItem[]): { output: ScoredItem[]; timeMs: number } {
  const start = performance.now();
  let output: ScoredItem[];
  switch (algorithm) {
    case "quicksort":
      output = quickSort(items);
      break;
    case "mergesort":
      output = mergeSort(items);
      break;
    case "builtin":
      output = builtinSort(items);
      break;
    case "nosort":
      output = noSort(items);
      break;
  }
  return { output, timeMs: performance.now() - start };
}

/**
 * Runs one full RAG Playground query end-to-end. This is a DEMONSTRATION
 * pipeline for section 34 (RAG Playground), not a scientific benchmark run —
 * see lib/benchmark/runner.ts for isolated, repeated-trial timing. Latency
 * here includes real retrieval/embedding/generation work and is reported
 * per-stage precisely so it is never confused with pure sorting time
 * (section 12/49).
 */
export async function runRagPipeline(
  query: string,
  corpus: DocumentChunk[],
  topN: number,
  topK: number,
  sortAlgorithm: AlgorithmName
): Promise<RagPipelineTrace> {
  const totalStart = performance.now();

  const embedStart = performance.now();
  // retrieveTopN embeds internally; we measure retrieval+embedding together
  // here since they are not separated in the current local retrieval mode.
  const retrieved = await retrieveTopN(query, corpus, topN);
  const embeddingMs = performance.now() - embedStart;

  const { output: sortedItems, timeMs: rankingMs } = applySort(sortAlgorithm, toScoredItems(retrieved));
  const reranked: RetrievedChunk[] = sortedItems.map((item, i) => ({
    ...(item.payload as RetrievedChunk),
    rerankRank: i + 1
  }));

  const topKChunks = reranked.slice(0, topK);

  const genStart = performance.now();
  const { answer, mode: answerMode } = await generateAnswer(query, topKChunks);
  const generationMs = performance.now() - genStart;

  const totalMs = performance.now() - totalStart;

  return {
    query,
    mode: currentEmbeddingMode(),
    retrieved,
    reranked,
    sortAlgorithm,
    sortTimeMs: rankingMs,
    topK: topKChunks,
    answer,
    answerMode,
    timings: {
      embeddingMs,
      retrievalMs: 0, // retrieval and embedding are not separable in local mode; see comment above
      rankingMs,
      generationMs,
      totalMs
    }
  };
}
