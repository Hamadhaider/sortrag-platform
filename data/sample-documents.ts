import { DocumentChunk } from "@/types";

/**
 * DEMO DATA — a small hand-written corpus used only so the RAG Playground has
 * something to retrieve from without external API keys configured. This is
 * NOT a benchmark dataset and produces NO official experimental results —
 * see lib/rag/embeddings.ts for the demo/API mode distinction.
 */
export const SAMPLE_DOCUMENTS: DocumentChunk[] = [
  {
    documentId: "doc-1",
    documentName: "Retrieval-Augmented Generation Overview",
    chunkId: "doc-1-c0",
    text: "Retrieval-augmented generation (RAG) combines a retrieval step over an external document store with a language model's generation step, so answers can be grounded in retrieved evidence rather than only the model's parameters."
  },
  {
    documentId: "doc-1",
    documentName: "Retrieval-Augmented Generation Overview",
    chunkId: "doc-1-c1",
    text: "A typical RAG pipeline embeds the user query, retrieves the most similar document chunks from a vector index, optionally reranks the candidates, and passes the top results to the language model as context."
  },
  {
    documentId: "doc-2",
    documentName: "Sorting Algorithms in Practice",
    chunkId: "doc-2-c0",
    text: "Quick Sort partitions an array around a pivot and recursively sorts each side; its average time complexity is O(n log n) but a poor pivot choice can degrade to O(n squared) on adversarial or already-sorted input."
  },
  {
    documentId: "doc-2",
    documentName: "Sorting Algorithms in Practice",
    chunkId: "doc-2-c1",
    text: "Merge Sort divides an array in half, recursively sorts each half, and merges the sorted halves; it guarantees O(n log n) time in the best, average, and worst case at the cost of O(n) auxiliary space."
  },
  {
    documentId: "doc-3",
    documentName: "Reranking in Retrieval Systems",
    chunkId: "doc-3-c0",
    text: "Reranking is the stage where an initial set of retrieved candidates is reordered, typically by relevance score, before a smaller top-K subset is passed downstream. The choice of sorting algorithm affects only the ordering step's latency, not retrieval quality itself."
  },
  {
    documentId: "doc-3",
    documentName: "Reranking in Retrieval Systems",
    chunkId: "doc-3-c1",
    text: "Because Quick Sort, Merge Sort, and a language runtime's built-in sort all implement total orderings, they should produce identical rankings given identical scores and a consistent tie-breaking rule; differences between them are expected to appear in execution time, not in ranking correctness."
  },
  {
    documentId: "doc-4",
    documentName: "Evaluating Retrieval Quality",
    chunkId: "doc-4-c0",
    text: "Precision@K measures the fraction of the top K retrieved items that are actually relevant, while Recall@K measures the fraction of all relevant items that were successfully retrieved within the top K."
  },
  {
    documentId: "doc-4",
    documentName: "Evaluating Retrieval Quality",
    chunkId: "doc-4-c1",
    text: "Mean Reciprocal Rank (MRR) and Normalized Discounted Cumulative Gain (NDCG) both account for the position of relevant results, rewarding systems that place relevant documents earlier in the ranked list."
  },
  {
    documentId: "doc-5",
    documentName: "Benchmark Methodology Basics",
    chunkId: "doc-5-c0",
    text: "A fair algorithm benchmark holds every variable constant except the one under study; for a sorting benchmark this means using the exact same input array, size, and distribution across every algorithm being compared, and reporting more than a single fastest run."
  },
  {
    documentId: "doc-5",
    documentName: "Benchmark Methodology Basics",
    chunkId: "doc-5-c1",
    text: "Warm-up runs allow a language runtime's just-in-time compiler and caches to reach a steady state before measured trials begin, which reduces noise from one-time compilation costs in the reported statistics."
  }
];
