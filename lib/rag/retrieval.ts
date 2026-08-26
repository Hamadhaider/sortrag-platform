import { DocumentChunk, RetrievedChunk } from "@/types";
import { embed, cosineSimilarity } from "./embeddings";

/**
 * Retrieves the top-N chunks by cosine similarity to the query.
 *
 * This is a LOCAL in-memory retrieval mode: it scores every chunk in
 * `corpus` directly rather than querying a hosted vector database. Labeled
 * "Demo/local retrieval mode" in the UI per section 17 — if a real vector
 * database (Pinecone, Supabase, FAISS, etc.) is later wired in via
 * VECTOR_DATABASE_PROVIDER, that code path should live alongside this one
 * and be labeled "Real retrieval mode", not silently replace it.
 */
export async function retrieveTopN(
  query: string,
  corpus: DocumentChunk[],
  topN: number
): Promise<RetrievedChunk[]> {
  const { vector: queryVector } = await embed(query);

  const scored = await Promise.all(
    corpus.map(async (chunk) => {
      const { vector } = await embed(chunk.text);
      return { chunk, score: cosineSimilarity(queryVector, vector) };
    })
  );

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topN).map((s, i) => ({
    ...s.chunk,
    relevanceScore: Math.round(s.score * 10000) / 10000,
    retrievalRank: i + 1
  }));
}
