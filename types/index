export interface DocumentChunk {
  documentId: string;
  documentName: string;
  chunkId: string;
  text: string;
}

export interface RetrievedChunk extends DocumentChunk {
  relevanceScore: number;
  retrievalRank: number; // position before reranking
  rerankRank?: number; // position after sorting/reranking
}

export type EmbeddingMode = "demo" | "api";

export interface RagPipelineTrace {
  query: string;
  mode: EmbeddingMode;
  retrieved: RetrievedChunk[]; // before ranking
  reranked: RetrievedChunk[]; // after ranking
  sortAlgorithm: "quicksort" | "mergesort" | "builtin" | "nosort";
  sortTimeMs: number;
  topK: RetrievedChunk[];
  answer: string;
  answerMode: EmbeddingMode;
  timings: {
    embeddingMs: number;
    retrievalMs: number;
    rankingMs: number;
    generationMs: number;
    totalMs: number;
  };
}

export interface GroundTruth {
  query: string;
  relevantDocumentIds: string[];
}

export interface RetrievalMetrics {
  precisionAtK: number;
  recallAtK: number;
  hitRateAtK: number;
  mrr: number | null;
  ndcg: number | null;
  k: number;
  groundTruthAvailable: boolean;
}
