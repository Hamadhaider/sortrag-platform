import { EmbeddingMode } from "@/types";

/**
 * Embedding provider abstraction.
 *
 * DEMO MODE (default, no API key required):
 *   Uses a deterministic bag-of-words vector (term frequency over a small
 *   fixed vocabulary derived from the input text itself) purely so the RAG
 *   Playground can compute a similarity score without network access or a
 *   paid API key. This is explicitly NOT a trained embedding model and every
 *   place it's used in the UI must be labeled "DEMO DATA — not a real
 *   embedding model."
 *
 * API MODE (when EMBEDDING_PROVIDER + EMBEDDING_API_KEY are set):
 *   Calls a real embedding API. Only OpenAI's embeddings endpoint is wired
 *   here as a concrete example — extend getApiEmbedding for Cohere/HF/etc.
 *   following the same shape. This code path has NOT been exercised against
 *   a live API key in development; verify it against your own account
 *   before treating results as real experimental data (section 45).
 */

export function currentEmbeddingMode(): EmbeddingMode {
  return process.env.EMBEDDING_PROVIDER && process.env.EMBEDDING_API_KEY ? "api" : "demo";
}

// Small fixed vocabulary keeps demo vectors a stable, comparable length.
// Extend this list if the demo corpus grows to cover more topics.
const DEMO_VOCAB = [
  "retrieval",
  "generation",
  "rag",
  "query",
  "embed",
  "vector",
  "rerank",
  "rank",
  "sort",
  "quick",
  "merge",
  "algorithm",
  "complexity",
  "time",
  "space",
  "benchmark",
  "precision",
  "recall",
  "relevance",
  "document",
  "chunk",
  "context",
  "language",
  "model",
  "score",
  "compare",
  "measure",
  "index",
  "similarity",
  "top"
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function demoEmbedding(text: string): number[] {
  const tokens = tokenize(text);
  const vec = new Array(DEMO_VOCAB.length).fill(0);
  for (const tok of tokens) {
    const idx = DEMO_VOCAB.findIndex((v) => tok.startsWith(v) || v.startsWith(tok));
    if (idx >= 0) vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

async function apiEmbedding(text: string): Promise<number[]> {
  const provider = process.env.EMBEDDING_PROVIDER;
  const apiKey = process.env.EMBEDDING_API_KEY;
  const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ input: text, model })
    });
    if (!res.ok) {
      throw new Error(`Embedding API request failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.data[0].embedding as number[];
  }

  throw new Error(
    `Unsupported EMBEDDING_PROVIDER "${provider}". Add a branch in lib/rag/embeddings.ts for this provider, or unset it to use demo mode.`
  );
}

export async function embed(text: string): Promise<{ vector: number[]; mode: EmbeddingMode }> {
  const mode = currentEmbeddingMode();
  if (mode === "demo") {
    return { vector: demoEmbedding(text), mode };
  }
  return { vector: await apiEmbedding(text), mode };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
